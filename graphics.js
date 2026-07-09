/* Originele, rechtenvrije illustraties voor Dandan's rijlessen.
   Verzorgde vlakke-illustratiestijl met gradiënten, zachte schaduw en
   herbruikbare componenten (auto boven-/zijaanzicht, weg, persoon, borden).
   Geen enkel beeld is ontleend aan of nagetekend van het bronboek. */

/* ---------------- iconen (24x24 lijnstijl) ---------------- */
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
  hill:'<path d="M3 20h18"/><path d="M4 20L14 7l6 8"/>',
  reverse:'<circle cx="12" cy="12" r="9"/><path d="M14.5 8.5H9.5v7M9.5 12h4a2 2 0 0 0 0-4"/>',
  parking:'<circle cx="12" cy="12" r="9"/><path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3"/>',
  uturn:'<path d="M7 20V10a5 5 0 0 1 10 0v4"/><path d="M14 12l3 3 3-3"/>',
  lane:'<path d="M8 3v18M16 3v18" opacity=".4"/><path d="M12 20V8"/><path d="M9 11l3-3 3 3"/>',
  overtake:'<rect x="4" y="14" width="6" height="6" rx="1"/><rect x="13" y="5" width="6" height="6" rx="1"/><path d="M7 14V9h9"/><path d="M14 7l2 2-2 2"/>',
  merge:'<path d="M5 4v6c0 4 3 5 7 6M19 4v16"/><path d="M16 14l3 2-3 2"/>',
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
  radar:'<circle cx="12" cy="12" r="9"/><path d="M12 12L18 8M12 12v-9" opacity=".6"/>',
  list:'<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 5-4 1 2-5z"/>'
};
function icon(n){ return `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${I[n]||I.check}</svg>`; }
const STEP_ICON={'1':'check','2':'check','3':'door','4':'door','5':'seat','6':'wheel','7':'mirror','8':'key','9':'pedal','10':'eye','11':'wheel','12':'road','13':'pedal','14':'pedal','15':'stop','16':'pedal','17':'gear','18':'gear','19':'road','20':'road','21':'shield','22':'road','23':'overtake','24':'roundabout','25':'uturn','26':'hill','27a':'reverse','27b':'reverse','28':'parking','29a':'uturn','29b':'uturn','30':'lane','31':'lane','32':'overtake','33':'merge','34':'merge','35':'roundabout','36':'home','37':'train','38':'ped','39':'bus','40':'moon','41':'route','42':'shield','43':'leaf','44':'shield','45':'brain','46':'heart'};
function iconFor(step,zh){ if(step&&STEP_ICON[step])return icon(STEP_ICON[step]); if(/学习方法|leermodel/i.test(zh))return icon('compass'); if(/路考|examen/i.test(zh))return icon('flag'); if(/辅助|ADAS/i.test(zh))return icon('radar'); if(/巩固|练习|oefening/i.test(zh))return icon('list'); return icon('check'); }
function moduleIcon(num){ return icon(['compass','wheel','road','roundabout','shield','flag'][Number(num)]||'compass'); }

/* ---------------- illustratie-componenten (semi-realistisch vector) ---------------- */
const GRAD = { blue:'gBlue', gray:'gGray', red:'gRed', teal:'gTeal' };
const ACC = { blue:['#fff1bf','#ff6b6b'], gray:['#f2f5f9','#e88a86'], red:['#fff1bf','#ffd2cf'], teal:['#fff1bf','#ff6b6b'] };
const DEFS = `<defs>
<linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5c98f2"/><stop offset=".55" stop-color="#3f80e6"/><stop offset="1" stop-color="#356fce"/></linearGradient>
<linearGradient id="gGray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ccd6e1"/><stop offset=".55" stop-color="#b6c2d1"/><stop offset="1" stop-color="#a3b0c1"/></linearGradient>
<linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0897f"/><stop offset=".55" stop-color="#e86a5f"/><stop offset="1" stop-color="#d6544a"/></linearGradient>
<linearGradient id="gTeal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4dc3b6"/><stop offset=".55" stop-color="#2fb0a3"/><stop offset="1" stop-color="#26978c"/></linearGradient>
<linearGradient id="gGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef6ff"/><stop offset="1" stop-color="#c7ddf6"/></linearGradient>
<radialGradient id="gTire" cx="38%" cy="34%" r="70%"><stop offset="0" stop-color="#59636f"/><stop offset="1" stop-color="#2b333d"/></radialGradient>
<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe6ff"/><stop offset="1" stop-color="#eef6ff"/></linearGradient>
<linearGradient id="gGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e5f1df"/><stop offset="1" stop-color="#dcebd4"/></linearGradient>
<filter id="sh" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="1.2" stdDeviation="2.2" flood-color="#20304a" flood-opacity="0.14"/></filter>
<filter id="soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.2"/></filter>
<marker id="a" markerWidth="11" markerHeight="11" refX="6.8" refY="3" orient="auto"><path d="M0 0l7 3-7 3z" fill="#2f6fe0"/></marker>
<marker id="ao" markerWidth="11" markerHeight="11" refX="6.8" refY="3" orient="auto"><path d="M0 0l7 3-7 3z" fill="#e5730a"/></marker>
</defs>`;
function svg(vb,label,inner){ return `<svg viewBox="0 0 ${vb}" class="figsvg" role="img" aria-label="${label}">${DEFS}${inner}</svg>`; }
function cap(x,y,t,cls){ return `<text x="${x}" y="${y}" text-anchor="middle" class="${cls||'caption'}">${t}</text>`; }

