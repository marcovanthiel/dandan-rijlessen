# Deploy: Dandan's rijlessen → dandandrive.nl

Zero-dependency **accountplatform** (fase 1 commercieel plan, live 9-7-2026):
worker (eigen mini-router) + D1 (accounts/sessies/passen/statistiek) +
statische assets. Lescontent wordt server-side per gebruiker gerenderd
(paywall: gratis account ziet de proefles, pas ontgrendelt alles); de build
genereert daarvoor `worker-content.js` uit `content/*.md`. **LIVE op https://dandandrive.nl** (+ www);
artnijmegen.nl verwijst door (301) sinds de verhuizing van 9-7-2026. Opgezet volgens de standaard van alle marcovanthiel-sites:
**Cloudflare Workers Static Assets + GitHub Actions auto-deploy.**

## Bron van waarheid
- Repo: **`marcovanthiel/dandan-rijlessen`** (lokale map heet sinds 9-7-2026
  **`dandandrive`**: `~/Developer/dandandrive` op de MacBook, `~/Projects/dandandrive`
  op de Mac mini).
- Inhoud wijzigen: `content/*.md` (per module, NL+ZH). Layout: `assets/style.css`;
  generator: `build.js`.
- `git fetch && git pull` bij sessie-start (multi-machine).

## Deployen = pushen
```bash
# inhoud aanpassen in content/*.md, dan:
git add -A && git commit -m "…" && git push
```
Push naar `main` → GitHub Action **Deploy to Cloudflare Workers** draait
`node build.js` (→ `dist/`) en `wrangler deploy`. Live in ~20 s.

