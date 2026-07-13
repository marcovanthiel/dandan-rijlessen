#!/usr/bin/env node
/* Generate consistent lesson images for Dandan Drive.
   All scenes use the same red learner car and a driver based on Marco's
   supplied reference: Asian woman, long dark hair, round red-brown glasses,
   calm friendly expression. */
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { MANIFEST } = require('../photos/prompt-map.js');

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const IMG = join(ROOT, 'img');
const TMP = join(tmpdir(), 'dandan-red-car-photos');
if (!existsSync(IMG)) mkdirSync(IMG, { recursive: true });
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true });

const W = 1200;
const H = 800;

function e(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function defs() {
  return `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9edff"/><stop offset="1" stop-color="#f7fbff"/></linearGradient>
  <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ca8b7"/><stop offset="1" stop-color="#6f7b8a"/></linearGradient>
  <linearGradient id="red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f45b59"/><stop offset=".55" stop-color="#cf2633"/><stop offset="1" stop-color="#9f1726"/></linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecf7ff"/><stop offset="1" stop-color="#a9c8e8"/></linearGradient>
  <linearGradient id="dash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#263548"/><stop offset="1" stop-color="#111b29"/></linearGradient>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#07152b" flood-opacity=".22"/></filter>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
</defs>`;
}

function person(x, y, s = 1, opts = {}) {
  const gaze = opts.gaze || 0;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-50 -2 C-55 -66 -22 -98 18 -94 C58 -90 75 -48 65 14 C58 54 36 76 5 78 C-28 76 -48 42 -50 -2Z" fill="#151924"/>
    <path d="M-37 6 C-42 -43 -17 -72 15 -70 C48 -68 63 -38 56 9 C50 49 31 66 6 66 C-21 66 -35 41 -37 6Z" fill="#f0c0a5"/>
    <path d="M-35 -4 C-37 -45 -12 -66 15 -64 C42 -62 57 -35 53 3 C40 -17 17 -25 -4 -20 C-18 -17 -29 -11 -35 -4Z" fill="#111827"/>
    <circle cx="${-12 + gaze}" cy="5" r="3.4" fill="#1d2939"/>
    <circle cx="${19 + gaze}" cy="5" r="3.4" fill="#1d2939"/>
    <path d="M-26 3 C-18 -5 -5 -4 2 3 M8 3 C15 -5 31 -5 38 3" fill="none" stroke="#7a2330" stroke-width="5" stroke-linecap="round"/>
    <path d="M2 3 H8" stroke="#7a2330" stroke-width="4" stroke-linecap="round"/>
    <path d="M-5 30 C7 41 23 38 34 28" fill="none" stroke="#9b4237" stroke-width="4" stroke-linecap="round"/>
    <path d="M-50 83 C-34 54 44 54 67 84 L80 150 H-68Z" fill="#bde7df"/>
  </g>`;
}

function redCar(x, y, s = 1, opts = {}) {
  const angle = opts.angle || 0;
  const mirror = opts.mirror ? -1 : 1;
  return `<g transform="translate(${x} ${y}) scale(${s}) rotate(${angle})" filter="url(#shadow)">
    <g transform="scale(${mirror} 1)">
      <ellipse cx="8" cy="96" rx="250" ry="34" fill="#07152b" opacity=".2" filter="url(#soft)"/>
      <path d="M-246 56 C-238 9 -204 -13 -150 -19 L-91 -88 C-65 -119 -9 -131 48 -130 H102 C154 -127 190 -96 218 -42 L246 -35 C278 -28 294 -2 292 42 L290 62 C288 83 270 96 246 96 H-222 C-245 96 -257 80 -246 56Z" fill="url(#red)"/>
      <path d="M-214 48 C-169 7 -95 -8 -28 -8 H141 C197 -8 248 8 289 38 L289 60 C178 33 -93 31 -246 62 C-246 56 -238 49 -214 48Z" fill="#fff" opacity=".16"/>
      <path d="M-93 -24 L-50 -80 H22 L22 -24Z" fill="url(#glass)"/>
      <path d="M38 -24 L38 -80 H98 C132 -79 153 -57 173 -24Z" fill="url(#glass)"/>
      ${person(78, -48, .45, { gaze: opts.gaze || 0 })}
      <rect x="-84" y="-2" width="42" height="11" rx="5" fill="#5b1720" opacity=".45"/>
      <rect x="222" y="14" width="44" height="24" rx="12" fill="#fff3bf"/>
      <rect x="-242" y="28" width="36" height="18" rx="9" fill="#7f1d2d"/>
      <circle cx="-157" cy="94" r="52" fill="#151c29"/>
      <circle cx="-157" cy="94" r="23" fill="#d9e2ef"/>
      <circle cx="178" cy="94" r="52" fill="#151c29"/>
      <circle cx="178" cy="94" r="23" fill="#d9e2ef"/>
    </g>
  </g>`;
}

function dutchBackdrop(kind) {
  const bike = kind.includes('cycl') || kind.includes('fiets') || kind.includes('afsl');
  const wet = kind.includes('wet') || kind.includes('dusk') || kind.includes('moeil');
  const motorway = kind.includes('motorway') || kind.includes('merge') || kind.includes('exit') || kind.includes('invoeg') || kind.includes('uitvoeg');
  const crossing = kind.includes('zebra') || kind.includes('pedestrian');
  const roundabout = kind.includes('roundabout') || kind.includes('rotonde');
  return `<rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="1018" cy="105" r="54" fill="#ffd977" opacity=".75"/>
  <g opacity=".9">
    <rect x="92" y="244" width="132" height="210" rx="8" fill="#c8d3e1"/>
    <rect x="254" y="190" width="116" height="264" rx="8" fill="#d7dfeb"/>
    <rect x="824" y="222" width="156" height="232" rx="8" fill="#c3cfde"/>
    <rect x="1008" y="174" width="112" height="280" rx="8" fill="#d5deea"/>
    ${Array.from({ length: 20 }, (_, i) => `<rect x="${118 + (i % 5) * 22}" y="${274 + Math.floor(i / 5) * 34}" width="11" height="16" rx="2" fill="#edf4fb" opacity=".82"/>`).join('')}
    ${Array.from({ length: 20 }, (_, i) => `<rect x="${846 + (i % 5) * 24}" y="${254 + Math.floor(i / 5) * 34}" width="12" height="16" rx="2" fill="#edf4fb" opacity=".82"/>`).join('')}
  </g>
  <rect x="0" y="450" width="${W}" height="350" fill="${wet ? '#bdc8d8' : '#dfead7'}"/>
  ${motorway
    ? `<path d="M-20 755 C270 524 864 520 1220 746 L1220 800 H-20Z" fill="url(#road)"/>
       <path d="M120 690 C375 540 845 540 1080 690" fill="none" stroke="#fff" stroke-width="10" stroke-dasharray="58 46" opacity=".9"/>
       <path d="M-20 608 C260 492 940 488 1220 610" fill="none" stroke="#f2c94c" stroke-width="8" opacity=".9"/>`
    : roundabout
      ? `<rect x="0" y="500" width="${W}" height="246" fill="url(#road)"/>
         <circle cx="610" cy="622" r="174" fill="#6f7b8a"/>
         <circle cx="610" cy="622" r="92" fill="#b8d59f"/>
         <circle cx="610" cy="622" r="132" fill="none" stroke="#fff" stroke-width="9" stroke-dasharray="32 28"/>`
      : `<rect x="0" y="518" width="${W}" height="210" fill="url(#road)"/>
         <line x1="30" y1="624" x2="1170" y2="624" stroke="#fff" stroke-width="9" stroke-dasharray="54 42" stroke-linecap="round"/>
         <rect x="0" y="504" width="${W}" height="10" fill="#cbd5e1"/>
         <rect x="0" y="724" width="${W}" height="12" fill="#cbd5e1"/>`}
  ${bike ? `<rect x="0" y="748" width="${W}" height="52" fill="#bd3b3b" opacity=".78"/>
    <line x1="0" y1="773" x2="${W}" y2="773" stroke="#fff" stroke-width="5" stroke-dasharray="30 22" opacity=".8"/>` : ''}
  ${crossing ? Array.from({ length: 9 }, (_, i) => `<rect x="${248 + i * 78}" y="538" width="42" height="178" fill="#fff" opacity=".88"/>`).join('') : ''}
  ${kind.includes('rail') ? `<g transform="translate(0 520)"><line x1="0" y1="0" x2="${W}" y2="178" stroke="#374151" stroke-width="9"/><line x1="0" y1="54" x2="${W}" y2="232" stroke="#374151" stroke-width="9"/></g>` : ''}
  ${kind.includes('cone') || kind.includes('training') ? Array.from({ length: 7 }, (_, i) => `<path d="M${220 + i * 112} 694 l22 -74 l22 74Z" fill="#f97316"/><rect x="${232 + i * 112}" y="662" width="20" height="7" fill="#fff"/>`).join('') : ''}
  ${kind.includes('bus') ? `<g transform="translate(750 475)"><rect width="250" height="110" rx="18" fill="#f0c419"/><rect x="24" y="22" width="160" height="38" rx="6" fill="#d9edff"/><circle cx="62" cy="110" r="26" fill="#263548"/><circle cx="202" cy="110" r="26" fill="#263548"/></g>` : ''}
  ${kind.includes('parking') || kind.includes('park') ? `<g opacity=".78">${redCar(240, 616, .42, { mirror: true })}${redCar(980, 616, .42)}</g>` : ''}`;
}

function interiorScene(kind, title) {
  const foot = kind.includes('foot') || kind.includes('clutch') || kind.includes('accelerator');
  const gear = kind.includes('gear');
  const mirror = kind.includes('mirror');
  const dash = kind.includes('dashboard') || kind.includes('ADAS') || kind.includes('navigation');
  return `<rect width="${W}" height="${H}" fill="#dce8f5"/>
  <path d="M0 0 H1200 V410 C870 325 366 328 0 420Z" fill="url(#sky)"/>
  <path d="M0 350 C305 280 895 280 1200 350 V800 H0Z" fill="url(#dash)"/>
  <path d="M180 250 C430 192 778 192 1030 250 L1110 515 C805 430 388 430 90 515Z" fill="#111b29"/>
  <path d="M230 268 C450 220 748 220 970 268 L1012 430 C760 382 444 382 188 430Z" fill="#d9edff"/>
  ${person(860, 344, .72, { gaze: mirror ? -3 : 0 })}
  <circle cx="386" cy="558" r="140" fill="none" stroke="#0b1220" stroke-width="42"/>
  <circle cx="386" cy="558" r="24" fill="#0b1220"/>
  <path d="M268 560 H504 M386 420 V696" stroke="#0b1220" stroke-width="18" stroke-linecap="round" opacity=".75"/>
  ${foot ? `<g transform="translate(690 602)"><rect x="0" y="0" width="130" height="50" rx="14" fill="#111827"/><rect x="166" y="-18" width="116" height="68" rx="14" fill="#111827"/><path d="M72 -42 C132 -22 148 18 126 50 C70 42 40 15 22 -24Z" fill="#e9d6bf"/></g>` : ''}
  ${gear ? `<g transform="translate(645 540)"><rect x="0" y="85" width="142" height="86" rx="22" fill="#111827"/><path d="M72 102 V0" stroke="#303b4d" stroke-width="18" stroke-linecap="round"/><circle cx="72" cy="-8" r="48" fill="#151c29"/><path d="M34 -12 H110 M54 -34 V14 M90 -34 V14" stroke="#d9e2ef" stroke-width="6" opacity=".8"/></g>` : ''}
  ${mirror ? `<g transform="translate(500 230)"><rect width="226" height="58" rx="20" fill="#101828"/><rect x="15" y="10" width="196" height="38" rx="14" fill="#c8ddf2"/><g transform="translate(112 30) scale(.22)">${person(0, 0, 1)}</g></g>` : ''}
  ${dash ? `<g transform="translate(540 462)"><rect width="220" height="100" rx="18" fill="#0f172a"/><circle cx="62" cy="50" r="35" fill="none" stroke="#22a06b" stroke-width="9"/><path d="M130 35 H188 M130 58 H174" stroke="#9ccaff" stroke-width="10" stroke-linecap="round"/></g>` : ''}
  <path d="M70 708 C280 642 896 642 1130 708 V800 H70Z" fill="#c72735"/>
  <rect x="0" y="720" width="1200" height="80" fill="#961827"/>`;
}

function sceneKind(it) {
  const s = `${it.key} ${it.title} ${it.prompt}`.toLowerCase();
  if (/dashboard|interior|steering|hands|foot|clutch|accelerator|gear|mirror|navigation|adas|seatbelt|posture|ignition/.test(s)) return 'interior dashboard mirror foot clutch accelerator gear navigation ADAS';
  return s;
}

function svgFor(it) {
  const kind = sceneKind(it);
  const interior = kind.includes('interior') || kind.includes('dashboard') || kind.includes('steering') || kind.includes('foot') || kind.includes('gear') || kind.includes('mirror');
  const carX = kind.includes('reverse') || kind.includes('parking') ? 662 : kind.includes('overtak') || kind.includes('inhalen') ? 730 : 604;
  const carY = kind.includes('motorway') || kind.includes('merge') || kind.includes('exit') ? 606 : 592;
  const carS = kind.includes('roundabout') ? .58 : kind.includes('parking') ? .56 : .68;
  const angle = kind.includes('turning right') || kind.includes('junction') ? 7 : kind.includes('reverse') ? -5 : kind.includes('roundabout') ? -13 : 0;
  const ext = `${dutchBackdrop(kind)}
    ${kind.includes('pedestrian') ? `<g transform="translate(442 496)"><circle cx="0" cy="0" r="22" fill="#f0c0a5"/><path d="M0 24 V104 M0 52 L-44 90 M0 56 L38 96 M0 104 L-32 172 M0 104 L38 168" stroke="#1f2937" stroke-width="16" stroke-linecap="round"/></g>` : ''}
    ${redCar(carX, carY, carS, { angle, mirror: kind.includes('reverse') })}
    ${kind.includes('following') || kind.includes('volgafstand') ? redCar(260, 575, .43, { mirror: true }) : ''}
    ${kind.includes('opposite') || kind.includes('tegemoet') ? redCar(900, 576, .46, { mirror: true }) : ''}
    ${kind.includes('exam') ? `<g transform="translate(465 430) scale(.38)">${person(0, 0, 1, { gaze: -2 })}</g>` : ''}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${defs()}
  ${interior ? interiorScene(kind, it.title) : ext}
  <rect x="18" y="18" width="1164" height="764" rx="34" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="2"/>
</svg>`;
}

for (const it of MANIFEST) {
  const svg = join(TMP, `${it.key}.svg`);
  const png = join(TMP, `${it.key}.png`);
  const webp = join(IMG, `${it.key}.webp`);
  writeFileSync(svg, svgFor(it));
  execFileSync('rsvg-convert', ['-w', String(W), '-h', String(H), '-o', png, svg], { stdio: 'ignore' });
  execFileSync('cwebp', ['-quiet', '-q', '88', png, '-o', webp], { stdio: 'ignore' });
  console.log(`ok ${it.key}.webp`);
}

const ogSvg = join(TMP, 'og.svg');
const ogPng = join(ROOT, 'og.png');
writeFileSync(ogSvg, `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
${defs()}
<rect width="1200" height="630" fill="#d9edff"/>
<circle cx="1016" cy="94" r="54" fill="#ffd977" opacity=".85"/>
<rect x="0" y="398" width="1200" height="232" fill="#dfead7"/>
<rect x="0" y="430" width="1200" height="114" fill="url(#road)"/>
<line x1="24" y1="486" x2="1176" y2="486" stroke="#fff" stroke-width="8" stroke-dasharray="56 42" stroke-linecap="round"/>
<rect x="88" y="92" width="96" height="96" rx="18" fill="#ffd23f"/>
<text x="136" y="156" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="68" font-weight="900" fill="#07152b">D</text>
<text x="214" y="140" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="60" font-weight="850" fill="#07152b">Dandan Drive</text>
<text x="218" y="188" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="28" font-weight="700" fill="#42526e">Rijbewijs leren in jouw taal</text>
${redCar(620, 452, .9)}
<text x="282" y="586" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="26" font-weight="800" fill="#42526e">11 talen · theorie · praktijk · oefenexamen</text>
</svg>`);
execFileSync('rsvg-convert', ['-w', '1200', '-h', '630', '-o', ogPng, ogSvg], { stdio: 'ignore' });
console.log('ok og.png');

rmSync(TMP, { recursive: true, force: true });
console.log(`Generated ${MANIFEST.length} red-car driver images in img/ and refreshed og.png.`);
