import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Header: background on scroll, active section link */
const header = document.querySelector<HTMLElement>('[data-header]');
const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];
// The hero is observed too, so no link stays highlighted after scrolling back to the top.
const sections = ['#top', ...navLinks.map((a) => a.hash)]
  .map((hash) => document.querySelector<HTMLElement>(hash))
  .filter((el): el is HTMLElement => Boolean(el));
const sectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.hash === `#${entry.target.id}`));
    }
  },
  { rootMargin: '-45% 0px -50% 0px' },
);
sections.forEach((s) => sectionObserver.observe(s));

/* Mobile menu */
const menuToggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
const setMenu = (open: boolean) => {
  if (!menuToggle || !menu) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
  header?.classList.toggle('is-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
};
menuToggle?.addEventListener('click', () => setMenu(menu?.hidden ?? false));
document.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));
window.matchMedia('(min-width: 1080px)').addEventListener('change', (e) => e.matches && setMenu(false));

/* Reveal on scroll */
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  },
  { rootMargin: '0px 0px -8% 0px' },
);
document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

/* Hero: each circle crossfades through its photos, offset in time */
if (!reducedMotion) {
  document.querySelectorAll<HTMLElement>('[data-rotator]').forEach((rotator, index) => {
    const images = [...rotator.querySelectorAll('img')];
    if (images.length < 2) return;
    let current = 0;
    window.setTimeout(() => {
      window.setInterval(() => {
        images[current].classList.remove('is-active');
        current = (current + 1) % images.length;
        images[current].classList.add('is-active');
      }, 6000);
    }, 2000 + index * 1800);
  });
}

/* Projects: filter by year + "show more" */
const grid = document.querySelector<HTMLElement>('[data-projects]');
if (grid) {
  const page = Number(grid.dataset.page) || 3;
  const cards = [...grid.querySelectorAll<HTMLElement>('.project')];
  const chips = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const moreBtn = document.querySelector<HTMLButtonElement>('[data-projects-more]');
  const restLabel = document.querySelector<HTMLElement>('[data-projects-rest]');
  let filter = 'all';
  let expanded = false;

  const render = () => {
    const matching = cards.filter((c) => filter === 'all' || c.dataset.tags?.split(' ').includes(filter));
    cards.forEach((c) => (c.hidden = true));
    matching.forEach((c, i) => (c.hidden = !expanded && i >= page));
    const rest = expanded ? 0 : Math.max(0, matching.length - page);
    if (moreBtn) moreBtn.hidden = rest === 0;
    if (restLabel) restLabel.textContent = String(rest);
  };

  const setFilter = (value: string) => {
    filter = value;
    expanded = false;
    chips.forEach((chip) => {
      const active = chip.dataset.filter === value;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
    render();
  };

  chips.forEach((chip) => chip.addEventListener('click', () => setFilter(chip.dataset.filter ?? 'all')));
  moreBtn?.addEventListener('click', () => {
    expanded = true;
    render();
  });
  render();
}

/* Project dialog: the card's full description is copied in from its <template> */
const projectDialog = document.querySelector<HTMLDialogElement>('[data-project-dialog]');
if (projectDialog) {
  const content = projectDialog.querySelector<HTMLElement>('[data-project-content]')!;
  const sheet = projectDialog.querySelector<HTMLElement>('.pd__sheet')!;
  document.querySelectorAll<HTMLButtonElement>('[data-project-open]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const tpl = document.querySelector<HTMLTemplateElement>(`[data-project-tpl="${btn.dataset.projectOpen}"]`);
      if (!tpl) return;
      content.replaceChildren(tpl.content.cloneNode(true));
      projectDialog.showModal();
      sheet.scrollTop = 0;
    }),
  );
  projectDialog.querySelector('[data-project-close]')?.addEventListener('click', () => projectDialog.close());
  projectDialog.addEventListener('click', (e) => {
    if (e.target === projectDialog) projectDialog.close(); // click on the backdrop
  });
}

/* Equal-height cards: while every fold is closed, all cards get the tallest card's height.
   Unfolding one card then grows only that card; the others keep their height. */
document.querySelectorAll<HTMLElement>('[data-equal-cards]').forEach((list) => {
  const level = () => {
    if (list.querySelector('details[open]')) return;
    list.style.removeProperty('--card-h');
    if (getComputedStyle(list).gridTemplateColumns.split(' ').length < 2) return; // one column: nothing to line up
    const tallest = Math.max(...[...list.children].map((c) => (c as HTMLElement).offsetHeight));
    list.style.setProperty('--card-h', `${tallest}px`);
  };
  level();
  window.addEventListener('resize', level);
  list.querySelectorAll('details').forEach((d) => d.addEventListener('toggle', level));
  document.fonts?.ready.then(level);
});

