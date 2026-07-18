#!/usr/bin/env node
/* Dandan's rijlessen: zero-dependency static site generator.
   Reads content/*.md (original bilingual lesson material) and writes to dist/. */
const fs = require('fs');
const path = require('path');
const G = require('./graphics.js');

const ROOT = __dirname;
const CONTENT = path.join(ROOT, 'content');  // per lestaal: content/zh/*.md, later content/<taal>/*.md
const DIST = path.join(ROOT, 'dist');
const ASSETS_SRC = path.join(ROOT, 'assets');
const IMG = path.join(ROOT, 'img');
const PHOTO_EXT = ['png','jpg','jpeg','webp'];
// Theorie blijft voor regels en afstanden gebruikmaken van diagrammen. Op de
// didactische kernparagraaf staat daarnaast een herkenbare praktijksituatie.
// Zo wordt een foto geen versiering, maar een concrete ankerplek voor de uitleg.
const THEORY_PHOTOS = {
  'theorie-1': { sec3: 'module-2_s25.webp' },
  'theorie-2': { sec2: 'module-2_s24.webp' },
  'theorie-4': { sec2: 'theorie-4_sec2.webp' },
  'theorie-5': { sec2: 'module-2_s20.webp' },
  'theorie-6': { sec2: 'module-3_s32.webp' },
  'theorie-7': { sec4: 'module-1_s4.webp' },
  'theorie-8': { sec2: 'module-2_s25.webp' },
  'theorie-9': { sec5: 'module-1_s10.webp' },
  'theorie-10': { sec4: 'module-5_adas.webp' },
  'theorie-11': { sec2: 'module-4_s40.webp' },
};

// Aanvullende foto's bij concrete situaties in de tekst. Anders dan de
// primaire praktijkfoto's vervangen deze beelden een bestaand diagram niet:
// waar een schema didactisch nuttig is, worden schema en praktijksituatie
// allebei getoond. `id#n` onderscheidt herhaalde ids, zoals de drie
// examenonderdelen op de AM-, motor- en aanhangerpagina.
const SECTION_PHOTOS = {
  'am-1': {
    sec1: ['am-1_voertuigtypen.webp'],
    'examen#2': ['am-1_praktijk.webp'],
  },
  'aanhanger-1': {
    'examen#1': ['aanhanger-1_exam.webp'],
    sec4: ['aanhanger-1_koppeling.webp'],
  },
  'info-1': {
    sec4: ['info-1_gezondheidsverklaring.webp'],
    sec5: ['info-1_theorie-examen-tolk.webp'],
    sec7: ['info-1_rijschool.webp'],
  },
  'motor-1': {
    sec1: ['motor-1_categorieen.webp'],
    'examen#2': ['motor-1_avd-examen.webp'],
    sec5: ['motor-1_avb.webp'],
    sec6: ['motor-1_beschermende-kleding.webp'],
  },
  'theorie-1': {
    sec4: ['theorie-1_fietser-naast-auto.webp'],
    sec7: ['module-2_s19.webp'],
    sec8: ['theorie-10_schade-afhandelen.webp'],
    sec9: ['module-4_s46.webp'],
    sec12: ['module-5_oefening.webp'],
  },
  'theorie-2': {
    sec3: ['theorie-2_afslaan-v2.webp'],
    sec4: ['theorie-2_hulpdienst.webp'],
    sec5: ['theorie-2_uitrit.webp'],
  },
  'theorie-3': {
    sec1: ['theorie-3_bordcategorieen.webp'],
    sec5: ['module-3_s36.webp'],
  },
  'theorie-4': {
    sec3: ['theorie-4_spoorwegovergang.webp'],
    sec4: ['theorie-4_negenoog.webp'],
    sec5: ['theorie-4_verkeersbrigadier.webp'],
  },
  'theorie-5': {
    sec3: ['module-1_s13.webp'],
    sec4: ['module-4_s40.webp'],
    sec5: ['module-3_s33.webp'],
  },
  'theorie-6': {
    sec1: ['theorie-6_fietser-inhalen.webp'],
    sec3: ['module-2_s23.webp'],
    sec4: ['module-3_s35.webp'],
    sec5: ['module-3_s33.webp'],
  },
  'theorie-7': {
    sec1: ['module-1_s15.webp'],
    sec2: ['theorie-7_parkeerverbod.webp'],
    sec3: ['theorie-7_parkeerschijf.webp'],
    sec5: ['theorie-7_pech.webp'],
  },
  'theorie-8': {
    sec1: ['module-3_s38.webp'],
    sec3: ['motor-1_avd-examen.webp'],
    sec4: ['theorie-8_scootmobiel.webp'],
    sec5: ['theorie-8_vrachtwagen-dode-hoek.webp'],
  },
  'theorie-9': {
    sec1: ['theorie-9_alcohol-keuze.webp'],
    sec2: ['theorie-9_medicijnen.webp'],
    sec3: ['theorie-9_vermoeidheid.webp'],
    sec4: ['theorie-9_telefoon-opbergen.webp'],
  },
  'theorie-10': {
    sec1: ['module-1_s1.webp'],
    sec2: ['theorie-10_lading-zekeren.webp'],
    sec3: ['module-4_s43.webp'],
    adas: ['module-5_adas.webp'],
    sec5: ['theorie-10_schade-afhandelen.webp'],
  },
  'theorie-11': {
    'examen#1': ['module-5_examen.webp'],
    sec3: ['theorie-11_verborgen-kind.webp'],
    sec4: ['module-5_oefening.webp'],
  },
};

function findSectionPhotos(m, s, occurrence=1){
  const map = SECTION_PHOTOS[m.slug];
  if(!map) return [];
  const files = map[`${s.id}#${occurrence}`] || map[s.id] || [];
  return files
    .filter(file=>fs.existsSync(path.join(IMG,file)))
    .map(file=>'img/'+file);
}