Lokaal bekijken: `npm run preview` (http://localhost:8080).
Handmatig deployen (nood): `npm run deploy` (build + `wrangler deploy`, Node 22).

## Architectuur / inrichting
- **`wrangler.toml`**: `[assets] directory = "./dist"` (Workers Static Assets).
- **`dist/_headers`** (door `build.js` gegenereerd): security-headers + strikte
  **CSP** (alles self-hosted; `style-src 'unsafe-inline'` voor inline
  style-attributen; `script-src 'self'`). `wranglerVersion` in de deploy-action
  is gepind op `4.107.0` zodat `_headers` op Workers-assets wordt toegepast.
- **Custom domains**: `dandandrive.nl` + `www` (en `artnijmegen.nl` + `www` voor
  de redirect) zijn via de Cloudflare-API aan de worker `dandan-rijlessen`
  gekoppeld (niet via `routes` in wrangler.toml; token met account-brede
  Workers-domeinrechten staat in dandanshop/.mailconfig.env).
  Module-URL's normaliseren via `auto-trailing-slash` (`/module-1.html` → `/module-1`).
- **Dependabot** (wekelijks, 5 dagen cooldown) + **auto-merge** (alleen
  patch/dev-minor; majors → review). GitHub-Actions zijn op commit-SHA gepind.
- **Secrets** op de repo: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
  (account `04865fcd4034789d3970c1b51950227c`).

## Auteursrecht
Originele lesteksten over publieke verkeersregels/rijtechniek. **Geen** scans,
foto's of illustraties uit het bronboek. Voeg alleen eigen/rechtenvrij beeld toe.

## Fase 1: accounts en paywall (sinds 9-7-2026)
- **D1**: database `dandandrive` (binding `DB`); schema in `schema.sql`
  (idempotent; toepassen met `wrangler d1 execute dandandrive --remote --file=schema.sql`).
  Admin-seed: marco@marcovanthiel.nl.
- **Login**: e-mailcode (6 cijfers, 10 min, max 5 pogingen, 60 s tussen codes)
  via Resend; secret `RESEND_API_KEY` op de worker (`wrangler secret put`).
  Afzender tijdelijk inlog@dandanshop.nl (Resend gratis plan = 1 domein);
  OPEN PUNT: eigen Resend-account voor @dandandrive.nl.
- **Paywall**: /leren, /module-N, /boek-index, /search.json, /pagemap.json
  vereisen login; volledige toegang vraagt een geldige pas (tabel `passes`)
  of admin. Passen toekennen: /admin (tot online betalen live is).
- **Kopieer-remming v1**: accountwatermerk, user-select/copy/context-blok
  (assets/les.js), printblokkade op beschermde pagina's. Open punt fase 4:
  beelden accountgebonden serveren (staan nu nog als statische assets).
- **Statistiek**: cookieloze events in D1 (view/signup/login/locked_view,
  utm_source als bron); overzicht onder /admin.
- **Lokaal ontwikkelen**: `wrangler d1 execute dandandrive --local --file=schema.sql`,
  dan `npx wrangler dev`; zonder RESEND_API_KEY toont het loginscherm de code
  (DEV-modus), zodat de hele stroom lokaal te testen is.

## Meertalige chrome + taalvoorkeur (sinds 9-7-2026)
- `i18n.js` = berichtencatalogus (zh/nl/en) voor alle site-chrome; lestekst
  staat per lestaal in `content/<taal>/` (nu alleen `zh`). Pariteitscheck:
  `node --input-type=module -e "import('./i18n.js').then(m=>{const r=m.pariteit();console.log(r.length?r:'ok');})"`
- Taalvolgorde: accountvoorkeur > `dd_lang`-cookie > standaard (anoniem nl,
  ingelogd zh). `?taal=xx` op elke GET zet cookie + accountvoorkeur.
- Nieuwe UI-taal = blok in i18n.js (pariteit!) + TALEN-lijst; nieuwe LEStaal =
  map `content/<taal>/` met vertaalde md's (structuur identiek aan zh) →
  build pakt 'm automatisch op; gebruikers in die taal krijgen dan de
  vertaalde les i.p.v. de zh-fallback met melding.

## Fase 3/4/5/6/9: volledig platform (sinds 9-7-2026, autonome bouwronde)
- **Theoriemodule B**: 11 hoofdstukken in `content/zh/Theorie *.md` (zelfde
  formaat als praktijk; bestandsnaam "Theorie N" bepaalt sectie+slug).
  Vragenbank: `content/vragen/*.json` (85 origineel; velden nl/zh, type
  kennis|inzicht|gevaar). Simulator volgt het vernieuwde CBR-examen
  (50 vragen, 44 goed, 30 min; bron cbr.nl, gecheckt 9-7-2026) — parameters
  in `features.js` (EXAMEN). Onderwerp→hoofdstuk-koppeling: OND_HOOFDSTUK.
- **Voortgang/leerpad**: tabel progress (part_key `p:slug:id`/`t:slug:id`),
  afvinkknoppen per onderdeel, ring op /leren, examendatum op /account.
- **Begrippentrainer**: `content/lexicon.json` (40 termen × 12 talen; dit is
  óók het terminologielexicon voor de vertaalpijplijn). NL-audio via
  SpeechSynthesis (client, geen externe bronnen).
- **Commerce-voorbereiding**: /prijzen → /bestellen → orders-tabel →
  /betalen/:id (wacht op provider). Vouchers: admin maakt codes (campagne,
  max_uses), inwisselen op /prijzen of /betalen → pas. WeChat Pay:
  webhook-stub op POST /webhook/wechat (501) + provider-veld in orders;
  activering zodra de Chinese entiteit er is. Referral: ref_code per account,
  ?ref= zet cookie, referred_by bij signup. Boek: /boek redirect (env
  BOEK_URL overschrijft; affiliate-ID invullen = var zetten).
- **Reviews**: tabel reviews, alléén door admin ingevoerde echte verhalen
  (zichtbaar-vlag); landing toont ze pas als ze bestaan.
- **Beveiliging fase 4 v1**: /img/* alleen met sessie; max 3 gelijktijdige
  sessies per account; best-effort gedragsrem (240 gated views/uur per
  isolate). Zwaardere varianten (D1-teller, signed URLs) = later.
- **i18n**: 12 talen in i18n.js (gegenereerd; pariteit verplicht). UI-taal ≠
  lestaal: lestekst valt terug op zh met melding. RTL voor ar.
- **PWA**: manifest + sw.js (alleen schil-cache, bewust geen lescontent).
  SEO: sitemap.xml + hreflang op de landing + robots.
- **E-mail**: info@dandandrive.nl → doorsturen naar marco@ via Cloudflare
  Email Routing (MX/SPF handmatig via DNS-API gezet; enable-endpoint viel
  buiten de token-permissies maar regels + MX werken, testmail delivered).

## Lestalen (stand 10-7-2026)
Alle 11 lestalen volledig live: zh (origineel), nl, tr, ar, pl, uk, ru, es,
pt, hi, vi. Elke taal: 16 modules (107 delen, 52 foto-delen) in
content/<taal>/ + 85 vraagvertalingen in content/vragen-vertalingen/<taal>.json.
Vertaald door Opus-agents met lexicon-terminologie; native review per taal
inplannen vóór actieve campagnes (afspraak: review in de live omgeving).
Valideren: ./valideer-taal.sh <taal>. Nieuwe taal of contentwijziging =
volg het draaiboek in **docs/VERTAALPROCEDURE.md** (incl. promptsjabloon);
de build weigert onvolledige talen (veiligheidsklep).