// auto van boven (naar boven), tone: blue/gray/red/teal
function carTop(cx,cy,s,tone){ tone=tone||'blue'; const g=GRAD[tone], ac=ACC[tone];
 return `<g transform="translate(${cx} ${cy}) scale(${s})">
 <ellipse cx="1" cy="2" rx="27" ry="47" fill="#20304a" opacity=".14" filter="url(#soft)"/>
 ${[[-22,-31],[22,-31],[-22,20],[22,20]].map(w=>`<rect x="${w[0]-3.5}" y="${w[1]}" width="7.5" height="17" rx="3" fill="url(#gTire)"/>`).join('')}
 <path d="M-23 -31 C-23 -44 -14 -47 0 -47 C14 -47 23 -44 23 -31 L23 33 C23 44 15 47 0 47 C-15 47 -23 44 -23 33 Z" fill="url(#${g})"/>
 <path d="M-23 -20 C-23 -40 -14 -46 0 -46 C14 -46 23 -40 23 -20 L23 -12 C10 -18 -10 -18 -23 -12 Z" fill="#ffffff" opacity=".14"/>
 <path d="M-16.5 -15 h33 a0 0 0 0 1 0 0 v27 a8 8 0 0 1 -8 8 h-17 a8 8 0 0 1 -8 -8 Z" fill="#ffffff" opacity=".10"/>
 <path d="M-16 -17 Q0 -23 16 -17 L13 -31 Q0 -37 -13 -31 Z" fill="url(#gGlass)"/>
 <path d="M-12 -30 L-4 -18 L-8 -18 Z" fill="#ffffff" opacity=".5"/>
 <path d="M-14 20 Q0 25 14 20 L12.5 32 Q0 37.5 -12.5 32 Z" fill="url(#gGlass)"/>
 <rect x="-16.5" y="-13" width="33" height="30" rx="8" fill="#ffffff" opacity=".07"/>
 <path d="M-23 -20 l-6 2.8 6 2.8 Z" fill="url(#${g})"/><path d="M23 -20 l6 2.8 -6 2.8 Z" fill="url(#${g})"/>
 <rect x="-18" y="-46" width="9" height="4" rx="2" fill="${ac[0]}"/><rect x="9" y="-46" width="9" height="4" rx="2" fill="${ac[0]}"/>
 <rect x="-18" y="42" width="9" height="4" rx="2" fill="${ac[1]}"/><rect x="9" y="42" width="9" height="4" rx="2" fill="${ac[1]}"/>
 </g>`; }
// auto van opzij (naar rechts)
function carSide(cx,cy,s,tone){ tone=tone||'blue'; const g=GRAD[tone], ac=ACC[tone];
 const body="M-55 12 C-54 3 -48 -1 -39 -3 L-25 -21 C-19 -26 -7 -28 5 -28 L19 -28 C29 -27 35 -21 41 -10 L50 -8 C55 -7 56 -1 56 8 L56 12 C56 16 52 18 48 18 L-48 18 C-53 18 -55 16 -55 12 Z";
 return `<g transform="translate(${cx} ${cy}) scale(${s})">
 <ellipse cx="1" cy="20" rx="54" ry="7" fill="#20304a" opacity=".14" filter="url(#soft)"/>
 <path d="${body}" fill="url(#${g})"/>
 <path d="M-55 12 C-54 3 -48 -1 -39 -3 L-25 -21 C-19 -26 -7 -28 5 -28 L19 -28 C29 -27 35 -21 41 -10 L50 -8 C55 -7 56 -1 56 6 C30 -2 -28 -2 -55 8 Z" fill="#ffffff" opacity=".16"/>
 <path d="M-23 -6 L-13 -19 L1 -19 L1 -6 Z" fill="url(#gGlass)"/>
 <path d="M5 -6 L5 -19 L18 -19 L29 -6 Z" fill="url(#gGlass)"/>
 <path d="M-20 -7 L-12 -17 L-8 -17 Z" fill="#ffffff" opacity=".5"/>
 <path d="M3 -6 V13" stroke="#22324c" stroke-opacity=".16" stroke-width="1.3"/>
 <rect x="-16" y="3.5" width="11" height="2.4" rx="1.2" fill="#22324c" opacity=".28"/>
 <rect x="49" y="-2" width="6.5" height="6.5" rx="2.5" fill="${ac[0]}"/>
 <g><circle cx="-31" cy="18" r="12" fill="url(#gTire)"/><circle cx="-31" cy="18" r="5.4" fill="#e6ebf2"/><circle cx="-31" cy="18" r="2.2" fill="#aab6c6"/></g>
 <g><circle cx="33" cy="18" r="12" fill="url(#gTire)"/><circle cx="33" cy="18" r="5.4" fill="#e6ebf2"/><circle cx="33" cy="18" r="2.2" fill="#aab6c6"/></g>
 </g>`; }
function person(cx,cy,s,c){ c=c||'#33507a'; return `<g transform="translate(${cx} ${cy}) scale(${s})">
 <circle cx="0" cy="-15" r="4.6" fill="${c}"/><path d="M0 -10 C3 -10 4 -8 4 -4 L4 2 -4 2 -4 -4 C-4 -8 -3 -10 0 -10Z" fill="${c}"/>
 <path d="M-3 2 L-5 15 M3 2 L5 15" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/></g>`; }
function cyclistTop(cx,cy,s){ s=s||1; return `<g transform="translate(${cx} ${cy}) scale(${s})">
 <rect x="-4" y="-13" width="8" height="26" rx="4" fill="#e8a13a"/><circle cx="0" cy="-16" r="4" fill="#33507a"/></g>`; }
