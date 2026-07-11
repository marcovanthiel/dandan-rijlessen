# EINDRAPPORT — Middagopdracht dandandrive.nl (11/12-7-2026)

_Managementsamenvatting. Detail in AANNAMES.md, VERBETERBACKLOG.md, DESIGN.md, FOTO-OPDRACHTEN.md en docs/varianten/._

## Missie
Autonome verbeterronde op het live platform dandandrive.nl (betalende gebruikers).
Herstelpunt: git-tag **`voor-middagopdracht-20260711`**. Werkwijze: loops van
audit -> backlog -> bouwen -> verifieren -> deploy -> loggen. Geen tussenvragen; keuzes
als aanname vastgelegd.

## Gerealiseerd per loop
- **Loop 1 - fundament** (539ed9b): audit; DESIGN.md, AANNAMES.md, VERBETERBACKLOG.md, FOTO-OPDRACHTEN.md, EINDRAPPORT.md.
- **Loop 2 - onderzoek C** (63dce1c): webonderzoek AM/A/BE (CBR/RDW/Rijksoverheid, 2026) in docs/varianten/; architectuurbevinding: sectielijst hardcoded op ~6 plekken.
- **Loop 3 - AM live** (097eeff): sectie am, /am-1 NL+ZH, gated, 1e deel gratis preview. Additief in parser/slug/routing/gated/courseNav/dashboard/i18n (sectie.am/motor/aanhanger 12 talen, pariteit OK). **Veiligheidsklep gefixt**: variant-secties tellen niet mee voor taal-compleetheid -> 9 talen behouden (waren anders uit de bundel gevallen).
- **Loop 4 - BE/aanhanger live** (ca2188f): sectie aanhanger, /aanhanger-1 NL+ZH. Kg-grenzen: B <= 3.500, code 96 <= 4.250, BE tot ~7.000 kg.
- **Loop 5 - A/motor live** (7d8bf1e): sectie motor, /motor-1 NL+ZH. A1/A2/A-opbouw, code 80, theorie 41/50, AVB (EUR 83) + AVD (EUR 147), beschermende kleding.
- **Loop 6 - vertaalronde** (lopend): 9 subagents vertalen de 3 variantsecties naar tr, ar, pl, uk, ru, es, pt, hi, vi (lexicon-terminologie, exact format). Daarna build + valideer-taal.sh + deploy.

Elke deploy geverifieerd (build slaagt, taalvalidatie OK, homepage 200, nieuwe routes gated 302->login = paywall intact, artnijmegen.nl 301-redirect intact).

## Stand deelopdrachten
- **C (varianten): grotendeels af** - AM/A/BE live in NL+ZH; overige 9 talen in loop 6.
- **A (grafische layout): nog te doen** - designsysteem in DESIGN.md; implementatie (tokens harmoniseren, dark mode, sterkere landing, mobiele nav) volgt.
- **B (visualisatie lesstof): nog te doen** - inventaris + eigen SVG-diagrammen.

## Aannames (samengevat; volledig in AANNAMES.md)
1. Uitvoeren op de Mac mini, dezelfde repo; alleen deze machine draait de opdracht (anders git/OneDrive-botsing).
2. [besluit Marco] Een pas geeft toegang tot alle varianten (geen prijs per variant).
3. Bouwvolgorde AM -> BE -> A. Nieuwe content eerst NL+ZH, rest via vertaalronde.
4. Varianten als eigen sectie in de bestaande structuur (additief); schoner "rijbewijs-kiezer"-model staat in de backlog.

## Te verifieren (feitelijk)
- Geldigheidsduur theoriecertificaat motor (mogelijk 36 mnd; niet bevestigd op CBR-pagina).
- Helmregels snorfiets per situatie/gemeente.
- Exacte code 96-route bij individuele rijscholen.
- Les-/opleidingsprijzen (marktafhankelijk). Bronvermelding onder elke variantsectie + docs/varianten/.

## Te reviewen (visueel, door Marco)
Bouwomgeving heeft geen headless browser; pixel-/360px-QA, dark-mode-contrast en de grafische redesign moeten visueel bekeken worden. Daarom is de redesign nog niet blind gedeployed.

## Besluiten/acties voor Marco
- [besluit] Toegangsmodel varianten (een pas vs prijs per variant).
- [coordinatie] MacBook deze opdracht niet parallel laten draaien.
- [review] Native taalreview van de 9 machinevertalingen voor campagnes.

## Welke vraag hebben we niet gesteld?
"Voor wie is dit platform primair?" Merk (Dandan/丹丹) en historie wijzen op de Chinese doelgroep als kern, terwijl de 11-talige opzet iedereen gelijk bedient. Aanname: structuur taalneutraal houden, Chinese landing het sterkst laten overtuigen.
