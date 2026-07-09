# Deploy: Dandan's rijlessen → dandandrive.nl

Statische, zero-dependency site (build met Node). **LIVE op https://dandandrive.nl** (+ www);
artnijmegen.nl verwijst door (301) sinds de verhuizing van 9-7-2026. Opgezet volgens de standaard van alle marcovanthiel-sites:
**Cloudflare Workers Static Assets + GitHub Actions auto-deploy.**

## Bron van waarheid
- Repo: **`marcovanthiel/dandan-rijlessen`** (lokaal `~/Projects/dandan-rijlessen`).
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
