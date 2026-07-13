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
export const PRODUCT_PAGINAS = {
  'auto-b-theorie': { scope: 'b-theorie', code: 'B', ico: '📘', prijs: 18, les: '/theorie-1', free: '/info-1', title: 'Auto B theorie', enTitle: 'Car B theory', focus: 'theorie' },
  'auto-b-praktijk': { scope: 'b-praktijk', code: 'B', ico: '🚗', prijs: 18, les: '/module-1', free: '/info-1', title: 'Auto B praktijk', enTitle: 'Car B practical course', focus: 'praktijk' },
  'auto-b-bundel': { scope: 'b', code: 'B', ico: '🚗', prijs: 24, les: '/theorie-1', free: '/info-1', title: 'Auto B bundel', enTitle: 'Car B bundle', focus: 'bundel' },
  am: { scope: 'am', code: 'AM', ico: '🛵', prijs: 8, les: '/am-1', free: '/info-1', title: 'AM bromfiets en scooter', enTitle: 'AM moped and scooter', focus: 'am' },
  motor: { scope: 'motor', code: 'A', ico: '🏍️', prijs: 12, les: '/motor-1', free: '/info-1', title: 'Motorrijbewijs A', enTitle: 'Motorcycle licence A', focus: 'motor' },
  be: { scope: 'be', code: 'BE', ico: '🚚', prijs: 8, les: '/aanhanger-1', free: '/info-1', title: 'BE aanhanger', enTitle: 'BE trailer', focus: 'be' },
};
// onderwerp -> theoriehoofdstuk (voor foutenanalyse-links)
export const OND_HOOFDSTUK = {
  wetgeving: 'theorie-1', voorrang: 'theorie-2', borden: 'theorie-3', lichten: 'theorie-4',
  snelheid: 'theorie-5', inhalen: 'theorie-6', parkeren: 'theorie-7', kwetsbaar: 'theorie-8',
  mens: 'theorie-9', voertuig: 'theorie-10', gevaar: 'theorie-11',
};
export const EXAMEN = { vragen: 50, norm: 44, minuten: 30 }; // vernieuwd CBR-examen sinds 7-4-2025

