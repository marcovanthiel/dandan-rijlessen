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
// Per-rijbewijs producten met eenmalige toegang. Auto B splitst in theorie/praktijk + bundel.
export const PRODUCTEN = [
  { scope: 'b', eur: 24, ico: '🚗', code: 'B', feat: true, split: true },
  { scope: 'am', eur: 8, ico: '🛵', code: 'AM' },
  { scope: 'motor', eur: 12, ico: '🏍️', code: 'A' },
  { scope: 'be', eur: 8, ico: '🚚', code: 'BE' },
];
export const PRIJS = { b: 24, 'b-theorie': 18, 'b-praktijk': 18, am: 8, motor: 12, be: 8 };
// onderwerp -> theoriehoofdstuk (voor foutenanalyse-links)
export const OND_HOOFDSTUK = {
  wetgeving: 'theorie-1', voorrang: 'theorie-2', borden: 'theorie-3', lichten: 'theorie-4',
  snelheid: 'theorie-5', inhalen: 'theorie-6', parkeren: 'theorie-7', kwetsbaar: 'theorie-8',
  mens: 'theorie-9', voertuig: 'theorie-10', gevaar: 'theorie-11',
};
export const EXAMEN = { vragen: 50, norm: 44, minuten: 30 }; // vernieuwd CBR-examen sinds 7-4-2025

const STAPW = { zh:'步骤', nl:'Stap', en:'Step', tr:'Adım', ar:'الخطوة', pl:'Krok', uk:'Крок', ru:'Шаг', es:'Paso', pt:'Passo', hi:'चरण', vi:'Bước' };
// sectie -> icoon (gedeeld door dashboard en "ga verder"-kaart). Rijbewijs B = praktijk/theorie/info; varianten AM/A/BE.
const SEC_ICO = { praktijk:'🚗', theorie:'📘', info:'🧭', am:'🛵', motor:'🏍️', aanhanger:'🚚' };
const secLabel = (L, sec) => sec === 'praktijk' ? t(L, 'nav.praktijk') : sec === 'theorie' ? t(L, 'nav.theorie') : t(L, 'sectie.' + sec);
const vraagVert = (v, L) => (L !== 'nl' && v[L]) ? v[L] : null;
const optTekst = (v, i, L) => (v['opts_' + L] ? v['opts_' + L][i] + ' (' + v.opts_nl[i] + ')' : v.opts_nl[i]);
const uitleg = (v, L) => v['uitleg_' + L] || v.uitleg_nl;

// ---------- leren-overzicht: twee secties + voortgang + leerpad ----------
export function lerenBody(L, user, passes, inhoud, klaarPct, examDate, banner, vervolg, mag) {
  const lesL = LESTALEN.includes(L) ? L : 'zh';
  const status = user.is_admin ? ''
    : (passes && passes.length)
      ? `<div class="note ok">${esc(t(L, 'leren.pas', { tot: String(passes[0].ends_at).slice(0, 10) }))}</div>`
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
       <span class="vk-deel">${SEC_ICO[vervolg.sectie] || '🚗'} ${esc(t(L, 'module.kicker', { n: vervolg.num }))} · ${esc(vervolg.plabel)}</span></span>
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
    const magSec = mag(sec);
    const cta = magSec
      ? `<a class="cta klein" href="${doel}">${esc(t(L, klaarPct > 0 ? 'lock.bekijk' : 'quiz.start'))} →</a>`
      : `<a class="cta klein" href="/prijzen">🔒 ${esc(t(L, 'leren.passen'))}</a>`;
    return `<section class="sectiekaart${magSec ? '' : ' vergrendeld'}" id="${sec}">
      <div class="sk-kop"><span class="sk-ico" aria-hidden="true">${ico}</span><h2>${esc(t(L, 'sectie.' + sec))}</h2><span class="sk-pct">${magSec ? pct + '%' : '🔒'}</span></div>
      <div class="balkje" aria-hidden="true"><span style="width:${pct}%"></span></div>
      <div class="sk-meta">✓ ${modAf}/${ms.length} · ${esc(secLabel(L, sec))}</div>
      ${cta}
    </section>`;
  };
  return `<div class="modbanner">${banner}</div>
  <div class="dash-head"><h1>${esc(t(L, 'leren.kop'))}</h1></div>
  ${status}${schema}${verder}
  <div class="sectiekaarten">${['praktijk', 'theorie', 'info', 'am', 'motor', 'aanhanger'].map((s) => secKaart(s, SEC_ICO[s])).join('')}</div>
  <div class="dash-tools">
    <a class="tool" href="/oefenexamen"><span aria-hidden="true">🎓</span>${esc(t(L, 'nav.examen'))}</a>
    <a class="tool" href="/begrippen"><span aria-hidden="true">🗂️</span>${esc(t(L, 'nav.begrippen'))}</a>
    <a class="tool" href="/boek-index"><span aria-hidden="true">📖</span>${esc(t(L, 'nav.boek'))}</a>
  </div>
  <div class="note boektip">📖 ${esc(t(L, 'boektip'))} <a href="/boek" rel="nofollow">${esc(t(L, 'boektip.link'))}</a></div>`;
}

