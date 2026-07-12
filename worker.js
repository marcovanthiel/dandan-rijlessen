// Dandan Drive: paywall-worker (fase 1 + meertalige chrome, fase 6-fundament).
// Zero-dependency: eigen mini-router, D1 (accounts/sessies/passen/statistiek),
// e-mailcode-login via Resend, server-side gerenderde lescontent per gebruiker.
// Taal: chrome in de voorkeurstaal (zh/nl/en, cookie dd_lang of account),
// lestekst in de lestaal (nu zh) met nette fallback-melding.
import { SITE, HOME_BANNER, CONTENT, LESTALEN, TOTAL_PAGES, ASSET_VER } from './worker-content.js';
import { t, TALEN, TAALNAMEN } from './i18n.js';
import * as F from './features.js';

const SEC = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; form-action 'self'",
};
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function sha256(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
const cookies = (req) => Object.fromEntries((req.headers.get('Cookie') || '').split(/;\s*/).filter(Boolean).map((c) => [c.slice(0, c.indexOf('=')), c.slice(c.indexOf('=') + 1)]));
const taalCookie = (l) => `dd_lang=${l}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`;

// ---------- html-schil ----------
function shell(L, title, body, o = {}) {
  const noindex = o.noindex ? '<meta name="robots" content="noindex">' : '';
  const desc = o.desc || SITE.tagZh + ' ' + SITE.tagNl;
  const canon = SITE.baseUrl + (o.path || '/');
  const rtl = L === 'ar' ? ' dir="rtl"' : '';
  const hreflang = o.hreflang ? TALEN.map((x) => `<link rel="alternate" hreflang="${x}" href="${SITE.baseUrl}/?taal=${x}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${SITE.baseUrl}/">` : '';
  return `<!doctype html><html lang="${L}"${rtl}><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">${noindex}
<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" href="/favicon.svg">
<meta name="theme-color" content="#14488f"><link rel="canonical" href="${canon}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Dandan Drive">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canon}"><meta property="og:image" content="${SITE.baseUrl}/og.png">
<meta name="twitter:card" content="summary_large_image">${hreflang}
<link rel="manifest" href="/manifest.webmanifest">
<link rel="stylesheet" href="/assets/style.css?v=${ASSET_VER}">
</head><body data-nl="on"${o.gated ? ' class="beschermd"' : ''}>
<a class="skip-link" href="#inhoud">${esc(t(L, 'skip'))}</a>${body}
<script src="/assets/search.js?v=${ASSET_VER}" defer></script><script src="/assets/interactie.js?v=${ASSET_VER}" defer></script>${o.gated ? `<script src="/assets/les.js?v=${ASSET_VER}" defer></script>` : ''}
</body></html>`;
}
function siteHeader(L, user, mods) {
  // Ingelogd: opgeruimde, gecategoriseerde navigatie — dashboard + de twee
  // leercategorieën (praktijk/theorie) + examen + boek. Dezelfde indeling als
  // de linker cursusbalk en het dashboard.
  const nav = `<a href="/leren">${esc(t(L, 'leren.kop'))}</a>`
    + `<a href="/leren#praktijk">🚗 ${esc(t(L, 'nav.praktijk'))}</a>`
    + `<a href="/leren#theorie">📘 ${esc(t(L, 'nav.theorie'))}</a>`
    + `<a href="/oefenexamen">🎓 ${esc(t(L, 'nav.examen'))}</a>`
    + `<a href="/boek-index">${esc(t(L, 'nav.boek'))}</a>`;
  const rechts = user
    ? `<a href="/account">👤 ${esc(user.email.split('@')[0])}</a>${user.is_admin ? '<a href="/admin">beheer</a>' : ''}`
    : `<a href="/login">${esc(t(L, 'nav.login'))}</a>`;
  return `<header class="site"><div class="container">
  <a class="brand" href="/" style="color:#fff"><span class="logo">丹</span>
    <span><span lang="nl">Dandan Drive</span><small>${esc(SITE.titleZh)} · 驾照路考</small></span></a>
  <nav>${user ? nav : `<a href="/">${esc(t(L, 'nav.home'))}</a><a href="/prijzen">${esc(t(L, 'landing.prijskop'))}</a>`}${rechts}
  ${user ? `<label class="searchbox">🔍<input id="q" type="search" placeholder="${esc(t(L, 'nav.zoek'))}" autocomplete="off" aria-label="${esc(t(L, 'nav.zoek'))}"></label>` : ''}</nav>
  </div><div id="results" class="container" style="display:none"></div></header>`;
}
const siteFooter = (L) => `<footer class="site"><div class="container">
  <strong>Dandan Drive · ${esc(SITE.titleZh)}</strong><br>
  ${esc(t(L, 'footer.tekst'))} · ${esc(SITE.domain)} · <a href="/login">${esc(t(L, 'nav.login'))}</a>
  </div></footer>`;
function page(L, title, inner, o = {}) {
  const mods = CONTENT[LESTALEN.includes(L) ? L : 'zh'].modules;
  const body = siteHeader(L, o.user, mods) + `<main id="inhoud"><div class="container">` + inner + `</div></main>` + siteFooter(L);
  const headers = { 'Content-Type': 'text/html; charset=utf-8', ...SEC };
  if (o.setTaal) headers['Set-Cookie'] = taalCookie(o.setTaal);
  return new Response(shell(L, title, body, o), { status: o.status || 200, headers });
}
const redirect = (to, extra = {}) => new Response(null, { status: 302, headers: { Location: to, ...extra } });

// ---------- auth ----------
async function getUser(req, env) {
  const tk = cookies(req).dd_sess;
  if (!tk) return null;
  const r = await env.DB.prepare(
    `SELECT u.id, u.email, u.lang, u.is_admin, u.exam_date, u.ref_code FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > datetime('now')`
  ).bind(await sha256(tk)).first();
  return r || null;
}
function taalVan(req, user, url) {
  const q = url.searchParams.get('taal');
  if (q && TALEN.includes(q)) return q;
  if (user && TALEN.includes(user.lang)) return user.lang;
  const c = cookies(req).dd_lang;
  if (c && TALEN.includes(c)) return c;
  return user ? 'zh' : 'nl';
}
// Best-effort gedrags-rem per isolate (echte bron = D1-events; zie DEPLOY.md)
const RATE = new Map();
function overRateLimit(userId) {
  const uur = Math.floor(Date.now() / 3600000);
  const k = userId + ':' + uur;
  const cur = (RATE.get(k) || 0) + 1;
  RATE.set(k, cur);
  if (RATE.size > 5000) RATE.clear();
  return cur > 240;
}
async function activePass(env, userId) {
  return env.DB.prepare(`SELECT kind, scope, ends_at FROM passes WHERE user_id = ? AND ends_at > datetime('now') ORDER BY ends_at DESC LIMIT 1`).bind(userId).first();
}
// Per-rijbewijs toegang. Auto B is gesplitst in twee losse modules:
// theorie-examen (b-theorie) en praktijk-examen (b-praktijk). De info-wegwijzer
// is gratis. Een pas-scope 'dekt' een set secties:
const SECTIE_SCOPE = { theorie: 'b-theorie', praktijk: 'b-praktijk', info: 'free', am: 'am', motor: 'motor', aanhanger: 'be' };
const SCOPE_DEKT = {
  all: ['b-theorie', 'b-praktijk', 'am', 'motor', 'be'], // bestaande/admin passen (grandfather)
  b: ['b-theorie', 'b-praktijk'],                        // auto-bundel (theorie + praktijk samen)
  'b-theorie': ['b-theorie'], 'b-praktijk': ['b-praktijk'],
  am: ['am'], motor: ['motor'], be: ['be'],
};
async function activePasses(env, userId) {
  return (await env.DB.prepare(`SELECT kind, scope, ends_at FROM passes WHERE user_id = ? AND ends_at > datetime('now') ORDER BY ends_at DESC`).bind(userId).all()).results || [];
}
// Toegang tot een sectie? Admin altijd; info is gratis; anders een actieve pas
// waarvan de scope de vereiste sectie-scope dekt.
function magSectie(passes, isAdmin, sectie) {
  if (isAdmin) return true;
  const nodig = SECTIE_SCOPE[sectie] || 'b-theorie';
  if (nodig === 'free') return true;
  return (passes || []).some((p) => (SCOPE_DEKT[p.scope] || [p.scope]).includes(nodig));
}
function scopeLabel(L, sc) {
  return sc === 'all' ? t(L, 'scope.all')
    : sc === 'b' ? 'Auto (theorie + praktijk)' : sc === 'b-theorie' ? 'Auto · theorie' : sc === 'b-praktijk' ? 'Auto · praktijk'
    : sc === 'am' ? t(L, 'sectie.am') : sc === 'motor' ? t(L, 'sectie.motor') : sc === 'be' ? t(L, 'sectie.aanhanger') : String(sc || 'b');
}
function recordEvent(env, ctx, type, pad, ref) {
  ctx.waitUntil(env.DB.prepare(
    `INSERT INTO events (day, type, path, ref, count) VALUES (date('now'), ?, ?, ?, 1)
     ON CONFLICT(day, type, path, ref) DO UPDATE SET count = count + 1`
  ).bind(type, (pad || '').slice(0, 80), (ref || '').slice(0, 60)).run().catch(() => {}));
}
function refVan(req, url) {
  const utm = url.searchParams.get('utm_source');
  if (utm) return 'utm:' + utm.slice(0, 40);
  try { const r = req.headers.get('Referer'); if (r) { const h = new URL(r).hostname; if (!h.endsWith('dandandrive.nl')) return h; } } catch {}
  return '';
}
async function mailCode(env, L, email, code) {
  if (!env.RESEND_API_KEY) return { dev: true }; // lokaal ontwikkelen zonder mail
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Afzender: geverifieerd domein binnen de merkfamilie (Resend gratis plan = 1 domein).
      // Open punt: eigen Resend-account voor @dandandrive.nl, dan dit adres omzetten.
      from: 'Dandan Drive <inlog@dandanshop.nl>', to: [email],
      subject: t(L, 'mail.onderwerp', { code }),
      text: t(L, 'mail.tekst', { code }),
    }),
  });
  return { ok: r.ok };
}

