#!/usr/bin/env node
/* Dandan's rijlessen — zero-dependency static site generator.
   Reads content/*.md (original bilingual lesson material) and writes to dist/. */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CONTENT = path.join(ROOT, 'content');
const DIST = path.join(ROOT, 'dist');
const ASSETS_SRC = path.join(ROOT, 'assets');

const SITE = {
  titleNl: "Dandan's rijlessen",
  titleZh: "丹丹的驾驶课",
  tagNl: "De Nederlandse praktijkopleiding, uitgelegd voor Chinese leerlingen.",
  tagZh: "为中国学员讲解荷兰驾照路考的实操课程。",
  domain: "artnijmegen.nl",
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
  if(/学习方法|Het leermodel/.test(zh)) return 1;     // voorwoord/leermodel (p.1–30; taakprocessen p.5)
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
function splitTitle(h){ // "步骤 1 · 车外检查 (Controle buiten de auto)" or "模块一 · Module 1 — X"
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
  if(/Slotdeel/i.test(modNl) || /结业/.test(modZh)){ modZh='结业部分'; modNl='Slotdeel — examen · ADAS · oefeningen'; }
  // drop empty divider blocks (no body text)
  const scripts = blocks.filter(b=>b.body.join('').trim().length>0);
  return {modZh,modNl,modNum,intro,scripts,slug:'module-'+(modNum||blocks.length)};
}

// ---------- templates ----------
function head(title, rel){
  return `<!doctype html><html lang="zh"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(SITE.tagZh)}">
<link rel="stylesheet" href="${rel}assets/style.css">
</head><body data-nl="on">`;
}
function header(rel, modules){
  const nav = modules.map(m=>`<a href="${rel}${m.slug}.html">模块${m.modNum}</a>`).join('');
  return `<header class="site"><div class="container">
  <a class="brand" href="${rel}index.html" style="color:#fff">
    <span class="logo">丹</span>
    <span>${esc(SITE.titleNl)}<small>${esc(SITE.titleZh)} · 驾照路考</small></span>
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
  Origineel lesmateriaal over de Nederlandse praktijkopleiding (RIS-methode) voor Chinese leerlingen.
  原创学习材料 · ${esc(SITE.domain)}
  </div></footer>
  <script src="assets/search.js" defer></script>
  </body></html>`;
}

function renderIndex(modules){
  const cards = modules.map(m=>`
  <a class="card" href="${m.slug}.html">
    <span class="mnum">${m.modNum}</span>
    <h3>${esc(m.modZh)}</h3>
    <div class="nl nl-only">${esc(m.modNl)}</div>
    <div class="count">${m.scripts.length} 个步骤 / onderdelen</div>
  </a>`).join('');
  return head(SITE.titleNl+' · '+SITE.titleZh,'')
    + header('',modules)
    + `<section class="hero"><div class="container">
        <div class="pill">荷兰驾照 · rijbewijs B</div>
        <h1><span class="zh">${esc(SITE.titleZh)}</span></h1>
        <h1 style="font-size:1.3rem;color:var(--muted);font-weight:600">${esc(SITE.titleNl)}</h1>
        <p>${esc(SITE.tagZh)}</p>
        <p class="nl-only" style="font-size:.95rem">${esc(SITE.tagNl)}</p>
      </div></section>`
    + `<main><div class="container">
        <div class="note">五个模块按照"分步"方法循序渐进：从车辆操控到复杂路况，再到考试。每个步骤都有要点说明。<br>
        <span class="nl-only">Vijf modules, stap voor stap — van voertuigbeheersing tot het examen.</span></div>
        <div class="grid">${cards}</div>
      </div></main>`
    + footer();
}

function renderModule(m, modules){
  const toc = m.scripts.map(s=>{
    const label = (s.step?('步骤 '+s.step+' · '):'')+ s.zh.replace(/^步骤\s*\d+[ab]?\s*·?\s*/,'');
    return `<li><a href="#${s.id}">${s.page?`<span class="tocpage">p.${s.page}</span> `:''}${esc(label)}</a></li>`;
  }).join('');
  const cards = m.scripts.map(s=>{
    const zhTitle = s.zh;
    const pageBadge = s.page?`<a class="bookpage" href="boek-index.html#p${s.page}" title="Boekpagina / 书页">📖 boek p.${s.page}</a>`:'';
    return `<article class="script" id="${s.id}" data-page="${s.page||''}">
      <div class="script-top">
        <h2>${s.step?`<span class="step">步骤 ${esc(s.step)}</span> · `:''}${esc(zhTitle.replace(/^步骤\s*\d+[ab]?\s*·?\s*/,''))}</h2>
        ${pageBadge}
      </div>
      ${s.nl?`<div class="nl-title nl-only">${esc(s.nl)}</div>`:''}
      ${bodyToHtml(s.body)}
    </article>`;
  }).join('\n');
  const introHtml = m.intro.length?`<div class="note">${bodyToHtml(m.intro)}</div>`:'';
  return head(m.modZh+' · '+SITE.titleZh,'')
    + header('',modules)
    + `<main><div class="container">
        <div class="crumbs"><a href="index.html">首页</a> › 模块${m.modNum}</div>
        <div class="module-head">
          <div class="kicker">模块 ${m.modNum} / Module ${m.modNum}</div>
          <h1>${esc(m.modZh)}</h1>
          <div class="nl nl-only" style="color:var(--muted)">${esc(m.modNl)}</div>
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
    const range = e.from===e.to?('p.'+e.from):('p.'+e.from+'–'+e.to);
    return `<tr id="p${e.from}">
      <td class="pcol"><span class="pill">${range}</span></td>
      <td>${e.step?`步骤 ${esc(e.step)} · `:''}<a href="${e.url}">${esc(e.label)}</a>${e.nl?`<div class="nl nl-only">${esc(e.nl)}</div>`:''}</td>
      <td class="mcol">模块 ${e.module}</td>
    </tr>`;
  }).join('\n');
  return head('按书页查找 · '+SITE.titleZh,'')
    + header('',modules)
    + `<main><div class="container">
        <div class="crumbs"><a href="index.html">首页</a> › 按书页查找</div>
        <h1>按书页查找 <span class="nl-only" style="color:var(--muted);font-size:1rem">· Zoek op boekpagina</span></h1>
        <div class="note">在原书里翻到某一页？输入页码，直接跳到网站上对应的讲解。<br>
        <span class="nl-only">Sla het boek open op een pagina en spring naar de bijbehorende uitleg op de site.</span></div>
        <div class="pagefind">
          <label>书页码 / boekpagina (1–${TOTAL_PAGES}): <input id="pageq" type="number" min="1" max="${TOTAL_PAGES}" placeholder="bv. 5"></label>
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
          if(e){ render('<a class="card" style="display:block;margin:8px 0" href="'+e.url+'"><strong>📖 书第 '+v+' 页 → '+e.label+'</strong><br><span style="color:#5b6b7b;font-size:.85rem">模块'+e.module+' · p.'+e.from+(e.from!==e.to?('–'+e.to):'')+'</span></a>'); }
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
    if(e){ msg.textContent=''; window.location.href=e.url; } else { msg.textContent='页码超出范围 / buiten bereik (1–264)'; } }); }
  if(go){ go.addEventListener('click',jump); pq.addEventListener('keydown',function(e){ if(e.key==='Enter') jump(); }); }
})();
`;

// ---------- run ----------
function main(){
  fs.mkdirSync(path.join(DIST,'assets'),{recursive:true});
  const files = fs.readdirSync(CONTENT).filter(f=>/\.md$/i.test(f)).sort();
  let modules = files.map(f=>parseModule(path.join(CONTENT,f)));
  modules.sort((a,b)=>Number(a.modNum)-Number(b.modNum));
  // assign stable ids + boek-paginanummers per onderdeel
  for(const m of modules) for(const s of m.scripts){
    s.id = 's'+(s.step||slug(s.zh));
    s.page = pageForScript(s.step, s.zh);
  }
  // paginamap boek -> website
  const pmap = buildPageMap(modules);
  // pages
  fs.writeFileSync(path.join(DIST,'index.html'), renderIndex(modules));
  for(const m of modules) fs.writeFileSync(path.join(DIST,m.slug+'.html'), renderModule(m,modules));
  fs.writeFileSync(path.join(DIST,'boek-index.html'), renderBookIndex(pmap, modules));
  fs.writeFileSync(path.join(DIST,'pagemap.json'), JSON.stringify(pmap));
  // assets
  fs.copyFileSync(path.join(ASSETS_SRC,'style.css'), path.join(DIST,'assets','style.css'));
  fs.writeFileSync(path.join(DIST,'assets','search.js'), SEARCH_JS);
  fs.writeFileSync(path.join(DIST,'search.json'), JSON.stringify(buildSearch(modules)));
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
  fs.writeFileSync(path.join(DIST,'robots.txt'), "User-agent: *\nAllow: /\n");
  console.log('Built '+modules.length+' modules, '+modules.reduce((n,m)=>n+m.scripts.length,0)+' onderdelen -> '+DIST);
}
main();