// Verdieping voor de Nederlandse theoriehoofdstukken. De brontekst blijft in
// content/nl; dit lesdeel geeft elk hoofdstuk dezelfde didactische structuur.
const THEORY_PLUS = {
  2: { onderwerp: 'Voorrang in een situatie lezen',
    intro: 'Voorrang is meer dan een regel uit je hoofd kennen. Je moet eerst zien wie elkaar werkelijk kan kruisen, daarna alle aanwijzingen in de juiste volgorde verwerken en pas dan beslissen. Kijk dus niet alleen naar de auto die het dichtstbij is, maar naar paden die elkaar kunnen raken.',
    situaties: ['Je komt bij een kruispunt zonder borden. Er staat een fietser rechts van je en een auto links. Kijk eerst of het echt een gelijkwaardig kruispunt is, zoek daarna verkeer van rechts en maak pas dan je keuze.', 'Je wilt links afslaan terwijl een tegenligger rechtdoor gaat. De richting die je kiest verandert de situatie: controleer de tegenligger, voetgangers die oversteken en fietsers naast je voordat je draait.', 'Een hulpdienst nadert met signalen. Kijk waar de veilige ruimte zit, blijf voorspelbaar en forceer geen uitwijkmanoeuvre. Voorrang geven mag nooit een nieuw gevaar maken.'],
    fouten: 'Veelgemaakte fout: een voorrangsbord zien en daarna niet meer kijken naar fietsers, voetgangers of een aanwijzing van een bevoegde persoon.', check: 'Kun je hardop benoemen: welke weg, welke richting, welke aanwijzing en welk verkeer kruist mij?', ond: 'voorrang', vis: ['Kijk naar alle richtingen', 'Bepaal wie kruist', 'Rijd pas als het veilig is'] },
  3: { onderwerp: 'Borden koppelen aan de plek waar je rijdt',
    intro: 'Een verkeersbord werkt nooit los van de weg. Lees eerst de vorm en kleur, kijk vervolgens waar het staat en verbind het met de rijbaan of zone waarop het betrekking heeft. Daardoor voorkom je dat je een bord wel herkent, maar het verkeerde gedrag kiest.',
    situaties: ['Je rijdt een straat in met een zonebord. Controleer of je de zone binnenrijdt of verlaat; een herhalingsbord kan je herinneren aan een regel die al geldt.', 'Bij wegwerkzaamheden staat tijdelijke bebording. Die kan afwijken van de normale inrichting. Laat de actuele borden en aanwijzingen leidend zijn.', 'Je ziet meerdere borden vlak voor een kruispunt. Splits ze in verboden, geboden en waarschuwingen en vraag je af voor welk verkeer of welke richting ze gelden.'],
    fouten: 'Veelgemaakte fout: alleen de afbeelding onthouden, maar niet controleren of het bord voor jouw rijbaan, een zijweg of een zone geldt.', check: 'Welk bord bepaalt hier mijn gedrag en welke details van de plaatsing bewijzen dat?', ond: 'borden', vis: ['Herken vorm en kleur', 'Lees plaats en richting', 'Pas je gedrag aan'] },
  4: { onderwerp: 'Verkeerslichten en aanwijzingen vooruit lezen',
    intro: 'Verkeerslichten regelen een moment, geen garantie dat je altijd kunt doorrijden. Train jezelf om al voor het stoplicht te zien waar je straks wilt staan, wie je pad kruist en of er voldoende ruimte achter het kruispunt is.',
    situaties: ['Je licht wordt groen, maar de ruimte na het kruispunt is nog bezet. Wacht voor de kruising; groen geeft geen opdracht om een blokkade in te rijden.', 'Je wilt rechts afslaan bij groen licht. Kijk opnieuw naar voetgangers en fietsers die ook groen kunnen hebben.', 'Een verkeersregelaar geeft een aanwijzing die anders is dan het licht. Volg de aanwijzing rustig en kijk welke rijstrook of beweging daarmee wordt bedoeld.'],
    fouten: 'Veelgemaakte fout: groen behandelen als “nu meteen gaan” in plaats van als toestemming wanneer de kruising ook echt vrij en veilig is.', check: 'Waar eindigt mijn auto na dit licht en wie kan daar nog voorrang of ruimte nodig hebben?', ond: 'lichten', vis: ['Kijk naar de uitweg', 'Controleer kruisend verkeer', 'Rijd zonder blokkeren'] },
  5: { onderwerp: 'Snelheid kiezen met een veiligheidsmarge',
    intro: 'De toegestane snelheid is een bovengrens, geen streefgetal. Je kiest een lagere snelheid zodra zicht, wegdek, verkeer of je eigen taak daarom vragen. Afstand houden geeft je tijd om waar te nemen, te beslissen en beheerst te remmen.',
    situaties: ['In regen zie je remlichten verderop. Laat vroeg gas los, vergroot afstand en voorkom abrupt remmen op nat wegdek.', 'Je rijdt buiten de bebouwde kom achter een groot voertuig. Houd extra ruimte zodat je verder vooruit kunt kijken en niet alleen op diens remlichten reageert.', 'Je nadert een schoolomgeving of drukke oversteekplaats. Ook zonder exact snelheidsbord kan de omgeving vragen om een snelheid waarbij je direct kunt stoppen.'],
    fouten: 'Veelgemaakte fout: alleen naar het bord kijken en vergeten dat zicht, grip en ruimte bepalen of die snelheid ook veilig is.', check: 'Als het voertuig voor mij nu hard remt, heb ik dan tijd en afstand om beheerst te reageren?', ond: 'snelheid', vis: ['Zicht', 'Grip', 'Ruimte'] },
  6: { onderwerp: 'Inhalen en positie kiezen zonder druk',
    intro: 'Inhalen begint ver voordat je naar links stuurt. Je beoordeelt ruimte, zicht, snelheid van alle betrokkenen en de markering. Wanneer een van die punten twijfel geeft, is wachten meestal de veilige en volwassen keuze.',
    situaties: ['Je komt achter een fietser op een smalle weg. Kijk of je ruim kunt passeren zonder tegemoetkomend verkeer of een zijweg te verrassen.', 'Op een rijbaan met markering lijkt er ruimte om in te halen. Controleer eerst of de markering, het zicht en een naderend kruispunt de manoeuvre niet onveilig maken.', 'Je voegt in op een drukke weg. Versnel alleen wanneer de ruimte klopt en blijf niet naast een ander voertuig hangen in een onduidelijke positie.'],
    fouten: 'Veelgemaakte fout: alleen naar de auto voor je kijken en niet naar tegemoetkomend verkeer, zijwegen, dode hoek of de mogelijkheid om terug te keren.', check: 'Kan ik de hele manoeuvre afmaken zonder dat iemand anders moet remmen of uitwijken?', ond: 'inhalen', vis: ['Zicht vooruit', 'Ruimte naast je', 'Veilige terugkeer'] },
  7: { onderwerp: 'Stilstaan en parkeren als verkeershandeling',
    intro: 'Parkeren is niet alleen een plek vinden. Je kiest een plaats waar je geen zicht wegneemt, geen doorgang blokkeert en veilig kunt in- en uitstappen. Lees de omgeving alsof je er straks weer uit moet rijden.',
    situaties: ['Je wilt vlak voor een kruispunt parkeren. Vraag je af of jouw voertuig het zicht van naderend verkeer of overstekenden beperkt.', 'Je ziet een vrije plek naast een uitrit. Controleer of jouw auto de uitrit bruikbaar laat en of je zelf later veilig kunt wegrijden.', 'Je zet iemand af in een drukke straat. Het korte moment blijft een verkeershandeling: kies een veilige plaats en let op openzwaaiende deuren, fietsers en voetgangers.'],
    fouten: 'Veelgemaakte fout: alleen controleren of de auto fysiek past, zonder te kijken naar zicht, doorgang, markering of andere weggebruikers.', check: 'Wie kan door mijn keuze minder zien, minder ruimte hebben of onverwacht moeten uitwijken?', ond: 'parkeren', vis: ['Zicht behouden', 'Doorgang vrij', 'Veilig uitstappen'] },
  8: { onderwerp: 'Kwetsbare verkeersdeelnemers vroeg herkennen',
    intro: 'Voetgangers, fietsers, kinderen, ouderen en bestuurders van lichte voertuigen zijn niet altijd goed zichtbaar of voorspelbaar. Goed rijgedrag betekent daarom dat je vooruitkijkt naar plaatsen waar zij kunnen verschijnen en je snelheid daarop aanpast.',
    situaties: ['Bij een bushalte kan iemand achter de bus oversteken. Kijk verder dan het voertuig en neem snelheid terug voordat je de situatie voorbij bent.', 'Je slaat af naast een fietspad. Controleer spiegels, schouder en de ruimte naast je opnieuw, ook wanneer je eerder al had gekeken.', 'Bij een school of speelplek kan gedrag plotseling veranderen. Rijd zo dat je kunt reageren op een bal, kind of oversteekbeweging die je nog niet ziet.'],
    fouten: 'Veelgemaakte fout: alleen kijken naar wie nu zichtbaar is, niet naar waar iemand logisch kan opduiken.', check: 'Welke plek naast, achter of voor mij kan binnen enkele seconden nieuw verkeer opleveren?', ond: 'kwetsbaar', vis: ['Verwacht beweging', 'Maak ruimte', 'Verlaag snelheid'] },
  9: { onderwerp: 'Rijgeschiktheid begint voor je instapt',
    intro: 'Veilig rijden begint met de keuze om wel of niet te rijden. Vermoeidheid, emotie, alcohol, drugs, ziekte en medicijnen kunnen je waarneming en reactie verminderen. Dat is geen detail voor na het examen, maar een dagelijkse verantwoordelijkheid.',
    situaties: ['Na een korte nacht merk je dat je moeite hebt om je aandacht vast te houden. Kies pauze, alternatief vervoer of stel de rit uit in plaats van jezelf te testen in druk verkeer.', 'Je start met nieuwe medicatie. Controleer bij arts, apotheker of de officiële medicijninformatie wat dit voor rijden betekent voordat je de auto neemt.', 'Een vriend vraagt je te rijden nadat er alcohol is gedronken. Maak vooraf een alternatief plan; de veilige beslissing is niet afhankelijk van hoe fit je je op dat moment voelt.'],
    fouten: 'Veelgemaakte fout: denken dat je alleen bij duidelijke slaperigheid of dronkenschap onveilig rijdt. Verminderd reageren merk je soms pas te laat.', check: 'Ben ik vandaag lichamelijk en mentaal in staat om onverwachte situaties rustig en snel op te lossen?', ond: 'mens', vis: ['Fit?', 'Nuchter?', 'Aandachtig?'] },
  10: { onderwerp: 'Voertuig, milieu en rijhulpen verstandig gebruiken',
    intro: 'Een auto helpt je met systemen als ABS, waarschuwingen en rijstrookondersteuning, maar de bestuurder houdt altijd de taak om te kijken, beslissen en handelen. Basiscontroles van banden, verlichting en signalen helpen je problemen vroeg te zien.',
    situaties: ['Een waarschuwingslampje gaat branden. Lees niet alleen het symbool, maar kies een veilige plek om te stoppen of raadpleeg de instructie van het voertuig.', 'Je gebruikt cruisecontrol op een rustige weg en nadert regen of druk verkeer. Neem de rijtaak weer bewust over en kies een snelheid die bij de omstandigheden past.', 'Bij een korte rit lijkt controle van banden en verlichting overbodig. Juist terugkerende kleine controles voorkomen dat je met een gebrek of slecht zicht vertrekt.'],
    fouten: 'Veelgemaakte fout: een rijhulpsysteem behandelen alsof het jouw waarneming of verantwoordelijkheid overneemt.', check: 'Wat zie ik zelf, wat doet het systeem hooguit als hulp en wanneer moet ik direct ingrijpen?', ond: 'voertuig', vis: ['Bestuurder kijkt', 'Systeem helpt', 'Bestuurder beslist'] },
  11: { onderwerp: 'Gevaar herkennen voordat het een noodsituatie wordt',
    intro: 'Gevaarherkenning is vooruitdenken. Je ziet niet alleen wat er nu gebeurt, maar ook wat er waarschijnlijk kan veranderen. Daarna kies je op tijd een rustige actie: snelheid verminderen, ruimte maken, positie aanpassen of wachten.',
    situaties: ['Een bal rolt tussen geparkeerde auto’s de weg op. Verminder direct snelheid omdat een kind kan volgen, ook als je nog niemand ziet.', 'Je nadert een bocht met beperkt zicht. Kies een snelheid waarbij je binnen de zichtbare ruimte kunt stoppen en houd rekening met tegenliggers of obstakels.', 'Voor je remt verkeer onverwacht terwijl je net naar je navigatie keek. Train jezelf om blik ver vooruit te houden zodat je remlichten en beweging eerder herkent.'],
    fouten: 'Veelgemaakte fout: pas reageren wanneer het gevaar zichtbaar voor je auto staat. Dan blijft alleen hard remmen of uitwijken over.', check: 'Wat kan hier binnen drie seconden veranderen en welke rustige actie geeft mij nu al meer tijd?', ond: 'gevaar', vis: ['Zie vooruit', 'Kies vroeg', 'Houd ruimte'] },
};