function mapWithOccurrences(scripts, fn){
  const seen = {};
  return scripts.map(s=>{
    const occurrence = seen[s.id] = (seen[s.id] || 0) + 1;
    return fn(s, occurrence);
  });
}
function photoSuffix(s){
  if(s.step) return 's'+s.step;
  const k = (s.zh||'') + ' ' + (s.nl||'');
  if(/学习方法|leermodel/i.test(k)) return 'leermodel';
  if(/路考|rijexamen|examen/i.test(k)) return 'examen';
  if(/辅助|ADAS/i.test(k)) return 'adas';
  if(/巩固|练习|oefening/i.test(k)) return 'oefening';
  return null;
}
function findPhoto(m,s){
  const theoryPhoto = THEORY_PHOTOS[m.slug]?.[s.id];
  if(theoryPhoto && fs.existsSync(path.join(IMG,theoryPhoto))) return 'img/'+theoryPhoto;
  const suf = photoSuffix(s); if(!suf) return null;
  for(const e of PHOTO_EXT){ const f=`${m.slug}_${suf}.${e}`; if(fs.existsSync(path.join(IMG,f))) return 'img/'+f; }
  return null;
}

// Afmetingen van png/jpg/webp lezen (zero-dependency) zodat <img> width/height
// krijgt en de pagina niet verspringt tijdens het laden (CLS).
const IMG_DIM_CACHE = {};
function imgSize(rel){
  if(rel in IMG_DIM_CACHE) return IMG_DIM_CACHE[rel];
  let dim = null;
  try{
    const b = fs.readFileSync(path.join(ROOT, rel));
    if(b.length>24 && b.toString('ascii',0,4)==='RIFF' && b.toString('ascii',8,12)==='WEBP'){
      const fmt = b.toString('ascii',12,16);
      if(fmt==='VP8X'){ dim = { w: 1+(b[24]|b[25]<<8|b[26]<<16), h: 1+(b[27]|b[28]<<8|b[29]<<16) }; }
      else if(fmt==='VP8 '){ dim = { w: b.readUInt16LE(26)&0x3fff, h: b.readUInt16LE(28)&0x3fff }; }
      else if(fmt==='VP8L'){ const n=b.readUInt32LE(21); dim = { w: 1+(n&0x3fff), h: 1+((n>>14)&0x3fff) }; }
    } else if(b.length>24 && b.readUInt32BE(0)===0x89504e47){
      dim = { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    } else if(b.length>4 && b[0]===0xff && b[1]===0xd8){
      let o=2;
      while(o<b.length-9){
        if(b[o]!==0xff){ o++; continue; }
        const m=b[o+1];
        if(m>=0xc0 && m<=0xcf && m!==0xc4 && m!==0xc8 && m!==0xcc){ dim = { w: b.readUInt16BE(o+7), h: b.readUInt16BE(o+5) }; break; }
        o += 2 + b.readUInt16BE(o+2);
      }
    }
  }catch(e){ /* geen afmetingen = attribuut weglaten */ }
  IMG_DIM_CACHE[rel] = dim;
  return dim;
}
function asciiSectionId(k, n){
  if(/学习方法|leermodel/i.test(k)) return 'leermodel';
  if(/路考|rijexamen|examen/i.test(k)) return 'examen';
  if(/辅助|ADAS/i.test(k)) return 'adas';
  if(/巩固|练习|oefening/i.test(k)) return 'oefening';
  return 'sec'+n;
}

const STAPWOORD = { zh:'步骤', nl:'Stap', en:'Step', tr:'Adım', ar:'الخطوة', pl:'Krok', uk:'Крок', ru:'Шаг', es:'Paso', pt:'Passo', hi:'चरण', vi:'Bước' };
// Vaste labels voor de verrijking per stap (veelgemaakte fouten + examentip).
// Vertalers gebruiken EXACT deze labels (zie docs/VERTAALPROCEDURE.md); de
// build herkent er de gekleurde chips aan (p-fout / p-tip).
const LABEL_FOUT = { zh:'常见错误', nl:'Veelgemaakte fouten', en:'Common mistakes', tr:'Sık yapılan hatalar', ar:'أخطاء شائعة', pl:'Częste błędy', uk:'Поширені помилки', ru:'Частые ошибки', es:'Errores frecuentes', pt:'Erros frequentes', hi:'आम गलतियाँ', vi:'Lỗi thường gặp' };
const LABEL_TIP  = { zh:'考试要点', nl:'Examentip', en:'Exam tip', tr:'Sınav ipucu', ar:'نصيحة الامتحان', pl:'Wskazówka egzaminacyjna', uk:'Порада до іспиту', ru:'Совет к экзамену', es:'Consejo para el examen', pt:'Dica de exame', hi:'परीक्षा सुझाव', vi:'Mẹo thi' };
const RE_FOUT = new RegExp('^<strong>(?:'+Object.values(LABEL_FOUT).join('|')+')');
const RE_TIP  = new RegExp('^<strong>(?:'+Object.values(LABEL_TIP).join('|')+'|考官关注)');
const SITE = {
  titleNl: "Dandan's rijlessen",
  titleZh: "丹丹的驾驶课",
  tagNl: "De Nederlandse praktijkopleiding, uitgelegd voor Chinese leerlingen.",
  tagZh: "为中国学员讲解荷兰驾照路考的实操课程。",
  domain: "dandandrive.nl",
  baseUrl: "https://dandandrive.nl",
};

// ---------- boek-paginanummers (startpagina per onderdeel) ----------
const PAGE_BY_STEP = {
  '1':31,'2':37,'3':42,'4':45,'5':47,'6':50,'7':53,'8':56,'9':60,'10':62,
  '11':67,'12':71,'13':75,'14':78,'15':81,'16':85,'17':88,'18':92,
  '19':96,'20':103,'21':106,'22':111,'23':115,'24':119,'25':126,'26':134,
  '27a':137,'27b':140,'28':145,'29a':156,'29b':159,
  '30':163,'31':168,'32':172,'33':176,'34':182,'35':186,'36':190,'37':193,'38':197,'39':200,
  '40':207,'41':210,'42':212,'43':214,'44':217,'45':220,'46':222
};
// module-intro pagina's (geen script-kaart, wijzen naar bovenkant modulepagina)
const MODULE_INTRO_PAGE = { '2':95, '3':162, '4':206 };
function pageForScript(step, zh){
  if(step && PAGE_BY_STEP[step]!=null) return PAGE_BY_STEP[step];
  if(/学习方法|Het leermodel/.test(zh)) return 1;     // voorwoord/leermodel (p.1-30; taakprocessen p.5)
  if(/路考|rijexamen/i.test(zh)) return 225;
  if(/辅助|安全系统|ADAS/i.test(zh)) return 227;
  if(/巩固|练习|oefening/i.test(zh)) return 233;
  return null;
}

// ---------- tiny markdown helpers (subset) ----------
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function inline(s){
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\((https?:[^)\s]+|\/[a-zA-Z0-9_?=&/-]+)\)/g,'<a href="$2" rel="noopener">$1</a>');
  s = s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  s = s.replace(/`(.+?)`/g,'<code>$1</code>');
  return s;
}
// convert a block of body lines to html (paragraphs + lists)
function bodyToHtml(lines){
  const out=[]; let list=null; let para=[];
  const flushPara=()=>{ if(para.length){
    const html=inline(para.join(' '));
    let cls='';
    if(RE_FOUT.test(html)) cls=' class="p-fout"';
    else if(RE_TIP.test(html)) cls=' class="p-tip"';
    out.push('<p'+cls+'>'+html+'</p>'); para=[];
  } };
  const flushList=()=>{ if(list){ out.push('<ul>'+list.map(li=>'<li>'+inline(li)+'</li>').join('')+'</ul>'); list=null; } };
  for(let raw of lines){
    const line=raw.replace(/\s+$/,'');
    if(/^\s*$/.test(line)){ flushPara(); flushList(); continue; }
    if(/^[-*]\s+/.test(line)){ flushPara(); if(!list) list=[]; list.push(line.replace(/^[-*]\s+/,'')); continue; }
    if(/^>\s?/.test(line)){ flushList(); para.push(line.replace(/^>\s?/,'')); continue; }
    if(/^\*.*\*$/.test(line) && line.startsWith('*') && !line.startsWith('**')){ continue; } // skip italic footers
    flushList(); para.push(line);
  }
  flushPara(); flushList();
  return out.join('\n');
}