function treeTop(cx,cy,r){ return `<g filter="url(#sh)"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#7cbf82"/></g><circle cx="${cx}" cy="${cy}" r="${r*0.7}" fill="#8fce8c"/><circle cx="${cx-r*0.28}" cy="${cy-r*0.28}" r="${r*0.4}" fill="#aede9f" opacity=".8"/>`; }
function bush(cx,cy,r){ return `<g><circle cx="${cx-r*0.6}" cy="${cy}" r="${r*0.7}" fill="#9ed49a"/><circle cx="${cx+r*0.6}" cy="${cy}" r="${r*0.7}" fill="#9ed49a"/><circle cx="${cx}" cy="${cy-r*0.3}" r="${r}" fill="#aede9f"/></g>`; }
function building(x,y,w,h,c){ c=c||'#c9d6e4'; return `<g filter="url(#sh)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c}"/></g><rect x="${x}" y="${y}" width="${w}" height="6" rx="3" fill="#ffffff" opacity=".18"/>${Array.from({length:Math.floor(h/16)}).map((_,r)=>Array.from({length:Math.max(1,Math.floor(w/14))}).map((__,k)=>`<rect x="${x+6+k*14}" y="${y+10+r*16}" width="7" height="9" rx="1.5" fill="#eef4fb" opacity=".85"/>`).join('')).join('')}`; }
function cloud(cx,cy,s){ s=s||1; return `<g transform="translate(${cx} ${cy}) scale(${s})" fill="#ffffff" opacity=".85"><circle cx="0" cy="0" r="11"/><circle cx="13" cy="2" r="9"/><circle cx="-12" cy="3" r="8"/><rect x="-14" y="0" width="30" height="9" rx="4"/></g>`; }
// wegen met groene bermen en struiken
function roadH(x,y,w,h){ const v=7; return `<g>
<rect x="${x}" y="${y-v}" width="${w}" height="${h+2*v}" rx="9" fill="url(#gGround)"/>
${bush(x+w*0.16,y-v+3,5)}${bush(x+w*0.62,y+h+v-3,5)}${bush(x+w*0.86,y-v+3,4)}
<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e8edf3"/>
<rect x="${x}" y="${y}" width="${w}" height="3.5" fill="#dbe2ec"/><rect x="${x}" y="${y+h-3.5}" width="${w}" height="3.5" fill="#dbe2ec"/>
<line x1="${x+8}" y1="${y+h/2}" x2="${x+w-8}" y2="${y+h/2}" stroke="#ffffff" stroke-width="3" stroke-dasharray="15 13" stroke-linecap="round"/></g>`; }
function roadV(x,y,w,h){ const v=7; return `<g>
<rect x="${x-v}" y="${y}" width="${w+2*v}" height="${h}" rx="9" fill="url(#gGround)"/>
${bush(x-v+3,y+h*0.2,5)}${bush(x+w+v-3,y+h*0.56,5)}
<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e8edf3"/>
<rect x="${x}" y="${y}" width="3.5" height="${h}" fill="#dbe2ec"/><rect x="${x+w-3.5}" y="${y}" width="3.5" height="${h}" fill="#dbe2ec"/>
<line x1="${x+w/2}" y1="${y+8}" x2="${x+w/2}" y2="${y+h-8}" stroke="#ffffff" stroke-width="3" stroke-dasharray="15 13" stroke-linecap="round"/></g>`; }
function sign(cx,cy,r,fill,stroke,txt){ return `<g filter="url(#sh)"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="3"/></g><text x="${cx}" y="${cy+r*0.30}" text-anchor="middle" class="signtxt">${txt}</text>`; }
// brede sfeerbanner per module
function moduleBanner(num){ const tone=['blue','blue','gray','teal','blue','blue'][Number(num)]||'blue';
 return `<svg viewBox="0 0 900 190" class="bannersvg" preserveAspectRatio="xMidYMid slice" role="img" aria-label="module banner">${DEFS}
 <rect x="0" y="0" width="900" height="190" fill="url(#gSky)"/>
 ${cloud(140,42,1.3)}${cloud(520,34,1)}${cloud(770,52,1.5)}
 ${building(60,70,70,70,'#cdd9e7')}${building(150,50,54,90,'#d7e1ee')}${building(220,84,80,56,'#c6d3e3')}
 ${building(640,60,64,80,'#d7e1ee')}${building(720,80,90,60,'#cdd9e7')}${building(822,54,58,86,'#d2dded')}
 <rect x="0" y="140" width="900" height="50" fill="url(#gGround)"/>
 ${treeTop(360,150,16)}${treeTop(470,156,13)}${treeTop(600,150,15)}
 <rect x="0" y="150" width="900" height="34" fill="#e8edf3"/>
 <rect x="0" y="150" width="900" height="4" fill="#dbe2ec"/>
 <line x1="10" y1="167" x2="890" y2="167" stroke="#ffffff" stroke-width="4" stroke-dasharray="26 22" stroke-linecap="round"/>
 <g transform="rotate(90 250 167)">${carTop(250,167,0.72,tone)}</g>
 <g transform="rotate(-90 640 167)">${carTop(640,167,0.72,'gray')}</g>
 </svg>`; }

/* ---------------- diagrammen ---------------- */
const F = {};
const BLUE='#2f6fe0', INK='#33507a', SOFT='#cfd8e4';