/* Stats: count up when visible */
const fmt = new Intl.NumberFormat('uk-UA');
const countObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      countObserver.unobserve(entry.target);
      const el = entry.target as HTMLElement;
      const target = Number(el.dataset.count);
      const start = performance.now();
      const duration = 1600;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = fmt.format(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  },
  { threshold: 0.6 },
);
if (!reducedMotion) document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

/* Copy requisites */
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) =>
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy ?? '');
      btn.classList.add('is-done');
      window.setTimeout(() => btn.classList.remove('is-done'), 1800);
    } catch {
      /* clipboard unavailable (e.g. insecure context) — value stays visible for manual copy */
    }
  }),
);

/* Tabs (news / media) with arrow-key navigation */
document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((list) => {
  const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const select = (tab: HTMLButtonElement) => {
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls') ?? '');
      if (!panel) return;
      panel.hidden = !active;
      if (active) panel.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      const next = tabs[(i + step + tabs.length) % tabs.length];
      next.focus();
      select(next);
    });
  });
});

/* Full-screen viewer (gallery photos, documents). Opens from [data-lightbox-open="<id>"][data-index]
   triggers or a 'lightbox:open' event with the item index; the shown index is kept in data-index. */
document.querySelectorAll<HTMLDialogElement>('[data-lightbox]').forEach((box) => {
  const items = [...box.querySelectorAll<HTMLElement>('[data-lightbox-items] li')];
  const img = box.querySelector<HTMLImageElement>('[data-lightbox-img]')!;
  const caption = box.querySelector<HTMLElement>('[data-lightbox-caption]');
  const index = box.querySelector<HTMLElement>('[data-lightbox-index]');
  const link = box.querySelector<HTMLAnchorElement>('[data-lightbox-link]');
  let shown = 0;

  const show = (k: number) => {
    shown = (k + items.length) % items.length;
    box.dataset.index = String(shown);
    const item = items[shown];
    img.classList.add('is-loading');
    img.onload = () => img.classList.remove('is-loading');
    img.src = item.dataset.src ?? '';
    img.alt = item.dataset.alt ?? '';
    if (caption) caption.textContent = item.dataset.caption ?? '';
    if (index) index.textContent = String(shown + 1).padStart(2, '0');
    if (link) {
      link.hidden = !item.dataset.link;
      link.href = item.dataset.link || '#';
    }
  };
  const open = (k: number) => {
    show(k);
    if (!box.open) box.showModal();
  };

  box.addEventListener('lightbox:open', (e) => open(Number((e as CustomEvent<number>).detail) || 0));
  document.querySelectorAll<HTMLElement>(`[data-lightbox-open="${box.id}"]`).forEach((trigger) =>
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      open(Number(trigger.dataset.index) || 0);
    }),
  );

  box.querySelector('[data-lightbox-close]')?.addEventListener('click', () => box.close());
  box.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => show(shown - 1));
  box.querySelector('[data-lightbox-next]')?.addEventListener('click', () => show(shown + 1));
  box.addEventListener('click', (e) => {
    if (e.target === box) box.close(); // click on the dark backdrop
  });
  if (items.length > 1) {
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(shown - 1);
      if (e.key === 'ArrowRight') show(shown + 1);
    });
    let startX = 0;
    box.addEventListener('pointerdown', (e) => (startX = e.clientX));
    box.addEventListener('pointerup', (e) => {
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 50) show(dx < 0 ? shown + 1 : shown - 1);
    });
  }
});

/* Gallery: looping reverse coverflow.
   `offset` is a continuous slide index. Each frame every card gets its distance from it (wrapped
   into [-n/2, n/2)) and its transform is interpolated from the tables below, so dragging follows
   the finger and settling is a smooth glide. Cards beyond 4 steps are invisible, which is where
   the loop wraps them from one end to the other. */
const AUTOPLAY = 4500;