// ---------- parse one module markdown ----------
function splitTitle(h){ // "步骤 1 · 车外检查 (Controle buiten de auto)" or "模块一 · Module 1: X"
  let nl=''; let zh=h.trim();
  const paren = zh.match(/\(([^()]+)\)\s*$/);
  if(paren){ nl=paren[1].trim(); zh=zh.replace(/\s*\([^()]+\)\s*$/,'').trim(); }
  else if(zh.includes(' · ')){ const p=zh.split(' · '); zh=p[0].trim(); nl=p.slice(1).join(' · ').trim(); }
  return {zh,nl};
}
function parseModule(file){
  const base = path.basename(file);
  const sectie = /^Theorie/i.test(base) ? 'theorie' : /^Info/i.test(base) ? 'info'
    : /^AM\b/i.test(base) ? 'am' : /^Motor/i.test(base) ? 'motor' : /^Aanhanger/i.test(base) ? 'aanhanger' : 'praktijk';
  const fnameNum = (base.match(/(?:Module|Theorie|Info|AM|Motor|Aanhanger)\s*(\d+)/i)||[])[1] || '';
  const raw = fs.readFileSync(file,'utf8').replace(/^---[\s\S]*?---\s*/,''); // strip frontmatter
  const lines = raw.split('\n');
  let modZh='',modNl='',modNum='',intro=[]; const blocks=[];
  let cur=null; let seenH1=false;
  const pushBlock=()=>{ if(cur){ blocks.push(cur); cur=null; } };
  for(let i=0;i<lines.length;i++){
    const l=lines[i];
    if(/^#\s+/.test(l) && !seenH1){
      seenH1=true;
      const t=splitTitle(l.replace(/^#\s+/,''));
      modZh=t.zh; modNl=t.nl;
      const m=t.nl.match(/Module\s+(\d+)/i)||t.zh.match(/模块([一二三四五])/);
      modNum = t.nl.match(/Module\s+(\d+)/i) ? t.nl.match(/Module\s+(\d+)/i)[1] : String(['一','二','三','四','五'].indexOf((t.zh.match(/模块([一二三四五])/)||[])[1])+1);
      continue;
    }
    if(/^###\s+/.test(l) || /^##\s+/.test(l)){
      // heading -> new block, unless it's an empty divider like "## X · De scripts" with no body
      const t=splitTitle(l.replace(/^#{2,3}\s+/,''));
      pushBlock();
      const step=((t.zh+' '+t.nl).match(/(?:步骤|Stap)\s*(\d+[ab]?)/i)||[])[1] || (t.nl.match(/^[A-Z]\.\s/)?t.nl.trim().charAt(0):'');
      cur={zh:t.zh,nl:t.nl,step:step||'',body:[]};
      continue;
    }
    if(/^---\s*$/.test(l)) continue;
    if(cur){ cur.body.push(l); }
    else if(seenH1){ // between H1 and first heading = intro (blockquote)
      if(/^>\s?/.test(l) || (intro.length && l.trim())) intro.push(l);
    }
  }
  pushBlock();
  if(fnameNum) modNum=fnameNum; // filename is authoritative
  if(/Slotdeel/i.test(modNl) || /Slotdeel/i.test(modZh) || /结业/.test(modZh)){ if(/结业|Slotdeel/.test(modZh)===false || /结业/.test(modZh)) modZh = /结业/.test(modZh)?'结业部分':modZh; if(/结业/.test(modZh)) modNl='Slotdeel: examen · ADAS · oefeningen'; }
  // drop empty divider blocks (no body text)
  const scripts = blocks.filter(b=>b.body.join('').trim().length>0);
  const slugpre = {theorie:'theorie-',info:'info-',am:'am-',motor:'motor-',aanhanger:'aanhanger-'}[sectie] || 'module-';
  return {modZh,modNl,modNum,intro,scripts,sectie,slug:slugpre+(modNum||blocks.length)};
}

// ---------- templates ----------
// favicon: afgeronde tegel met merkverloop en het witte merk-teken 丹 (zelfde als het logo).
// Origineel, self-hosted SVG, schaalbaar en scherp; valt binnen de CSP (img-src 'self').
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#14488f"/><stop offset="1" stop-color="#1f6feb"/>
</linearGradient></defs>
<rect width="64" height="64" rx="14" fill="url(#g)"/>
<text x="32" y="35" text-anchor="middle" dominant-baseline="central" font-family="'PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="42" font-weight="700" fill="#ffffff">丹</text>
</svg>`;

function head(title, rel, opts){
  opts = opts||{};
  const desc = opts.desc || (SITE.tagZh+' '+SITE.tagNl);
  const canon = SITE.baseUrl + '/' + (opts.path!=null ? opts.path : '');
  const ogimg = SITE.baseUrl + '/og.png';
  return `<!doctype html><html lang="zh"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="icon" type="image/svg+xml" href="${rel}favicon.svg">
<link rel="apple-touch-icon" href="${rel}favicon.svg">
<meta name="theme-color" content="#14488f">
<link rel="canonical" href="${canon}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.titleNl)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canon}">
<meta property="og:image" content="${ogimg}">
<meta property="og:locale" content="zh_CN"><meta property="og:locale:alternate" content="nl_NL">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ogimg}">
<link rel="stylesheet" href="${rel}assets/style.css">
</head><body data-nl="on">
<a class="skip-link" href="#inhoud">跳到内容<span lang="nl"> / naar de inhoud</span></a>`;
}
function header(rel, modules){
  const nav = modules.map(m=>`<a href="${rel}${m.slug}.html">模块${m.modNum}</a>`).join('');
  return `<header class="site"><div class="container">
  <a class="brand" href="${rel}index.html" style="color:#fff">
    <span class="logo">丹</span>
    <span><span lang="nl">${esc(SITE.titleNl)}</span><small>${esc(SITE.titleZh)} · 驾照路考</small></span>
  </a>
  <nav>
    <a href="${rel}index.html">首页 Home</a>
    ${nav}
    <a href="${rel}boek-index.html">📖 书页</a>
    <label class="searchbox">🔍<input id="q" type="search" placeholder="搜索 / zoeken · 页码" autocomplete="off"></label>
  </nav>
  </div>
  <div id="results" class="container" style="display:none"></div>
</header>`;
}
function footer(){
  return `<footer class="site"><div class="container">
  <strong>${esc(SITE.titleNl)} · ${esc(SITE.titleZh)}</strong><br>
  <span lang="nl">Origineel lesmateriaal over de Nederlandse praktijkopleiding (RIS-methode) voor Chinese leerlingen.</span>
  原创学习材料 · ${esc(SITE.domain)}
  </div></footer>
  <script src="assets/search.js" defer></script>
  </body></html>`;
}

function renderIndex(modules){
  const cards = modules.map(m=>`
  <a class="card" href="${m.slug}.html">
    <div class="card-ico">${G.moduleIcon(m.modNum)}</div>
    <span class="mnum">${m.modNum}</span>
    <h3>${esc(m.modZh)}</h3>
    <div class="nl nl-only" lang="nl">${esc(m.modNl)}</div>
    <div class="count">${m.scripts.length} 个步骤 / onderdelen</div>
  </a>`).join('');
  return head(SITE.titleNl+' · '+SITE.titleZh,'',{path:'',desc:SITE.tagZh+' '+SITE.tagNl})
    + header('',modules)
    + `<section class="hero"><div class="container">
        <div class="pill">荷兰驾照 · rijbewijs B</div>
        <h1><span class="zh">${esc(SITE.titleZh)}</span></h1>
        <p class="hero-sub" lang="nl" style="font-size:1.3rem;color:var(--muted);font-weight:600;margin:0">${esc(SITE.titleNl)}</p>
        <p>${esc(SITE.tagZh)}</p>
        <p class="nl-only" lang="nl" style="font-size:.95rem">${esc(SITE.tagNl)}</p>
      </div></section>`
    + `<main id="inhoud"><div class="container">
        <div class="modbanner">${G.moduleBanner(0)}</div>
        <div class="note">五个模块按照"分步"方法循序渐进：从车辆操控到复杂路况，再到考试。每个步骤都有要点说明。<br>
        <span class="nl-only" lang="nl">Vijf modules, stap voor stap: van voertuigbeheersing tot het examen.</span></div>
        <div class="grid">${cards}</div>
      </div></main>`
    + footer();
}

function articleHtml(m, s, taal, occurrence=1){
    const stapw = STAPWOORD[taal] || STAPWOORD.zh;
    const zhTitle = s.zh;
    const pageBadge = s.page?`<a class="bookpage" href="boek-index.html#p${s.page}" title="Boekpagina / 书页">📖 boek p.${s.page}</a>`:'';
    // Theoriefiguren kunnen aan een specifieke paragraaf hangen; de info-
    // tijdlijn blijft beperkt tot het 185-dagen-deel in de eerste paragraaf.
    const theoFig = m.sectie==='theorie' ? G.theorieFig(m.modNum, taal, s.id) : '';
    const fig = (m.sectie==='info' && s.id==='sec1') ? G.tijdlijn185(taal) : (theoFig || G.figFor(s.step, s.zh));
    const photo = findPhoto(m, s);
    const photos = [photo, ...findSectionPhotos(m, s, occurrence)]
      .filter((value, index, list)=>value && list.indexOf(value)===index);
    const cleanTitle = zhTitle.replace(/^(?:步骤|Stap)\s*\d+[ab]?\s*[:·]?\s*/i,'');
    const photoHtml = photos.map(src=>{
      const dim = imgSize(src);
      return `<figure class="fig photo"><img src="${src}" alt="${esc(cleanTitle)}${s.nl?' · '+esc(s.nl):''}"${dim?` width="${dim.w}" height="${dim.h}"`:''} loading="lazy"></figure>`;
    }).join('');
    // Behoud de illustraties die vóór deze uitbreiding zichtbaar waren. Een
    // primair praktijkbeeld bleef die illustratie al vervangen; aanvullende
    // tekstfoto's worden er juist naast gezet.
    const figHtml = (fig && !photo ? `<figure class="fig">${fig}</figure>` : '') + photoHtml;
    return `<article class="script" id="${s.id}" data-page="${s.page||''}">
      <div class="script-top">
        <div class="script-title">
          <span class="script-icon">${G.iconFor(s.step, s.zh)}</span>
          <h2>${s.step?`<span class="step">${stapw} ${esc(s.step)}</span> · `:''}${esc(cleanTitle)}</h2>
        </div>
        ${pageBadge}
      </div>
      ${s.nl?`<div class="nl-title nl-only" lang="nl">${esc(s.nl)}</div>`:''}
      ${bodyToHtml(s.body)}
      ${figHtml}
    </article>`;
}

function renderModule(m, modules){
  const toc = m.scripts.map(s=>{
    const label = (s.step?('步骤 '+s.step+' · '):'')+ s.zh.replace(/^步骤\s*\d+[ab]?\s*·?\s*/,'');
    return `<li><a href="#${s.id}">${s.page?`<span class="tocpage">p.${s.page}</span> `:''}${esc(label)}</a></li>`;
  }).join('');
  const cards = mapWithOccurrences(m.scripts, (s, occurrence)=>articleHtml(m,s,'zh',occurrence)).join('\n');
  const introHtml = m.intro.length?`<div class="note">${bodyToHtml(m.intro)}</div>`:'';
  return head(m.modZh+' · '+SITE.titleZh,'',{path:m.slug,desc:m.modZh+' · '+m.modNl+' · '+SITE.tagZh})
    + header('',modules)
    + `<main id="inhoud"><div class="container">
        <div class="crumbs"><a href="index.html">首页</a> › 模块${m.modNum}</div>
        <div class="modbanner">${G.moduleBanner(m.modNum)}</div>
        <div class="module-head">
          <div class="kicker">模块 ${m.modNum} / Module ${m.modNum}</div>
          <h1>${esc(m.modZh)}</h1>
          <div class="nl nl-only" lang="nl" style="color:var(--muted)">${esc(m.modNl)}</div>
        </div>
        ${introHtml}
        <div class="layout">
          <aside class="toc"><ul>${toc}</ul></aside>
          <div>${cards}</div>
        </div>
      </div></main>`
    + footer();
}
function slug(s){return s.replace(/[^\w一-龥]+/g,'-').slice(0,24);}

// ---------- boek-paginamap ----------
const TOTAL_PAGES = 264;
function buildPageMap(modules){
  const pts=[];
  for(const m of modules) for(const s of m.scripts){
    if(s.page!=null) pts.push({page:s.page, url:m.slug+'.html#'+s.id, label:s.zh.replace(/^步骤\s*\d+[ab]?\s*·?\s*/,''), nl:s.nl, module:m.modNum, step:s.step});
  }
  for(const [num,pg] of Object.entries(MODULE_INTRO_PAGE)){
    const m=modules.find(x=>String(x.modNum)===num); if(m) pts.push({page:pg, url:m.slug+'.html', label:m.modZh+' · 模块导言', nl:m.modNl, module:m.modNum, step:''});
  }
  pts.sort((a,b)=>a.page-b.page);
  // ranges: elke pagina tot de volgende start
  for(let i=0;i<pts.length;i++){ pts[i].from=pts[i].page; pts[i].to=(i+1<pts.length?pts[i+1].page-1:TOTAL_PAGES); }
  return pts;
}
function renderBookIndex(pmap, modules){
  const rows = pmap.map(e=>{
    const range = e.from===e.to?('p.'+e.from):('p.'+e.from+'-'+e.to);
    return `<tr id="p${e.from}">
      <td class="pcol"><span class="pill">${range}</span></td>
      <td>${e.step?`步骤 ${esc(e.step)} · `:''}<a href="${e.url}">${esc(e.label)}</a>${e.nl?`<div class="nl nl-only" lang="nl">${esc(e.nl)}</div>`:''}</td>
      <td class="mcol">模块 ${e.module}</td>
    </tr>`;
  }).join('\n');
  return head('按书页查找 · '+SITE.titleZh,'',{path:'boek-index',desc:'按书页查找 · zoek op boekpagina · '+SITE.tagZh})
    + header('',modules)
    + `<main id="inhoud"><div class="container">
        <div class="crumbs"><a href="index.html">首页</a> › 按书页查找</div>
        <h1>按书页查找 <span class="nl-only" lang="nl" style="color:var(--muted);font-size:1rem">· Zoek op boekpagina</span></h1>
        <div class="note">在原书里翻到某一页？输入页码，直接跳到网站上对应的讲解。<br>
        <span class="nl-only" lang="nl">Sla het boek open op een pagina en spring naar de bijbehorende uitleg op de site.</span></div>
        <div class="pagefind">
          <label>书页码 / boekpagina (1-${TOTAL_PAGES}): <input id="pageq" type="number" min="1" max="${TOTAL_PAGES}" placeholder="bv. 5"></label>
          <button id="pagego">跳转 / ga</button>
          <span id="pagemsg" class="pagemsg"></span>
        </div>
        <table class="pagetable">
          <thead><tr><th>书页 / boek</th><th>onderwerp · 内容</th><th>模块</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div></main>`
    + footer();
}

// ---------- search index + client ----------
function buildSearch(modules){
  const idx=[];
  for(const m of modules){
    for(const s of m.scripts){
      const id='s'+(s.step||slug(s.zh));
      idx.push({t:(s.step?'步骤'+s.step+' ':'')+s.zh+' '+s.nl, u:m.slug+'.html#'+id, m:'模块'+m.modNum, body:s.body.join(' ').replace(/[#*>`-]/g,'').slice(0,400)});
    }
  }
  return idx;
}
const SEARCH_JS = `
(function(){
  var data=null, pmap=null;
  function loadSearch(cb){ if(data) return cb(); fetch('search.json').then(r=>r.json()).then(d=>{data=d;cb();}).catch(()=>{}); }
  function loadPmap(cb){ if(pmap) return cb(pmap); fetch('pagemap.json').then(r=>r.json()).then(d=>{pmap=d;cb(pmap);}).catch(()=>cb(null)); }
  function findPage(n){ if(!pmap) return null; for(var i=0;i<pmap.length;i++){ if(n>=pmap[i].from && n<=pmap[i].to) return pmap[i]; } return null; }

  // Header zoekbalk (tekst + paginanummer)
  var q=document.getElementById('q'), box=document.getElementById('results');
  if(q){
    function render(html){ box.innerHTML=html; box.style.display=html?'block':'none'; }
    q.addEventListener('input',function(){
      var v=q.value.trim(); if(v.length<1){render('');return;}
      if(/^[0-9]{1,3}$/.test(v)){
        loadPmap(function(){ var e=findPage(parseInt(v,10));
          if(e){ render('<a class="card" style="display:block;margin:8px 0" href="'+e.url+'"><strong>📖 书第 '+v+' 页 → '+e.label+'</strong><br><span style="color:#5b6b7b;font-size:.85rem">模块'+e.module+' · p.'+e.from+(e.from!==e.to?('-'+e.to):'')+'</span></a>'); }
          else render('<div class="card" style="margin:8px 0;color:#5b6b7b">页码超出范围 / pagina buiten bereik</div>');
        }); return;
      }
      loadSearch(function(){
        var lv=v.toLowerCase();
        var res=data.filter(function(x){return (x.t+' '+x.body).toLowerCase().indexOf(lv)>=0;});
        render(res.slice(0,12).map(function(x){
          return '<a class="card" style="display:block;margin:8px 0" href="'+x.u+'"><strong>'+x.t+'</strong><br><span style="color:#5b6b7b;font-size:.85rem">'+x.m+' · '+x.body.slice(0,90)+'…</span></a>';
        }).join(''));
      });
    });
    document.addEventListener('click',function(e){ if(box && !box.contains(e.target)&&e.target!==q) box.style.display='none'; });
  }

  // boek-index: paginazoeker
  var pq=document.getElementById('pageq'), go=document.getElementById('pagego'), msg=document.getElementById('pagemsg');
  function jump(){ var n=parseInt(pq.value,10); if(!n){return;} loadPmap(function(){ var e=findPage(n);
    if(e){ msg.textContent=''; window.location.href=e.url; } else { msg.textContent='页码超出范围 / buiten bereik (1-264)'; } }); }
  if(go){ go.addEventListener('click',jump); pq.addEventListener('keydown',function(e){ if(e.key==='Enter') jump(); }); }
})();
`;


