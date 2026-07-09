// Dandan Drive: paywall-worker (fase 1 van het commerciële plan).
// Zero-dependency: eigen mini-router, D1 voor accounts/sessies/passen/statistiek,
// e-mailcode-login via Resend, server-side gerenderde lescontent (nooit bulk
// naar de browser). Statische assets (css/js/img) via de ASSETS-binding.
// Host-redirects: artnijmegen.nl (+www) en www.dandandrive.nl -> apex.
import { SITE, HOME_BANNER, MODULES, PMAP, SEARCH, TOTAL_PAGES } from './worker-content.js';

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

// ---------- html-schil ----------
function shell(title, body, o = {}) {
  const noindex = o.noindex ? '<meta name="robots" content="noindex">' : '';
  const desc = o.desc || SITE.tagZh + ' ' + SITE.tagNl;
  const canon = SITE.baseUrl + (o.path || '/');
  return `<!doctype html><html lang="${o.lang || 'zh'}"><head>
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
<a class="skip-link" href="#inhoud">跳到内容<span lang="nl"> / naar de inhoud</span></a>${body}
<script src="/assets/search.js" defer></script>${o.gated ? '<script src="/assets/les.js" defer></script>' : ''}
</body></html>`;
}
function siteHeader(user) {
  const nav = MODULES.map((m) => `<a href="/${m.slug}">模块${m.num}</a>`).join('');
  const rechts = user
    ? `<a href="/account">👤 ${esc(user.email.split('@')[0])}</a>${user.is_admin ? '<a href="/admin">beheer</a>' : ''}`
    : `<a href="/login">登录 · <span lang="nl">inloggen</span></a>`;
  return `<header class="site"><div class="container">
  <a class="brand" href="/" style="color:#fff"><span class="logo">丹</span>
    <span><span lang="nl">Dandan Drive</span><small>${esc(SITE.titleZh)} · 驾照路考</small></span></a>
  <nav><a href="/">Home</a>${user ? nav + '<a href="/boek-index">📖 书页</a>' : ''}${rechts}
  ${user ? '<label class="searchbox">🔍<input id="q" type="search" placeholder="搜索 / zoeken · 页码" autocomplete="off"></label>' : ''}</nav>
  </div><div id="results" class="container" style="display:none"></div></header>`;
}
const siteFooter = () => `<footer class="site"><div class="container">
  <strong>Dandan Drive · ${esc(SITE.titleZh)}</strong><br>
  <span lang="nl">Origineel lesmateriaal als aanvulling op het boek van de Nederlandse praktijkopleiding (RIS-methode).</span>
  原创学习材料 · ${esc(SITE.domain)} · <a href="/login">登录 / inloggen</a>
  </div></footer>`;
const page = (title, inner, o = {}) => new Response(shell(title, siteHeader(o.user) + `<main id="inhoud"><div class="container">` + inner + `</div></main>` + siteFooter(), o), { status: o.status || 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ...SEC } });
const redirect = (to, extra = {}) => new Response(null, { status: 302, headers: { Location: to, ...extra } });

// ---------- auth ----------
async function getUser(req, env) {
  const t = cookies(req).dd_sess;
  if (!t) return null;
  const r = await env.DB.prepare(
    `SELECT u.id, u.email, u.lang, u.is_admin FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > datetime('now')`
  ).bind(await sha256(t)).first();
  return r || null;
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
async function mailCode(env, email, code) {
  if (!env.RESEND_API_KEY) return { dev: true }; // lokaal ontwikkelen zonder mail
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Afzender: geverifieerd domein binnen de merkfamilie (Resend gratis plan = 1 domein).
      // Open punt: eigen Resend-account voor @dandandrive.nl, dan dit adres omzetten.
      from: 'Dandan Drive <inlog@dandanshop.nl>', to: [email],
      subject: `${code} · 你的登录验证码 / je inlogcode`,
      text: `你的 Dandan Drive 登录验证码:${code}(10 分钟内有效)。\n\nJe inlogcode voor Dandan Drive: ${code} (10 minuten geldig).\n\n没有请求过?请忽略此邮件。/ Niet aangevraagd? Negeer deze mail.`,
    }),
  });
  return { ok: r.ok };
}

