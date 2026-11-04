// Phosphor icons (regular weight), inlined at build time.
import balloon from '@phosphor-icons/core/assets/regular/balloon.svg?raw';
import rocketLaunch from '@phosphor-icons/core/assets/regular/rocket-launch.svg?raw';
import usersThree from '@phosphor-icons/core/assets/regular/users-three.svg?raw';
import sunHorizon from '@phosphor-icons/core/assets/regular/sun-horizon.svg?raw';
import handshake from '@phosphor-icons/core/assets/regular/handshake.svg?raw';
import confetti from '@phosphor-icons/core/assets/regular/confetti.svg?raw';
import lightbulb from '@phosphor-icons/core/assets/regular/lightbulb-filament.svg?raw';
import park from '@phosphor-icons/core/assets/regular/park.svg?raw';
import scroll from '@phosphor-icons/core/assets/regular/scroll.svg?raw';
import handHeart from '@phosphor-icons/core/assets/regular/hand-heart.svg?raw';
import babyCarriage from '@phosphor-icons/core/assets/regular/baby-carriage.svg?raw';
import graduationCap from '@phosphor-icons/core/assets/regular/graduation-cap.svg?raw';
import sealCheck from '@phosphor-icons/core/assets/regular/seal-check.svg?raw';
import chartLineUp from '@phosphor-icons/core/assets/regular/chart-line-up.svg?raw';
import smiley from '@phosphor-icons/core/assets/regular/smiley.svg?raw';
import heartHalf from '@phosphor-icons/core/assets/regular/heart-half.svg?raw';
import fileText from '@phosphor-icons/core/assets/regular/file-text.svg?raw';
import buildings from '@phosphor-icons/core/assets/regular/buildings.svg?raw';

import mapPin from '@phosphor-icons/core/assets/regular/map-pin.svg?raw';
import arrowRight from '@phosphor-icons/core/assets/regular/arrow-right.svg?raw';
import arrowUpRight from '@phosphor-icons/core/assets/regular/arrow-up-right.svg?raw';
import copy from '@phosphor-icons/core/assets/regular/copy.svg?raw';
import check from '@phosphor-icons/core/assets/regular/check.svg?raw';
import list from '@phosphor-icons/core/assets/regular/list.svg?raw';
import x from '@phosphor-icons/core/assets/regular/x.svg?raw';
import phone from '@phosphor-icons/core/assets/regular/phone.svg?raw';
import envelope from '@phosphor-icons/core/assets/regular/envelope-simple.svg?raw';
import instagram from '@phosphor-icons/core/assets/regular/instagram-logo.svg?raw';
import facebook from '@phosphor-icons/core/assets/regular/facebook-logo.svg?raw';
import telegram from '@phosphor-icons/core/assets/regular/telegram-logo.svg?raw';
import youtube from '@phosphor-icons/core/assets/regular/youtube-logo.svg?raw';
import heart from '@phosphor-icons/core/assets/fill/heart-fill.svg?raw';
import calendar from '@phosphor-icons/core/assets/regular/calendar-blank.svg?raw';
import chatDots from '@phosphor-icons/core/assets/regular/chat-circle-dots.svg?raw';
import folderOpen from '@phosphor-icons/core/assets/regular/folder-open.svg?raw';
import presentation from '@phosphor-icons/core/assets/regular/presentation.svg?raw';
import caretDown from '@phosphor-icons/core/assets/regular/caret-down.svg?raw';
import plus from '@phosphor-icons/core/assets/regular/plus.svg?raw';
import download from '@phosphor-icons/core/assets/regular/download-simple.svg?raw';
// Phosphor has no Viber logo; this one is drawn in the same outline style
import viber from '../assets/icons/viber.svg?raw';
import cornersOut from '@phosphor-icons/core/assets/regular/corners-out.svg?raw';
import filePdf from '@phosphor-icons/core/assets/regular/file-pdf.svg?raw';
import clockCountdown from '@phosphor-icons/core/assets/regular/clock-countdown.svg?raw';
import playCircle from '@phosphor-icons/core/assets/regular/play-circle.svg?raw';
import article from '@phosphor-icons/core/assets/regular/article.svg?raw';

export const icons = {
  balloon,
  rocketLaunch,
  usersThree,
  sunHorizon,
  handshake,
  confetti,
  lightbulb,
  park,
  scroll,
  handHeart,
  babyCarriage,
  graduationCap,
  sealCheck,
  chartLineUp,
  smiley,
  heartHalf,
  fileText,
  buildings,
  mapPin,
  arrowRight,
  arrowUpRight,
  copy,
  check,
  list,
  x,
  phone,
  envelope,
  instagram,
  facebook,
  telegram,
  youtube,
  heart,
  calendar,
  cornersOut,
  viber,
  chatDots,
  folderOpen,
  presentation,
  caretDown,
  plus,
  download,
  filePdf,
  clockCountdown,
  playCircle,
  article,
} as const;

export type IconName = keyof typeof icons;
