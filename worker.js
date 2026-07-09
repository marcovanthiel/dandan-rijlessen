// Dandan Drive: paywall-worker (fase 1 + meertalige chrome, fase 6-fundament).
// Zero-dependency: eigen mini-router, D1 (accounts/sessies/passen/statistiek),
// e-mailcode-login via Resend, server-side gerenderde lescontent per gebruiker.
// Taal: chrome in de voorkeurstaal (zh/nl/en, cookie dd_lang of account),
// lestekst in de lestaal (nu zh) met nette fallback-melding.
import { SITE, HOME_BANNER, CONTENT, LESTALEN, TOTAL_PAGES } from './worker-content.js';
import { t, TALEN, TAALNAMEN } from './i18n.js';

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
  return `<!doctype html><html lang="${L}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">${noindex}
<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" href="/favicon.svg">
<meta name="theme-color" content="#14488f"><link rel="canonical" href="${canon}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Dandan Drive">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canon}"><meta property="og:image" content="${SITE.baseUrl}/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/assets/style.css">
</head><body data-nl="on"${o.gated ? ' class="beschermd"' : ''}>
<a class="skip-link" href="#inhoud">${esc(t(L, 'skip'))}</a>${body}
<script src="/assets/search.js" defer></script>${o.gated ? '<script src="/assets/les.js" defer></script>' : ''}
</body></html>`;
}
function siteHeader(L, user, mods) {
  const nav = mods.map((m) => `<a href="/${m.slug}">${esc(t(L, 'nav.module', { n: m.num }))}</a>`).join('');
  const rechts = user
    ? `<a href="/account">👤 ${esc(user.email.split('@')[0])}</a>${user.is_admin ? '<a href="/admin">beheer</a>' : ''}`
    : `<a href="/login">${esc(t(L, 'nav.login'))}</a>`;
  return `<header class="site"><div class="container">
  <a class="brand" href="/" style="color:#fff"><span class="logo">丹</span>
    <span><span lang="nl">Dandan Drive</span><small>${esc(SITE.titleZh)} · 驾照路考</small></span></a>
  <nav><a href="/">${esc(t(L, 'nav.home'))}</a>${user ? nav + `<a href="/boek-index">${esc(t(L, 'nav.boek'))}</a>` : ''}${rechts}
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
    `SELECT u.id, u.email, u.lang, u.is_admin FROM sessions s JOIN users u ON u.id = s.user_id
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
async function activePass(env, userId) {
  return env.DB.prepare(`SELECT kind, ends_at FROM passes WHERE user_id = ? AND ends_at > datetime('now') ORDER BY ends_at DESC LIMIT 1`).bind(userId).first();
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
const PRIJZEN = [
  { kind: '1m', mnd: 1, eur: 18 }, { kind: '3m', mnd: 3, eur: 38 },
  { kind: '6m', mnd: 6, eur: 58 }, { kind: '12m', mnd: 12, eur: 88 },
];
function landingBody(L) {
  const kaarten = PRIJZEN.map((p) => `<div class="card" style="text-align:center"><div class="mnum">${p.mnd}</div>
    <h3>€ ${p.eur}</h3><div class="count">${esc(p.mnd === 1 ? t(L, 'landing.mnd1') : t(L, 'landing.mnd', { n: p.mnd }))}</div></div>`).join('');
  const taalkeuze = TALEN.map((x) => `<a href="/?taal=${x}"${x === L ? ' class="is-actief"' : ''} lang="${x}">${TAALNAMEN[x]}</a>`).join(' · ');
  return `
  <section class="hero"><div class="container">
    <div class="pill">rijbewijs B · 荷兰驾照</div>
    <h1>${esc(t(L, 'landing.titel'))}</h1>
    <p>${esc(t(L, 'landing.sub'))}</p>
    <p><a class="cta" href="/login">${esc(t(L, 'landing.proef'))} →</a></p>
    <p class="landtaal">${taalkeuze}</p>
  </div></section>
  <div class="modbanner">${HOME_BANNER}</div>
  <ul class="usps"><li>${esc(t(L, 'landing.usp1'))}</li><li>${esc(t(L, 'landing.usp2'))}</li><li>${esc(t(L, 'landing.usp3'))}</li></ul>
  <h2 style="margin-top:28px">${esc(t(L, 'landing.prijskop'))}</h2>
  <div class="grid">${kaarten}</div>
  <div class="note">${esc(t(L, 'landing.betaal'))}</div>`;
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
function moduleBody(L, m, vol, user) {
  const lesT = lesTaalVoor(L);
  const toc = m.parts.map((p) => `<li><a href="#${p.id}">${p.page ? `<span class="tocpage">p.${p.page}</span> ` : ''}${esc(p.label)}${vol || p.preview ? '' : ' 🔒'}</a></li>`).join('');
  const delen = m.parts.map((p) => (vol || p.preview ? p.html : lockCard(L, p))).join('\n');
  const taalnote = L !== lesT ? `<div class="note">${esc(t(L, 'module.lestaal'))}</div>` : '';
  return `<div class="crumbs"><a href="/leren">${esc(t(L, 'module.crumb'))}</a> › ${esc(t(L, 'module.kicker', { n: m.num }))}</div>
  <div class="modbanner">${m.banner}</div>
  <div class="module-head"><div class="kicker">${esc(t(L, 'module.kicker', { n: m.num }))}</div>
  <h1 lang="${lesT}">${esc(m.zh)}</h1><div class="nl nl-only" lang="nl" style="color:var(--muted)">${esc(m.nl)}</div></div>
  ${taalnote}${vol ? '' : `<div class="note">${esc(t(L, 'module.previewnote'))}</div>`}
  ${m.introHtml ? `<div lang="${lesT}">${m.introHtml}</div>` : ''}
  <div class="layout"><aside class="toc"><ul>${toc}</ul></aside><div class="les-wrap" lang="${lesT}">${watermerk(user)}${delen}</div></div>`;
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
function lerenBody(L, user, pas, mods) {
  const kaarten = mods.map((m) => `<a class="card" href="/${m.slug}"><span class="mnum">${m.num}</span>
    <h3 lang="${lesTaalVoor(L)}">${esc(m.zh)}</h3><div class="nl nl-only" lang="nl">${esc(m.nl)}</div>
    <div class="count">${esc(t(L, 'leren.onderdelen', { n: m.parts.length }))}${pas || user.is_admin ? '' : m.num === '1' ? ' · ' + esc(t(L, 'leren.preview')) : ' · 🔒'}</div></a>`).join('');
  const status = pas
    ? `<div class="note">${esc(t(L, 'leren.pas', { tot: String(pas.ends_at).slice(0, 10) }))}</div>`
    : user.is_admin ? ''
    : `<div class="note">${esc(t(L, 'leren.gratis'))} <a href="/account">${esc(t(L, 'leren.passen'))}</a></div>`;
  return `<div class="modbanner">${HOME_BANNER}</div>${status}
  <div class="note">${esc(t(L, 'leren.intro'))}</div>
  <div class="grid">${kaarten}</div>`;
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
      return page(L, 'Dandan Drive · ' + SITE.titleZh, landingBody(L), { path: '/', desc: t(L, 'landing.sub') });
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
        u = await env.DB.prepare(`INSERT INTO users (email, lang) VALUES (?, ?) RETURNING id`).bind(email, L).first();
        recordEvent(env, ctx, 'signup', '', '');
      }
      const token = crypto.randomUUID() + crypto.randomUUID();
      await env.DB.prepare(`INSERT INTO sessions (token_hash, user_id, expires_at, ua) VALUES (?, ?, datetime('now','+30 days'), ?)`)
        .bind(await sha256(token), u.id, (request.headers.get('User-Agent') || '').slice(0, 120)).run();
      recordEvent(env, ctx, 'login', '', '');
      return redirect('/leren', { 'Set-Cookie': `dd_sess=${token}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax` });
    }
    if (pad === '/logout' && request.method === 'POST') {
      const tk = cookies(request).dd_sess;
      if (tk) await env.DB.prepare(`DELETE FROM sessions WHERE token_hash = ?`).bind(await sha256(tk)).run();
      return redirect('/', { 'Set-Cookie': 'dd_sess=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax' });
    }

    // vanaf hier: inloggen vereist
    const gated = pad === '/leren' || pad === '/boek-index' || pad === '/account' || pad === '/account/taal' || pad === '/admin' || pad === '/search.json' || pad === '/pagemap.json' || /^\/module-\d+$/.test(pad);
    if (gated && !user) {
      recordEvent(env, ctx, 'locked_view', pad, refVan(request, url));
      return redirect('/login');
    }
    const inhoud = CONTENT[lesTaalVoor(L)];
    if (pad === '/leren') {
      const pas = await activePass(env, user.id);
      recordEvent(env, ctx, 'view', '/leren', '');
      return page(L, t(L, 'leren.kop') + ' · Dandan Drive', lerenBody(L, user, pas, inhoud.modules), { user, noindex: true, path: '/leren' });
    }
    if (/^\/module-\d+$/.test(pad)) {
      const m = inhoud.modules.find((x) => '/' + x.slug === pad);
      if (!m) return page(L, '404', `<h1>${esc(t(L, 'p404'))}</h1>`, { user, status: 404, noindex: true });
      const pas = await activePass(env, user.id);
      const vol = !!pas || !!user.is_admin;
      recordEvent(env, ctx, vol ? 'view' : 'locked_view', pad, '');
      return page(L, m.zh + ' · Dandan Drive', moduleBody(L, m, vol, user), { user, gated: true, noindex: true, path: pad });
    }
    if (pad === '/boek-index') {
      const pas = await activePass(env, user.id);
      if (!pas && !user.is_admin) return page(L, t(L, 'boek.kop'), `<h1>${esc(t(L, 'boek.kop'))}</h1><div class="note">${esc(t(L, 'boek.pas'))} <a href="/account">${esc(t(L, 'lock.bekijk'))}</a></div>`, { user, noindex: true });
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
    if (pad === '/account' && request.method === 'GET') {
      const pas = await activePass(env, user.id);
      const opties = TALEN.map((x) => `<option value="${x}"${x === user.lang ? ' selected' : ''}>${TAALNAMEN[x]}</option>`).join('');
      return page(L, t(L, 'account.kop') + ' · Dandan Drive', `
        <h1>${esc(t(L, 'account.kop'))}</h1>
        <div class="note">${esc(user.email)}${user.is_admin ? ' · beheerder' : ''}</div>
        ${pas ? `<div class="note">${esc(t(L, 'account.pas', { kind: pas.kind, tot: String(pas.ends_at).slice(0, 10) }))}</div>`
          : `<div class="note">${esc(t(L, 'account.geenpas'))}</div>`}
        <form method="post" action="/account/taal" class="authform rij">
          <label>${esc(t(L, 'account.taal'))} <select name="taal">${opties}</select></label>
          <button>${esc(t(L, 'account.taalopslaan'))}</button>
        </form>
        <form method="post" action="/logout" class="authform"><button>${esc(t(L, 'account.uitloggen'))}</button></form>`, { user, noindex: true, path: '/account' });
    }
    if (pad === '/admin' && user.is_admin) {
      if (request.method === 'POST') {
        const f = await request.formData();
        const email = String(f.get('email') || '').trim().toLowerCase();
        const kind = String(f.get('kind') || '3m');
        const mnd = { '1m': 1, '3m': 3, '6m': 6, '12m': 12 }[kind] || 3;
        if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          let u = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first();
          if (!u) u = await env.DB.prepare(`INSERT INTO users (email) VALUES (?) RETURNING id`).bind(email).first();
          await env.DB.prepare(`INSERT INTO passes (user_id, kind, ends_at, source) VALUES (?, ?, datetime('now', ?), 'admin')`)
            .bind(u.id, kind, `+${mnd} months`).run();
        }
        return redirect('/admin');
      }
      const leden = (await env.DB.prepare(`SELECT u.email, u.lang, u.created_at, u.is_admin,
          (SELECT MAX(ends_at) FROM passes p WHERE p.user_id = u.id AND p.ends_at > datetime('now')) AS pas_tot
        FROM users u ORDER BY u.created_at DESC LIMIT 200`).all()).results;
      const stats = (await env.DB.prepare(`SELECT day, type, SUM(count) n FROM events WHERE day > date('now','-14 days') GROUP BY day, type ORDER BY day DESC`).all()).results;
      return page(L, 'Beheer · Dandan Drive', `
        <h1>Beheer</h1>
        <h2>Pas toekennen</h2>
        <form method="post" action="/admin" class="authform rij">
          <label>e-mail <input type="email" name="email" required></label>
          <label>pas <select name="kind"><option value="1m">1 maand</option><option value="3m" selected>3 maanden</option><option value="6m">6 maanden</option><option value="12m">12 maanden</option></select></label>
          <button>toekennen</button></form>
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