export function theoryCompanion(L, num) {
  if (L !== 'nl' || Number(num) === 1) return '';
  const d = THEORY_PLUS[Number(num)];
  if (!d) return '';
  return `<section class="theory-plus"><div class="theory-plus-head"><span>VERDIEPING</span><h2>${esc(d.onderwerp)}</h2><p>${esc(d.intro)}</p></div>
    <div class="theory-visual" aria-label="Visuele geheugensteun"><span>${esc(d.vis[0])}</span><i></i><span>${esc(d.vis[1])}</span><i></i><span>${esc(d.vis[2])}</span></div>
    <h3>Drie situaties om te oefenen</h3><div class="theory-scenarios">${d.situaties.map((s, i) => `<article><b>Situatie ${i + 1}</b><p>${esc(s)}</p></article>`).join('')}</div>
    <div class="theory-recall"><section><strong>Veelgemaakte fout</strong><p>${esc(d.fouten)}</p></section><section><strong>Mini-check</strong><p>${esc(d.check)}</p></section></div>
    <p class="theory-action"><a href="/oefenexamen?onderwerp=${encodeURIComponent(d.ond)}">Oefen nu vragen over dit onderwerp →</a></p>
    <p class="theory-source">Eigen lesuitleg. Controleer actuele regels bij Rijksoverheid en CBR; laatst gecontroleerd: juli 2026.</p></section>`;
}

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
    details: 'Bekijk inhoud',
    foot: 'Geen abonnement. Je betaalt alleen voor de gekozen toegang en ziet vooraf precies wat je krijgt.',
  } : {
    eyebrow: 'Simple, personal access',
    intro: 'Choose what you want to learn. After your request, you receive a personal access code for that exact course.',
    how: 'How access works',
    steps: ['Create your free account.', 'Choose your licence and request an access code.', 'After confirmation, redeem your code and start learning.'],
    code: 'Already have an access code?',
    request: 'Request an access code',
    details: 'View contents',
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
    <a class="lp-cardlink" href="/producten/auto-b-bundel">${esc(T.details)} →</a>
    </div>`;
  const productUrl = { am: 'am', motor: 'motor', be: 'be' };
  const varKaart = (p) => `<div class="lp-plan"><div class="lp-pico">${p.ico}</div>
    <div><span class="lp-code">${p.code}</span><h3>${esc(naam(p.scope))}</h3></div>
    <ul><li>${esc(naam(p.scope))}</li></ul>
    <span class="lp-gratis">✦ ${esc(t(L, 'landing.proefles'))}</span>
    <div class="lp-prijs"><span class="lp-eur tnum">€${p.eur}</span><span class="lp-per">${eenmaligTekst}</span></div>
    ${kies(p.scope, t(L, 'landing.kies'))}<a class="lp-cardlink" href="/producten/${productUrl[p.scope]}">${esc(T.details)} →</a></div>`;
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

// ---------- publieke productpagina's ----------
export function productBody(L, user, productKey) {
  const p = PRODUCT_PAGINAS[productKey];
  if (!p) return '';
  const nl = L === 'nl';
  const T = nl ? {
    eyebrow: 'Rijbewijs ' + p.code,
    price: 'eenmalige toegang',
    what: 'Wat je krijgt',
    free: 'Wat is gratis?',
    errors: 'Veelgemaakte fouten',
    example: 'Bekijk de voorbeeldles',
    simulator: 'Oefen zoals bij het examen',
    simulatorText: 'De simulator geeft na afloop per onderwerp terug waar je nog moet oefenen. Het is oefenmateriaal en geen officieel CBR-examen.',
    request: 'Vraag toegangscode aan',
    account: 'Maak eerst je gratis account aan',
    source: 'Lesmateriaal is eigen uitleg op basis van Nederlandse verkeersregels. Laatst gecontroleerd: juli 2026.',
  } : {
    eyebrow: 'Driving licence ' + p.code,
    price: 'one-time access',
    what: 'What you get',
    free: 'What is free?',
    errors: 'Common mistakes',
    example: 'View the sample lesson',
    simulator: 'Practise like an exam',
    simulatorText: 'After each attempt, the simulator shows the topics you should practise next. It is practice material, not an official CBR exam.',
    request: 'Request an access code',
    account: 'Create your free account first',
    source: 'The lessons are original explanations based on Dutch traffic rules. Last checked: July 2026.',
  };
  const copy = {
    theorie: nl ? {
      lead: 'Begrijp regels, voorrang en verkeerssituaties eerst rustig in je eigen taal. Daarna oefen je gericht met Nederlandse begrippen en examenvragen.',
      items: ['11 hoofdstukken met uitleg, situaties en Nederlandse kernwoorden.', 'Gerichte oefensets per onderwerp en foutanalyse na elke poging.', 'Toegang tot alle Auto B-theoriehoofdstukken.'],
      free: 'De route naar je rijbewijs en de eerste theorie-uitleg zijn gratis na je account.',
      errors: ['Een bord zien maar de voorrangssituatie niet afmaken.', 'Regels onthouden zonder naar de concrete verkeerssituatie te kijken.', 'Alleen fouten tellen, zonder het onderwerp opnieuw te oefenen.'],
    } : {
      lead: 'Understand rules, priority and traffic situations calmly in your own language. Then practise Dutch terminology and exam questions with purpose.',
      items: ['11 chapters with explanations, situations and Dutch key terms.', 'Focused practice sets per topic and feedback after each attempt.', 'Access to all Car B theory chapters.'],
      free: 'The route to your driving licence and the first theory explanation are free after you create an account.',
      errors: ['Seeing a sign but not completing the priority situation.', 'Memorising rules without reading the actual traffic situation.', 'Counting mistakes without practising that topic again.'],
    },
    praktijk: nl ? {
      lead: 'Leer de Nederlandse rijpraktijk stap voor stap: kijken, handelen en terugkijken. Heldere beelden maken elke rijtaak concreet.',
      items: ['Praktijkmodules over voorbereiding, voertuigbeheersing en verkeersdeelname.', 'Duidelijke stappen, veelgemaakte fouten en examentips.', 'Nederlandse vaktaal naast uitleg in je eigen taal.'],
      free: 'De eerste stap van de eerste praktijkmodule is gratis na je account.',
      errors: ['Te laat spiegelen of pas kijken wanneer je al wilt sturen.', 'Een handeling uitvoeren zonder de omgeving opnieuw te controleren.', 'Te snel doorgaan na een fout in plaats van veilig herstellen.'],
    } : {
      lead: 'Learn Dutch driving practice step by step: observe, act and reflect. Clear imagery makes every driving task concrete.',
      items: ['Practical modules on preparation, vehicle control and traffic participation.', 'Clear steps, common mistakes and exam tips.', 'Dutch driving vocabulary alongside explanation in your own language.'],
      free: 'The first step of the first practical module is free after you create an account.',
      errors: ['Checking mirrors too late or only when you already want to steer.', 'Completing an action without checking the surroundings again.', 'Continuing too quickly after a mistake instead of recovering safely.'],
    },
    bundel: nl ? {
      lead: 'De complete Auto B-route: begrijp de regels, oefen voor het examen en vertaal die kennis naar veilig rijgedrag in de praktijk.',
      items: ['Alle Auto B-theoriehoofdstukken en praktijkmodules.', 'Oefenexamen met foutanalyse en directe links naar de juiste les.', 'Eén toegangscode voor theorie en praktijk samen.'],
      free: 'De route naar je rijbewijs, een theorie-preview en een praktijk-preview zijn gratis na je account.',
      errors: ['Theorie en praktijk los van elkaar behandelen.', 'Pas oefenen vlak voor het examen in plaats van per onderwerp.', 'Niet controleren of je de Nederlandse termen in een situatie herkent.'],
    } : {
      lead: 'The complete Car B route: understand rules, practise for the exam and turn that knowledge into safe driving behaviour.',
      items: ['All Car B theory chapters and practical modules.', 'Practice exam with feedback and direct links to the right lesson.', 'One access code for both theory and practice.'],
      free: 'The route to your licence, a theory preview and a practical preview are free after you create an account.',
      errors: ['Treating theory and practice as separate subjects.', 'Only practising just before the exam instead of per topic.', 'Not checking whether you recognise Dutch terms in a real situation.'],
    },
    am: nl ? {
      lead: 'Bereid je voor op veilig rijden met bromfiets of scooter: regels, wegpositie, bescherming en situaties die je direct herkent.',
      items: ['AM-les over voertuig, routekeuze, bescherming en verkeersregels.', 'Eigen uitleg met Nederlandse woorden die je onderweg ziet.', 'Gerichte voorbereiding naast je rijschoollessen.'],
      free: 'Het eerste deel van de AM-les is gratis na je account.',
      errors: ['Een fietspad verwarren met een fiets/bromfietspad.', 'Te weinig afstand houden bij regen, wind of druk verkeer.', 'Helm, zichtbaarheid en wegpositie pas laat controleren.'],
    } : {
      lead: 'Prepare for safe riding on a moped or scooter: rules, road position, protection and familiar real-world situations.',
      items: ['AM lesson on vehicle, route choice, protection and traffic rules.', 'Original explanations with Dutch words you see on the road.', 'Focused preparation alongside driving school lessons.'],
      free: 'The first part of the AM lesson is free after you create an account.',
      errors: ['Confusing a cycle path with a cycle/moped path.', 'Leaving too little distance in rain, wind or heavy traffic.', 'Checking helmet, visibility and road position too late.'],
    },
    motor: nl ? {
      lead: 'Bouw veilig motorinzicht op rond voertuigbeheersing, bescherming, routekeuze en de opbouw van A1, A2 en A.',
      items: ['Overzicht van de A-categorieen en de Nederlandse praktijkroute.', 'Uitleg over beschermende kleding, kijktechniek en risicoherkenning.', 'Eigen voorbereiding naast lessen en praktijkexamens.'],
      free: 'Het eerste deel van de motorles is gratis na je account.',
      errors: ['Bescherming als bijzaak behandelen.', 'Alleen naar de bocht kijken en niet naar uitweg of verkeer.', 'Een motorcategorie kiezen zonder te controleren wat bij je leeftijd past.'],
    } : {
      lead: 'Build safe motorcycle insight around vehicle control, protection, route choice and the progression through A1, A2 and A.',
      items: ['Overview of A categories and the Dutch practical route.', 'Explanation of protective clothing, observation and risk recognition.', 'Independent preparation alongside lessons and practical exams.'],
      free: 'The first part of the motorcycle lesson is free after you create an account.',
      errors: ['Treating protection as an afterthought.', 'Looking only at the bend instead of the exit and traffic.', 'Choosing a motorcycle category without checking your age requirements.'],
    },
    be: nl ? {
      lead: 'Leer wanneer je code 96 of BE nodig hebt en hoe je veilig met een aanhanger manoeuvreert, koppelt en rijdt.',
      items: ['Uitleg over gewicht, koppelen, manoeuvreren en praktijkexamen.', 'Nederlandse begrippen rond toegestane maximummassa en combinatie.', 'Praktische voorbereiding naast lessen bij je rijschool.'],
      free: 'Het eerste deel van de aanhangerles is gratis na je account.',
      errors: ['Alleen naar het gewicht van de aanhanger kijken in plaats van naar de combinatie.', 'Koppeling, verlichting of lading niet systematisch controleren.', 'Bochten nemen alsof de aanhanger de binnenbocht niet afsnijdt.'],
    } : {
      lead: 'Learn when you need code 96 or BE and how to manoeuvre, couple and drive safely with a trailer.',
      items: ['Explanation of weight, coupling, manoeuvring and the practical exam.', 'Dutch terms for permitted maximum mass and vehicle combination.', 'Practical preparation alongside driving school lessons.'],
      free: 'The first part of the trailer lesson is free after you create an account.',
      errors: ['Looking only at the trailer weight instead of the complete combination.', 'Not checking coupling, lights or load systematically.', 'Taking bends as if the trailer does not cut the inside corner.'],
    },
  }[p.focus];
  const cta = user
    ? `<a class="lp-cta" href="/toegang-aanvragen?scope=${encodeURIComponent(p.scope)}">${esc(T.request)} →</a>`
    : `<a class="lp-cta" href="/login">${esc(T.account)} →</a>`;
  const simulator = p.scope === 'b' || p.scope === 'b-theorie'
    ? `<section class="lp-product-exam"><div><span class="lp-eyebrow">${esc(T.simulator)}</span><h2>${esc(T.simulator)}</h2><p>${esc(T.simulatorText)}</p></div><a class="lp-knop" href="/login">Oefenexamen bekijken →</a></section>` : '';
  return `<div class="lp lp-product-page"><section class="lp-product-hero"><div class="lp-wrap"><a class="lp-back" href="/prijzen">← ${nl ? 'Alle toegangspassen' : 'All access passes'}</a><div class="lp-product-heading"><span class="lp-product-icon">${p.ico}</span><div><span class="lp-eyebrow">${esc(T.eyebrow)}</span><h1>${esc(nl ? p.title : p.enTitle)}</h1><p class="lp-lead">${esc(copy.lead)}</p></div><div class="lp-product-price"><strong>€${p.prijs}</strong><span>${esc(T.price)}</span>${cta}</div></div></div></section>
  <section class="lp-blk"><div class="lp-wrap"><div class="lp-product-grid2"><section><h2>${esc(T.what)}</h2><ul class="lp-checklist">${copy.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section><section><h2>${esc(T.free)}</h2><p>${esc(copy.free)}</p><a class="lp-textlink" href="${p.free}">${esc(T.example)} →</a></section></div></div></section>
  <section class="lp-blk lp-alt"><div class="lp-wrap"><div class="lp-product-errors"><div><span class="lp-eyebrow">${esc(T.errors)}</span><h2>${esc(T.errors)}</h2></div><ol>${copy.errors.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div><div class="lp-product-sample"><div><span class="lp-eyebrow">${esc(T.example)}</span><h2>${esc(nl ? 'Begin met een concrete les' : 'Start with a concrete lesson')}</h2><p>${esc(nl ? 'Bekijk eerst gratis hoe een les is opgebouwd. Daarna kies je bewust voor toegang.' : 'First see how a lesson is structured for free. Then choose access deliberately.')}</p></div><a class="lp-knop" href="${p.les}">${esc(T.example)} →</a></div>${simulator}</div></section>
  <section class="lp-blk"><div class="lp-wrap lp-product-bottom"><p>${esc(T.source)}</p>${cta}</div></section></div>`;
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
    p3: 'Dandan Drive kopieert geen theorieboek, CBR-vragen of officiële lesmethode. We schrijven eigen uitleg en gebruiken eigen situaties. De opbouw helpt leerlingen om stap voor stap te kijken, beslissen en handelen, passend naast een rijschoolopleiding en de RIS-gedachte.',
    sources: 'Bronnen en controle', sourceText: 'Regels en procedures kunnen veranderen. We controleren de hoofdlijnen aan de hand van openbare informatie van Rijksoverheid, RDW en CBR. Laatste algemene inhoudscontrole: juli 2026.',
    cbr: 'Belangrijk: Dandan Drive is een onafhankelijk oefenplatform en geen officiële website van het CBR, de RDW of de Rijksoverheid. Controleer voor je examen altijd de actuele officiële regels en procedures.',
    start: 'Gratis beginnen',
  } : {
    eyebrow: 'About Dandan Drive', title: 'Learn for your Dutch driving licence without language getting in the way.',
    intro: 'Dandan Drive was created by Dandan and Marco for international learners who want to understand their Dutch driving licence step by step.',
    p1: 'The lessons make Dutch traffic rules, exam routines and driving practice clear. Start in your own language, then build Dutch driving vocabulary calmly as you go.',
    p2: 'We deliberately choose clear explanations, real traffic situations and a calm learning path. No loud marketing, no invented reviews, just a place to practise with purpose.',
    p3: 'Dandan Drive does not copy theory books, CBR questions or an official lesson method. We write original explanations and use our own situations. The structure helps learners observe, decide and act step by step alongside driving school lessons and the RIS approach.',
    sources: 'Sources and checking', sourceText: 'Rules and procedures can change. We check key points against public information from the Dutch government, RDW and CBR. Last general content check: July 2026.',
    cbr: 'Important: Dandan Drive is an independent practice platform and not an official website of the CBR, RDW or the Dutch government. Always check the latest official rules and procedures before your exam.',
    start: 'Start for free',
  };
  return `<div class="lp"><section class="lp-about"><div class="lp-wrap"><div class="lp-about-grid"><div><span class="lp-eyebrow">${esc(T.eyebrow)}</span><h1>${esc(T.title)}</h1><p class="lp-lead">${esc(T.intro)}</p><a class="lp-cta" href="/login">${esc(T.start)} →</a></div><div class="lp-about-mark"><span>11</span><small>talen<br>een duidelijk leerpad</small></div></div></div></section>
  <section class="lp-blk"><div class="lp-wrap lp-prose"><p>${esc(T.p1)}</p><p>${esc(T.p2)}</p><p>${esc(T.p3)}</p><div class="lp-disclaimer"><strong>CBR</strong><p>${esc(T.cbr)}</p></div><section class="lp-sources"><h2>${esc(T.sources)}</h2><p>${esc(T.sourceText)}</p><p><a href="https://www.rijksoverheid.nl/onderwerpen/verkeersveiligheid">Rijksoverheid</a> · <a href="https://www.rdw.nl/">RDW</a> · <a href="https://www.cbr.nl/">CBR</a></p></section></div></section></div>`;
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
    eyebrow: 'For driving schools', kop: 'Give every learner a clear route to Dutch driving theory.', sub: 'Offer original explanations in the learner\'s own language alongside your lessons. You decide which access passes your students receive.',
    packages: 'Clear partner packages', p10: 'Starter', p25: 'Growth', p50: 'Scale', s1: '10 access passes. 20% partner discount.', s2: '25 access passes. 30% partner discount.', s3: '50 access passes. Quote based on your course mix.',
    how: 'How it works', h1: 'Choose the course mix that fits your students.', h2: 'Receive product-specific voucher codes.', h3: 'Students activate independently with their own email address.',
    privacy: 'Privacy by design', privacyText: 'You receive voucher codes, not student progress or account data. Dandan Drive only uses the contact details below to handle your demo request.',
    mail: 'A ready-to-send message for learners', mailText: 'We prepare a short Dutch and English message that you can send with the voucher code and the right start link.',
    form: 'Request a demo or partner quote', school: 'Driving school name', name: 'Contact person', email: 'Business email address', amount: 'Expected number of learners', message: 'What would you like to offer?', send: 'Send request',
  } : {
    eyebrow: 'Voor rijscholen', kop: 'Geef elke leerling een heldere route naar Nederlandse rijtheorie.', sub: 'Bied eigen uitleg in de taal van je leerling naast je rijlessen. Jij bepaalt welke toegangspassen leerlingen ontvangen.',
    packages: 'Duidelijke partnerpakketten', p10: 'Start', p25: 'Groei', p50: 'Schaal', s1: '10 toegangspassen. 20% partnerkorting.', s2: '25 toegangspassen. 30% partnerkorting.', s3: '50 toegangspassen. Offerte op basis van jouw cursusmix.',
    how: 'Zo werkt het', h1: 'Kies de cursusmix die bij jouw leerlingen past.', h2: 'Ontvang productgebonden vouchercodes.', h3: 'Leerlingen activeren zelfstandig met hun eigen e-mailadres.',
    privacy: 'Privacy by design', privacyText: 'Je ontvangt vouchercodes, geen voortgang of accountgegevens van leerlingen. Dandan Drive gebruikt de contactgegevens hieronder alleen om je demo-aanvraag af te handelen.',
    mail: 'Kant-en-klaar bericht voor leerlingen', mailText: 'We maken een kort Nederlands en Engels bericht dat je samen met de vouchercode en juiste startlink kunt versturen.',
    form: 'Vraag een demo of partnerofferte aan', school: 'Naam rijschool', name: 'Contactpersoon', email: 'Zakelijk e-mailadres', amount: 'Verwacht aantal leerlingen', message: 'Wat wil je aanbieden?', send: 'Aanvraag versturen',
  };
  return `<div class="lp lp-partner"><section class="lp-partner-hero"><div class="lp-wrap"><span class="lp-eyebrow">${esc(T.eyebrow)}</span><h1>${esc(T.kop)}</h1><p class="lp-lead">${esc(T.sub)}</p><a class="lp-cta" href="#aanvragen">${esc(T.form)} →</a></div></section>
  <section class="lp-blk"><div class="lp-wrap"><div class="lp-kop"><span class="lp-eyebrow">${esc(T.packages)}</span><h2>${esc(T.packages)}</h2></div><div class="lp-partner-packages"><article><strong>${esc(T.p10)}</strong><b>10</b><p>${esc(T.s1)}</p></article><article><strong>${esc(T.p25)}</strong><b>25</b><p>${esc(T.s2)}</p></article><article><strong>${esc(T.p50)}</strong><b>50</b><p>${esc(T.s3)}</p></article></div></div></section>
  <section class="lp-blk lp-alt"><div class="lp-wrap"><div class="lp-kop"><span class="lp-eyebrow">${esc(T.how)}</span><h2>${esc(T.how)}</h2></div><div class="lp-steps"><article class="lp-step"><div class="lp-bar"></div><h3>01</h3><p>${esc(T.h1)}</p></article><article class="lp-step"><div class="lp-bar"></div><h3>02</h3><p>${esc(T.h2)}</p></article><article class="lp-step"><div class="lp-bar"></div><h3>03</h3><p>${esc(T.h3)}</p></article></div><div class="lp-partner-notes"><section><h3>${esc(T.privacy)}</h3><p>${esc(T.privacyText)}</p></section><section><h3>${esc(T.mail)}</h3><p>${esc(T.mailText)}</p></section></div></div></section>
  <section class="lp-blk" id="aanvragen"><div class="lp-wrap lp-form-wrap"><div class="lp-kop"><span class="lp-eyebrow">${esc(T.eyebrow)}</span><h2>${esc(T.form)}</h2></div><form method="post" action="/partner-aanvraag" class="access-form"><label>${esc(T.school)}<input name="rijschool" required maxlength="160"></label><label>${esc(T.name)}<input name="naam" required maxlength="120"></label><label>${esc(T.email)}<input type="email" name="email" required maxlength="120"></label><label>${esc(T.amount)}<select name="omvang"><option value="1-9">1-9</option><option value="10-24">10-24</option><option value="25-49">25-49</option><option value="50+">50+</option></select></label><label>${esc(T.message)}<textarea name="bericht" rows="4" maxlength="800"></textarea></label><button class="lp-knop">${esc(T.send)} →</button></form></div></section></div>`;
}

export function partnerBedanktBody(L) {
  const nl = L === 'nl';
  return `<div class="lp"><div class="lp-wrap lp-form-wrap"><div class="lp-confirm"><span class="lp-confirm-check">✓</span><span class="lp-eyebrow">${nl ? 'Aanvraag ontvangen' : 'Request received'}</span><h1>${nl ? 'Je partneraanvraag is ontvangen.' : 'Your partner request has been received.'}</h1><p>${nl ? 'We nemen persoonlijk contact op over de juiste cursusmix en vouchercodes voor je leerlingen.' : 'We will contact you personally about the right course mix and voucher codes for your learners.'}</p><a class="lp-knop" href="/">${nl ? 'Terug naar Dandan Drive' : 'Back to Dandan Drive'} →</a></div></div></div>`;
}

// ---------- reviews (sociaal bewijs; alleen echte, door admin goedgekeurde) ----------
export function reviewsBlok(L, rows) {
  if (!rows.length) return '';
  return `<h2 style="margin-top:28px">${esc(t(L, 'reviews.kop'))}</h2>
  <div class="grid">${rows.map((r) => `<figure class="card review"><div class="sterren" aria-label="${r.sterren}/5">${'★'.repeat(r.sterren)}${'☆'.repeat(5 - r.sterren)}</div>
    <blockquote lang="${esc(r.taal)}">${esc(r.tekst)}</blockquote><figcaption>${esc(r.naam)} · ${esc(TAALNAMEN[r.taal] || r.taal)}</figcaption></figure>`).join('')}</div>`;
}