F['leermodel']=svg('480 210','五个任务过程 · taakprocessen', `
${[['观察','Waarnemen'],['预测','Voorspellen'],['评估','Evalueren'],['决定','Beslissen'],['执行','Handelen']].map((t,i)=>{const x=52+i*94;return `<g filter="url(#sh)"><circle cx="${x}" cy="78" r="33" fill="#eef4fd" stroke="${BLUE}" stroke-width="2"/></g><text x="${x}" y="74" text-anchor="middle" class="zhlbl">${t[0]}</text><text x="${x}" y="90" text-anchor="middle" class="nllbl">${t[1]}</text>${i<4?`<line x1="${x+35}" y1="78" x2="${x+58}" y2="78" stroke="${BLUE}" stroke-width="2.4" marker-end="url(#a)"/>`:''}`;}).join('')}
<path d="M420 108 q46 52 -188 74 q-232 22 -186 -70" fill="none" stroke="${BLUE}" stroke-width="2.2" stroke-dasharray="6 7" marker-end="url(#a)"/>
${cap(240,196,'不断循环 · doorlopende cyclus')}`);

// ---- M1 ----
F['1']=svg('320 190','车外检查', `${roadH(0,118,320,46)}${carTop(160,96,1)}
${[['左灯',86,56],['轮胎',58,120],['车底',160,150],['油液',262,120],['右灯',234,56]].map(a=>`<path d="M${a[1]} ${a[2]} L160 96" stroke="${SOFT}" stroke-width="1.5" stroke-dasharray="3 4"/><g filter="url(#sh)"><circle cx="${a[1]}" cy="${a[2]}" r="16" fill="#fff"/></g><circle cx="${a[1]}" cy="${a[2]}" r="16" fill="#eef4fd"/><text x="${a[1]}" y="${a[2]+4}" text-anchor="middle" class="mini">${a[0]}</text>`).join('')}
${cap(160,184,'出发前绕车检查一圈 · rondje om de auto')}`);
F['2']=svg('320 170','车内检查', `<g filter="url(#sh)"><rect x="40" y="34" width="240" height="74" rx="16" fill="#2a3446"/></g>
<rect x="40" y="34" width="240" height="16" rx="8" fill="#ffffff" opacity=".06"/>
<rect x="56" y="52" width="150" height="34" rx="8" fill="#161e2c"/><path d="M64 70h58" stroke="#7fd1ff" stroke-width="3" stroke-linecap="round"/>
${[['#ff6b6b',226],['#ffb020',248],['#3ec98a',270]].map(c=>`<circle cx="${c[1]}" cy="60" r="7.5" fill="${c[0]}"/>`).join('')}
${['#ffb020','#3ec98a'].map((c,i)=>`<circle cx="${226+i*22}" cy="82" r="7.5" fill="${c}"/>`).join('')}
${cap(160,140,'启动后警示灯应熄灭 · lampjes moeten doven')}`);
F['3']=svg('320 190','上车', `${roadH(0,118,320,48)}${carTop(182,100,1)}${person(96,116,1.5)}
<path d="M110 118 q28 -10 48 -14" fill="none" stroke="${BLUE}" stroke-width="2.4" marker-end="url(#a)"/>
${cap(160,184,'逆行方向绕到车门 · tegen het verkeer in')}`);
F['4']=svg('320 182','下车', `${roadH(0,120,320,48)}${carSide(150,98,1.25)}
<path d="M150 72 q34 -26 62 -8" fill="none" stroke="${BLUE}" stroke-width="2.4" marker-end="url(#a)"/><text x="214" y="54" class="mini">肩后 schouderblik</text>
${cap(160,172,'先看后视镜和肩后再开门')}`);
F['5']=svg('240 190','坐姿', `<path d="M62 152 V80 q0 -12 12 -12 h10" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
<circle cx="104" cy="54" r="12" fill="${BLUE}"/><path d="M104 66 l40 30" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
<circle cx="152" cy="100" r="15" fill="none" stroke="${BLUE}" stroke-width="4"/><path d="M62 152h84" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
${cap(122,182,'手能搭到方向盘、腿略弯 · goede zithouding')}`);
F['6']=svg('220 200','握姿', `<circle cx="110" cy="98" r="66" fill="none" stroke="${BLUE}" stroke-width="13"/><circle cx="110" cy="98" r="22" fill="#eef4fd" stroke="${BLUE}" stroke-width="2"/>
<g filter="url(#sh)"><rect x="33" y="84" width="23" height="30" rx="10" fill="#f0c19a"/><rect x="164" y="84" width="23" height="30" rx="10" fill="#f0c19a"/></g>
${cap(110,186,'“差一刻到三点” · handen op 9 en 3')}`);
F['11']=F['6'];
F['8']=svg('300 160','启动', `<g filter="url(#sh)"><circle cx="66" cy="74" r="30" fill="#eef4fd" stroke="${BLUE}" stroke-width="2"/></g><path d="M66 58v16M66 74l11 7" stroke="${BLUE}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
${['踩离合','点火','松钥匙'].map((t,i)=>`${i<3?`<g filter="url(#sh)"><rect x="${118+i*58}" y="58" width="52" height="34" rx="10" fill="#fff"/></g><rect x="${118+i*58}" y="58" width="52" height="34" rx="10" fill="#eef4fd"/>`:''}<text x="${144+i*58}" y="80" text-anchor="middle" class="mini">${t}</text>${i<2?`<path d="M${170+i*58} 75 h12" stroke="${BLUE}" stroke-width="2.4" marker-end="url(#a)"/>`:''}`).join('')}
${cap(150,140,'按顺序起步 · vaste startvolgorde')}`);
F['9']=svg('280 160','加油门', `<path d="M40 126 H238" stroke="${SOFT}" stroke-width="2"/><path d="M40 126 Q150 46 234 68" fill="none" stroke="${BLUE}" stroke-width="4" marker-end="url(#a)"/>
${cap(140,148,'平顺加速 · vlot en gedoseerd gas')}`);
F['10']=svg('320 182','观察 gezichtsveld', `<path d="M160 152 L26 36 A176 176 0 0 1 294 36 Z" fill="#e6eefb"/>
<path d="M160 152 L116 28 A128 128 0 0 1 204 28 Z" fill="#c4d8f6"/><path d="M160 152 L151 24 A64 64 0 0 1 169 24 Z" fill="${BLUE}" opacity=".7"/>
<circle cx="160" cy="152" r="7" fill="${INK}"/><text x="160" y="44" text-anchor="middle" class="mini">清晰 3°</text><text x="272" y="56" class="mini">余光 ~180°</text>
${cap(160,174,'转动头和眼睛去扫视 · blik niet fixeren')}`);
F['12']=svg('240 176','车道位置', `${roadV(84,8,72,160)}<line x1="120" y1="14" x2="120" y2="162" stroke="#e2b45c" stroke-width="2.5" stroke-dasharray="10 10"/>${carTop(120,90,1)}
${cap(120,166,'居中行驶 · midden van de rijstrook')}`);
F['13']=svg('300 160','刹车', `${roadH(0,96,300,46)}${carSide(84,75,1.1)}<path d="M154 96 H238" stroke="${BLUE}" stroke-width="2.4" stroke-dasharray="9 7" marker-end="url(#a)"/>
${cap(150,148,'有分寸，快停时略松 · zonder duiken')}`);
F['14']=svg('240 160','踩离合', `<g filter="url(#sh)"><rect x="72" y="34" width="28" height="66" rx="9" fill="${BLUE}"/><rect x="116" y="46" width="24" height="54" rx="9" fill="#eef4fd" stroke="${BLUE}" stroke-width="2"/></g>
<text x="86" y="120" text-anchor="middle" class="mini">离合</text><text x="128" y="120" text-anchor="middle" class="mini">刹车</text>${cap(120,146,'左脚踩到底 · geheel intrappen')}`);
F['15']=svg('320 150','停车', `${roadH(0,52,320,44)}${['车流中','车流外','紧急'].map((t,i)=>`${carTop(58+i*104,74,0.62,['blue','blue','red'][i])}<text x="${58+i*104}" y="128" text-anchor="middle" class="mini">${t}</text>`).join('')}`);
F['16']=svg('260 160','接合离合', `<path d="M34 124 H226" stroke="${SOFT}" stroke-width="2"/><path d="M34 124 C96 124 108 60 158 60 L226 60" fill="none" stroke="${BLUE}" stroke-width="4"/>
<circle cx="108" cy="94" r="6" fill="${INK}"/><text x="108" y="82" text-anchor="middle" class="mini">结合点</text>${cap(130,148,'抬到结合点稳住 · aangrijpingspunt')}`);
F['17']=svg('280 190','换挡图', `<path d="M70 48V158M150 48V158M210 48V158M70 103H210" stroke="${BLUE}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
<g class="zhlbl" text-anchor="middle"><text x="70" y="42">1</text><text x="70" y="176">2</text><text x="150" y="42">3</text><text x="150" y="176">4</text><text x="210" y="42">5</text><text x="210" y="176">R</text></g>
${cap(140,190,'典型 5 挡 + 倒挡 · schakelpatroon')}`);
F['18']=svg('300 140','技术起步', `${['离合','挡位','油门','转向'].map((t,i)=>`<g filter="url(#sh)"><rect x="${18+i*72}" y="42" width="54" height="36" rx="11" fill="#fff"/></g><rect x="${18+i*72}" y="42" width="54" height="36" rx="11" fill="#eef4fd"/><text x="${45+i*72}" y="65" text-anchor="middle" class="mini">${t}</text>${i<3?`<path d="M${72+i*72} 60 h14" stroke="${BLUE}" stroke-width="2.4" marker-end="url(#a)"/>`:''}`).join('')}${cap(150,112,'配合成一个连贯动作')}`);

