// Dandan Drive: feature-pagina's en quizlogica (fase 3/5/9 van het plan).
// Server-side gerenderd; werkt zonder JS (formulieren), JS verrijkt (timer,
// flashcards, audio). Geïmporteerd door worker.js.
import { CONTENT, LESTALEN, VRAGEN, LEXICON } from './worker-content.js';
import { t, TAALNAMEN } from './i18n.js';

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const PASSEN = [
  { kind: '1m', mnd: 1, eur: 18 }, { kind: '3m', mnd: 3, eur: 38 },
  { kind: '6m', mnd: 6, eur: 58 }, { kind: '12m', mnd: 12, eur: 88 },
];
// onderwerp -> theoriehoofdstuk (voor foutenanalyse-links)
export const OND_HOOFDSTUK = {
  wetgeving: 'theorie-1', voorrang: 'theorie-2', borden: 'theorie-3', lichten: 'theorie-4',
  snelheid: 'theorie-5', inhalen: 'theorie-6', parkeren: 'theorie-7', kwetsbaar: 'theorie-8',
  mens: 'theorie-9', voertuig: 'theorie-10', gevaar: 'theorie-11',
};
export const EXAMEN = { vragen: 50, norm: 44, minuten: 30 }; // vernieuwd CBR-examen sinds 7-4-2025

const STAPW = { zh:'步骤', nl:'Stap', en:'Step', tr:'Adım', ar:'الخطوة', pl:'Krok', uk:'Крок', ru:'Шаг', es:'Paso', pt:'Passo', hi:'चरण', vi:'Bước' };
const vraagVert = (v, L) => (L !== 'nl' && v[L]) ? v[L] : null;
const optTekst = (v, i, L) => (v['opts_' + L] ? v['opts_' + L][i] + ' (' + v.opts_nl[i] + ')' : v.opts_nl[i]);
const uitleg = (v, L) => v['uitleg_' + L] || v.uitleg_nl;

// ---------- leren-overzicht: twee secties + voortgang + leerpad ----------
export function lerenBody(L, user, pas, inhoud, klaarPct, examDate, banner, vervolg) {
  const vol = !!pas || !!user.is_admin;
  const lesL = LESTALEN.includes(L) ? L : 'zh';
  const status = pas
    ? `<div class="note ok">${esc(t(L, 'leren.pas', { tot: String(pas.ends_at).slice(0, 10) }))}</div>`
    : user.is_admin ? ''
    : `<div class="note">${esc(t(L, 'leren.gratis'))} <a href="/prijzen">${esc(t(L, 'leren.passen'))}</a></div>`;
  const schema = examDate
    ? `<div class="leerpad"><div class="ring" style="--p:${klaarPct}"><span>${klaarPct}%</span></div>
       <div><strong>${esc(t(L, 'pad.examen', { datum: examDate }))}</strong><br>${esc(t(L, klaarPct >= 90 ? 'pad.klaar' : 'pad.opweg'))}
       · <a href="/oefenexamen">${esc(t(L, 'nav.examen'))}</a></div></div>`
    : `<div class="leerpad"><div class="ring" style="--p:${klaarPct}"><span>${klaarPct}%</span></div>
       <div>${esc(t(L, 'pad.geen'))} <a href="/account">${esc(t(L, 'pad.instellen'))}</a></div></div>`;
  // "Ga verder waar je was": eerstvolgende toegankelijke, nog niet afgevinkte onderdeel.
  const verder = vervolg
    ? `<a class="vervolgkaart" href="/${vervolg.slug}#${vervolg.pid}">
       <span class="vk-pijl" aria-hidden="true">▶</span>
       <span class="vk-tekst"><small>${esc(t(L, klaarPct > 0 ? 'pad.opweg' : 'quiz.start'))}</small>
       <strong lang="${lesL}">${esc(vervolg.mtitel)}</strong>
       <span class="vk-deel">${vervolg.sectie === 'theorie' ? '📘' : '🚗'} ${esc(t(L, 'module.kicker', { n: vervolg.num }))} · ${esc(vervolg.plabel)}</span></span>
       <span class="vk-ga" aria-hidden="true">→</span></a>`
    : '';
  // Samenvattingskaart per sectie (geen wall of modules meer; die staan links).
  const secKaart = (sec, ico) => {
    const ms = inhoud.modules.filter((m) => m.sectie === sec);
    if (!ms.length) return '';
    let tp = 0, dp = 0, modAf = 0;
    ms.forEach((m) => { const n = m.parts.length; tp += n; dp += Math.round((m.pct / 100) * n); if (m.pct >= 100) modAf++; });
    const pct = tp ? Math.round((dp / tp) * 100) : 0;
    const doel = '/' + (ms.find((m) => m.pct < 100) || ms[0]).slug;
    return `<section class="sectiekaart" id="${sec}">
      <div class="sk-kop"><span class="sk-ico" aria-hidden="true">${ico}</span><h2>${esc(t(L, 'sectie.' + sec))}</h2><span class="sk-pct">${pct}%</span></div>
      <div class="balkje" aria-hidden="true"><span style="width:${pct}%"></span></div>
      <div class="sk-meta">✓ ${modAf}/${ms.length} · ${esc(sec === 'theorie' ? t(L, 'nav.theorie') : t(L, 'nav.praktijk'))}</div>
      <a class="cta klein" href="${doel}">${esc(t(L, klaarPct > 0 ? 'lock.bekijk' : 'quiz.start'))} →</a>
    </section>`;
  };
  return `<div class="modbanner">${banner}</div>
  <div class="dash-head"><h1>${esc(t(L, 'leren.kop'))}</h1></div>
  ${status}${schema}${verder}
  <div class="sectiekaarten">${secKaart('praktijk', '🚗')}${secKaart('theorie', '📘')}</div>
  <div class="dash-tools">
    <a class="tool" href="/oefenexamen"><span aria-hidden="true">🎓</span>${esc(t(L, 'nav.examen'))}</a>
    <a class="tool" href="/begrippen"><span aria-hidden="true">🗂️</span>${esc(t(L, 'nav.begrippen'))}</a>
    <a class="tool" href="/boek-index"><span aria-hidden="true">📖</span>${esc(t(L, 'nav.boek'))}</a>
  </div>
  <div class="note boektip">📖 ${esc(t(L, 'boektip'))} <a href="/boek" rel="nofollow">${esc(t(L, 'boektip.link'))}</a></div>`;
}