// ---------- worker-content: gegenereerde ESM-module voor de paywall-worker ----------
function writeWorkerContent(perTaal){
  const vragen = [];
  const vdir = path.join(ROOT, 'content', 'vragen');
  if(fs.existsSync(vdir)) for(const f of fs.readdirSync(vdir)) if(/\.json$/.test(f))
    vragen.push(...JSON.parse(fs.readFileSync(path.join(vdir,f),'utf8')));
  const vtdir = path.join(ROOT, 'content', 'vragen-vertalingen');
  if(fs.existsSync(vtdir)) for(const f of fs.readdirSync(vtdir)){
    const mt = f.match(/^([a-z]{2})\.json$/); if(!mt) continue;
    const taal = mt[1];
    const vert = JSON.parse(fs.readFileSync(path.join(vtdir,f),'utf8'));
    for(const v of vragen){ const w = vert[v.id]; if(!w) continue;
      v[taal] = w.v; v['opts_'+taal] = w.opts; v['uitleg_'+taal] = w.uitleg; }
  }
  const lexicon = fs.existsSync(path.join(ROOT,'content','lexicon.json'))
    ? JSON.parse(fs.readFileSync(path.join(ROOT,'content','lexicon.json'),'utf8')) : [];
  const inhoud = {};
  for(const [taal, d] of Object.entries(perTaal)){
    inhoud[taal] = {
      modules: d.modules.map(m=>({
    num: String(m.modNum), slug: m.slug, sectie: m.sectie, zh: m.modZh, nl: m.modNl,
    introHtml: m.intro.length?('<div class="note">'+bodyToHtml(m.intro)+'</div>'):'',
    banner: G.moduleBanner(m.modNum),
    parts: mapWithOccurrences(m.scripts, (s, occurrence)=>({
      id: s.id, step: s.step||'', zh: s.zh, nl: s.nl||'', page: s.page||null,
      label: (s.step?((STAPWOORD[taal]||'Stap')+' '+s.step+' · '):'')+ s.zh.replace(/^(?:步骤|Stap)\s*\d+[ab]?\s*[:·]?\s*/i,''),
      html: articleHtml(m, s, taal, occurrence),
      // preview = gratis leesbaar na login; de info-sectie (rijbewijsproces) is
      // bewust volledig gratis: praktische wegwijzer en instap voor nieuwe leden.
      // 1 gratis proefles per rijbewijs-module: info volledig gratis; praktijk = leermodel;
      // theorie/AM/motor/aanhanger = eerste onderdeel (sec1).
      preview: m.sectie==='info' || (String(m.modNum)==='1' && (m.sectie==='praktijk' ? s.id==='leermodel' : s.id==='sec1')) || (['am','motor','aanhanger'].includes(m.sectie) && s.id==='sec1')
    }))
      })),
      pmap: d.pmap,
      search: buildSearch(d.modules)
    };
  }
  // asset-versie voor cache-busting: verandert zodra CSS/JS wijzigt.
  const assetHash = require('crypto').createHash('md5');
  for(const asset of ['style.css','les.js','interactie.js','landing-hero.webp','landing-priority.webp','product-auto-b-v2.png']){
    const file = path.join(ASSETS_SRC,asset);
    if(fs.existsSync(file)) assetHash.update(fs.readFileSync(file));
  }
  const assetVer = assetHash.digest('hex').slice(0,10);
  const out = '// GEGENEREERD door build.js; niet handmatig bewerken.\n'
    + 'export const ASSET_VER = '+JSON.stringify(assetVer)+';\n'
    + 'export const SITE = '+JSON.stringify(SITE)+';\n'
    + 'export const HOME_BANNER = '+JSON.stringify(G.moduleBanner(0))+';\n'
    + 'export const CONTENT = '+JSON.stringify(inhoud)+';\n'
    + 'export const LESTALEN = '+JSON.stringify(Object.keys(inhoud))+';\n'
    + 'export const VRAGEN = '+JSON.stringify(vragen)+';\n'
    + 'export const LEXICON = '+JSON.stringify(lexicon)+';\n'
    + 'export const TOTAL_PAGES = '+TOTAL_PAGES+';\n';
  fs.writeFileSync(path.join(ROOT,'worker-content.js'), out);
}

