# DESIGN — Dandan Drive designsysteem

Eén bron van waarheid voor de visuele taal. Doel: modern, betrouwbaar (rijschool),
internationaal (11 lestalen, Latijn + CJK + Arabisch/RTL), mobile-first.

## Merkidee
"Onderweg" — nachtblauw als betrouwbare basis, wegmarkering-geel als accent/actie.
Rustig, professioneel, met speelse verkeers-iconografie in eigen SVG.

## Typografie
- **Koppen (`.lp h1/h2/h3`):** Bricolage Grotesque (OFL, self-hosted in `assets/bricolage-*.woff2`,
  variabel wght 400-800, `--disp`-token). Alleen Latijnse subsets (latin/latin-ext/vietnamese);
  zh/ar/cyrillisch/hindi vallen via de fontstack correct terug op Noto/systeem. `font-display:swap`.
- **Body:** systeemstack met Noto Sans SC voor CJK (regel 1 van style.css).
- Geen CDN-fonts (CSP `font-src 'self'`); nieuwe fonts altijd zelf hosten + in `build.js` naar `dist/` kopiëren.

## Kwaliteitsborging
- `/impeccable audit` (detector) draaien op de gerenderde landing; doel = **0 anti-patterns**.
  Verificatie via `wrangler dev --local` + Playwright (desktop/mobiel) vóór deploy; na deploy
  de edge-cache negeren (eerste run vlak na deploy kan stale zijn, cache-bust met `?v=`).
- Schaduwen op donkere vlakken: strak en near-black (gegronde elevatie), nooit gekleurde glow
  (dark-glow = AI-tell). Koptekst-tracking niet strakker dan -.04em.

## Kleurtokens (licht)
Canoniek in `:root`. `--brand*` blijven bestaan als **alias** naar deze waarden
(geen enkel bestaand component breekt).

| Token | Waarde | Gebruik |
|---|---|---|
| `--dd-navy` | `#0b1e3d` | koppen, header-gradient donker, primaire tekst-op-licht accent |
| `--dd-navy2` | `#123262` | header-gradient licht, hover |
| `--dd-blauw` (`--brand`) | `#1f6feb` | links, primaire knop-alt, voortgang |
| `--dd-blauw-d` (`--brand-dark`) | `#14488f` | tekst-op-licht, focus |
| `--dd-geel` | `#ffd23f` | primaire CTA, actief accent (wegmarkering) |
| `--dd-geel-d` | `#8a6d00` | tekst op geel (AA-contrast) |
| `--dd-papier` (`--bg`) | `#f6f8fc` | paginagrond |
| `--card` | `#ffffff` | kaarten |
| `--dd-inkt` (`--ink`) | `#16233a` | bodytekst |
| `--muted` | `#5b6b7b` | secundaire tekst |
| `--dd-rand` (`--line`) | `#dfe6f1` | randen |
| `--dd-groen` (`--ok`) | `#1a7f4b` | succes/afgevinkt |
| `--dd-rood` | `#c0392b` | fout/waarschuwing |
| `--dd-schaduw` (`--shadow`) | `0 10px 30px -12px rgba(11,30,61,.25)` | verhoging |

## Kleurtokens (donker) — `@media (prefers-color-scheme: dark)`
Alleen de tokens worden omgezet; componenten erven. Contrast ≥ WCAG AA.

| Token | Donker |
|---|---|
| `--dd-papier`/`--bg` | `#0b1424` |
| `--card` | `#111d33` |
| `--dd-inkt`/`--ink` | `#e7edf6` |
| `--muted` | `#9fb0c4` |
| `--dd-rand`/`--line` | `#24344f` |
| `--brand`/`--dd-blauw` | `#5c98f2` (lichter voor contrast op donker) |
| `--brand-dark` | `#bcd4fb` (tekst-op-donker) |
| `--accent` | `#16294a` |
| header/CTA-geel | ongewijzigd (geel werkt op beide) |

## Typografie
Systeem-fontstack, geen externe fonts (performance + betrouwbaarheid):
`-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC",
"Microsoft YaHei", Roboto, Helvetica, Arial, "Noto Sans Arabic", sans-serif`.
Schaal (rem, mobile-first, fluid via `clamp` waar zinvol):

| Rol | Grootte |
|---|---|
| h1 | `clamp(1.6rem, 1.2rem + 2vw, 2.2rem)` |
| h2 | `clamp(1.25rem, 1.05rem + 1vw, 1.5rem)` |
| h3 | `1.1rem` |
| body | `1rem` / regelhoogte `1.65` |
| klein | `.85rem` |