// ---------- oefenexamen ----------
export function examenOverzicht(L, laatste) {
  const onderwerpen = Object.keys(OND_HOOFDSTUK).map((o) =>
    `<button name="mode" value="onderwerp:${o}" class="ondknop">${esc(t(L, 'ond.' + o))} <small>${VRAGEN.filter((v) => v.ond === o).length}</small></button>`).join('');
  const hist = laatste.length ? `<h2>${esc(t(L, 'quiz.historie'))}</h2><table class="pagetable"><thead><tr><th>${esc(t(L, 'quiz.datum'))}</th><th>${esc(t(L, 'quiz.mode'))}</th><th>${esc(t(L, 'quiz.score'))}</th></tr></thead><tbody>${
    laatste.map((a) => `<tr><td>${esc(String(a.started_at).slice(0, 16))}</td><td>${esc(a.mode === 'examen' ? t(L, 'quiz.examen') : t(L, 'ond.' + a.mode.split(':')[1]))}</td><td>${a.score}/${a.totaal}${a.mode === 'examen' ? (a.geslaagd ? ' ✅' : ' ❌') : ''}</td></tr>`).join('')}</tbody></table>` : '';
  return `<h1>${esc(t(L, 'nav.examen'))}</h1>
  <div class="note">${esc(t(L, 'quiz.uitleg', { v: EXAMEN.vragen, n: EXAMEN.norm, m: EXAMEN.minuten }))}</div>
  <form method="post" action="/oefenexamen/start" class="examenstart">
    <button name="mode" value="examen" class="cta groot">🎓 ${esc(t(L, 'quiz.examen'))} · ${EXAMEN.vragen} ${esc(t(L, 'quiz.vragen'))} · ${EXAMEN.minuten} min</button>
    <h2>${esc(t(L, 'quiz.peronderwerp'))}</h2>
    <div class="ondgrid">${onderwerpen}</div>
  </form>${hist}`;
}
export function stelVragenSamen(mode) {
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  if (mode === 'examen') {
    const gevaar = shuffle(VRAGEN.filter((v) => v.type === 'gevaar').map((v) => v.id));
    const rest = shuffle(VRAGEN.filter((v) => v.type !== 'gevaar').map((v) => v.id));
    return shuffle([...gevaar.slice(0, 15), ...rest.slice(0, EXAMEN.vragen - 15)]);
  }
  const o = mode.split(':')[1];
  return shuffle(VRAGEN.filter((v) => v.ond === o).map((v) => v.id)).slice(0, 10);
}
export function vraagBody(L, attempt, n, feedback) {
  const ids = JSON.parse(attempt.vragen);
  const v = VRAGEN.find((x) => x.id === ids[n - 1]);
  const antwoorden = JSON.parse(attempt.antwoorden || '{}');
  const examen = attempt.mode === 'examen';
  const deadline = examen ? new Date(new Date(attempt.started_at.replace(' ', 'T') + 'Z').getTime() + EXAMEN.minuten * 60000).toISOString() : '';
  const vertOpts = v['opts_' + L];
  const opts = v.opts_nl.map((_, i) => {
    let cls = 'antwoord';
    if (feedback) { if (i === v.juist) cls += ' goed'; else if (String(antwoorden[v.id]) === String(i)) cls += ' fout'; }
    return `<label class="${cls}"><input type="radio" name="antwoord" value="${i}" required ${feedback ? 'disabled' : ''} ${String(antwoorden[v.id]) === String(i) ? 'checked' : ''}>
      <span>${esc(v.opts_nl[i])}${vertOpts && L !== 'nl' ? ` <small lang="${L}">${esc(vertOpts[i])}</small>` : ''}</span></label>`;
  }).join('');
  const fb = feedback ? `<div class="note ${String(antwoorden[v.id]) === String(v.juist) ? 'ok' : 'fout'}">
      <strong>${esc(String(antwoorden[v.id]) === String(v.juist) ? t(L, 'quiz.goed') : t(L, 'quiz.fout'))}</strong> ${esc(uitleg(v, L))}
      · <a href="/${OND_HOOFDSTUK[v.ond]}">${esc(t(L, 'ond.' + v.ond))}</a></div>
      <a class="cta" href="${n < ids.length ? `/oefenexamen/a/${attempt.id}/v/${n + 1}` : `/oefenexamen/a/${attempt.id}/resultaat`}">${esc(n < ids.length ? t(L, 'quiz.volgende') : t(L, 'quiz.naarresultaat'))} →</a>` : '';
  return `<div class="quizkop"><span>${esc(examen ? t(L, 'quiz.examen') : t(L, 'ond.' + attempt.mode.split(':')[1]))} · ${n}/${ids.length}</span>
  ${examen ? `<span class="timer" id="timer" data-deadline="${deadline}" aria-live="off">⏱ ${EXAMEN.minuten}:00</span>` : ''}
  <span class="qtype">${esc(t(L, 'type.' + v.type))}</span></div>
  <div class="voortgangsbalk" aria-hidden="true"><span style="width:${Math.round(((n - 1) / ids.length) * 100)}%"></span></div>
  <div class="vraagkaart les-wrap">
    <h1 class="vraagtekst" lang="nl">${esc(v.nl)}</h1>
    ${vraagVert(v, L) ? `<p class="vraagvert" lang="${L}">${esc(vraagVert(v, L))}</p>` : ''}
    ${feedback ? fb : `<form method="post" action="/oefenexamen/a/${attempt.id}/v/${n}" id="vraagform">
      <div class="antwoorden">${opts}</div>
      <button class="cta">${esc(n < ids.length ? t(L, 'quiz.volgende') : t(L, 'quiz.inleveren'))} →</button>
    </form>`}
  </div>`;
}
export function scoreAttempt(attempt) {
  const ids = JSON.parse(attempt.vragen);
  const antw = JSON.parse(attempt.antwoorden || '{}');
  let goed = 0; const perOnd = {};
  for (const id of ids) {
    const v = VRAGEN.find((x) => x.id === id);
    if (!v) continue;
    perOnd[v.ond] = perOnd[v.ond] || { goed: 0, totaal: 0 };
    perOnd[v.ond].totaal++;
    if (String(antw[id]) === String(v.juist)) { goed++; perOnd[v.ond].goed++; }
  }
  const totaal = ids.length;
  const norm = attempt.mode === 'examen' ? EXAMEN.norm : null;
  return { goed, totaal, perOnd, geslaagd: norm ? goed >= norm : null };
}
export function resultaatBody(L, attempt) {
  const r = scoreAttempt(attempt);
  const ids = JSON.parse(attempt.vragen);
  const antw = JSON.parse(attempt.antwoorden || '{}');
  const analyse = Object.entries(r.perOnd).map(([o, s]) => `<tr class="${s.goed === s.totaal ? '' : 'zwak'}"><td><a href="/${OND_HOOFDSTUK[o]}">${esc(t(L, 'ond.' + o))}</a></td><td>${s.goed}/${s.totaal}</td>
    <td><div class="balkje"><span style="width:${Math.round((s.goed / s.totaal) * 100)}%"></span></div></td></tr>`).join('');
  const fouten = ids.filter((id) => { const v = VRAGEN.find((x) => x.id === id); return v && String(antw[id]) !== String(v.juist); });
  const foutlijst = fouten.map((id) => { const v = VRAGEN.find((x) => x.id === id); return `<details class="foutdetail"><summary lang="nl">${esc(v.nl)}</summary>
    <p><strong>${esc(t(L, 'quiz.juisteantwoord'))}:</strong> ${esc(optTekst(v, v.juist, L))}</p><p>${esc(uitleg(v, L))}</p>
    <p><a href="/${OND_HOOFDSTUK[v.ond]}">${esc(t(L, 'ond.' + v.ond))} →</a></p></details>`; }).join('');
  const kop = attempt.mode === 'examen'
    ? (r.geslaagd ? `<div class="resultaatkop geslaagd">🎉 ${esc(t(L, 'quiz.geslaagd'))}</div>` : `<div class="resultaatkop gezakt">${esc(t(L, 'quiz.gezakt', { norm: EXAMEN.norm }))}</div>`)
    : '';
  return `${kop}
  <h1>${r.goed}/${r.totaal}</h1>
  <div class="note deelbaar">${esc(t(L, 'quiz.deel', { score: r.goed, totaal: r.totaal }))}</div>
  <h2>${esc(t(L, 'quiz.analyse'))}</h2>
  <table class="pagetable analyse"><tbody>${analyse}</tbody></table>
  ${fouten.length ? `<h2>${esc(t(L, 'quiz.foutenlijst', { n: fouten.length }))}</h2>${foutlijst}` : ''}
  <p><a class="cta" href="/oefenexamen">${esc(t(L, 'quiz.nogeen'))}</a></p>`;
}