// ---------- run ----------
function main(){
  fs.mkdirSync(path.join(DIST,'assets'),{recursive:true});
  const talen = fs.readdirSync(CONTENT).filter(d=>/^[a-z]{2}$/.test(d) && fs.statSync(path.join(CONTENT,d)).isDirectory()).sort();  // alleen taalcodes; vragen(-vertalingen) zijn geen talen
  const perTaal = {};
  let modules = null, pmap = null;   // zh blijft leidend voor totalen/log
  for(const taal of talen){
    const dir = path.join(CONTENT, taal);
    const files = fs.readdirSync(dir).filter(f=>/\.md$/i.test(f)).sort();
    const mods = files.map(f=>parseModule(path.join(dir,f)));
    mods.sort((a,b)=>Number(a.modNum)-Number(b.modNum));
    for(const m of mods){ let sec=0; for(const s of m.scripts){
      s.id = s.step ? 's'+s.step : asciiSectionId((s.zh||'')+' '+(s.nl||''), ++sec);
      s.page = m.sectie==='praktijk' ? pageForScript(s.step, (s.zh||'')+' '+(s.nl||'')) : null;   // boekpagina's = praktijkboek
    }}
    perTaal[taal] = { modules: mods, pmap: buildPageMap(mods.filter(m=>m.sectie==='praktijk')) };
    if(taal==='zh' || !modules){ modules = mods; pmap = perTaal[taal].pmap; }
  }
  // Veiligheidsklep: een taal die (nog) niet compleet is bouwt niet mee;
  // zo kan een lopende vertaalronde nooit een halve taal live zetten.
  // Alleen de KERN (rijbewijs B: praktijk/theorie/info) telt voor compleetheid.
  // Rijbewijs-varianten (am/motor/aanhanger) zijn optioneel en mogen per taal
  // incrementeel worden toegevoegd zonder de taal te blokkeren.
  const VARIANT_SECTIES = new Set(['am','motor','aanhanger']);
  const kernAantal = (taal) => perTaal[taal].modules.filter(m => !VARIANT_SECTIES.has(m.sectie)).length;
  const referentie = kernAantal(perTaal.zh ? 'zh' : Object.keys(perTaal)[0]);
  for(const taal of Object.keys(perTaal)){
    if(kernAantal(taal) < referentie){
      console.warn('taal '+taal+' onvolledig ('+kernAantal(taal)+'/'+referentie+' kern-modules): overgeslagen');
      delete perTaal[taal];
    }
  }
  // Sinds fase 1 (commercieel plan) schrijft de build GEEN lespagina's of
  // zoekindexen meer naar dist: alle content wordt door de worker per
  // ingelogde gebruiker gerenderd (paywall). De content gaat als gegenereerde
  // ESM-module (worker-content.js, projectroot) mee in de worker-bundel.
  writeWorkerContent(perTaal);
  for(const f of ['index.html','boek-index.html','pagemap.json','search.json'])
    if(fs.existsSync(path.join(DIST,f))) fs.unlinkSync(path.join(DIST,f));
  for(const m of modules) if(fs.existsSync(path.join(DIST,m.slug+'.html'))) fs.unlinkSync(path.join(DIST,m.slug+'.html'));
  // assets
  fs.copyFileSync(path.join(ASSETS_SRC,'style.css'), path.join(DIST,'assets','style.css'));
  fs.copyFileSync(path.join(ASSETS_SRC,'les.js'), path.join(DIST,'assets','les.js'));
  fs.copyFileSync(path.join(ASSETS_SRC,'interactie.js'), path.join(DIST,'assets','interactie.js'));
  for(const font of ['bricolage-latin.woff2','bricolage-latinext.woff2','bricolage-viet.woff2']){
    if(fs.existsSync(path.join(ASSETS_SRC,font))) fs.copyFileSync(path.join(ASSETS_SRC,font), path.join(DIST,'assets',font));
  }
  for(const photo of ['landing-hero.webp','landing-priority.webp','product-auto-b-v2.png']){
    if(fs.existsSync(path.join(ASSETS_SRC,photo))) fs.copyFileSync(path.join(ASSETS_SRC,photo), path.join(DIST,'assets',photo));
  }
  for(const ic of ['icon-192.png','icon-512.png']) if(fs.existsSync(path.join(ASSETS_SRC,ic))) fs.copyFileSync(path.join(ASSETS_SRC,ic), path.join(DIST,ic));
  // PWA: manifest + service worker (cachet alleen de schil, nooit lescontent)
  fs.writeFileSync(path.join(DIST,'manifest.webmanifest'), JSON.stringify({
    name: 'Dandan Drive', short_name: 'Dandan Drive', start_url: '/leren',
    display: 'standalone', background_color: '#0b1e3d', theme_color: '#0b1e3d', lang: 'zh',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }
    ]
  }));
  fs.writeFileSync(path.join(DIST,'sw.js'),
    "// Dandan Drive PWA: alleen statische schil cachen; lescontent en beelden\n" +
    "// bewust NIET offline (kopieerbescherming).\n" +
    "const CACHE='dd-schil-v1';\n" +
    "const SCHIL=['/assets/style.css','/assets/search.js','/assets/interactie.js','/favicon.svg','/manifest.webmanifest'];\n" +
    "self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SCHIL)).then(()=>self.skipWaiting()))});\n" +
    "self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});\n" +
    "self.addEventListener('fetch',e=>{\n" +
    "  const u=new URL(e.request.url);\n" +
    "  if(e.request.method!=='GET'||u.origin!==location.origin)return;\n" +
    "  if(u.pathname.startsWith('/img/')||u.pathname.startsWith('/module')||u.pathname.startsWith('/theorie')||u.pathname.startsWith('/oefenexamen'))return;\n" +
    "  if(SCHIL.includes(u.pathname))e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));\n" +
    "});\n");
  // SEO: sitemap met taalvarianten van de publieke pagina's
  const TALEN_SEO = ['zh','nl','en','tr','ar','pl','uk','ru','es','pt','hi','vi'];
  const publiekeRoutes = ['/', '/prijzen', '/partner', '/over',
    '/producten/auto-b-theorie', '/producten/auto-b-praktijk', '/producten/auto-b-bundel',
    '/producten/am', '/producten/motor', '/producten/be'];
  const urls = publiekeRoutes.flatMap(p => [SITE.baseUrl+p, ...TALEN_SEO.map(l=>SITE.baseUrl+p+'?taal='+l)]);
  fs.writeFileSync(path.join(DIST,'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u=>'  <url><loc>'+u.replace(/&/g,'&amp;')+'</loc></url>').join('\n') + '\n</urlset>\n');
  // Alleen geoptimaliseerde WebP-lesbeelden publiceren. PNG/JPEG-bestanden
  // zijn lokale bronbestanden en mogen de live-lesomgeving niet verzwaren.
  let nPhoto=0;
  if(fs.existsSync(IMG)){
    const dimg=path.join(DIST,'img'); fs.mkdirSync(dimg,{recursive:true});
    for(const f of fs.readdirSync(dimg)){
      const target = path.join(dimg,f);
      if(fs.statSync(target).isFile() && !/\.webp$/i.test(f)) fs.unlinkSync(target);
    }
    for(const f of fs.readdirSync(IMG)){ if(/\.webp$/i.test(f)){ fs.copyFileSync(path.join(IMG,f), path.join(dimg,f)); nPhoto++; } }
  }
  fs.writeFileSync(path.join(DIST,'assets','search.js'), SEARCH_JS);
  fs.writeFileSync(path.join(DIST,'favicon.svg'), FAVICON_SVG);
  // social-preview (og.png) meenemen indien aanwezig in de projectroot
  if(fs.existsSync(path.join(ROOT,'og.png'))) fs.copyFileSync(path.join(ROOT,'og.png'), path.join(DIST,'og.png'));
  // Security-headers + caching (Cloudflare Workers Static Assets / _headers).
  // Strikte CSP: alle scripts/styles/fonts self-hosted; inline style-attributen
  // vereisen style-src 'unsafe-inline'. Geen externe bronnen.
  fs.writeFileSync(path.join(DIST,'_headers'),
    "/*\n" +
    "  X-Content-Type-Options: nosniff\n" +
    "  Referrer-Policy: strict-origin-when-cross-origin\n" +
    "  X-Frame-Options: DENY\n" +
    "  Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()\n" +
    "  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload\n" +
    "  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; form-action 'self'\n" +
    "\n" +
    "/assets/*\n" +
    "  Cache-Control: public, max-age=3600\n");
  fs.writeFileSync(path.join(DIST,'robots.txt'), "User-agent: *\nDisallow: /login\nDisallow: /account\nDisallow: /admin\nDisallow: /oefenexamen\nAllow: /\nSitemap: "+SITE.baseUrl+"/sitemap.xml\n");
  console.log('Built '+modules.length+' modules, '+modules.reduce((n,m)=>n+m.scripts.length,0)+' onderdelen -> '+DIST);
}
main();