// ---------- landing (NL/EN) ----------
const PRIJZEN = [
  { kind: '1m', mnd: 1, eur: 18 }, { kind: '3m', mnd: 3, eur: 38 },
  { kind: '6m', mnd: 6, eur: 58 }, { kind: '12m', mnd: 12, eur: 88 },
];
const LANDING = {
  nl: {
    titel: 'Haal je Nederlandse rijbewijs, in jouw taal', sub: 'Volledige uitleg van de Nederlandse praktijkopleiding (RIS-methode), geschreven in jouw taal. Nu beschikbaar in het Chinees; meer talen volgen op verzoek.',
    usp: ['Alle rijstappen stap voor stap uitgelegd, met originele beelden', 'Aanvulling op het officiële boek, met paginaverwijzingen (boek aangeraden, niet verplicht)', 'Doorzoekbaar, op elk apparaat, altijd actueel'],
    proef: 'Maak een gratis account en bekijk een proefles', prijskop: 'Toegangspassen (eenmalig, geen abonnement)',
    betaal: 'Online betalen (onder andere WeChat Pay) komt binnenkort. Maak alvast een gratis account.', mnd: 'maanden', mnd1: 'maand',
  },
  en: {
    titel: 'Get your Dutch driving licence, in your language', sub: 'The complete Dutch practical driving course (RIS method), explained in your own language. Available in Chinese now; more languages on request.',
    usp: ['Every driving step explained one by one, with original images', 'A companion to the official book, with page references (book recommended, not required)', 'Searchable, on any device, always up to date'],
    proef: 'Create a free account and see a sample lesson', prijskop: 'Access passes (one-time payment, no subscription)',
    betaal: 'Online payment (including WeChat Pay) is coming soon. Create your free account today.', mnd: 'months', mnd1: 'month',
  },
};
function landing(url) {
  const taal = url.searchParams.get('taal') === 'en' ? 'en' : 'nl';
  const t = LANDING[taal];
  const kaarten = PRIJZEN.map((p) => `<div class="card" style="text-align:center"><div class="mnum">${p.mnd}</div>
    <h3>€ ${p.eur}</h3><div class="count">${p.mnd === 1 ? '1 ' + t.mnd1 : p.mnd + ' ' + t.mnd}</div></div>`).join('');
  const inner = `
  <section class="hero"><div class="container">
    <div class="pill">rijbewijs B · 荷兰驾照</div>
    <h1>${esc(t.titel)}</h1>
    <p>${esc(t.sub)}</p>
    <p><a class="cta" href="/login">${esc(t.proef)} →</a></p>
    <p class="landtaal"><a href="/?taal=nl"${taal === 'nl' ? ' class="is-actief"' : ''}>NL</a> · <a href="/?taal=en"${taal === 'en' ? ' class="is-actief"' : ''}>EN</a> · <span lang="zh">课程内容:中文</span></p>
  </div></section>
  <div class="modbanner">${HOME_BANNER}</div>
  <ul class="usps">${t.usp.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>
  <h2 style="margin-top:28px">${esc(t.prijskop)}</h2>
  <div class="grid">${kaarten}</div>
  <div class="note">${esc(t.betaal)}</div>`;
  return shell('Dandan Drive · ' + SITE.titleZh, siteHeader(null) + `<main id="inhoud"><div class="container">` + inner + `</div></main>` + siteFooter(), { lang: taal, path: '/', desc: t.sub });
}