// ---------- begrippentrainer / flashcards ----------
export function begrippenBody(L) {
  const doel = L === 'nl' || L === 'en' ? 'en' : L;
  const kaarten = LEXICON.map((x, i) => `<button class="flashcard" data-nl="${esc(x.nl)}" aria-expanded="false" aria-label="${esc(x.nl)}">
    <span class="fc-nl" lang="nl">${esc(x.nl)}</span>
    <span class="fc-vert" lang="${doel}">${esc(x.vert[doel] || x.vert.en || '')}</span>
    <span class="fc-audio" aria-hidden="true">🔊</span></button>`).join('');
  return `<h1>${esc(t(L, 'nav.begrippen'))}</h1>
  <div class="note">${esc(t(L, 'begrippen.uitleg'))}</div>
  <div class="fc-grid">${kaarten}</div>`;
}

// ---------- prijzen / bestellen / betalen ----------
export function prijzenBody(L, user) {
  const kaarten = PASSEN.map((p, i) => `<div class="prijskaart${i === 1 ? ' aanbevolen' : ''}">
    ${i === 1 ? `<span class="ribbon">${esc(t(L, 'prijs.populair'))}</span>` : ''}
    <div class="prijs-mnd">${p.mnd === 1 ? esc(t(L, 'landing.mnd1')) : esc(t(L, 'landing.mnd', { n: p.mnd }))}</div>
    <div class="prijs-eur">€ ${p.eur}</div>
    ${user ? `<form method="post" action="/bestellen"><button name="kind" value="${p.kind}" class="cta">${esc(t(L, 'prijs.kies'))}</button></form>`
           : `<a class="cta" href="/login">${esc(t(L, 'prijs.eerstaccount'))}</a>`}
  </div>`).join('');
  return `<h1>${esc(t(L, 'landing.prijskop'))}</h1>
  <div class="prijsgrid">${kaarten}</div>
  <div class="note">${esc(t(L, 'landing.betaal'))}</div>
  <h2>${esc(t(L, 'voucher.kop'))}</h2>
  ${user ? `<form method="post" action="/voucher" class="authform rij">
    <label>${esc(t(L, 'voucher.code'))} <input name="code" required maxlength="20" style="text-transform:uppercase"></label>
    <button>${esc(t(L, 'voucher.inwisselen'))}</button></form>` : `<div class="note">${esc(t(L, 'voucher.login'))} <a href="/login">${esc(t(L, 'nav.login'))}</a></div>`}`;
}
export function betaalBody(L, order) {
  return `<h1>${esc(t(L, 'betaal.kop'))}</h1>
  <div class="note"><strong>${esc(t(L, 'betaal.order'))}:</strong> ${esc(order.kind)} · € ${(order.amount_cents / 100).toFixed(2)} · ${esc(order.id.slice(0, 8))}</div>
  <div class="note wacht">💳 ${esc(t(L, 'betaal.wacht'))}</div>
  <div class="note">${esc(t(L, 'voucher.alternatief'))}</div>
  <form method="post" action="/voucher" class="authform rij">
    <label>${esc(t(L, 'voucher.code'))} <input name="code" required maxlength="20" style="text-transform:uppercase"></label>
    <button>${esc(t(L, 'voucher.inwisselen'))}</button></form>`;
}