// ---------- oefenexamen ----------
export function examenOverzicht(L, laatste, onderwerp = '') {
  const onderwerpen = Object.keys(OND_HOOFDSTUK).map((o) =>
    `<button name="mode" value="onderwerp:${o}" class="ondknop">${esc(t(L, 'ond.' + o))} <small>${VRAGEN.filter((v) => v.ond === o).length}</small></button>`).join('');
  const hist = laatste.length ? `<h2>${esc(t(L, 'quiz.historie'))}</h2><table class="pagetable"><thead><tr><th>${esc(t(L, 'quiz.datum'))}</th><th>${esc(t(L, 'quiz.mode'))}</th><th>${esc(t(L, 'quiz.score'))}</th></tr></thead><tbody>${
    laatste.map((a) => `<tr><td>${esc(String(a.started_at).slice(0, 16))}</td><td>${esc(a.mode === 'examen' ? t(L, 'quiz.examen') : t(L, 'ond.' + a.mode.split(':')[1]))}</td><td>${a.score}/${a.totaal}${a.mode === 'examen' ? (a.geslaagd ? ' ✅' : ' ❌') : ''}</td></tr>`).join('')}</tbody></table>` : '';
  const gekozen = OND_HOOFDSTUK[onderwerp] ? `<div class="note ok"><strong>${esc(t(L, 'ond.' + onderwerp))}</strong><br>${esc(L === 'nl' ? 'Je komt vanuit de les. Start hieronder meteen met een gerichte oefenset.' : 'You came here from a lesson. Start a focused practice set below.')}</div>` : '';
  return `<h1>${esc(t(L, 'nav.examen'))}</h1>
  ${gekozen}
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
    ${doel === 'zh' && x.pinyin ? `<span class="fc-pinyin">${esc(x.pinyin)}</span>` : ''}
    <span class="fc-audio" aria-hidden="true">🔊</span></button>`).join('');
  return `<h1>${esc(t(L, 'nav.begrippen'))}</h1>
  <div class="note">${esc(t(L, 'begrippen.uitleg'))}</div>
  <div class="fc-grid">${kaarten}</div>`;
}