// ---- M2 ----
F['19']=svg('300 160','起步', `${roadH(0,104,300,48)}${carTop(70,82,0.7)}<path d="M92 74 q34 -22 70 -20" fill="none" stroke="${BLUE}" stroke-width="2.4" marker-end="url(#a)"/>
${cap(150,150,'镜子+肩后确认再起步 · spiegels + schouder')}`);
F['20']=svg('420 150','两秒规则', `${roadH(0,58,420,46)}${carTop(360,81,0.62,'blue')}${carTop(70,81,0.62,'gray')}
<path d="M100 81 H322" stroke="${BLUE}" stroke-width="2.4" stroke-dasharray="9 8" marker-end="url(#a)"/><text x="211" y="52" text-anchor="middle" class="zhlbl">≥ 2 秒</text>
${cap(210,140,'保持至少两秒跟车距离 · 2-secondenregel')}`);
F['21']=svg('240 178','安全空间', `${roadV(70,8,100,162)}<ellipse cx="120" cy="90" rx="86" ry="68" fill="${BLUE}" opacity=".10"/>${carTop(120,90,1)}
${[['前',120,30],['后',120,152],['左',36,94],['右',204,94]].map(a=>`<text x="${a[1]}" y="${a[2]}" text-anchor="middle" class="mini">${a[0]}</text>`).join('')}`);
F['22']=svg('320 152','会车', `${roadH(0,54,320,46)}${carTop(66,66,0.6,'blue')}${carTop(254,90,0.6,'gray')}
<path d="M92 62 h44" stroke="${BLUE}" stroke-width="2.2" marker-end="url(#a)"/><path d="M228 94 h-44" stroke="#e5730a" stroke-width="2.2" marker-end="url(#ao)"/>${cap(160,140,'双方向右避让 · beiden uitwijken')}`);
F['23']=svg('340 150','被超车', `${roadH(0,60,340,54)}${carTop(80,88,0.6,'gray')}${carTop(190,64,0.6,'blue')}
<path d="M214 64 q-30 -14 -66 -8" fill="none" stroke="${BLUE}" stroke-width="2.2" marker-end="url(#a)"/>${cap(170,140,'保持稳定，不加速 · niet versnellen')}`);
// ---- rijker scenebeeld: kruispunt ----
F['24']=svg('340 260','路口场景 · kruispunt', `
<rect x="0" y="0" width="340" height="260" fill="#f3f7ee"/>
${[[66,56],[274,56],[66,204],[274,204]].map(c=>`<g filter="url(#sh)"><rect x="${c[0]-58}" y="${c[1]-52}" width="116" height="104" rx="14" fill="#e9f2e2"/></g>`).join('')}
${treeTop(40,40,15)}${treeTop(300,40,15)}${treeTop(40,220,15)}${treeTop(300,220,15)}
<rect x="130" y="0" width="80" height="260" fill="#e8edf3"/>
<rect x="0" y="112" width="340" height="76" fill="#e8edf3"/>
<line x1="170" y1="6" x2="170" y2="104" stroke="#fff" stroke-width="3" stroke-dasharray="15 13"/>
<line x1="170" y1="196" x2="170" y2="254" stroke="#fff" stroke-width="3" stroke-dasharray="15 13"/>
<line x1="8" y1="150" x2="122" y2="150" stroke="#fff" stroke-width="3" stroke-dasharray="15 13"/>
<line x1="218" y1="150" x2="332" y2="150" stroke="#fff" stroke-width="3" stroke-dasharray="15 13"/>
${[0,1,2,3].map(i=>`<rect x="${150+i*11}" y="196" width="6" height="20" fill="#fff"/>`).join('')}
<rect x="132" y="192" width="76" height="4" fill="#fff"/>
${carTop(150,232,0.72,'blue')}
<g transform="rotate(90 66 150)">${carTop(66,150,0.66,'gray')}</g>
${cyclistTop(300,150,1)}
<path d="M150 208 C132 168 96 160 40 150" fill="none" stroke="${BLUE}" stroke-width="2.6" marker-end="url(#a)"/>
<path d="M150 208 C168 168 236 160 300 150" fill="none" stroke="${BLUE}" stroke-width="2.6" marker-end="url(#a)"/>
<text x="30" y="140" text-anchor="middle" class="zhlbl">左</text><text x="312" y="140" text-anchor="middle" class="zhlbl">右</text>
${cap(170,250,'看的顺序：前 → 左 → 前 → 右')}`);
F['25']=svg('240 210','转弯', `${roadV(96,0,64,210)}${roadH(0,92,240,54)}${carTop(128,180,0.62)}
<path d="M128 156 V128 Q128 118 138 118 H214" fill="none" stroke="${BLUE}" stroke-width="3" marker-end="url(#a)"/>${cap(120,204,'先打灯、并道、让行')}`);
F['26']=svg('300 170','坡道起步', `<path d="M14 150 L188 60 L300 60 L300 150 Z" fill="#e8edf3"/><path d="M14 150 L188 60" stroke="${SOFT}" stroke-width="3"/>${carSide(152,68,1.05)}
<path d="M152 94 v18" stroke="#e5484d" stroke-width="2.6" marker-end="url(#ao)"/><text x="120" y="118" class="warnlbl">别后溜</text>${cap(150,162,'手刹配合起步 · handrem gebruiken')}`);
F['27a']=svg('280 150','直线倒车', `${roadH(0,86,280,48)}${carTop(190,84,0.62)}<path d="M172 100 H58" stroke="${BLUE}" stroke-width="2.4" stroke-dasharray="9 7" marker-end="url(#a)"/>${cap(140,138,'回正方向，慢速')}`);
F['27b']=svg('240 170','弯道倒车', `${roadH(0,96,240,48)}<path d="M60 118 H150 Q112 118 96 54" fill="none" stroke="${BLUE}" stroke-width="3" stroke-dasharray="9 7" marker-end="url(#a)"/>${carTop(150,110,0.55)}${cap(120,158,'注意车头外摆 · neusuitzwaai')}`);
F['28']=svg('320 162','停车入位', `${roadH(0,40,320,42)}<g filter="url(#sh)"><rect x="150" y="86" width="66" height="54" rx="8" fill="#fff"/></g><rect x="150" y="86" width="66" height="54" rx="8" fill="none" stroke="${BLUE}" stroke-width="2" stroke-dasharray="7 5"/>
${carTop(96,60,0.55)}<path d="M110 72 Q182 72 192 108 T184 132" fill="none" stroke="${BLUE}" stroke-width="2.4" marker-end="url(#a)"/>${cap(160,154,'分阶段倒入 · in fasen')}`);
F['29a']=svg('240 170','半圈掉头', `${roadH(0,118,240,48)}<path d="M64 132 V80 A52 52 0 0 1 168 80 V132" fill="none" stroke="${BLUE}" stroke-width="3.2" marker-end="url(#a)"/>${cap(120,158,'一次完成 · halve draai')}`);
F['29b']=svg('260 170','挪动掉头', `${roadH(0,118,260,48)}<path d="M50 130 H160" stroke="${BLUE}" stroke-width="2.6" marker-end="url(#a)"/><path d="M210 96 H100" stroke="#e5730a" stroke-width="2.6" stroke-dasharray="7 5" marker-end="url(#ao)"/><path d="M70 64 H180" stroke="${BLUE}" stroke-width="2.6" marker-end="url(#a)"/>${cap(130,158,'前-后-前 · steken')}`);