// ---------- partnerpagina (B2B, alleen NL/EN conform besluit) ----------
export function partnerBody(L) {
  const en = L !== 'nl';
  const T = en ? {
    kop: 'Partner programme for driving schools', sub: 'Your students study the Dutch theory and practical course in their own language. Buy access passes in bulk at a discount.',
    hoe: 'How it works', s1: 'You order passes per student (bundles of 10, 25 or 50).', s2: 'Bulk discount: 20% from 10 passes, 30% from 25 passes.', s3: 'Students activate with a voucher code; you see nothing of their data (privacy by design).',
    cta: 'Request a partner quote', mail: 'mailto:info@dandandrive.nl?subject=Partner%20programme%20driving%20school',
  } : {
    kop: 'Partnerprogramma voor rijscholen', sub: 'Uw leerlingen bestuderen de Nederlandse theorie en praktijkopleiding in hun eigen taal. Koop toegangspassen in bulk met korting.',
    hoe: 'Zo werkt het', s1: 'U bestelt passen per leerling (bundels van 10, 25 of 50).', s2: 'Bulkkorting: 20% vanaf 10 passen, 30% vanaf 25 passen.', s3: 'Leerlingen activeren met een vouchercode; u ziet niets van hun gegevens (privacy by design).',
    cta: 'Vraag een partnerofferte aan', mail: 'mailto:info@dandandrive.nl?subject=Partnerprogramma%20rijschool',
  };
  return `<h1>${esc(T.kop)}</h1><p class="intro">${esc(T.sub)}</p>
  <h2>${esc(T.hoe)}</h2>
  <ul class="usps"><li>${esc(T.s1)}</li><li>${esc(T.s2)}</li><li>${esc(T.s3)}</li></ul>
  <p><a class="cta" href="${T.mail}">${esc(T.cta)} →</a></p>`;
}

// ---------- reviews (sociaal bewijs; alleen echte, door admin goedgekeurde) ----------
export function reviewsBlok(L, rows) {
  if (!rows.length) return '';
  return `<h2 style="margin-top:28px">${esc(t(L, 'reviews.kop'))}</h2>
  <div class="grid">${rows.map((r) => `<figure class="card review"><div class="sterren" aria-label="${r.sterren}/5">${'★'.repeat(r.sterren)}${'☆'.repeat(5 - r.sterren)}</div>
    <blockquote lang="${esc(r.taal)}">${esc(r.tekst)}</blockquote><figcaption>${esc(r.naam)} · ${esc(TAALNAMEN[r.taal] || r.taal)}</figcaption></figure>`).join('')}</div>`;
}
