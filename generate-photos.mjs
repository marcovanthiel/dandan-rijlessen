#!/usr/bin/env node
/* Genereert fotorealistische beelden voor Dandan's rijlessen.
 *
 * Twee manieren:
 *  A) Automatisch via de OpenAI beeld-API:
 *       OPENAI_API_KEY=sk-...  node generate-photos.mjs
 *     Opties (env): MODEL (default gpt-image-1), SIZE (default 1536x1024),
 *                   VARIANTS (default 1), ONLY (komma-lijst van keys).
 *     Bestaat img/<key>.png al? Dan wordt die overgeslagen (hervatbaar).
 *  B) Handmatig via ChatGPT:
 *       node generate-photos.mjs --dump   -> schrijft photos/prompts.md
 *     Genereer daar de beelden en sla ze op als img/<key>.png (of .jpg/.webp).
 *
 * De import gebeurt vanzelf: build.js toont img/<key>.<ext> als die bestaat,
 * anders de originele illustratie. Draai daarna:  node build.js
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { STYLE, MANIFEST } = require('./photos/prompt-map.js');

const ROOT = fileURLToPath(new URL('.', import.meta.url)); // eindigt op path-separator
const IMG = ROOT + 'img';
if (!existsSync(IMG)) mkdirSync(IMG, { recursive: true });

const args = process.argv.slice(2);
const MODEL = process.env.MODEL || 'gpt-image-1';
const SIZE = process.env.SIZE || '1536x1024';
const VARIANTS = Math.max(1, parseInt(process.env.VARIANTS || '1', 10));
const ONLY = (process.env.ONLY || '').split(',').map(s=>s.trim()).filter(Boolean);

function fullPrompt(p){ return `${p} ${STYLE}`; }

// --- dump: prompts.md voor handmatig gebruik in ChatGPT ---
if (args.includes('--dump')) {
  let md = `# Fotoprompts — Dandan's rijlessen\n\n`
    + `Genereer per regel één fotorealistische afbeelding en sla die op als **img/<key>.png** in de sitemap.\n`
    + `Deze beelden zijn originele, generieke Nederlandse verkeersscènes — géén kopie van de foto's uit het boek.\n\n`
    + `Gemeenschappelijke stijl (achteraan elke prompt plakken):\n\n> ${STYLE}\n\n---\n\n`;
  for (const it of MANIFEST) {
    md += `### ${it.key}  —  ${it.title}\nBestand: \`img/${it.key}.png\`\n\n${fullPrompt(it.prompt)}\n\n`;
  }
  writeFileSync(ROOT + 'photos/prompts.md', md);
  writeFileSync(ROOT + 'photos/prompts.json', JSON.stringify(MANIFEST.map(m=>({...m, file:`img/${m.key}.png`, prompt_full:fullPrompt(m.prompt)})), null, 2));
  console.log(`Geschreven: photos/prompts.md en photos/prompts.json (${MANIFEST.length} prompts).`);
  process.exit(0);
}

// --- automatisch genereren via OpenAI ---
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('Zet OPENAI_API_KEY (of gebruik: node generate-photos.mjs --dump).'); process.exit(1); }

const sleep = ms => new Promise(r=>setTimeout(r, ms));

async function genOne(prompt){
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method:'POST',
    headers:{ 'Authorization':`Bearer ${KEY}`, 'Content-Type':'application/json' },
    body: JSON.stringify({ model: MODEL, prompt, size: SIZE, n: 1 })
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`API ${res.status}: ${t.slice(0,200)}`); }
  const j = await res.json();
  const d = j.data && j.data[0];
  if (d?.b64_json) return Buffer.from(d.b64_json, 'base64');
  if (d?.url) { const im = await fetch(d.url); return Buffer.from(await im.arrayBuffer()); }
  throw new Error('Geen beelddata in respons.');
}

const items = MANIFEST.filter(m => ONLY.length===0 || ONLY.includes(m.key));
let made=0, skipped=0, failed=0;
for (const it of items) {
  for (let v=1; v<=VARIANTS; v++) {
    const suffix = v===1 ? '' : `_v${v}`;
    const file = `${IMG}/${it.key}${suffix}.png`;
    if (existsSync(file)) { skipped++; continue; }
    try {
      process.stdout.write(`• ${it.key}${suffix} … `);
      const buf = await genOne(fullPrompt(it.prompt));
      writeFileSync(file, buf);
      made++; console.log('ok');
      await sleep(1200); // vriendelijk voor rate limits
    } catch(e) {
      failed++; console.log('FOUT — ' + e.message);
      await sleep(3000);
    }
  }
}
console.log(`\nKlaar. Nieuw: ${made}, overgeslagen: ${skipped}, mislukt: ${failed}.`);
console.log('Draai nu:  node build.js   (foto\'s worden automatisch in de site gezet)');
