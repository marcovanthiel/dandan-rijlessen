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
function photoSuffix(s){
  if(s.step) return 's'+s.step;
  if(/学习方法|leermodel/i.test(s.zh)) return 'leermodel';
  if(/路考|examen/i.test(s.zh)) return 'examen';
  if(/辅助|ADAS/i.test(s.zh)) return 'adas';
  if(/巩固|练习|oefening/i.test(s.zh)) return 'oefening';
  return null;
}
function findPhoto(m,s){
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
function asciiSectionId(zh, n){
  if(/学习方法|leermodel/i.test(zh)) return 'leermodel';
  if(/路考|examen/i.test(zh)) return 'examen';
  if(/辅助|ADAS/i.test(zh)) return 'adas';
  if(/巩固|练习|oefening/i.test(zh)) return 'oefening';
  return 'sec'+n;
}

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
  s = s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  s = s.replace(/`(.+?)`/g,'<code>$1</code>');
  return s;
}
// convert a block of body lines to html (paragraphs + lists)
function bodyToHtml(lines){
  const out=[]; let list=null; let para=[];
  const flushPara=()=>{ if(para.length){ out.push('<p>'+inline(para.join(' '))+'</p>'); para=[]; } };
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
  const fnameNum = (path.basename(file).match(/Module\s*(\d+)/i)||[])[1] || '';
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
      const step=(t.zh.match(/步骤\s*(\d+[ab]?)/)||[])[1] || (t.nl.match(/^[A-Z]\.\s/)?t.nl.trim().charAt(0):'');
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
  if(/Slotdeel/i.test(modNl) || /结业/.test(modZh)){ modZh='结业部分'; modNl='Slotdeel: examen · ADAS · oefeningen'; }
  // drop empty divider blocks (no body text)
  const scripts = blocks.filter(b=>b.body.join('').trim().length>0);
  return {modZh,modNl,modNum,intro,scripts,slug:'module-'+(modNum||blocks.length)};
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

function articleHtml(m, s){
    const zhTitle = s.zh;
    const pageBadge = s.page?`<a class="bookpage" href="boek-index.html#p${s.page}" title="Boekpagina / 书页">📖 boek p.${s.page}</a>`:'';
    const fig = G.figFor(s.step, s.zh);
    const photo = findPhoto(m, s);
    const cleanTitle = zhTitle.replace(/^步骤\s*\d+[ab]?\s*·?\s*/,'');
    const dim = photo ? imgSize(photo) : null;
    const figHtml = photo
      ? `<figure class="fig photo"><img src="${photo}" alt="${esc(cleanTitle)}${s.nl?' · '+esc(s.nl):''}"${dim?` width="${dim.w}" height="${dim.h}"`:''} loading="lazy"></figure>`
      : (fig?`<figure class="fig">${fig}</figure>`:'');
    return `<article class="script" id="${s.id}" data-page="${s.page||''}">
      <div class="script-top">
        <div class="script-title">
          <span class="script-icon">${G.iconFor(s.step, s.zh)}</span>
          <h2>${s.step?`<span class="step">步骤 ${esc(s.step)}</span> · `:''}${esc(cleanTitle)}</h2>
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
  const cards = m.scripts.map(s=>articleHtml(m,s)).join('\n');
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
  const inhoud = {};
  for(const [taal, d] of Object.entries(perTaal)){
    inhoud[taal] = {
      modules: d.modules.map(m=>({
    num: String(m.modNum), slug: m.slug, zh: m.modZh, nl: m.modNl,
    introHtml: m.intro.length?('<div class="note">'+bodyToHtml(m.intro)+'</div>'):'',
    banner: G.moduleBanner(m.modNum),
    parts: m.scripts.map(s=>({
      id: s.id, step: s.step||'', zh: s.zh, nl: s.nl||'', page: s.page||null,
      label: (s.step?('步骤 '+s.step+' · '):'')+ s.zh.replace(/^步骤\s*\d+[ab]?\s*·?\s*/,''),
      html: articleHtml(m, s),
      preview: String(m.modNum)==='1' && (s.id==='leermodel' || s.id==='s1')
    }))
      })),
      pmap: d.pmap,
      search: buildSearch(d.modules)
    };
  }
  const out = '// GEGENEREERD door build.js; niet handmatig bewerken.\n'
    + 'export const SITE = '+JSON.stringify(SITE)+';\n'
    + 'export const HOME_BANNER = '+JSON.stringify(G.moduleBanner(0))+';\n'
    + 'export const CONTENT = '+JSON.stringify(inhoud)+';\n'
    + 'export const LESTALEN = '+JSON.stringify(Object.keys(inhoud))+';\n'
    + 'export const TOTAL_PAGES = '+TOTAL_PAGES+';\n';
  fs.writeFileSync(path.join(ROOT,'worker-content.js'), out);
}

// ---------- run ----------
function main(){
  fs.mkdirSync(path.join(DIST,'assets'),{recursive:true});
  const talen = fs.readdirSync(CONTENT).filter(d=>fs.statSync(path.join(CONTENT,d)).isDirectory()).sort();
  const perTaal = {};
  let modules = null, pmap = null;   // zh blijft leidend voor totalen/log
  for(const taal of talen){
    const dir = path.join(CONTENT, taal);
    const files = fs.readdirSync(dir).filter(f=>/\.md$/i.test(f)).sort();
    const mods = files.map(f=>parseModule(path.join(dir,f)));
    mods.sort((a,b)=>Number(a.modNum)-Number(b.modNum));
    for(const m of mods){ let sec=0; for(const s of m.scripts){
      s.id = s.step ? 's'+s.step : asciiSectionId(s.zh, ++sec);
      s.page = pageForScript(s.step, s.zh);
    }}
    perTaal[taal] = { modules: mods, pmap: buildPageMap(mods) };
    if(taal==='zh' || !modules){ modules = mods; pmap = perTaal[taal].pmap; }
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
  // foto's meenemen (indien aanwezig)
  let nPhoto=0;
  if(fs.existsSync(IMG)){
    const dimg=path.join(DIST,'img'); fs.mkdirSync(dimg,{recursive:true});
    for(const f of fs.readdirSync(IMG)){ if(/\.(png|jpe?g|webp)$/i.test(f)){ fs.copyFileSync(path.join(IMG,f), path.join(dimg,f)); nPhoto++; } }
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
  fs.writeFileSync(path.join(DIST,'robots.txt'), "User-agent: *\nDisallow: /login\nDisallow: /account\nDisallow: /admin\nAllow: /\n");
  console.log('Built '+modules.length+' modules, '+modules.reduce((n,m)=>n+m.scripts.length,0)+' onderdelen -> '+DIST);
}
main();