CJK/Arabisch: `line-height` iets ruimer; RTL via bestaande `dir="rtl"` voor `ar`.

## Spacing & radius
Schaal: `4 · 8 · 12 · 16 · 24 · 32 · 48`. Radius: klein `8px`, kaart `14–16px`,
pil `999px`. Touch-doelen **minimaal 44×44px** (knoppen, nav-links, afvink).

## Componenten (bestaand + te verzorgen)
- **Header**: sticky, navy→blauw gradient; nav met categorieën (Dashboard, 🚗 Praktijk,
  📘 Theorie, 🧭 Info, 🎓 Examen). Op mobiel: **hamburger < 720px (LIVE 16-7-2026)**: `.navburger` (44px, aria-expanded, balkjes→kruis), nav klapt uit als kolom, sluit op linkklik en Escape; label via i18n-key `nav.menu` (12 talen).
- **Kaart** (`.card`, `.sectiekaart`, `.modkaart`): wit, subtiele schaduw, hover-lift.
- **Cursusbalk** (`.coursenav`): linker menubalk, secties → modules → onderdelen + scrollspy.
- **Voortgang**: ring (`.ring`), balk (`.balkje`), vinkjes.
- **CTA** (`.cta`): geel, pil, duidelijke schaduw; `.klein`/`.groot` varianten.
- **Chips**: `p-fout` (rood-zacht), `p-tip` (geel-zacht), `preview`/🔒.
- **Quiz-UI**, **flashcards**, **prijskaarten**: bestaand, blijven consistent.

## Illustratiestijl (eigen SVG, rechtenvrij)
- **Lijnstijl-iconen** 24×24, `stroke` via `currentColor`, ronde hoeken.
- **Conceptdiagrammen** (`.figsvg`): vlak, egale merkkleuren met zachte gradiënt,
  tekst met witte `paint-order`-stroke voor leesbaarheid; meertalige `title`/`aria-label`.
- Verkeerssituaties in **bovenaanzicht**; auto's als herbruikbare componenten
  (blauw/grijs/rood/teal paletten). Geen boekbeeld (auteursrecht, kader §4).
- Nieuwe diagrammen leven in `graphics.js` (server-side inline SVG in `worker-content.js`).

## Toegankelijkheid (hard)
- Eén `<h1>` per pagina; correcte `lang` per taaldeel; skip-link aanwezig.
- Focus-visible zichtbaar; `prefers-reduced-motion` respecteren (transities uit).
- Contrast ≥ AA; geen tekst puur op kleur zonder contrastcheck.
- Alle SVG/beeld met `title`/`aria-label` of `aria-hidden` indien decoratief.

## Landing: hip redesign (16-7-2026) — LIVE
De publieke landing (`/`) is een **op zichzelf staand donker design**, gescoped onder `.hp`
(worker.js `landingBody`), los van de lichte app-shell. `page()` draait de landing in
**solo-modus** (`o.solo`): eigen donkere nav + footer i.p.v. `header.site`; `body.hp-body`
zet de donkere grond.
- **Palet (2026, research-gedreven):** zinc near-black `#0a0b0e`; gradient
  **electric cobalt `#3d6fff` → cyaan `#22d3ee` → lime `#b8f23d`**; off-white tekst
  `#f3f5f8` (elevated neutral, geen puur wit). Bewust wég van de generieke violet/paars
  "AI-gradient". Lime = pop-accent.
- **Stijl:** glasmorfisme (`backdrop-filter`), ambient gloed-blobs (lighting, geen decoratie),
  zwevende taal-bubbels, talen-marquee, glas-productkaart met conische voortgangsring,
  ronde hoeken (14-26px). Koppen in Bricolage. Contrast ruim > AA op donker (doorgerekend).
- **Login-knop** rechtsboven in de landing-nav (+ toegevoegd aan de gedeelde publieke nav).
- **Meertalig** via bestaande i18n-keys + NL/EN-patroon (geen nieuwe gegenereerde keys).
- **Rollback:** git-tag `voor-hip-redesign` (commit vóór de omzetting).
- **Nog niet omgezet:** de in-app pagina's (cursusroute, lespagina, dashboard) staan nog in
  het lichte navy/geel-systeem; die kunnen in een volgende fase mee.

### Hero-rijfoto (16-7-2026)
De landing-hero toont `assets/landing-hero.webp` (AI-gegenereerde NL-rijlesscène,
rechtenvrij, geen leesbaar kenteken) als fotokaart in `.hp-showcard`; de glas-kaart
overlapt de onderrand (`:has(.hp-foto)`-regel), orbit-taalbubbels blijven. Foto laadt
eager/fetchpriority=high met vaste width/height (geen CLS).
