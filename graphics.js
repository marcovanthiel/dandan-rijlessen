/* Originele, rechtenvrije SVG-graphics voor Dandan's rijlessen.
   Iconen (24x24, lijnstijl via currentColor) + grotere concept-diagrammen.
   Geen enkel beeld is afkomstig uit het bronboek. */

// ---- iconen (inner markup; stroke geërfd via CSS) ----
const I = {
  check:'<path d="M9 11l2 2 4-4"/><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 3v3h6V3"/>',
  door:'<path d="M3 20h18"/><path d="M14 20V5L6 7v13"/><circle cx="9.5" cy="13" r="1"/>',
  seat:'<path d="M6 20v-6a3 3 0 0 1 3-3h2"/><path d="M6 11V5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v6"/><path d="M11 14h5l2 6"/>',
  wheel:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/><path d="M12 9.5V4M9.9 13.6l-4 3.4M14.1 13.6l4 3.4"/>',
  mirror:'<rect x="4" y="8" width="16" height="6" rx="3"/><path d="M7 14v4M17 14v4"/><path d="M9 11h6"/>',
  key:'<circle cx="8" cy="12" r="3.2"/><path d="M11 12h9M17 12v3M20 12v2"/>',
  pedal:'<rect x="7" y="4" width="7" height="12" rx="2" transform="rotate(8 10 10)"/><path d="M6 20h12"/>',
  stop:'<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z"/><path d="M9 12h6"/>',
  eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
  road:'<path d="M6 21L9 3M18 21l-3-18"/><path d="M12 6v2M12 12v2M12 18v2"/>',
  gear:'<path d="M6 4v10M12 4v10M18 4v10M4 8h16"/><circle cx="6" cy="18" r="2"/><circle cx="12" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  hill:'<path d="M3 20h18"/><path d="M4 20L14 7l6 8"/><rect x="12" y="9" width="5" height="3" rx="1" transform="rotate(-38 12 9)"/>',
  reverse:'<circle cx="12" cy="12" r="9"/><path d="M14.5 8.5H9.5v7M9.5 12h4a2 2 0 0 0 0-4M12.5 12l2.5 3.5"/>',
  parking:'<circle cx="12" cy="12" r="9"/><path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3"/>',
  uturn:'<path d="M7 20V10a5 5 0 0 1 10 0v4"/><path d="M14 12l3 3 3-3"/>',
  lane:'<path d="M8 3v18M16 3v18" opacity=".4"/><path d="M12 20V8"/><path d="M9 11l3-3 3 3"/>',
  overtake:'<rect x="4" y="14" width="6" height="6" rx="1"/><rect x="13" y="5" width="6" height="6" rx="1"/><path d="M7 14V9h9"/><path d="M14 7l2 2-2 2"/>',
  merge:'<path d="M5 4v6c0 4 3 5 7 6M19 4v16"/><path d="M12 13l-3 3M12 13l3 3" opacity="0"/><path d="M16 14l3 2-3 2"/>',
  roundabout:'<circle cx="12" cy="11" r="4"/><path d="M12 20v-5M12 7V3M8 11H3M21 11h-5" opacity=".5"/><path d="M12 3l2 2-2 2"/>',
  home:'<path d="M4 11l8-6 8 6"/><path d="M6 10v10h12V10"/><circle cx="10" cy="17" r="1"/><circle cx="14" cy="17" r="1"/>',
  train:'<rect x="6" y="4" width="12" height="12" rx="2"/><path d="M6 10h12"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/><path d="M7 20l3-3M17 20l-3-3"/>',
  ped:'<circle cx="12" cy="4.5" r="1.6"/><path d="M12 7v6M12 9l-3 2M12 9l3 2M12 13l-2 5M12 13l2 5"/>',
  bus:'<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M4 11h16"/><circle cx="8" cy="18" r="1.4"/><circle cx="16" cy="18" r="1.4"/>',
  moon:'<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
  route:'<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h6"/>',
  leaf:'<path d="M5 19C5 9 12 5 20 5c0 9-5 15-13 14 0 0 1-6 8-9"/>',
  shield:'<path d="M12 3l7 3v6c0 5-3 7-7 9-4-2-7-4-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
  brain:'<path d="M9 4a3 3 0 0 0-3 5 3 3 0 0 0 0 6 3 3 0 0 0 3 3V4z"/><path d="M15 4a3 3 0 0 1 3 5 3 3 0 0 1 0 6 3 3 0 0 1-3 3V4z"/><path d="M12 4v16"/>',
  heart:'<path d="M12 20S4 14 4 8.5A3.5 3.5 0 0 1 12 6a3.5 3.5 0 0 1 8 2.5C20 14 12 20 12 20z"/>',
  flag:'<path d="M6 21V4"/><path d="M6 5h11l-2 3 2 3H6"/>',
  radar:'<circle cx="12" cy="12" r="9"/><path d="M12 12L18 8M12 12v-9" opacity=".6"/><path d="M12 12a6 6 0 0 1 5-3" fill="none"/>',
  list:'<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 5-4 1 2-5z"/>'
};
function icon(name){ return `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${I[name]||I.check}</svg>`; }