// ---------- prijzen / bestellen / betalen ----------
export function prijzenBody(L, user) {
  const T = L === 'nl' ? {
    eyebrow: 'Eenvoudig en persoonlijk geregeld',
    intro: 'Kies wat je wilt leren. Na je aanvraag ontvang je persoonlijk een toegangscode voor precies dit onderdeel.',
    how: 'Zo werkt toegang',
    steps: ['Maak gratis je account aan.', 'Kies je rijbewijs en vraag een toegangscode aan.', 'Na bevestiging ontvang je een code die je direct kunt inwisselen.'],
    code: 'Heb je al een toegangscode?',
    request: 'Toegangscode aanvragen',
    foot: 'Geen abonnement. Je betaalt alleen voor de gekozen toegang en ziet vooraf precies wat je krijgt.',
  } : {
    eyebrow: 'Simple, personal access',
    intro: 'Choose what you want to learn. After your request, you receive a personal access code for that exact course.',
    how: 'How access works',
    steps: ['Create your free account.', 'Choose your licence and request an access code.', 'After confirmation, redeem your code and start learning.'],
    code: 'Already have an access code?',
    request: 'Request an access code',
    foot: 'No subscription. You pay only for the access you choose, with the contents clear before you start.',
  };
  const eenmaligTekst = L === 'nl' ? 'eenmalig' : 'one-time';
  const naam = (sc) => sc === 'am' ? t(L, 'sectie.am') : sc === 'motor' ? t(L, 'sectie.motor') : sc === 'be' ? t(L, 'sectie.aanhanger') : t(L, 'nav.auto');
  const kies = (sc, label) => user
    ? `<a class="lp-knop" href="/toegang-aanvragen?scope=${encodeURIComponent(sc)}">${esc(T.request)} →</a>`
    : `<a class="lp-knop" href="/login">${esc(t(L, 'prijs.eerstaccount'))}</a>`;
  const autoKaart = `<div class="lp-plan lp-feat"><span class="lp-badge">★</span><div class="lp-pico">🚗</div>
    <div><span class="lp-code">B · ${esc(t(L, 'nav.auto'))}</span><h3>${esc(t(L, 'nav.theorie'))} &amp; ${esc(t(L, 'nav.praktijk'))}</h3></div>
    <ul><li class="lp-split">📖 ${esc(t(L, 'nav.theorie'))} <span class="lp-mp">€18<small>${eenmaligTekst}</small></span></li>
      <li class="lp-split">🚗 ${esc(t(L, 'nav.praktijk'))} <span class="lp-mp">€18<small>${eenmaligTekst}</small></span></li></ul>
    <div class="lp-samen"><span class="lp-slbl">${esc(t(L, 'landing.samen'))}</span><span class="lp-eur tnum">€24</span></div>
    <span class="lp-gratis">✦ ${esc(t(L, 'landing.proefles'))}</span>
    ${user ? `<a href="/toegang-aanvragen?scope=b" class="lp-knop">${esc(T.request)} →</a>
      <div class="lp-los"><a href="/toegang-aanvragen?scope=b-theorie" class="lp-knop2">${esc(t(L, 'nav.theorie'))} €18</a>
      <a href="/toegang-aanvragen?scope=b-praktijk" class="lp-knop2">${esc(t(L, 'nav.praktijk'))} €18</a></div>`
      : `<a class="lp-knop" href="/login">${esc(t(L, 'prijs.eerstaccount'))}</a>`}
    </div>`;
  const varKaart = (p) => `<div class="lp-plan"><div class="lp-pico">${p.ico}</div>
    <div><span class="lp-code">${p.code}</span><h3>${esc(naam(p.scope))}</h3></div>
    <ul><li>${esc(naam(p.scope))}</li></ul>
    <span class="lp-gratis">✦ ${esc(t(L, 'landing.proefles'))}</span>
    <div class="lp-prijs"><span class="lp-eur tnum">€${p.eur}</span><span class="lp-per">${eenmaligTekst}</span></div>
    ${kies(p.scope, t(L, 'landing.kies'))}</div>`;
  const kaarten = autoKaart + PRODUCTEN.filter((p) => p.scope !== 'b').map(varKaart).join('');
  return `<div class="lp"><div class="lp-wrap" style="padding-block:20px">
    <div class="lp-kop"><span class="lp-eyebrow">${esc(T.eyebrow)}</span><h1>${esc(t(L, 'landing.prijskop'))}</h1><p>${esc(T.intro)}</p></div>
    <div class="lp-plans">${kaarten}</div>
    <div class="lp-access-steps"><h2>${esc(T.how)}</h2><ol>${T.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
    <div class="lp-note">${esc(T.foot)}</div>
    <h2 style="margin-top:32px">${esc(T.code)}</h2>
    ${user ? `<form method="post" action="/voucher" class="authform rij"><label>${esc(t(L, 'voucher.code'))} <input name="code" required maxlength="20" style="text-transform:uppercase"></label><button class="lp-knop" style="max-width:220px">${esc(t(L, 'voucher.inwisselen'))}</button></form>` : `<div class="lp-note">${esc(t(L, 'voucher.login'))} <a href="/login">${esc(t(L, 'nav.login'))}</a></div>`}
  </div></div>`;
}

export function toegangAanvragenBody(L, user, scope) {
  const T = L === 'nl' ? {
    eyebrow: 'Toegang aanvragen', title: 'Vraag je toegangscode aan',
    lead: 'Je aanvraag staat klaar voor de juiste cursus. Na persoonlijk contact ontvang je een code die alleen toegang geeft tot dit gekozen onderdeel.',
    selected: 'Gekozen toegang', message: 'Opmerking of vraag (optioneel)', placeholder: 'Bijvoorbeeld: ik wil starten op 1 september.',
    send: 'Aanvraag versturen', note: 'We gebruiken je e-mailadres alleen om je aanvraag en toegang te regelen.',
  } : {
    eyebrow: 'Request access', title: 'Request your access code',
    lead: 'Your request is ready for the right course. After personal confirmation, you receive a code that unlocks only this selected course.',
    selected: 'Selected access', message: 'Question or note (optional)', placeholder: 'For example: I would like to start on 1 September.',
    send: 'Send request', note: 'We use your email address only to handle this request and your access.',
  };
  return `<div class="lp"><div class="lp-wrap lp-form-wrap"><div class="lp-kop"><span class="lp-eyebrow">${esc(T.eyebrow)}</span><h1>${esc(T.title)}</h1><p>${esc(T.lead)}</p></div>
    <form method="post" action="/toegang-aanvragen" class="access-form">
      <input type="hidden" name="scope" value="${esc(scope)}">
      <div class="access-selected"><span>${esc(T.selected)}</span><strong>${esc(scopeLabel(L, scope))}</strong></div>
      <label>${esc(user.email)}</label>
      <label>${esc(T.message)}<textarea name="bericht" rows="4" maxlength="600" placeholder="${esc(T.placeholder)}"></textarea></label>
      <button class="lp-knop">${esc(T.send)} →</button>
      <p class="access-privacy">${esc(T.note)}</p>
    </form></div></div>`;
}