// ---------- landing ----------
function landingBody(L, reviewsHtml) {
  const taalkeuze = TALEN.map((x) => `<a href="/?taal=${x}"${x === L ? ' class="is-actief"' : ''} lang="${x}">${TAALNAMEN[x]}</a>`).join(' · ');
  const glasrij = [['🚗', t(L, 'nav.auto'), 'B', '€18'], ['🛵', t(L, 'sectie.am'), 'AM', '€8'], ['🏍️', t(L, 'sectie.motor'), 'A', '€12'], ['🚚', t(L, 'sectie.aanhanger'), 'BE', '€8']]
    .map(([e, n, , pr]) => `<a class="lp-hglink" href="/login"><span class="lp-em">${e}</span><span class="lp-tt"><b>${esc(n)}</b></span><span class="lp-pr">${pr}<small>/mnd</small></span></a>`).join('');
  const feats = `<ul><li>${esc(t(L, 'landing.feat1'))}</li><li>${esc(t(L, 'landing.feat2'))}</li><li>${esc(t(L, 'landing.feat3'))}</li></ul>`;
  const variant = (e, code, titel, eur) => `<div class="lp-plan"><div class="lp-pico">${e}</div>
    <div><span class="lp-code">${esc(code)}</span><h3>${esc(titel)}</h3></div>
    ${feats}
    <span class="lp-gratis">✦ ${esc(t(L, 'landing.proefles'))}</span>
    <div class="lp-prijs"><span class="lp-eur tnum">${eur}</span><span class="lp-per">/ ${t(L, 'landing.mnd1')}</span></div>
    <a class="lp-knop" href="/login">${esc(t(L, 'landing.kies'))} →</a></div>`;
  return `<div class="lp">
  <section class="lp-hero"><div class="lp-hwrap">
    <div>
      <span class="lp-pill">🇳🇱 · <b>11</b> 🗣️</span>
      <h1>${esc(t(L, 'landing.titel'))}</h1>
      <p class="lp-lead">${esc(t(L, 'landing.sub'))}</p>
      <a class="lp-cta" href="/login">${esc(t(L, 'landing.proef'))} →</a>
      <div class="lp-stat"><div><b>11</b> 🗣️</div><div><b>4</b> 🚗</div><div><b>85+</b> 🎓</div></div>
      <p class="lp-talen">${taalkeuze}</p>
    </div>
    <aside class="lp-glass" aria-label="${esc(t(L, 'landing.kieskop'))}">
      <div class="lp-gkop">${esc(t(L, 'landing.kieskop'))}</div>${glasrij}
    </aside>
  </div></section>

  <section class="lp-blk lp-alt" style="padding-block:clamp(2.2rem,4vw,3.2rem)"><div class="lp-wrap">
    <div class="lp-kop" style="margin-bottom:16px"><span class="lp-eyebrow">🌍 ${esc(t(L, 'landing.taalkop'))}</span></div>
    <div class="lp-talenchips">${TALEN.map((x) => `<a href="/?taal=${x}"${x === L ? ' class="aan"' : ''} lang="${x}">${TAALNAMEN[x]}</a>`).join('')}</div>
  </div></section>

  <section class="lp-blk" id="kiezer"><div class="lp-wrap">
    <div class="lp-kop"><span class="lp-eyebrow">${esc(t(L, 'landing.kieskop'))}</span><h2>${esc(t(L, 'landing.prijskop'))}</h2><p>${esc(t(L, 'landing.betaal'))}</p></div>
    <div class="lp-plans">
      <div class="lp-plan lp-feat"><span class="lp-badge">★</span><div class="lp-pico">🚗</div>
        <div><span class="lp-code">B · ${esc(t(L, 'nav.auto'))}</span><h3>${esc(t(L, 'nav.theorie'))} &amp; ${esc(t(L, 'nav.praktijk'))}</h3></div>
        <ul>
          <li class="lp-split">📖 ${esc(t(L, 'nav.theorie'))} <span class="lp-mp">€18<small>/mnd</small></span></li>
          <li class="lp-split">🚗 ${esc(t(L, 'nav.praktijk'))} <span class="lp-mp">€18<small>/mnd</small></span></li>
        </ul>
        <div class="lp-samen"><span class="lp-slbl">${esc(t(L, 'landing.samen'))}</span><span class="lp-eur tnum">€24</span></div>
        <span class="lp-gratis">✦ ${esc(t(L, 'landing.proefles'))}</span>
        <a class="lp-knop" href="/login">${esc(t(L, 'landing.kies'))} →</a></div>
      ${variant('🛵', 'AM', t(L, 'sectie.am'), '€8')}
      ${variant('🏍️', 'A', t(L, 'sectie.motor'), '€12')}
      ${variant('🚚', 'BE', t(L, 'sectie.aanhanger'), '€8')}
    </div>
    <div class="lp-note">${esc(t(L, 'landing.betaal'))}</div>
  </div></section>

  <section class="lp-blk lp-alt" id="hoe"><div class="lp-wrap">
    <div class="lp-kop"><span class="lp-eyebrow">${esc(t(L, 'landing.hoekop'))}</span><h2>${esc(t(L, 'landing.hoekop'))}</h2></div>
    <div class="lp-steps">
      <div class="lp-step"><div class="lp-bar"></div><h3>${esc(t(L, 'sectie.theorie'))}</h3><p>${esc(t(L, 'landing.usp1'))}</p></div>
      <div class="lp-step"><div class="lp-bar"></div><h3>${esc(t(L, 'nav.examen'))}</h3><p>${esc(t(L, 'landing.usp3'))}</p></div>
      <div class="lp-step"><div class="lp-bar"></div><h3>${esc(t(L, 'sectie.praktijk'))}</h3><p>${esc(t(L, 'landing.usp2'))}</p></div>
    </div>
  </div></section>

  <section class="lp-blk"><div class="lp-wrap"><div class="lp-gband">
    <span class="lp-gem">✦</span><div><h3>${esc(t(L, 'landing.proefles'))}</h3><p>${esc(t(L, 'landing.sub'))}</p></div>
    <a class="lp-cta" href="/login">${esc(t(L, 'landing.proef'))} →</a>
  </div></div></section>

  <section class="lp-blk lp-alt"><div class="lp-wrap">
    <div class="lp-trust"><div><div class="lp-n tnum">11</div><div class="lp-l">🗣️</div></div>
      <div><div class="lp-n tnum">4</div><div class="lp-l">🚗🛵🏍️🚚</div></div>
      <div><div class="lp-n tnum">85+</div><div class="lp-l">🎓</div></div>
      <div><div class="lp-n tnum">100%</div><div class="lp-l">✦</div></div></div>
    <p class="lp-bron">CBR · RDW · Rijksoverheid · RIS</p>
    <p style="text-align:center;margin-top:16px"><a class="lp-mut" href="/boek" rel="nofollow">📖 ${esc(t(L, 'boektip.link'))}</a> · <a class="lp-mut" href="/partner">${esc(t(L, 'nav.partner'))}</a></p>
    ${reviewsHtml || ''}
  </div></section>
  </div>`;
}

