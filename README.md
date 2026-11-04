# Спільно з тобою — лендинг

Статический сайт на [Astro](https://astro.build). На выходе чистый HTML/CSS/JS в `dist/`, который можно залить на любой хостинг.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # сборка в dist/
```

## Где что лежит

| Что | Где |
|---|---|
| Весь текст и контент (проекты, цифры, новости, партнёры, реквизиты) | `src/data/site.ts` |
| Иконки (Phosphor) | `src/data/icons.ts` |
| Блоки страницы | `src/components/*.astro` |
| Цвета, шрифты, общие стили | `src/styles/global.css` |
| Интерактив (меню, фильтры, донат, табы) | `src/scripts/main.ts` |
| Фото и документы | `src/assets/photos`, `src/assets/docs` |
| Лого (вектор, перерисовано 1:1) | `src/assets/logo` |

## Как заменить фото

Положите оригинал в `src/assets/photos/` под **тем же именем** (например, `optimists.jpg`). Astro сам сожмёт его и нарежет размеры в WebP.