const STEP_ICON = {
  '1':'check','2':'check','3':'door','4':'door','5':'seat','6':'wheel','7':'mirror','8':'key','9':'pedal','10':'eye',
  '11':'wheel','12':'road','13':'pedal','14':'pedal','15':'stop','16':'pedal','17':'gear','18':'gear',
  '19':'road','20':'road','21':'shield','22':'road','23':'overtake','24':'roundabout','25':'uturn','26':'hill',
  '27a':'reverse','27b':'reverse','28':'parking','29a':'uturn','29b':'uturn',
  '30':'lane','31':'lane','32':'overtake','33':'merge','34':'merge','35':'roundabout','36':'home','37':'train','38':'ped','39':'bus',
  '40':'moon','41':'route','42':'shield','43':'leaf','44':'shield','45':'brain','46':'heart'
};
function iconFor(step, zh){
  if(step && STEP_ICON[step]) return icon(STEP_ICON[step]);
  if(/学习方法|leermodel/i.test(zh)) return icon('compass');
  if(/路考|examen/i.test(zh)) return icon('flag');
  if(/辅助|ADAS/i.test(zh)) return icon('radar');
  if(/巩固|练习|oefening/i.test(zh)) return icon('list');
  return icon('check');
}
function moduleIcon(num){ return icon(['compass','wheel','road','roundabout','shield','flag'][Number(num)]||'compass'); }

