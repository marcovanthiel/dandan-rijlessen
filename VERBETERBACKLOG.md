# VERBETERBACKLOG — dandandrive.nl

Status: `[ ]` open · `[~]` mee bezig · `[x]` gereed · `[M]` besluit Marco vereist.
Prioriteit: **P1** hoogste leerling-/conversie-impact.

## Loop 1 — audit 11-7-2026 (HEAD d17802e)
Bevindingen uit statische audit (landing-HTML + `assets/style.css` 372 regels + worker.js/features.js). Visuele/360px-QA nog te doen door Marco (geen headless browser in deze omgeving).

### A · Grafische layout (grootste prioriteit)
- [x] **P1** Designsysteem vastleggen (DESIGN.md) — twee overlappende tokensets (`--brand*` + `--dd-*`) harmoniseren met aliassen.
- [~] **P1** Dark mode via `prefers-color-scheme` (nu 0 regels; opdracht wil dit) — tokens omzetten, componenten erven.
- [ ] **P1** Landing sterker maken: nu 1 hero + usps + 1 CTA + 1 beeld. Toevoegen: heldere waardepropositie, 3 duidelijke ingangen (theorie / simulator / praktijk), social proof/reviews prominenter, vertrouwenselementen (bronnen, gratis Info-sectie uitlichten).
- [ ] **P1** Mobiele navigatie: header-nav is een platte flex die op smal scherm rommelig kan worden; hamburger/collapse < 720px met duimvriendelijke items ≥44px.
- [ ] **P2** Homepage-hero met eigen SVG-illustratie (weg/auto/verkeer) i.p.v. tekst-only.
- [ ] **P2** Consistente kaart-/spacing-schaal doorvoeren (4/8/12/16/24/32/48).
- [ ] **P3** Micro-interacties (CSS-only): hover-lift, focus-ringen, subtiele transities (met reduced-motion-uitzondering).

### B · Visualisatie lesstof
- [ ] **P1** Inventarisatie per theoriehoofdstuk (1–11) + per simulator-onderwerp: waar dient een diagram het leerdoel (voorrang, borden, dode hoek, remweg, rotonde, inhalen). Vastleggen als sublijst hieronder.
- [ ] **P2** Nieuwe eigen SVG-conceptdiagrammen in `graphics.js` per bruikbaar onderwerp, meertalige `title`/`aria-label`.
- [ ] **P2** Zelftoetsvraag per theoriehoofdstuk (koppelen aan bestaande vragenbank/onderwerp).
- [ ] **P3** Waar een foto beter werkt dan SVG → placeholder + opdracht in FOTO-OPDRACHTEN.md.

### C · Nieuwe rijbewijsvarianten (AM, A, BE)
- [x] **P1** Webonderzoek AM / A / BE (CBR/RDW/Rijksoverheid) — af; bronmateriaal in `docs/varianten/{AM-bromfiets,A-motor,BE-aanhanger}.md` met kg-grenzen, tarieven 2026, examenopzet, fouten/tips, bronnen, TE-VERIFIËREN-punten.
- [ ] **P1** **Sectieregister centraliseren (blokkeert schone variant-uitrol).** De sectielijst `['praktijk','theorie','info']` is nu hardcoded op ~6 plekken: build.js (regel 144 sectie-detectie, 180 slug, 281 fig, 452 preview, 485 pmap), worker.js (185 courseNav, route-regex + gated-lijst), features.js (dashboard secKaart 66 + iconen), i18n `sectie.*`, sitemap. Eerst één centrale definitie (sectie → prefix, slug-prefix, icoon, i18n-key, preview-regel) maken; daarna schalen varianten zonder 6× te editen.
- [ ] **P1** Sectie-architectuur varianten: naast B in navigatie, sidebar, dashboard, sitemap, zoekfunctie. Aanname toegangsmodel A2 ([M]). Model: elke variant = eigen sectie(s) (bijv. `am-theorie`, `am-praktijk` of één `am`-sectie), of overkoepelende "rijbewijs-kiezer". Beslissen in de bouw-loop; motiveren in AANNAMES.
- [x] **P1** AM-variant live (loop 3, commit 097eeff): sectie `am`, `/am-1` NL+ZH, gated, 1e deel gratis preview; parser/routing/courseNav/dashboard/i18n additief; **veiligheidsklep gefixt** (variant-secties tellen niet mee voor taal-compleetheid → 9 talen behouden). Wiring ondersteunt nu am/motor/aanhanger.
- [x] **P1** BE/aanhanger live (loop 4, ca2188f) NL+ZH; A/motor live (loop 5, 7d8bf1e) NL+ZH.
- [x] **P2** Alle 3 varianten vertaald naar de overige 9 lestalen (loop 6, 5f5960f) via 9 parallelle subagents; alle 11 talen = 20 modules, 3 varianten; validatie OK, live. Native taalreview = openstaand (zie hieronder).
- [ ] **P2** Native taalreview van de 9 machinevertalingen van AM/A/BE vóór campagnes (o.a. hi: "vermogen" → correcte term i.p.v. transliteratie).
- [ ] **P2** Vertaling nieuwe content naar overige 9 lestalen (VERTAALPROCEDURE.md).
- [ ] **P2** Eigen oefenvragenset per variant waar zinvol (AM-theorie).
- [M] **P2** Prijs/pas per variant of één pas voor alles (aanname A2 = één pas).

### Techniek/kwaliteit
- [ ] **P2** Geautomatiseerde linkcheck-script toevoegen (interne links/anchors).
- [ ] **P3** Performance: controleren dat er geen render-blocking of ongebruikte CSS is; webp lazy (al gedaan voor lesfoto's).
- [ ] **P3** `prefers-reduced-motion` audit over alle transities.

## Onderwerpen-inventaris visualisatie (vullen in loop B)
_(per theoriehoofdstuk: onderwerp → gewenst diagram → status)_
