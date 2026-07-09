# Deploy — Dandan's rijlessen (Cloudflare Pages)

Statische site (geen framework, geen dependencies). Build met Node, deploy naar
Cloudflare Pages, domein **artnijmegen.nl**.

> Let op: dit volgt de gangbare Cloudflare Pages-opzet. Als jullie standaard afwijkt
> (bv. deploy via Git-integratie i.p.v. wrangler, of een vast project/account-id),
> stem dit dan af op `kunstwebsite/Deployment.md` in de OneDrive-root.

## 1. Bouwen
```bash
cd "Website/dandan-rijlessen"
node build.js          # of: npm run build
```
De site wordt gegenereerd in `dist/` uit de bronbestanden in `content/*.md`.
Inhoud wijzigen? Pas de markdown in `content/` aan en bouw opnieuw.

## 2. Lokaal bekijken
```bash
npm run preview        # start http://localhost:8080
```

## 3. Deployen naar Cloudflare Pages
Vereist een ingelogde `wrangler` (Cloudflare-account met toegang tot artnijmegen.nl).

```bash
npx wrangler pages deploy dist --project-name=dandan-rijlessen
# eerste keer maakt wrangler het Pages-project aan (kies production branch = main)
```

Of via npm:
```bash
npm run deploy
```

## 4. Domein koppelen (eenmalig, in Cloudflare dashboard)
- Pages-project **dandan-rijlessen** → *Custom domains*.
- Kies de gewenste route op **artnijmegen.nl**:
  - subdomein, bv. `rijlessen.artnijmegen.nl`, **of**
  - een pad op de hoofdsite (via een redirect/route rule).
- DNS staat al bij Cloudflare, dus de CNAME wordt automatisch voorgesteld.

> De site gebruikt uitsluitend **relatieve paden**, dus werkt zowel op een eigen
> (sub)domein als onder een subpad.

## 5. Git-deploy (alternatief, indien dat jullie standaard is)
Push deze map naar de repo die aan het Pages-project hangt met:
- Build command: `node build.js`
- Build output directory: `dist`
- (geen install-stap nodig; geen dependencies)

## Structuur
```
dandan-rijlessen/
├─ content/         # bronteksten per module (markdown, NL+ZH) — enige plek om inhoud te wijzigen
├─ assets/style.css # opmaak
├─ build.js         # generator (zero-dependency Node)
├─ dist/            # gegenereerde site (deploy-doel)
├─ wrangler.toml    # Cloudflare Pages config
└─ package.json
```

## Auteursrecht
De teksten zijn **origineel lesmateriaal** over publieke verkeersregels en rijtechniek.
Er staan **geen scans, foto's of illustraties uit het bronboek** in de site. Voeg alleen
eigen/rechtenvrije beelden toe.
