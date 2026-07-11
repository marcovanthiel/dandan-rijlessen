# DESIGN — Dandan Drive designsysteem

Eén bron van waarheid voor de visuele taal. Doel: modern, betrouwbaar (rijschool),
internationaal (11 lestalen, Latijn + CJK + Arabisch/RTL), mobile-first.

## Merkidee
"Onderweg" — nachtblauw als betrouwbare basis, wegmarkering-geel als accent/actie.
Rustig, professioneel, met speelse verkeers-iconografie in eigen SVG.

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
  📘 Theorie, 🧭 Info, 🎓 Examen). Op mobiel: hamburger/collapse < 720px (backlog).
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