// ---- grotere concept-diagrammen (origineel) ----
const F = {};
// Leermodel: 5 taakprocessen als cyclus
F['leermodel'] = `
<svg viewBox="0 0 460 200" class="figsvg" role="img" aria-label="五个任务过程循环 / vijf taakprocessen">
<defs><marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0 0l6 3-6 3z" fill="var(--brand)"/></marker></defs>
${[['观察','Waarnemen'],['预测','Voorspellen'],['评估','Evalueren'],['决定','Beslissen'],['执行','Handelen']].map((t,i)=>{
  const x=40+i*95; return `<g><circle cx="${x}" cy="70" r="30" fill="var(--accent)" stroke="var(--brand)"/>
  <text x="${x}" y="66" text-anchor="middle" class="zhlbl">${t[0]}</text>
  <text x="${x}" y="82" text-anchor="middle" class="nllbl">${t[1]}</text>
  ${i<4?`<line x1="${x+31}" y1="70" x2="${x+63}" y2="70" stroke="var(--brand)" stroke-width="2" marker-end="url(#ar)"/>`:''}</g>`;
}).join('')}
<path d="M405 88 q 30 40 -180 62 q -215 22 -185 -60" fill="none" stroke="var(--brand)" stroke-width="2" stroke-dasharray="5 5" marker-end="url(#ar)"/>
<text x="230" y="185" text-anchor="middle" class="caption">不断循环 · doorlopende cyclus</text>
</svg>`;
// Dode hoek / spiegels
F['7'] = `
<svg viewBox="0 0 420 200" class="figsvg" role="img" aria-label="盲区 / dode hoek">
<rect x="180" y="80" width="60" height="34" rx="6" fill="var(--accent)" stroke="var(--brand)"/>
<text x="210" y="101" text-anchor="middle" class="caption">你的车</text>
<path d="M180 88 L60 40 M180 106 L60 150" stroke="var(--brand)" stroke-width="1.5" stroke-dasharray="4 4"/>
<path d="M240 88 L360 40 M240 106 L360 150" stroke="var(--brand)" stroke-width="1.5" stroke-dasharray="4 4"/>
<path d="M240 92 L330 150 L360 150 L240 108 Z" fill="#ffdede" stroke="#e57373"/>
<text x="322" y="130" text-anchor="middle" class="warnlbl">盲区 dode hoek</text>
<text x="90" y="35" class="nllbl">spiegelbeeld</text>
</svg>`;
// Stuurhouding: handen kwart voor drie
F['11'] = `
<svg viewBox="0 0 220 200" class="figsvg" role="img" aria-label="握姿 kwart voor drie">
<circle cx="110" cy="100" r="70" fill="none" stroke="var(--brand)" stroke-width="6"/>
<circle cx="110" cy="100" r="22" fill="var(--accent)" stroke="var(--brand)"/>
<rect x="36" y="86" width="20" height="28" rx="6" fill="var(--brand)"/>
<rect x="164" y="86" width="20" height="28" rx="6" fill="var(--brand)"/>
<text x="110" y="190" text-anchor="middle" class="caption">"差一刻到三点" · kwart voor drie (9+3)</text>
</svg>`;
// Schakelpatroon H
F['17'] = `
<svg viewBox="0 0 260 190" class="figsvg" role="img" aria-label="换挡图 schakelpatroon">
<path d="M60 40V150M130 40V150M200 40V150M60 95H200" stroke="var(--brand)" stroke-width="3" fill="none" stroke-linecap="round"/>
<g class="zhlbl" text-anchor="middle">
<text x="60" y="34">1</text><text x="60" y="168">2</text>
<text x="130" y="34">3</text><text x="130" y="168">4</text>
<text x="200" y="34">5</text><text x="200" y="168">R</text></g>
<text x="130" y="186" text-anchor="middle" class="caption">典型 5 挡 + 倒挡 · 5 versnellingen + R</text>
</svg>`;
// 2-secondenregel
F['20'] = `
<svg viewBox="0 0 440 150" class="figsvg" role="img" aria-label="两秒规则 2-secondenregel">
<rect x="20" y="70" width="70" height="34" rx="6" fill="var(--accent)" stroke="var(--brand)"/>
<rect x="330" y="70" width="70" height="34" rx="6" fill="var(--brand)" opacity=".85"/>
<path d="M95 87H325" stroke="var(--brand)" stroke-width="2" stroke-dasharray="6 6" marker-end="url(#ar2)"/>
<defs><marker id="ar2" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0 0l6 3-6 3z" fill="var(--brand)"/></marker></defs>
<text x="210" y="60" text-anchor="middle" class="zhlbl">≥ 2 秒</text>
<text x="210" y="120" text-anchor="middle" class="caption">保持至少两秒跟车距离 · minstens 2 seconden</text>
</svg>`;
// Kruispunt kijkvolgorde
F['24'] = `
<svg viewBox="0 0 260 210" class="figsvg" role="img" aria-label="路口观察顺序">
<path d="M110 0v210M150 0v210" stroke="var(--line)" stroke-width="1"/>
<path d="M0 90h260M0 130h260" stroke="var(--line)" stroke-width="1"/>
<rect x="112" y="150" width="36" height="50" rx="6" fill="var(--accent)" stroke="var(--brand)"/>
<path d="M130 150 C130 120 60 118 30 110" fill="none" stroke="var(--brand)" stroke-width="2" marker-end="url(#ar3)"/>
<path d="M130 150 C130 120 200 118 230 110" fill="none" stroke="var(--brand)" stroke-width="2" marker-end="url(#ar3)"/>
<defs><marker id="ar3" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0 0l6 3-6 3z" fill="var(--brand)"/></marker></defs>
<text x="30" y="100" text-anchor="middle" class="zhlbl">左</text>
<text x="230" y="100" text-anchor="middle" class="zhlbl">右</text>
<text x="130" y="205" text-anchor="middle" class="caption">前 → 左 → 前 → 右，反复</text>
</svg>`;
// Rotonde rijstrookkeuze
F['35'] = `
<svg viewBox="0 0 240 220" class="figsvg" role="img" aria-label="环岛车道选择">
<circle cx="120" cy="110" r="55" fill="none" stroke="var(--brand)" stroke-width="2"/>
<circle cx="120" cy="110" r="26" fill="var(--accent)" stroke="var(--brand)"/>
<path d="M120 200v-20" stroke="var(--brand)" stroke-width="10" stroke-linecap="round"/>
<g class="caption" text-anchor="middle">
<text x="120" y="24">½ → 中 midden</text>
<text x="214" y="112">¼→右</text>
<text x="120" y="150" class="zhlbl">环岛</text>
<text x="30" y="112">¾→左</text></g>
</svg>`;
// Zebrapad
F['38'] = `
<svg viewBox="0 0 300 150" class="figsvg" role="img" aria-label="人行横道 zebrapad">
<rect x="0" y="0" width="300" height="150" fill="none"/>
${[0,1,2,3,4,5].map(i=>`<rect x="${40+i*38}" y="30" width="20" height="90" rx="2" fill="var(--brand)" opacity=".85"/>`).join('')}
<circle cx="150" cy="20" r="7" fill="var(--brand)"/><path d="M150 26v14M150 30l-6 4M150 30l6 4M150 40l-4 8M150 40l4 8" stroke="var(--brand)" stroke-width="2" fill="none"/>
<text x="150" y="142" text-anchor="middle" class="caption">让行人先行 · voetgangers voor laten gaan</text>
</svg>`;

function figFor(step, zh){
  if(F[step]) return F[step];
  if(/学习方法|leermodel/i.test(zh)) return F['leermodel'];
  return '';
}

module.exports = { iconFor, moduleIcon, figFor };