export function aanvraagBedanktBody(L, scope) {
  const T = L === 'nl' ? {
    eyebrow: 'Aanvraag ontvangen', title: 'We hebben je aanvraag ontvangen.',
    text: 'Je aanvraag voor {scope} staat klaar. Je ontvangt persoonlijk bericht zodra je toegangscode geregeld is.',
    back: 'Terug naar je leeromgeving',
  } : {
    eyebrow: 'Request received', title: 'We received your request.',
    text: 'Your request for {scope} is ready. We will contact you personally when your access code is arranged.',
    back: 'Go to your learning dashboard',
  };
  return `<div class="lp"><div class="lp-wrap lp-form-wrap"><div class="lp-confirm"><span class="lp-confirm-check">✓</span><span class="lp-eyebrow">${esc(T.eyebrow)}</span><h1>${esc(T.title)}</h1><p>${esc(T.text.replace('{scope}', scopeLabel(L, scope)))}</p><a class="lp-knop" href="/leren">${esc(T.back)} →</a></div></div></div>`;
}

export function overBody(L) {
  const T = L === 'nl' ? {
    eyebrow: 'Over Dandan Drive', title: 'Rijbewijs B leren zonder dat taal je tegenhoudt.',
    intro: 'Dandan Drive is gemaakt door Dandan en Marco voor internationale leerlingen die hun Nederlandse rijbewijs stap voor stap willen begrijpen.',
    p1: 'De lessen maken de Nederlandse verkeersregels, examenroutine en rijpraktijk overzichtelijk. Je leert eerst in je eigen taal en bouwt daarna het Nederlandse vakjargon rustig op.',
    p2: 'We kiezen bewust voor heldere uitleg, echte verkeerssituaties en een rustig leerpad. Geen drukke marketing, geen verzonnen beoordelingen, wel een plek waar je gericht kunt oefenen.',
    cbr: 'Belangrijk: Dandan Drive is een onafhankelijk oefenplatform en geen officiële website van het CBR, de RDW of de Rijksoverheid. Controleer voor je examen altijd de actuele officiële regels en procedures.',
    start: 'Gratis beginnen',
  } : {
    eyebrow: 'About Dandan Drive', title: 'Learn for your Dutch driving licence without language getting in the way.',
    intro: 'Dandan Drive was created by Dandan and Marco for international learners who want to understand their Dutch driving licence step by step.',
    p1: 'The lessons make Dutch traffic rules, exam routines and driving practice clear. Start in your own language, then build Dutch driving vocabulary calmly as you go.',
    p2: 'We deliberately choose clear explanations, real traffic situations and a calm learning path. No loud marketing, no invented reviews, just a place to practise with purpose.',
    cbr: 'Important: Dandan Drive is an independent practice platform and not an official website of the CBR, RDW or the Dutch government. Always check the latest official rules and procedures before your exam.',
    start: 'Start for free',
  };
  return `<div class="lp"><section class="lp-about"><div class="lp-wrap"><div class="lp-about-grid"><div><span class="lp-eyebrow">${esc(T.eyebrow)}</span><h1>${esc(T.title)}</h1><p class="lp-lead">${esc(T.intro)}</p><a class="lp-cta" href="/login">${esc(T.start)} →</a></div><div class="lp-about-mark"><span>11</span><small>talen<br>een duidelijk leerpad</small></div></div></div></section>
  <section class="lp-blk"><div class="lp-wrap lp-prose"><p>${esc(T.p1)}</p><p>${esc(T.p2)}</p><div class="lp-disclaimer"><strong>CBR</strong><p>${esc(T.cbr)}</p></div></div></section></div>`;
}

function scopeLabel(L, scope) {
  const auto = L === 'nl' ? 'Auto B' : 'Car B';
  if (scope === 'b') return `${auto} · theorie + praktijk`;
  if (scope === 'b-theorie') return `${auto} · ${L === 'nl' ? 'theorie-examen' : 'theory'}`;
  if (scope === 'b-praktijk') return `${auto} · ${L === 'nl' ? 'praktijk-examen' : 'practical course'}`;
  if (scope === 'am') return 'AM · bromfiets';
  if (scope === 'motor') return 'A · motor';
  if (scope === 'be') return 'BE · aanhanger';
  return `${auto} · theorie + praktijk`;
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