// ---- M3 ----
F['30']=svg('240 182','变道', `${roadV(60,8,120,166)}<line x1="120" y1="14" x2="120" y2="168" stroke="${SOFT}" stroke-width="3" stroke-dasharray="13 11"/>${carTop(92,122,0.62)}
<path d="M102 108 Q102 74 140 64" fill="none" stroke="${BLUE}" stroke-width="2.4" marker-end="url(#a)"/><g filter="url(#sh)"><rect x="130" y="118" width="24" height="36" rx="6" fill="#ffe4e4"/></g><rect x="130" y="118" width="24" height="36" rx="6" fill="none" stroke="#e5726b" stroke-width="1.6"/><text x="142" y="140" text-anchor="middle" class="warnlbl">盲区</text>`);
F['31']=svg('320 150','绕行', `${roadH(0,88,320,52)}<g filter="url(#sh)"><rect x="150" y="70" width="46" height="42" rx="7" fill="#cfd8e2"/></g>${carTop(60,96,0.55)}
<path d="M78 84 Q120 44 202 58" fill="none" stroke="${BLUE}" stroke-width="2.4" marker-end="url(#a)"/>${cap(160,136,'绕过静止障碍 · voorbijgaan')}`);
F['32']=svg('340 142','超车', `${roadH(0,66,340,56)}${carTop(50,94,0.55,'blue')}${carTop(170,94,0.55,'gray')}<path d="M76 86 Q140 42 236 52 T286 84" fill="none" stroke="${BLUE}" stroke-width="2.4" marker-end="url(#a)"/>${cap(170,134,'完全占左道，不右超')}`);
F['33']=svg('320 150','汇入', `${roadH(0,42,320,46)}<path d="M20 118 Q150 118 212 74 L300 70" fill="none" stroke="#e8edf3" stroke-width="28" stroke-linecap="round"/>${carTop(66,104,0.55)}
<path d="M84 96 Q152 90 218 66" fill="none" stroke="${BLUE}" stroke-width="2.4" marker-end="url(#a)"/>${cap(160,140,'加速匹配车流 · invoegen')}`);
F['34']=svg('320 150','驶出', `${roadH(0,42,320,46)}<path d="M120 78 Q192 84 212 122 L300 126" fill="none" stroke="#e8edf3" stroke-width="28" stroke-linecap="round"/>${carTop(66,58,0.55)}
<path d="M84 66 Q172 74 238 116" fill="none" stroke="${BLUE}" stroke-width="2.4" marker-end="url(#a)"/>${cap(160,140,'到减速道再减速 · uitvoegen')}`);
F['35']=svg('260 234','环岛车道选择', `${roadV(112,0,40,234)}${roadH(0,112,260,40)}
<circle cx="130" cy="122" r="60" fill="#e8edf3"/><circle cx="130" cy="122" r="60" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="10 9"/><circle cx="130" cy="122" r="26" fill="#e9f2e2" stroke="#8bb27c" stroke-width="2"/>
<path d="M130 226 V156" stroke="${BLUE}" stroke-width="3.4" marker-end="url(#a)"/>
<text x="130" y="22" text-anchor="middle" class="mini">½ → 中</text><text x="236" y="120" text-anchor="middle" class="mini">¼→右</text><text x="24" y="120" text-anchor="middle" class="mini">¾→左</text>${cap(130,228,'先选对车道 · rijstrookkeuze')}`);
F['36']=svg('280 162','生活区', `${roadH(0,96,280,48)}${sign(60,58,26,'#fff',BLUE,'15')}${person(150,96,1.25)}${person(180,98,1.05)}
${cap(150,150,'限速15，行人优先 · erf')}`);
F['37']=svg('300 172','铁路道口', `${roadH(0,110,300,48)}<path d="M120 40 L156 76 M156 40 L120 76" stroke="#e5484d" stroke-width="6.5" stroke-linecap="round"/>
<rect x="60" y="96" width="180" height="6" rx="3" fill="${BLUE}"/><rect x="150" y="70" width="6" height="30" rx="3" fill="#e5730a"/>${cap(150,158,'绝不停在道口上 · nooit op de overweg')}`);
F['38']=svg('300 162','人行横道', `${roadH(0,30,300,112)}${[0,1,2,3,4,5].map(i=>`<rect x="${44+i*40}" y="42" width="22" height="88" rx="3" fill="#fff"/>`).join('')}${person(150,20,1.15)}<path d="M150 40 V120" stroke="${BLUE}" stroke-width="2.4" stroke-dasharray="7 6" marker-end="url(#a)"/>${cap(150,154,'让行人先行 · voetgangers voor')}`);
F['39']=svg('300 162','公交站', `${roadH(0,96,300,48)}<g filter="url(#sh)"><rect x="30" y="44" width="96" height="52" rx="10" fill="#b6c2d1"/></g><path d="M30 74h96" stroke="#93a1b3"/><rect x="40" y="53" width="76" height="15" rx="4" fill="#dceafb"/>
${person(170,96,1.2)}<path d="M188 90 h44" stroke="${BLUE}" stroke-width="2.4" stroke-dasharray="7 5" marker-end="url(#a)"/>${cap(160,150,'减速、留侧距 · voorzichtig')}`);