document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
  const stage = root.querySelector<HTMLElement>('[data-carousel-stage]')!;
  const slides = [...root.querySelectorAll<HTMLElement>('[data-slide]')];
  const indexLabel = root.querySelector<HTMLElement>('[data-carousel-index]');
  const caption = root.querySelector<HTMLElement>('[data-carousel-caption]');
  const box = root.parentElement?.querySelector<HTMLDialogElement>('[data-lightbox]');
  const n = slides.length;

  // Per step from the centre: outer-edge-forward tilt, scale, brightness
  const RY = [0, 26, 32, 36, 38, 40];
  const S = [1, 0.8, 0.65, 0.54, 0.46, 0.42];
  const B = [1, 0.92, 0.86, 0.82, 0.8, 0.8];

  // x shifts (in card widths) that keep the same visible gap between neighbours once perspective
  // is applied: each card's projected inner edge sits GAP after the previous card's outer edge.
  // P matches the stage's `perspective: calc(var(--w) * 4.5)`.
  const P = 4.5;
  const GAP = 0.03;
  const X = [0];
  let edge = 0.5; // projected outer edge of the centre card
  for (let k = 1; k < S.length; k++) {
    const h = S[k] / 2;
    const t = (RY[k] * Math.PI) / 180;
    const x = ((edge + GAP) * (P + h * Math.sin(t))) / P + h * Math.cos(t);
    X.push(x);
    edge = ((x + h * Math.cos(t)) * P) / (P - h * Math.sin(t));
  }
  const at = (table: number[], t: number) => {
    const i = Math.min(Math.floor(t), table.length - 2);
    return table[i] + (table[i + 1] - table[i]) * Math.min(t - i, 1);
  };
  const mod = (v: number) => ((v % n) + n) % n;

  let w = slides[0].offsetWidth;
  let offset = 0;
  let target = 0;
  let shownIndex = -1;

  const render = () => {
    slides.forEach((el, i) => {
      let d = mod(i - offset);
      if (d >= n / 2) d -= n;
      const a = Math.abs(d);
      const sign = Math.sign(d);
      el.style.transform = `translate3d(${sign * at(X, a) * w}px,0,0) rotateY(${-sign * at(RY, a)}deg) scale(${at(S, a)})`;
      el.style.opacity = String(Math.max(0, Math.min(1, 4 - a)));
      el.style.zIndex = String(100 - Math.round(a * 10));
      el.style.setProperty('--b', String(at(B, a)));
    });
    const c = mod(Math.round(offset));
    if (c === shownIndex) return;
    shownIndex = c;
    slides.forEach((el, i) => {
      const cur = i === c;
      el.classList.toggle('is-current', cur);
      el.setAttribute('aria-hidden', String(!cur));
      el.querySelector('[data-carousel-open]')?.setAttribute('tabindex', cur ? '0' : '-1');
    });
    if (indexLabel) indexLabel.textContent = String(Number(slides[c].dataset.photo) + 1).padStart(2, '0');
    if (caption) {
      caption.textContent = slides[c].dataset.caption ?? '';
      caption.classList.remove('is-changing');
      void caption.offsetWidth;
      caption.classList.add('is-changing');
    }
  };

  // Glide `offset` towards `target` (exponential ease-out; frame-rate independent)
  let raf = 0;
  let last = 0;
  let dragging = false;
  const tick = (now: number) => {
    const dt = Math.min(64, now - last) / 1000;
    last = now;
    offset += (target - offset) * (1 - Math.exp(-(reducedMotion ? 60 : 7) * dt));
    if (Math.abs(target - offset) < 0.0005) offset = target;
    render();
    raf = offset !== target && !dragging ? requestAnimationFrame(tick) : 0;
  };
  const animate = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  // Autoplay while visible and not being interacted with
  let timer = 0;
  let hovered = false;
  let visible = false;
  const paused = () =>
    !visible || hovered || dragging || root.contains(document.activeElement) || document.hidden || Boolean(box?.open);
  const schedule = () => {
    window.clearTimeout(timer);
    const stop = paused();
    if (!reducedMotion && !stop) timer = window.setTimeout(() => go(1), AUTOPLAY);
  };
  const resume = schedule;

  const go = (steps: number) => {
    target = Math.round(target) + steps;
    animate();
    schedule();
  };
  // Shortest way round the loop to slide i
  const goTo = (i: number) => {
    let d = mod(i - Math.round(target));
    if (d > n / 2) d -= n;
    go(d);
  };

  root.querySelector('[data-carousel-prev]')?.addEventListener('click', () => go(-1));
  root.querySelector('[data-carousel-next]')?.addEventListener('click', () => go(1));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });

  // Drag / swipe: the rack follows the pointer, then settles with a little momentum
  let startX = 0;
  let startOffset = 0;
  let moved = false;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0; // slides per ms
  const step = () => w * X[1];

  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 6) {
      moved = true;
      stage.classList.add('is-dragging');
    }
    const now = performance.now();
    if (now > lastT) velocity = (-(e.clientX - lastX) / step()) / (now - lastT);
    lastX = e.clientX;
    lastT = now;
    offset = startOffset - dx / step();
    target = offset;
    render();
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    if (moved) {
      const fresh = performance.now() - lastT < 80 ? velocity : 0;
      const projected = offset + Math.max(-3, Math.min(3, fresh * 180));
      target = Math.round(projected);
      if (target === Math.round(startOffset) && Math.abs(offset - startOffset) > 0.15) {
        target += Math.sign(offset - startOffset); // a short flick still turns one card
      }
      animate();
      window.setTimeout(() => (moved = false)); // after the click that ends the drag is ignored
    }
    schedule();
  };
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    moved = false;
    startX = lastX = e.clientX;
    lastT = performance.now();
    velocity = 0;
    startOffset = offset;
    cancelAnimationFrame(raf);
    raf = 0;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    schedule();
  });

  // Lightbox: the centre photo opens full size, side photos just come to the centre
  const open = (i: number) => {
    box?.dispatchEvent(new CustomEvent('lightbox:open', { detail: Number(slides[i].dataset.photo) }));
    schedule();
  };

  slides.forEach((el, i) =>
    el.addEventListener('click', () => {
      if (moved) return;
      if (i === mod(Math.round(offset))) open(i);
      else goTo(i);
    }),
  );
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target === root) open(mod(Math.round(offset)));
  });

  // Leave the carousel on the photo that was viewed last (nearest copy of it)
  box?.addEventListener('close', () => {
    const shown = Number(box?.dataset.index);
    let best = -1;
    let bestD = Infinity;
    slides.forEach((el, i) => {
      if (Number(el.dataset.photo) !== shown) return;
      let d = mod(i - Math.round(target));
      if (d > n / 2) d -= n;
      if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
    });
    if (best >= 0) goTo(best);
    resume();
  });

  root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovered = true; schedule(); } });
  root.addEventListener('pointerleave', () => { hovered = false; resume(); });
  root.addEventListener('focusin', schedule);
  root.addEventListener('focusout', () => window.setTimeout(resume));
  document.addEventListener('visibilitychange', resume);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); }, { threshold: 0.4 }).observe(root);

  window.addEventListener('resize', () => {
    w = slides[0].offsetWidth;
    render();
  });
  render();
});