// ---------- lespagina's ----------
const lesTaalVoor = (L) => (LESTALEN.includes(L) ? L : 'zh');
function watermerk(user) {
  const tekst = esc(user.email) + ' · Dandan Drive';
  let spans = '';
  for (let i = 0; i < 12; i++) spans += `<span style="top:${(i % 6) * 18 + 4}%;left:${i < 6 ? 6 : 52}%">${tekst}</span>`;
  return `<div class="wm" aria-hidden="true">${spans}</div>`;
}
const lockCard = (L, p) => `<article class="script lock" id="${p.id}">
  <div class="script-top"><div class="script-title"><span class="script-icon">🔒</span>
  <h2>${p.step ? `<span class="step">步骤 ${esc(p.step)}</span> · ` : ''}${esc(p.label.replace(/^步骤\s*\d+[ab]?\s*·\s*/, ''))}</h2></div>
  ${p.page ? `<span class="bookpage">📖 p.${p.page}</span>` : ''}</div>
  ${p.nl ? `<div class="nl-title nl-only" lang="nl">${esc(p.nl)}</div>` : ''}
  <p class="locktekst">${esc(t(L, 'lock.tekst'))} <a href="/account">${esc(t(L, 'lock.bekijk'))}</a></p>
</article>`;
// Cursusnavigatie: linker menubalk met beide secties (praktijk/theorie),
// alle modules, de actieve module gemarkeerd, en onder de actieve module de
// onderdelen (met voortgang-vinkjes; de scrollspy in les.js licht de huidige op).
function courseNav(L, current, mods, doneSet, mag) {
  const lesT = lesTaalVoor(L);
  const pkey = (mm, p) => `${mm.sectie[0]}:${mm.slug}:${p.id}`;
  const secties = ['praktijk', 'theorie', 'info', 'am', 'motor', 'aanhanger'].map((sec) => {
    const lijst = mods.filter((mm) => mm.sectie === sec);
    if (!lijst.length) return '';
    const items = lijst.map((mm) => {
      const actief = current && mm.slug === current.slug;
      const totaal = mm.parts.length;
      const af = mm.parts.filter((p) => doneSet.has(pkey(mm, p))).length;
      const compleet = totaal > 0 && af === totaal;
      const prog = compleet ? '<span class="cn-check">✓</span>' : (af > 0 ? `<span class="cn-count">${af}/${totaal}</span>` : '');
      const sub = actief
        ? `<ul class="cn-parts">` + mm.parts.map((p) => {
            const done = doneSet.has(pkey(mm, p));
            const lock = !(mag(mm.sectie) || p.preview);
            return `<li><a href="#${p.id}" data-spy="${p.id}">${done ? '<span class="tick">✓</span> ' : ''}<span class="cn-plabel">${esc(p.label)}</span>${lock ? ' <span class="cn-lock" aria-label="vergrendeld">🔒</span>' : ''}</a></li>`;
          }).join('') + `</ul>`
        : '';
      return `<li class="cn-mod${actief ? ' active' : ''}${compleet ? ' done' : ''}"><a href="/${mm.slug}"${actief ? ' aria-current="page"' : ''}><span class="cn-num">${esc(mm.num)}</span><span class="cn-title" lang="${lesT}">${esc(mm.zh)}</span>${prog}</a>${sub}</li>`;
    }).join('');
    const secActief = current && current.sectie === sec;
    const ico = { theorie: '📘', info: '🧭', am: '🛵', motor: '🏍️', aanhanger: '🚚' }[sec] || '🚗';
    return `<div class="cn-sec${secActief ? ' active' : ''}"><div class="cn-sec-kop"><span class="cn-sec-ico" aria-hidden="true">${ico}</span>${esc(t(L, 'sectie.' + sec))}</div><ul class="cn-mods">${items}</ul></div>`;
  }).join('');
  const nu = current ? `${esc(t(L, 'sectie.' + current.sectie))} · ${esc(t(L, 'module.kicker', { n: current.num }))}` : esc(t(L, 'module.crumb'));
  return `<details class="cn-box" open><summary class="cn-summary"><span class="cn-here">${esc(t(L, 'module.crumb'))}:</span> ${nu}</summary><nav class="coursenav" aria-label="${esc(t(L, 'module.crumb'))}">${secties}</nav></details>`;
}
function moduleBody(L, m, user, doneSet, mag) {
  const lesT = lesTaalVoor(L);
  const vol = mag(m.sectie); // toegang tot deze rijbewijs-sectie
  const key = (p) => `${m.sectie[0]}:${m.slug}:${p.id}`;
  const afvink = (p) => `<form method="post" action="/voortgang" class="afvink"><input type="hidden" name="key" value="${key(p)}"><input type="hidden" name="terug" value="/${m.slug}#${p.id}">
    <button class="${doneSet.has(key(p)) ? 'is-af' : ''}">${doneSet.has(key(p)) ? '✓ ' + esc(t(L, 'pad.af')) : esc(t(L, 'pad.markeer'))}</button></form>`;
  const nav = courseNav(L, m, CONTENT[lesT].modules, doneSet, mag);
  const delen = m.parts.map((p) => (vol || p.preview ? p.html + afvink(p) : lockCard(L, p))).join('\n');
  const taalnote = L !== lesT ? `<div class="note">${esc(t(L, 'module.lestaal'))}</div>` : '';
  return `<div class="crumbs"><a href="/leren">${esc(t(L, 'module.crumb'))}</a> › ${esc(t(L, 'sectie.' + m.sectie))} › ${esc(t(L, 'module.kicker', { n: m.num }))}</div>
  <div class="modbanner">${m.banner}</div>
  <div class="module-head"><div class="kicker">${esc(t(L, 'sectie.' + m.sectie))} · ${esc(t(L, 'module.kicker', { n: m.num }))}</div>
  <h1 lang="${lesT}">${esc(m.zh)}</h1><div class="nl nl-only" lang="nl" style="color:var(--muted)">${esc(m.nl)}</div></div>
  ${taalnote}${vol ? '' : `<div class="note">${esc(t(L, 'module.previewnote'))}</div>`}
  ${m.introHtml ? `<div lang="${lesT}">${m.introHtml}</div>` : ''}
  <div class="layout"><aside class="toc">${nav}</aside><div class="les-wrap" lang="${lesT}">${watermerk(user)}${delen}</div></div>`;
}
function boekIndexBody(L, pmap) {
  const rows = pmap.map((e) => `<tr id="p${e.from}"><td class="pcol"><span class="pill">${e.from === e.to ? 'p.' + e.from : 'p.' + e.from + '-' + e.to}</span></td>
    <td>${e.step ? `步骤 ${esc(e.step)} · ` : ''}<a href="/${e.url.replace('.html', '')}">${esc(e.label)}</a>${e.nl ? `<div class="nl nl-only" lang="nl">${esc(e.nl)}</div>` : ''}</td>
    <td class="mcol">${esc(t(L, 'module.kicker', { n: e.module }))}</td></tr>`).join('');
  return `<div class="crumbs"><a href="/leren">${esc(t(L, 'module.crumb'))}</a> › ${esc(t(L, 'boek.kop'))}</div>
  <h1>${esc(t(L, 'boek.kop'))}</h1>
  <div class="note">${esc(t(L, 'boek.sub'))}</div>
  <div class="pagefind"><label>${esc(t(L, 'boek.label', { n: TOTAL_PAGES }))} <input id="pageq" type="number" min="1" max="${TOTAL_PAGES}" placeholder="5"></label>
  <button id="pagego">${esc(t(L, 'boek.ga'))}</button> <span id="pagemsg" class="pagemsg"></span></div>
  <table class="pagetable"><thead><tr><th>${esc(t(L, 'boek.thkop'))}</th><th>${esc(t(L, 'boek.thonderwerp'))}</th><th>${esc(t(L, 'boek.thmodule'))}</th></tr></thead><tbody>${rows}</tbody></table>`;
}
const loginBody = (L, o = {}) => `
  <h1>${esc(t(L, 'login.kop'))}</h1>
  <div class="note">${esc(t(L, 'login.sub'))}</div>
  ${o.fout ? `<div class="note fout" role="alert">${esc(o.fout)}</div>` : ''}
  ${o.dev ? `<div class="note fout" role="alert">DEV zonder RESEND_API_KEY; code = ${esc(o.dev)}</div>` : ''}
  ${o.email ? `
  <form method="post" action="/login/code" class="authform">
    <input type="hidden" name="email" value="${esc(o.email)}">
    <label>${esc(t(L, 'login.code'))} <input name="code" inputmode="numeric" pattern="[0-9]{6}" required autofocus autocomplete="one-time-code"></label>
    <button>${esc(t(L, 'login.inloggen'))}</button>
    <p><a href="/login">${esc(t(L, 'login.opnieuw'))}</a></p>
  </form>` : `
  <form method="post" action="/login" class="authform">
    <label>${esc(t(L, 'login.email'))} <input type="email" name="email" required autofocus autocomplete="email"></label>
    <button>${esc(t(L, 'login.stuur'))}</button>
  </form>`}`;