// ---- M4 ----
F['40']=svg('320 152','困难条件', `${[['夜间','#33406b','moon'],['雨','#4a7196','rain'],['雾','#8592a4','fog']].map((d,i)=>`<g filter="url(#sh)"><circle cx="${70+i*90}" cy="60" r="30" fill="${d[1]}"/></g>${d[2]==='moon'?`<path d="M${78+i*90} 50 a12 12 0 1 0 6 18 9 9 0 0 1 -6 -18z" fill="#ffe7a0"/>`:''}${d[2]==='rain'?`${[0,1,2].map(k=>`<path d="M${60+i*90+k*10} 68 l-3 8" stroke="#cfe0ff" stroke-width="2.5" stroke-linecap="round"/>`).join('')}`:''}<text x="${70+i*90}" y="64" text-anchor="middle" class="whitetag">${d[0]}</text>`).join('')}${cap(160,130,'降速、开灯 · aangepast rijden')}`);
F['41']=svg('260 150','行前准备', `<circle cx="52" cy="112" r="9" fill="${BLUE}"/><circle cx="204" cy="42" r="9" fill="#e5484d"/><path d="M60 110 H120 a12 12 0 0 0 0 -24 H92 a12 12 0 0 1 0 -24 H196" fill="none" stroke="${BLUE}" stroke-width="3" stroke-dasharray="1 8" stroke-linecap="round" marker-end="url(#a)"/>${cap(130,138,'规划路线、用导航 · route plannen')}`);
F['42']=svg('280 150','特殊训练', `${roadH(0,96,280,46)}${[80,140,200].map(x=>`<g filter="url(#sh)"><path d="M${x} 72 l-13 32 h26 z" fill="#ff9a3d"/></g><path d="M${x} 80 v16" stroke="#fff" stroke-width="2"/>`).join('')}${cap(140,136,'封闭场地练习 · oefenterrein')}`);
F['43']=svg('280 160','节能', `<path d="M34 118 Q100 46 150 46" fill="none" stroke="${BLUE}" stroke-width="4" marker-end="url(#a)"/>
<path d="M168 96 C168 62 196 46 228 46 C228 74 210 98 176 98Z" fill="#e6f4ea" stroke="#5aa06d" stroke-width="2"/>${cap(140,146,'早升挡、匀速 · zuinig (HNR)')}`);
F['44']=svg('260 160','防御驾驶', `<g filter="url(#sh)"><path d="M130 22 l64 22 v36 c0 36-32 48-64 58-32-10-64-22-64-58V44z" fill="#eef4fd" stroke="${BLUE}" stroke-width="2.4"/></g><path d="M106 86l16 16 30-32" fill="none" stroke="${BLUE}" stroke-width="4.5" stroke-linecap="round"/>${cap(130,150,'预判并留余地 · anticiperen')}`);
F['45']=svg('260 150','适应车速', `<path d="M42 116 A74 74 0 0 1 218 116" fill="none" stroke="#e8edf3" stroke-width="13" stroke-linecap="round"/><path d="M42 116 A74 74 0 0 1 150 47" fill="none" stroke="${BLUE}" stroke-width="13" stroke-linecap="round"/><path d="M130 116 L182 66" stroke="#e5484d" stroke-width="4.5" stroke-linecap="round"/><circle cx="130" cy="116" r="7" fill="${INK}"/>${cap(130,142,'与情境相称 · aangepast')}`);
F['46']=svg('260 160','心态责任', `<g filter="url(#sh)"><path d="M130 128 S64 92 64 56 A28 28 0 0 1 130 44 A28 28 0 0 1 196 56 C196 92 130 128 130 128Z" fill="#ffe4e8" stroke="#e5726b" stroke-width="2.4"/></g>${cap(130,150,'冷静、礼让、清醒 · sociaal en nuchter')}`);