/* Mission: the soft light follows the cursor, all the way into the corners */
document.querySelectorAll<HTMLElement>('[data-follow]').forEach((box) => {
  const glow = box.querySelector<HTMLElement>('.mission__glow');
  if (!glow || reducedMotion || !window.matchMedia('(hover: hover)').matches) return;
  // Easing time constants (ms): snappy while following, slow when entering and drifting home
  const FOLLOW = 90;
  const SETTLE = 700;
  let tx = 0;
  let ty = 0;
  let gx = 0;
  let gy = 0;
  let tau = FOLLOW;
  let raf = 0;
  let last = 0;
  const loop = (now: number) => {
    // Capped so a stalled frame (background tab) never turns into a jump
    const dt = Math.min(now - (last || now - 16), 50);
    last = now;
    // Frame-rate independent; after entering, the lag eases from slow to snappy instead of jumping
    if (box.matches(':hover')) tau = FOLLOW + (tau - FOLLOW) * Math.exp(-dt / 350);
    const k = 1 - Math.exp(-dt / tau);
    gx += (tx - gx) * k;
    gy += (ty - gy) * k;
    glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
    if (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.3) raf = requestAnimationFrame(loop);
    else raf = last = 0;
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };
  box.addEventListener('pointerenter', () => {
    tau = SETTLE;
  });
  box.addEventListener('pointermove', (e) => {
    const r = box.getBoundingClientRect();
    // Offset from the glow's resting point (78% / 30% of the panel), centred right on the cursor
    tx = e.clientX - r.left - r.width * 0.78;
    ty = e.clientY - r.top - r.height * 0.3;
    kick();
  });
  box.addEventListener('pointerleave', () => {
    tx = 0;
    ty = 0;
    tau = SETTLE;
    kick();
  });
});

/* PDF viewer: pdf.js loads only when a document is opened; pages render as they scroll into view */