// ---------- app ----------
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const h = url.hostname;
    if (h === 'artnijmegen.nl' || h === 'www.artnijmegen.nl' || h === 'www.dandandrive.nl') {
      url.hostname = 'dandandrive.nl';
      return Response.redirect(url.toString(), 301);
    }
    const pad = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    const user = await getUser(request, env);
    const L = taalVan(request, user, url);

    // expliciete taalkeuze: cookie zetten (en accountvoorkeur bijwerken), dan schone URL
    if (url.searchParams.get('taal') && TALEN.includes(url.searchParams.get('taal')) && request.method === 'GET') {
      if (user && user.lang !== L) await env.DB.prepare(`UPDATE users SET lang = ? WHERE id = ?`).bind(L, user.id).run();
      return redirect(pad + (url.search.replace(/[?&]taal=[a-z]+/, '').replace(/^&/, '?') || ''), { 'Set-Cookie': taalCookie(L) });
    }

    // publiek
    if (pad === '/' && request.method === 'GET') {
      if (user) return redirect('/leren');
      recordEvent(env, ctx, 'view', '/', refVan(request, url));
      const rows = ((await env.DB.prepare(`SELECT naam, taal, tekst, sterren FROM reviews WHERE zichtbaar = 1 ORDER BY created_at DESC LIMIT 6`).all()).results) || [];
      const opts = { path: '/', desc: t(L, 'landing.sub'), hreflang: true };
      const refc = url.searchParams.get('ref');
      const resp = page(L, 'Dandan Drive · ' + SITE.titleZh, landingBody(L, F.reviewsBlok(L, rows)), opts);
      if (refc && /^[A-Z0-9]{4,12}$/i.test(refc)) resp.headers.append('Set-Cookie', `dd_ref=${refc.toUpperCase()}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`);
      return resp;
    }
    if (pad === '/partner' && request.method === 'GET')
      return page(L, t(L, 'nav.partner') + ' · Dandan Drive', F.partnerBody(L), { path: '/partner' });
    if (pad === '/prijzen' && request.method === 'GET')
      return page(L, t(L, 'landing.prijskop') + ' · Dandan Drive', F.prijzenBody(L, user), { user, path: '/prijzen' });
    if (pad === '/boek' && request.method === 'GET') {
      recordEvent(env, ctx, 'boekklik', '/boek', '');
      // Affiliate-parameter configureerbaar via env.BOEK_URL (aanname: bol.com-zoeklink tot een partnerdeal er is)
      return redirect(env.BOEK_URL || 'https://www.bol.com/nl/nl/s/?searchtext=rijopleiding+in+stappen+theorieboek');
    }
    if (pad === '/webhook/wechat' && request.method === 'POST') {
      // Fase 2: hier komt de WeChat Pay-notificatie (handtekening verifiëren, order op paid zetten, pas activeren).
      return new Response('betaalprovider nog niet actief', { status: 501 });
    }
    if (pad === '/login' && request.method === 'GET')
      return page(L, t(L, 'login.kop') + ' · Dandan Drive', loginBody(L), { noindex: true, path: '/login' });
    if (pad === '/login' && request.method === 'POST') {
      const f = await request.formData();
      const email = String(f.get('email') || '').trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 120)
        return page(L, t(L, 'login.kop'), loginBody(L, { fout: t(L, 'login.fout.email') }), { noindex: true, status: 400 });
      const vorige = await env.DB.prepare(`SELECT sent_at FROM login_codes WHERE email = ? AND sent_at > datetime('now', '-60 seconds')`).bind(email).first();
      if (vorige) return page(L, t(L, 'login.kop'), loginBody(L, { email, fout: t(L, 'login.fout.wacht') }), { noindex: true, status: 429 });
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await env.DB.prepare(`INSERT INTO login_codes (email, code_hash, expires_at, attempts, sent_at) VALUES (?, ?, datetime('now','+10 minutes'), 0, datetime('now'))
        ON CONFLICT(email) DO UPDATE SET code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0, sent_at = excluded.sent_at`)
        .bind(email, await sha256(code + email)).run();
      const m = await mailCode(env, L, email, code);
      recordEvent(env, ctx, 'login_code', '/login', '');
      return page(L, t(L, 'login.kop'), loginBody(L, { email, dev: m.dev ? code : '' }), { noindex: true });
    }
    if (pad === '/login/code' && request.method === 'POST') {
      const f = await request.formData();
      const email = String(f.get('email') || '').trim().toLowerCase();
      const code = String(f.get('code') || '').trim();
      const rij = await env.DB.prepare(`SELECT code_hash, attempts, (expires_at > datetime('now')) AS geldig FROM login_codes WHERE email = ?`).bind(email).first();
      if (!rij || rij.attempts >= 5 || !rij.geldig)
        return page(L, t(L, 'login.kop'), loginBody(L, { fout: t(L, 'login.fout.verlopen') }), { noindex: true, status: 400 });
      if (rij.code_hash !== await sha256(code + email)) {
        await env.DB.prepare(`UPDATE login_codes SET attempts = attempts + 1 WHERE email = ?`).bind(email).run();
        return page(L, t(L, 'login.kop'), loginBody(L, { email, fout: t(L, 'login.fout.onjuist') }), { noindex: true, status: 400 });
      }
      await env.DB.prepare(`DELETE FROM login_codes WHERE email = ?`).bind(email).run();
      let u = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first();
      if (!u) {
        const ref = (cookies(request).dd_ref || '').toUpperCase().slice(0, 12) || null;
        u = await env.DB.prepare(`INSERT INTO users (email, lang, referred_by) VALUES (?, ?, ?) RETURNING id`).bind(email, L, ref).first();
        recordEvent(env, ctx, 'signup', '', ref ? 'ref' : '');
      }
      const token = crypto.randomUUID() + crypto.randomUUID();
      await env.DB.prepare(`INSERT INTO sessions (token_hash, user_id, expires_at, ua) VALUES (?, ?, datetime('now','+30 days'), ?)`)
        .bind(await sha256(token), u.id, (request.headers.get('User-Agent') || '').slice(0, 120)).run();
      await env.DB.prepare(`DELETE FROM sessions WHERE user_id = ? AND token_hash NOT IN (
        SELECT token_hash FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 3)`).bind(u.id, u.id).run();
      recordEvent(env, ctx, 'login', '', '');
      return redirect('/leren', { 'Set-Cookie': `dd_sess=${token}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax` });
    }
    if (pad === '/logout' && request.method === 'POST') {
      const tk = cookies(request).dd_sess;
      if (tk) await env.DB.prepare(`DELETE FROM sessions WHERE token_hash = ?`).bind(await sha256(tk)).run();
      return redirect('/', { 'Set-Cookie': 'dd_sess=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax' });
    }

    // vanaf hier: inloggen vereist (incl. lesbeelden: /img en /foto zijn niet meer publiek)
    const gated = pad === '/leren' || pad === '/boek-index' || pad === '/account' || pad.startsWith('/account/') || pad === '/admin' || pad === '/search.json' || pad === '/pagemap.json' || /^\/(module|theorie|info|am|motor|aanhanger)-\d+$/.test(pad) || pad === '/begrippen' || pad.startsWith('/oefenexamen') || pad === '/voortgang' || pad === '/bestellen' || pad.startsWith('/betalen') || pad === '/voucher' || pad.startsWith('/img/');
    if (gated && !user) {
      recordEvent(env, ctx, 'locked_view', pad, refVan(request, url));
      return redirect('/login');
    }
    if (gated && overRateLimit(user.id)) return page(L, '429', `<h1>${esc(t(L, 'rate.kop'))}</h1><div class="note">${esc(t(L, 'rate.tekst'))}</div>`, { user, status: 429, noindex: true });
    if (pad.startsWith('/img/')) return env.ASSETS.fetch(request);
    const inhoud = CONTENT[lesTaalVoor(L)];
    if (pad === '/leren') {
      const passes = await activePasses(env, user.id);
      const mag = (s) => magSectie(passes, user.is_admin, s);
      const done = new Set(((await env.DB.prepare(`SELECT part_key FROM progress WHERE user_id = ?`).bind(user.id).all()).results || []).map((r) => r.part_key));
      let totaal = 0, af = 0;
      const modsMetPct = inhoud.modules.map((m) => {
        const keys = m.parts.map((p) => `${m.sectie[0]}:${m.slug}:${p.id}`);
        const d = keys.filter((k) => done.has(k)).length;
        totaal += keys.length; af += d;
        return { ...m, pct: keys.length ? Math.round((d / keys.length) * 100) : 0 };
      });
      const klaarPct = totaal ? Math.round((af / totaal) * 100) : 0;
      let vervolg = null;
      for (const m of modsMetPct) {
        for (const p of m.parts) {
          const k = `${m.sectie[0]}:${m.slug}:${p.id}`;
          if ((mag(m.sectie) || p.preview) && !done.has(k)) { vervolg = { slug: m.slug, num: m.num, sectie: m.sectie, mtitel: m.zh, pid: p.id, plabel: p.label }; break; }
        }
        if (vervolg) break;
      }
      recordEvent(env, ctx, 'view', '/leren', '');
      const dash = F.lerenBody(L, user, passes, { ...inhoud, modules: modsMetPct }, klaarPct, user.exam_date, HOME_BANNER, vervolg, mag);
      const inner = `<div class="layout"><aside class="toc">${courseNav(L, null, modsMetPct, done, mag)}</aside><div class="dash">${dash}</div></div>`;
      return page(L, t(L, 'leren.kop') + ' · Dandan Drive', inner, { user, noindex: true, path: '/leren' });
    }
    if (pad === '/voortgang' && request.method === 'POST') {
      const f = await request.formData();
      const key = String(f.get('key') || '').slice(0, 80);
      const terug = String(f.get('terug') || '/leren');
      const bestaat = await env.DB.prepare(`SELECT 1 x FROM progress WHERE user_id = ? AND part_key = ?`).bind(user.id, key).first();
      if (bestaat) await env.DB.prepare(`DELETE FROM progress WHERE user_id = ? AND part_key = ?`).bind(user.id, key).run();
      else await env.DB.prepare(`INSERT OR IGNORE INTO progress (user_id, part_key) VALUES (?, ?)`).bind(user.id, key).run();
      return redirect(terug.startsWith('/') ? terug : '/leren');
    }
    if (pad === '/begrippen') {
      recordEvent(env, ctx, 'view', '/begrippen', '');
      return page(L, t(L, 'nav.begrippen') + ' · Dandan Drive', F.begrippenBody(L), { user, gated: true, noindex: true, path: '/begrippen' });
    }
    if (pad === '/oefenexamen' && request.method === 'GET') {
      const laatste = ((await env.DB.prepare(`SELECT * FROM exam_attempts WHERE user_id = ? AND finished_at IS NOT NULL ORDER BY started_at DESC LIMIT 8`).bind(user.id).all()).results) || [];
      return page(L, t(L, 'nav.examen') + ' · Dandan Drive', F.examenOverzicht(L, laatste), { user, noindex: true, path: '/oefenexamen' });
    }
    if (pad === '/oefenexamen/start' && request.method === 'POST') {
      const f = await request.formData();
      const mode = String(f.get('mode') || 'examen');
      if (mode !== 'examen' && !/^onderwerp:[a-z]+$/.test(mode)) return redirect('/oefenexamen');
      const examPasses = await activePasses(env, user.id);
      if (!magSectie(examPasses, user.is_admin, 'theorie') && mode !== 'onderwerp:gevaar')
        return page(L, t(L, 'nav.examen'), `<h1>${esc(t(L, 'nav.examen'))}</h1><div class="note">${esc(t(L, 'quiz.pasnodig'))} <a href="/prijzen">${esc(t(L, 'leren.passen'))}</a></div>`, { user, noindex: true });
      const ids = F.stelVragenSamen(mode);
      const a = await env.DB.prepare(`INSERT INTO exam_attempts (user_id, mode, vragen) VALUES (?, ?, ?) RETURNING id`).bind(user.id, mode, JSON.stringify(ids)).first();
      recordEvent(env, ctx, 'quiz_start', mode, '');
      return redirect(`/oefenexamen/a/${a.id}/v/1`);
    }
    const qm = pad.match(/^\/oefenexamen\/a\/(\d+)\/v\/(\d+)$/);
    if (qm) {
      const attempt = await env.DB.prepare(`SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?`).bind(Number(qm[1]), user.id).first();
      if (!attempt) return redirect('/oefenexamen');
      const nvr = Number(qm[2]);
      const ids = JSON.parse(attempt.vragen);
      if (nvr < 1 || nvr > ids.length) return redirect('/oefenexamen');
      if (request.method === 'POST') {
        const f = await request.formData();
        const antw = JSON.parse(attempt.antwoorden || '{}');
        antw[ids[nvr - 1]] = String(f.get('antwoord') ?? '');
        const verlopen = attempt.mode === 'examen' && (Date.now() - new Date(attempt.started_at.replace(' ', 'T') + 'Z').getTime()) > F.EXAMEN.minuten * 60000;
        await env.DB.prepare(`UPDATE exam_attempts SET antwoorden = ? WHERE id = ?`).bind(JSON.stringify(antw), attempt.id).run();
        attempt.antwoorden = JSON.stringify(antw);
        if (attempt.mode !== 'examen')
          return page(L, t(L, 'nav.examen'), F.vraagBody(L, attempt, nvr, true), { user, gated: true, noindex: true });
        if (nvr < ids.length && !verlopen) return redirect(`/oefenexamen/a/${attempt.id}/v/${nvr + 1}`);
        return redirect(`/oefenexamen/a/${attempt.id}/resultaat`);
      }
      return page(L, t(L, 'nav.examen'), F.vraagBody(L, attempt, nvr, false), { user, gated: true, noindex: true });
    }
    const rm = pad.match(/^\/oefenexamen\/a\/(\d+)\/resultaat$/);
    if (rm) {
      const attempt = await env.DB.prepare(`SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?`).bind(Number(rm[1]), user.id).first();
      if (!attempt) return redirect('/oefenexamen');
      if (!attempt.finished_at) {
        const r = F.scoreAttempt(attempt);
        await env.DB.prepare(`UPDATE exam_attempts SET finished_at = datetime('now'), score = ?, totaal = ?, geslaagd = ? WHERE id = ?`)
          .bind(r.goed, r.totaal, r.geslaagd === null ? null : (r.geslaagd ? 1 : 0), attempt.id).run();
        recordEvent(env, ctx, 'quiz_klaar', attempt.mode, r.geslaagd ? 'geslaagd' : '');
      }
      return page(L, t(L, 'quiz.analyse') + ' · Dandan Drive', F.resultaatBody(L, attempt), { user, gated: true, noindex: true });
    }
    if (pad === '/bestellen' && request.method === 'POST') {
      const f = await request.formData();
      const scope = String(f.get('scope') || '');
      const eur = F.PRIJS[scope];
      if (!eur) return redirect('/prijzen');
      const id = crypto.randomUUID();
      // order.kind bewaart de gekozen rijbewijs-scope (product); bedrag uit PRIJS.
      await env.DB.prepare(`INSERT INTO orders (id, user_id, kind, amount_cents) VALUES (?, ?, ?, ?)`).bind(id, user.id, scope, eur * 100).run();
      recordEvent(env, ctx, 'order', scope, '');
      return redirect('/betalen/' + id);
    }
    const bm = pad.match(/^\/betalen\/([0-9a-f-]{36})$/);
    if (bm && request.method === 'GET') {
      const order = await env.DB.prepare(`SELECT * FROM orders WHERE id = ? AND user_id = ?`).bind(bm[1], user.id).first();
      if (!order) return redirect('/prijzen');
      return page(L, t(L, 'betaal.kop') + ' · Dandan Drive', F.betaalBody(L, order), { user, noindex: true });
    }
    if (pad === '/voucher' && request.method === 'POST') {
      const f = await request.formData();
      const code = String(f.get('code') || '').trim().toUpperCase().slice(0, 20);
      const v = await env.DB.prepare(`SELECT * FROM vouchers WHERE code = ? AND used_count < max_uses AND (expires_at IS NULL OR expires_at > datetime('now'))`).bind(code).first();
      if (!v) return page(L, t(L, 'voucher.kop'), `<h1>${esc(t(L, 'voucher.kop'))}</h1><div class="note fout" role="alert">${esc(t(L, 'voucher.ongeldig'))}</div><p><a class="cta" href="/prijzen">← ${esc(t(L, 'landing.prijskop'))}</a></p>`, { user, noindex: true, status: 400 });
      const mnd = { '1m': 1, '3m': 3, '6m': 6, '12m': 12 }[v.kind] || 1;
      await env.DB.prepare(`UPDATE vouchers SET used_count = used_count + 1 WHERE code = ?`).bind(code).run();
      await env.DB.prepare(`INSERT INTO passes (user_id, kind, ends_at, source) VALUES (?, ?, datetime('now', ?), ?)`).bind(user.id, v.kind, `+${mnd} months`, 'voucher:' + code).run();
      recordEvent(env, ctx, 'voucher', v.campagne || code, '');
      return redirect('/leren');
    }
    if (/^\/(module|theorie|info|am|motor|aanhanger)-\d+$/.test(pad)) {
      const m = inhoud.modules.find((x) => '/' + x.slug === pad);
      if (!m) return page(L, '404', `<h1>${esc(t(L, 'p404'))}</h1>`, { user, status: 404, noindex: true });
      const passes = await activePasses(env, user.id);
      const mag = (s) => magSectie(passes, user.is_admin, s);
      const done = new Set(((await env.DB.prepare(`SELECT part_key FROM progress WHERE user_id = ?`).bind(user.id).all()).results || []).map((r) => r.part_key));
      recordEvent(env, ctx, mag(m.sectie) ? 'view' : 'locked_view', pad, '');
      return page(L, m.zh + ' · Dandan Drive', moduleBody(L, m, user, done, mag), { user, gated: true, noindex: true, path: pad });
    }
    if (pad === '/boek-index') {
      const boekPasses = await activePasses(env, user.id);
      if (!magSectie(boekPasses, user.is_admin, 'praktijk')) return page(L, t(L, 'boek.kop'), `<h1>${esc(t(L, 'boek.kop'))}</h1><div class="note">${esc(t(L, 'boek.pas'))} <a href="/account">${esc(t(L, 'lock.bekijk'))}</a></div>`, { user, noindex: true });
      return page(L, t(L, 'boek.kop') + ' · Dandan Drive', boekIndexBody(L, inhoud.pmap), { user, gated: true, noindex: true, path: pad });
    }
    if (pad === '/search.json') return Response.json(inhoud.search, { headers: { 'Cache-Control': 'no-store' } });
    if (pad === '/pagemap.json') return Response.json(inhoud.pmap, { headers: { 'Cache-Control': 'no-store' } });
    if (pad === '/account/taal' && request.method === 'POST') {
      const f = await request.formData();
      const nieuw = String(f.get('taal') || '');
      if (TALEN.includes(nieuw)) {
        await env.DB.prepare(`UPDATE users SET lang = ? WHERE id = ?`).bind(nieuw, user.id).run();
        return redirect('/account', { 'Set-Cookie': taalCookie(nieuw) });
      }
      return redirect('/account');
    }
    if (pad === '/account/examen' && request.method === 'POST') {
      const f = await request.formData();
      const d = String(f.get('datum') || '');
      await env.DB.prepare(`UPDATE users SET exam_date = ? WHERE id = ?`).bind(/^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null, user.id).run();
      return redirect('/account');
    }
    if (pad === '/account' && request.method === 'GET') {
      const passes = await activePasses(env, user.id);
      if (!user.ref_code) {
        user.ref_code = Array.from(crypto.getRandomValues(new Uint8Array(4))).map((b) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('') + String(user.id % 97);
        await env.DB.prepare(`UPDATE users SET ref_code = ? WHERE id = ?`).bind(user.ref_code, user.id).run();
      }
      const refs = await env.DB.prepare(`SELECT COUNT(*) n FROM users WHERE referred_by = ?`).bind(user.ref_code).first();
      const opties = TALEN.map((x) => `<option value="${x}"${x === user.lang ? ' selected' : ''}>${TAALNAMEN[x]}</option>`).join('');
      return page(L, t(L, 'account.kop') + ' · Dandan Drive', `
        <h1>${esc(t(L, 'account.kop'))}</h1>
        <div class="note">${esc(user.email)}${user.is_admin ? ' · beheerder' : ''}</div>
        ${passes.length ? `<div class="note ok">${passes.map((p) => `<div>🎫 <strong>${esc(scopeLabel(L, p.scope))}</strong> · ${esc(t(L, 'account.pas', { kind: p.kind, tot: String(p.ends_at).slice(0, 10) }))}</div>`).join('')}</div>`
          : `<div class="note">${esc(t(L, 'account.geenpas'))} <a href="/prijzen">${esc(t(L, 'leren.passen'))}</a></div>`}
        <form method="post" action="/account/taal" class="authform rij">
          <label>${esc(t(L, 'account.taal'))} <select name="taal">${opties}</select></label>
          <button>${esc(t(L, 'account.taalopslaan'))}</button>
        </form>
        <form method="post" action="/account/examen" class="authform rij">
          <label>${esc(t(L, 'pad.datumlabel'))} <input type="date" name="datum" value="${esc(user.exam_date || '')}"></label>
          <button>${esc(t(L, 'pad.datumopslaan'))}</button>
        </form>
        <h2>${esc(t(L, 'ref.kop'))}</h2>
        <div class="note">${esc(t(L, 'ref.uitleg'))}<br>
        <code class="deellink">https://dandandrive.nl/?ref=${esc(user.ref_code)}</code>
        <button class="kopieer" data-kopieer="https://dandandrive.nl/?ref=${esc(user.ref_code)}">${esc(t(L, 'ref.kopieer'))}</button>
        · ${esc(t(L, 'ref.aantal', { n: refs.n }))}</div>
        <form method="post" action="/logout" class="authform"><button>${esc(t(L, 'account.uitloggen'))}</button></form>`, { user, noindex: true, path: '/account' });
    }
    if (pad === '/admin' && user.is_admin) {
      if (request.method === 'POST') {
        const f = await request.formData();
        const actie = String(f.get('actie') || 'pas');
        const kind = String(f.get('kind') || '3m');
        const scope = ['all', 'b', 'b-theorie', 'b-praktijk', 'am', 'motor', 'be'].includes(String(f.get('scope'))) ? String(f.get('scope')) : 'all';
        const mnd = { '1m': 1, '3m': 3, '6m': 6, '12m': 12 }[kind] || 3;
        if (actie === 'pas') {
          const emails = String(f.get('email') || '').toLowerCase().split(/[\s,;]+/).filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)).slice(0, 100);
          for (const email of emails) {
            let u = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first();
            if (!u) u = await env.DB.prepare(`INSERT INTO users (email) VALUES (?) RETURNING id`).bind(email).first();
            await env.DB.prepare(`INSERT INTO passes (user_id, kind, scope, ends_at, source) VALUES (?, ?, ?, datetime('now', ?), 'admin')`).bind(u.id, kind, scope, `+${mnd} months`).run();
          }
        } else if (actie === 'voucher') {
          const aantal = Math.min(Number(f.get('aantal') || 1), 100);
          const campagne = String(f.get('campagne') || '').slice(0, 40);
          const codes = [];
          for (let i = 0; i < aantal; i++) {
            const code = 'DD' + Array.from(crypto.getRandomValues(new Uint8Array(6))).map((b) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
            await env.DB.prepare(`INSERT INTO vouchers (code, kind, campagne, max_uses) VALUES (?, ?, ?, ?)`).bind(code, kind, campagne, Number(f.get('max_uses') || 1)).run();
            codes.push(code);
          }
          return page(L, 'Vouchers', `<h1>Vouchers aangemaakt (${codes.length})</h1><pre class="codeblok">${codes.join('\n')}</pre><p><a class="cta" href="/admin">← beheer</a></p>`, { user, noindex: true });
        } else if (actie === 'review') {
          await env.DB.prepare(`INSERT INTO reviews (naam, taal, tekst, sterren, zichtbaar) VALUES (?, ?, ?, ?, 1)`)
            .bind(String(f.get('naam') || '').slice(0, 60), String(f.get('taal') || 'zh').slice(0, 5), String(f.get('tekst') || '').slice(0, 400), Math.min(5, Math.max(1, Number(f.get('sterren') || 5)))).run();
        } else if (actie === 'review_toggle') {
          await env.DB.prepare(`UPDATE reviews SET zichtbaar = 1 - zichtbaar WHERE id = ?`).bind(Number(f.get('id'))).run();
        }
        return redirect('/admin');
      }
      const leden = (await env.DB.prepare(`SELECT u.email, u.lang, u.created_at, u.is_admin,
          (SELECT MAX(ends_at) FROM passes p WHERE p.user_id = u.id AND p.ends_at > datetime('now')) AS pas_tot
        FROM users u ORDER BY u.created_at DESC LIMIT 200`).all()).results;
      const stats = (await env.DB.prepare(`SELECT day, type, SUM(count) n FROM events WHERE day > date('now','-14 days') GROUP BY day, type ORDER BY day DESC`).all()).results;
      return page(L, 'Beheer · Dandan Drive', `
        <h1>Beheer</h1>
        <h2>Passen toekennen (één of meer e-mailadressen)</h2>
        <form method="post" action="/admin" class="authform rij">
          <input type="hidden" name="actie" value="pas">
          <label>e-mail(s) <textarea name="email" rows="2" required placeholder="een@adres.nl, twee@adres.nl"></textarea></label>
          <label>rijbewijs <select name="scope"><option value="all">alles</option><option value="b">Auto — theorie + praktijk (bundel)</option><option value="b-theorie">Auto — theorie-examen</option><option value="b-praktijk">Auto — praktijk-examen</option><option value="am">AM (bromfiets)</option><option value="motor">A (motor)</option><option value="be">BE (aanhanger)</option></select></label>
          <label>pas <select name="kind"><option value="1m">1 maand</option><option value="3m" selected>3 maanden</option><option value="6m">6 maanden</option><option value="12m">12 maanden</option></select></label>
          <button>toekennen</button></form>
        <h2>Vouchers (campagnes, partners, referral-beloningen)</h2>
        <form method="post" action="/admin" class="authform rij">
          <input type="hidden" name="actie" value="voucher">
          <label>aantal <input type="number" name="aantal" value="1" min="1" max="100"></label>
          <label>pas <select name="kind"><option value="1m">1 maand</option><option value="3m">3 maanden</option><option value="6m">6 maanden</option><option value="12m">12 maanden</option></select></label>
          <label>campagne <input name="campagne" placeholder="tiktok-jan"></label>
          <label>max. gebruik <input type="number" name="max_uses" value="1" min="1" max="1000"></label>
          <button>aanmaken</button></form>
        <h2>Review toevoegen (alleen échte slagingsverhalen)</h2>
        <form method="post" action="/admin" class="authform rij">
          <input type="hidden" name="actie" value="review">
          <label>naam <input name="naam" required></label>
          <label>taal <input name="taal" value="zh" size="3"></label>
          <label>sterren <input type="number" name="sterren" value="5" min="1" max="5"></label>
          <label>tekst <textarea name="tekst" rows="2" required></textarea></label>
          <button>plaatsen</button></form>
        <h2>Gebruikers (${leden.length})</h2>
        <table class="pagetable"><thead><tr><th>e-mail</th><th>taal</th><th>sinds</th><th>pas geldig tot</th></tr></thead><tbody>
        ${leden.map((l) => `<tr><td>${esc(l.email)}${l.is_admin ? ' 👑' : ''}</td><td>${esc(l.lang)}</td><td>${esc(String(l.created_at).slice(0, 10))}</td><td>${l.pas_tot ? esc(String(l.pas_tot).slice(0, 10)) : '-'}</td></tr>`).join('')}
        </tbody></table>
        <h2>Statistiek (14 dagen)</h2>
        <table class="pagetable"><thead><tr><th>dag</th><th>type</th><th>aantal</th></tr></thead><tbody>
        ${stats.map((s) => `<tr><td>${esc(s.day)}</td><td>${esc(s.type)}</td><td>${s.n}</td></tr>`).join('')}
        </tbody></table>`, { user, noindex: true, path: '/admin' });
    }

    // overig: statische assets (css/js/img/favicon/og); nooit lescontent
    return env.ASSETS.fetch(request);
  },
};