// ---------- lespagina's ----------
function watermerk(user) {
  const tekst = esc(user.email) + ' · Dandan Drive';
  let spans = '';
  for (let i = 0; i < 12; i++) spans += `<span style="top:${(i % 6) * 18 + 4}%;left:${i < 6 ? 6 : 52}%">${tekst}</span>`;
  return `<div class="wm" aria-hidden="true">${spans}</div>`;
}
const lockCard = (p) => `<article class="script lock" id="${p.id}">
  <div class="script-top"><div class="script-title"><span class="script-icon">🔒</span>
  <h2>${p.step ? `<span class="step">步骤 ${esc(p.step)}</span> · ` : ''}${esc(p.label.replace(/^步骤\s*\d+[ab]?\s*·\s*/, ''))}</h2></div>
  ${p.page ? `<span class="bookpage">📖 boek p.${p.page}</span>` : ''}</div>
  ${p.nl ? `<div class="nl-title nl-only" lang="nl">${esc(p.nl)}</div>` : ''}
  <p class="locktekst">此部分需要有效通行证。<span lang="nl">Dit onderdeel vraagt een geldige toegangspas.</span> <a href="/account">查看通行证 / bekijk passen</a></p>
</article>`;
function moduleBody(m, vol, user) {
  const toc = m.parts.map((p) => `<li><a href="#${p.id}">${p.page ? `<span class="tocpage">p.${p.page}</span> ` : ''}${esc(p.label)}${vol || p.preview ? '' : ' 🔒'}</a></li>`).join('');
  const delen = m.parts.map((p) => (vol || p.preview ? p.html : lockCard(p))).join('\n');
  return `<div class="crumbs"><a href="/leren">课程</a> › 模块${m.num}</div>
  <div class="modbanner">${m.banner}</div>
  <div class="module-head"><div class="kicker">模块 ${m.num} / Module ${m.num}</div>
  <h1>${esc(m.zh)}</h1><div class="nl nl-only" lang="nl" style="color:var(--muted)">${esc(m.nl)}</div></div>
  ${vol ? '' : `<div class="note">免费账户可预览约 2% 的内容。<span lang="nl">Met een gratis account zie je een proefles; een toegangspas ontgrendelt alles.</span></div>`}
  ${m.introHtml}
  <div class="layout"><aside class="toc"><ul>${toc}</ul></aside><div class="les-wrap">${watermerk(user)}${delen}</div></div>`;
}
function boekIndexBody() {
  const rows = PMAP.map((e) => `<tr id="p${e.from}"><td class="pcol"><span class="pill">${e.from === e.to ? 'p.' + e.from : 'p.' + e.from + '-' + e.to}</span></td>
    <td>${e.step ? `步骤 ${esc(e.step)} · ` : ''}<a href="/${e.url.replace('.html', '')}">${esc(e.label)}</a>${e.nl ? `<div class="nl nl-only" lang="nl">${esc(e.nl)}</div>` : ''}</td>
    <td class="mcol">模块 ${e.module}</td></tr>`).join('');
  return `<div class="crumbs"><a href="/leren">课程</a> › 按书页查找</div>
  <h1>按书页查找 <span class="nl-only" lang="nl" style="color:var(--muted);font-size:1rem">· Zoek op boekpagina</span></h1>
  <div class="pagefind"><label>书页码 / boekpagina (1-${TOTAL_PAGES}): <input id="pageq" type="number" min="1" max="${TOTAL_PAGES}" placeholder="bv. 5"></label>
  <button id="pagego">跳转 / ga</button> <span id="pagemsg" class="pagemsg"></span></div>
  <table class="pagetable"><thead><tr><th>书页 / boek</th><th>onderwerp · 内容</th><th>模块</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function lerenBody(user, pas) {
  const kaarten = MODULES.map((m) => `<a class="card" href="/${m.slug}"><span class="mnum">${m.num}</span>
    <h3>${esc(m.zh)}</h3><div class="nl nl-only" lang="nl">${esc(m.nl)}</div>
    <div class="count">${m.parts.length} 个步骤 / onderdelen${pas || user.is_admin ? '' : m.num === '1' ? ' · 部分免费预览' : ' · 🔒'}</div></a>`).join('');
  const status = pas
    ? `<div class="note">✅ 通行证有效至 <strong>${esc(String(pas.ends_at).slice(0, 10))}</strong>。<span lang="nl">Je pas is geldig tot ${esc(String(pas.ends_at).slice(0, 10))}.</span></div>`
    : user.is_admin ? ''
    : `<div class="note">你正在使用免费账户(约 2% 内容)。<span lang="nl">Gratis account: proefles zichtbaar. Een toegangspas ontgrendelt alle modules.</span> <a href="/account">通行证 / passen</a></div>`;
  return `<div class="modbanner">${HOME_BANNER}</div>${status}
  <div class="note">五个模块按照"分步"方法循序渐进。<span class="nl-only" lang="nl">Vijf modules, stap voor stap: van voertuigbeheersing tot het examen.</span></div>
  <div class="grid">${kaarten}</div>`;
}

// ---------- formulieren ----------
const loginBody = (o = {}) => `
  <h1>登录 <span class="nl-only" lang="nl" style="font-size:1rem;color:var(--muted)">· inloggen of gratis account</span></h1>
  <div class="note">输入邮箱,我们发送一次性验证码;首次登录即创建免费账户。<span lang="nl">Vul je e-mailadres in; je krijgt een eenmalige code. Bij je eerste login ontstaat je gratis account.</span></div>
  ${o.fout ? `<div class="note fout" role="alert">${esc(o.fout)}</div>` : ''}
  ${o.dev ? `<div class="note fout" role="alert">DEV zonder RESEND_API_KEY; code = ${esc(o.dev)}</div>` : ''}
  ${o.email ? `
  <form method="post" action="/login/code" class="authform">
    <input type="hidden" name="email" value="${esc(o.email)}">
    <label>验证码 / code (6 cijfers) <input name="code" inputmode="numeric" pattern="[0-9]{6}" required autofocus autocomplete="one-time-code"></label>
    <button>登录 / inloggen</button>
    <p><a href="/login">重新发送 / opnieuw</a></p>
  </form>` : `
  <form method="post" action="/login" class="authform">
    <label>邮箱 / e-mail <input type="email" name="email" required autofocus autocomplete="email"></label>
    <button>发送验证码 / stuur code</button>
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

    // publiek
    if (pad === '/' && request.method === 'GET') {
      if (user) return redirect('/leren');
      recordEvent(env, ctx, 'view', '/', refVan(request, url));
      return new Response(landing(url), { headers: { 'Content-Type': 'text/html; charset=utf-8', ...SEC } });
    }
    if (pad === '/login' && request.method === 'GET')
      return page('登录 · Dandan Drive', loginBody(), { noindex: true, path: '/login' });
    if (pad === '/login' && request.method === 'POST') {
      const f = await request.formData();
      const email = String(f.get('email') || '').trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 120)
        return page('登录', loginBody({ fout: '请输入有效邮箱 / vul een geldig e-mailadres in' }), { noindex: true, status: 400 });
      const vorige = await env.DB.prepare(`SELECT sent_at FROM login_codes WHERE email = ? AND sent_at > datetime('now', '-60 seconds')`).bind(email).first();
      if (vorige) return page('登录', loginBody({ email, fout: '请稍候再重发(60 秒)/ wacht 60 s voor een nieuwe code' }), { noindex: true, status: 429 });
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await env.DB.prepare(`INSERT INTO login_codes (email, code_hash, expires_at, attempts, sent_at) VALUES (?, ?, datetime('now','+10 minutes'), 0, datetime('now'))
        ON CONFLICT(email) DO UPDATE SET code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0, sent_at = excluded.sent_at`)
        .bind(email, await sha256(code + email)).run();
      const m = await mailCode(env, email, code);
      recordEvent(env, ctx, 'login_code', '/login', '');
      return page('验证码 · Dandan Drive', loginBody({ email, dev: m.dev ? code : '' }), { noindex: true });
    }
    if (pad === '/login/code' && request.method === 'POST') {
      const f = await request.formData();
      const email = String(f.get('email') || '').trim().toLowerCase();
      const code = String(f.get('code') || '').trim();
      const rij = await env.DB.prepare(`SELECT code_hash, attempts, (expires_at > datetime('now')) AS geldig FROM login_codes WHERE email = ?`).bind(email).first();
      if (!rij || rij.attempts >= 5 || !rij.geldig)
        return page('登录', loginBody({ fout: '验证码已失效,请重新发送 / code verlopen, vraag een nieuwe aan' }), { noindex: true, status: 400 });
      if (rij.code_hash !== await sha256(code + email)) {
        await env.DB.prepare(`UPDATE login_codes SET attempts = attempts + 1 WHERE email = ?`).bind(email).run();
        return page('登录', loginBody({ email, fout: '验证码不正确 / code onjuist' }), { noindex: true, status: 400 });
      }
      await env.DB.prepare(`DELETE FROM login_codes WHERE email = ?`).bind(email).run();
      let u = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first();
      if (!u) {
        u = await env.DB.prepare(`INSERT INTO users (email) VALUES (?) RETURNING id`).bind(email).first();
        recordEvent(env, ctx, 'signup', '', '');
      }
      const token = crypto.randomUUID() + crypto.randomUUID();
      await env.DB.prepare(`INSERT INTO sessions (token_hash, user_id, expires_at, ua) VALUES (?, ?, datetime('now','+30 days'), ?)`)
        .bind(await sha256(token), u.id, (request.headers.get('User-Agent') || '').slice(0, 120)).run();
      recordEvent(env, ctx, 'login', '', '');
      return redirect('/leren', { 'Set-Cookie': `dd_sess=${token}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax` });
    }
    if (pad === '/logout' && request.method === 'POST') {
      const t = cookies(request).dd_sess;
      if (t) await env.DB.prepare(`DELETE FROM sessions WHERE token_hash = ?`).bind(await sha256(t)).run();
      return redirect('/', { 'Set-Cookie': 'dd_sess=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax' });
    }

    // vanaf hier: inloggen vereist
    const gated = pad === '/leren' || pad === '/boek-index' || pad === '/account' || pad === '/admin' || pad === '/search.json' || pad === '/pagemap.json' || /^\/module-\d+$/.test(pad);
    if (gated && !user) {
      recordEvent(env, ctx, 'locked_view', pad, refVan(request, url));
      return redirect('/login');
    }
    if (pad === '/leren') {
      const pas = await activePass(env, user.id);
      recordEvent(env, ctx, 'view', '/leren', '');
      return page('课程 · Dandan Drive', lerenBody(user, pas), { user, noindex: true, path: '/leren' });
    }
    if (/^\/module-\d+$/.test(pad)) {
      const m = MODULES.find((x) => '/' + x.slug === pad);
      if (!m) return page('404', '<h1>页面不存在 / niet gevonden</h1>', { user, status: 404, noindex: true });
      const pas = await activePass(env, user.id);
      const vol = !!pas || !!user.is_admin;
      recordEvent(env, ctx, vol ? 'view' : 'locked_view', pad, '');
      return page(m.zh + ' · Dandan Drive', moduleBody(m, vol, user), { user, gated: true, noindex: true, path: pad });
    }
    if (pad === '/boek-index') {
      const pas = await activePass(env, user.id);
      if (!pas && !user.is_admin) return page('按书页查找', `<h1>按书页查找</h1><div class="note">需要有效通行证。<span lang="nl">De boekindex vraagt een geldige toegangspas.</span> <a href="/account">通行证 / passen</a></div>`, { user, noindex: true });
      return page('按书页查找 · Dandan Drive', boekIndexBody(), { user, gated: true, noindex: true, path: pad });
    }
    if (pad === '/search.json') return Response.json(SEARCH, { headers: { 'Cache-Control': 'no-store' } });
    if (pad === '/pagemap.json') return Response.json(PMAP, { headers: { 'Cache-Control': 'no-store' } });
    if (pad === '/account' && request.method === 'GET') {
      const pas = await activePass(env, user.id);
      return page('账户 · Dandan Drive', `
        <h1>账户 <span class="nl-only" lang="nl" style="font-size:1rem;color:var(--muted)">· account</span></h1>
        <div class="note">${esc(user.email)} · 语言/taal: 中文${user.is_admin ? ' · beheerder' : ''}</div>
        ${pas ? `<div class="note">✅ 通行证(${esc(pas.kind)})有效至 <strong>${esc(String(pas.ends_at).slice(0, 10))}</strong></div>`
          : `<div class="note">尚无通行证。在线支付(微信支付等)即将上线;在此之前请联系我们开通:<a href="mailto:info@dandandrive.nl">info@dandandrive.nl</a><br><span lang="nl">Nog geen pas. Online betalen volgt binnenkort; tot die tijd kun je een pas aanvragen via info@dandandrive.nl.</span></div>`}
        <form method="post" action="/logout" class="authform"><button>退出登录 / uitloggen</button></form>`, { user, noindex: true, path: '/account' });
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
      const leden = (await env.DB.prepare(`SELECT u.email, u.created_at, u.is_admin,
          (SELECT MAX(ends_at) FROM passes p WHERE p.user_id = u.id AND p.ends_at > datetime('now')) AS pas_tot
        FROM users u ORDER BY u.created_at DESC LIMIT 200`).all()).results;
      const stats = (await env.DB.prepare(`SELECT day, type, SUM(count) n FROM events WHERE day > date('now','-14 days') GROUP BY day, type ORDER BY day DESC`).all()).results;
      return page('Beheer · Dandan Drive', `
        <h1>Beheer</h1>
        <h2>Pas toekennen</h2>
        <form method="post" action="/admin" class="authform rij">
          <label>e-mail <input type="email" name="email" required></label>
          <label>pas <select name="kind"><option value="1m">1 maand</option><option value="3m" selected>3 maanden</option><option value="6m">6 maanden</option><option value="12m">12 maanden</option></select></label>
          <button>toekennen</button></form>
        <h2>Gebruikers (${leden.length})</h2>
        <table class="pagetable"><thead><tr><th>e-mail</th><th>sinds</th><th>pas geldig tot</th></tr></thead><tbody>
        ${leden.map((l) => `<tr><td>${esc(l.email)}${l.is_admin ? ' 👑' : ''}</td><td>${esc(String(l.created_at).slice(0, 10))}</td><td>${l.pas_tot ? esc(String(l.pas_tot).slice(0, 10)) : '-'}</td></tr>`).join('')}
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