const viewer = document.querySelector<HTMLDialogElement>('[data-pdf-viewer]');
if (viewer) {
  const scroller = viewer.querySelector<HTMLElement>('[data-pdf-scroll]')!;
  const pagesEl = viewer.querySelector<HTMLElement>('[data-pdf-pages]')!;
  const status = viewer.querySelector<HTMLElement>('[data-pdf-status]')!;
  const titleEl = viewer.querySelector<HTMLElement>('[data-pdf-title]')!;
  const pageEl = viewer.querySelector<HTMLElement>('[data-pdf-page]')!;
  const totalEl = viewer.querySelector<HTMLElement>('[data-pdf-total]')!;
  const folder = viewer.querySelector<HTMLAnchorElement>('[data-pdf-folder]')!;
  const download = viewer.querySelector<HTMLAnchorElement>('[data-pdf-download]')!;
  const prev = viewer.querySelector<HTMLButtonElement>('[data-pdf-prev]')!;
  const next = viewer.querySelector<HTMLButtonElement>('[data-pdf-next]')!;
  type PdfDoc = import('pdfjs-dist').PDFDocumentProxy;
  let doc: PdfDoc | null = null;
  let task: { destroy: () => unknown } | null = null; // the loading task frees the document in pdf.js 6
  let session = 0;
  let current = 1;
  let observers: IntersectionObserver[] = [];

  const setPage = (n: number) => {
    current = n;
    pageEl.textContent = String(n);
    prev.disabled = n <= 1;
    next.disabled = !doc || n >= doc.numPages;
  };
  const goPage = (n: number) => {
    pagesEl.children[n - 1]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const open = async (src: string, title: string, folderUrl?: string) => {
    const id = ++session;
    titleEl.textContent = title;
    download.href = src;
    folder.hidden = !folderUrl;
    folder.href = folderUrl || '#';
    pagesEl.replaceChildren();
    totalEl.textContent = '…';
    status.hidden = false;
    status.textContent = 'Завантажуємо документ…';
    setPage(1);
    viewer.showModal();
    scroller.scrollTop = 0;

    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
      const loading = pdfjs.getDocument({ url: src });
      task = loading;
      const loaded = await loading.promise;
      if (id !== session) return;
      doc = loaded;
      totalEl.textContent = String(doc.numPages);
      setPage(1);

      // Size every page box up front (from page 1's shape) so the scrollbar is right from the start
      const first = await doc.getPage(1);
      const base = first.getViewport({ scale: 1 });
      const maxW = base.width > base.height ? '1100px' : '820px';
      // A one-page document fits the screen whole (above the panel); longer ones scroll
      viewer.style.setProperty(
        '--pv-width',
        doc.numPages === 1 ? `min(${maxW}, calc((100dvh - 250px) * ${base.width / base.height}))` : maxW,
      );
      const boxes = Array.from({ length: doc.numPages }, (_, i) => {
        const box = document.createElement('div');
        box.className = 'pv__page';
        box.dataset.page = String(i + 1);
        box.style.aspectRatio = `${base.width} / ${base.height}`;
        pagesEl.append(box);
        return box;
      });
      status.hidden = true;

      const render = async (box: HTMLElement) => {
        if (box.dataset.done || !doc) return;
        box.dataset.done = '1';
        const page = await doc.getPage(Number(box.dataset.page));
        const vp1 = page.getViewport({ scale: 1 });
        box.style.aspectRatio = `${vp1.width} / ${vp1.height}`;
        const scale = (box.clientWidth * Math.min(window.devicePixelRatio || 1, 2)) / vp1.width;
        const vp = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        box.append(canvas);
        await page.render({ canvas, viewport: vp }).promise;
      };

      const near = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && render(e.target as HTMLElement)),
        { root: scroller, rootMargin: '800px 0px' },
      );
      const visible = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => e.isIntersecting && setPage(Number((e.target as HTMLElement).dataset.page))),
        { root: scroller, rootMargin: '-45% 0px -45% 0px' },
      );
      boxes.forEach((b) => {
        near.observe(b);
        visible.observe(b);
      });
      observers = [near, visible];
    } catch (err) {
      console.error(err);
      status.hidden = false;
      status.textContent = 'Не вдалося відкрити документ. Спробуйте завантажити PDF.';
    }
  };

  document.querySelectorAll<HTMLElement>('[data-pdf]').forEach((trigger) =>
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      open(trigger.dataset.pdf!, trigger.dataset.pdfTitle ?? '', trigger.dataset.pdfFolder);
    }),
  );
  prev.addEventListener('click', () => goPage(current - 1));
  next.addEventListener('click', () => goPage(current + 1));
  viewer.querySelector('[data-pdf-close]')?.addEventListener('click', () => viewer.close());
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goPage(current + 1); }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goPage(current - 1); }
  });
  viewer.addEventListener('close', () => {
    session++;
    observers.forEach((o) => o.disconnect());
    observers = [];
    task?.destroy();
    task = null;
    doc = null;
    pagesEl.replaceChildren();
  });
}