// ---- slot ----
F['examen']=svg('260 150','路考', `<g filter="url(#sh)"><path d="M74 128V34h92l-16 18 16 18H94v58" fill="none" stroke="${BLUE}" stroke-width="4.5" stroke-linecap="round"/></g>${cap(130,140,'CBR 路考 · praktijkexamen')}`);
F['adas']=svg('260 160','ADAS', `${carTop(130,98,0.7)}<path d="M130 62 A62 62 0 0 1 192 98" fill="none" stroke="${BLUE}" stroke-opacity=".45" stroke-width="3"/><path d="M130 46 A78 78 0 0 1 208 98" fill="none" stroke="${BLUE}" stroke-opacity=".28" stroke-width="3"/>${cap(130,150,'辅助系统 · rijhulpsystemen')}`);
F['oefening']=svg('260 140','练习', `${[46,74,102].map(y=>`<g filter="url(#sh)"><circle cx="44" cy="${y}" r="9" fill="#eef4fd" stroke="${BLUE}" stroke-width="2"/></g><path d="M60 ${y} h150" stroke="${SOFT}" stroke-width="4" stroke-linecap="round"/><path d="M40 ${y}l4 4 8-9" fill="none" stroke="${BLUE}" stroke-width="2.6"/>`).join('')}${cap(130,132,'巩固练习 · controleoefeningen')}`);

function figFor(step, zh){
  if(step && F[step]) return F[step];
  if(/学习方法|leermodel/i.test(zh)) return F['leermodel'];
  if(/路考|examen/i.test(zh)) return F['examen'];
  if(/辅助|ADAS/i.test(zh)) return F['adas'];
  if(/巩固|练习|oefening/i.test(zh)) return F['oefening'];
  return '';
}

module.exports = { iconFor, moduleIcon, figFor, moduleBanner };
