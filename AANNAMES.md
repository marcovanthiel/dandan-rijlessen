# AANNAMES — Middagopdracht dandandrive.nl (11-7-2026)

Elke aanname: tijdstip · keuze · motivering · alternatief. Bij "besluit Marco vereist" wordt live niets onomkeerbaars gewijzigd.

## A1 · Uitvoeringsmachine en pad
- **11:20 · Keuze:** de opdracht wordt uitgevoerd op de **Mac mini** in `~/Projects/dandan-rijlessen` (dezelfde GitHub-repo `marcovanthiel/dandan-rijlessen` als het in de opdracht genoemde `~/Developer/dandandrive`).
- **Motivering:** de opdracht draait waar Marco hem gaf; het is dezelfde repo/branch, dus productie is identiek. Backup-tag `voor-middagopdracht-20260711` staat op de remote.
- **Coördinatierisico (niet in de opdracht benoemd):** twee machines die tegelijk autonoom bouwen én deployen op dit live betaalplatform botsen op git en OneDrive. **Aanname:** alleen deze machine voert de opdracht uit; de MacBook draait hem niet parallel. Vóór elke deploy: `git fetch` + rebase.
- **Alternatief:** op de MacBook draaien — afgewezen omdat Marco de opdracht hier gaf.

## A2 · Toegangsmodel varianten — BESLIST DOOR MARCO (12-7): aparte pas per rijbewijs
- **12-7 · Besluit Marco:** de cursist neemt content **per rijbewijs** af. Er is dus een **aparte (maand)pas per variant**: één voor B (auto), één voor AM, één voor A/motor, één voor BE/aanhanger. (Vervangt mijn eerdere aanname "één pas voor alles".)
- **Implementatie:** elke pas heeft een **scope** (`all`/`b`/`am`/`motor`/`be`); migratie 0003 op live-D1 (default `all`). Toegang per sectie via `magSectie` (worker.js): admin altijd; anders een actieve pas met scope `all` of de scope die bij de sectie hoort. Sectie→scope: praktijk/theorie/info→`b`, am→`am`, motor→`motor`, aanhanger→`be`. Oefenexamen en boek-index vallen onder `b`.
- **Grandfather:** bestaande passen kregen scope `all` (behoud volle toegang). Er waren 0 bestaande passen, dus niemand geraakt. Admin (marco@) behoudt volledige toegang.
- **Nog open [besluit Marco]:** de **prijzen per variant** (bijv. maandpas AM/A/BE). Nu uit te geven via **/admin** (pas + rijbewijs-scope) en later via de betaalflow. Publieke per-variant prijs-UI = follow-up (betalen loopt nog via admin/voucher; WeChat Pay pending).
- **Te verifiëren door Marco (ingelogd):** admin heeft nog volle toegang; een test-user met alleen een B-pas ziet B maar niet AM/A/BE; /account toont de pas(sen) met rijbewijs-label. (Deze bouwomgeving heeft geen ingelogde browsertest; logica is met 8 scenario's lokaal geverifieerd.)

## A3 · Bouwvolgorde varianten
- **11:20 · Keuze:** volgorde **AM → BE → A**. AM: grootste jonge doelgroep en laagste drempel (16 jaar, veel bromfietsers). BE/code 96: veel B-rijbewijshouders met caravan/aanhanger, puur praktijk (weinig content-risico). A (motor) als laatste: meest complex (A1/A2/A-opbouw).
- **Motivering:** "liever twee volledig af dan drie half" (§7). Grootste verwachte vraag + laagste bouwrisico eerst.
- **Alternatief:** A eerst (hoge marge/motivatie) — afgewezen wegens complexiteit.

## A4 · Nieuwe content eerst NL+ZH
- **11:20 · Keuze:** nieuwe variant-content en info gaat eerst live in **NL en ZH**; de overige 9 lestalen komen als expliciete backlogtaak (kader §4 staat dit toe).
- **Motivering:** snelheid en correctheid; vertaling naar 9 talen via `docs/VERTAALPROCEDURE.md` in aparte loops met validatie.
- **Alternatief:** wachten tot alle talen klaar zijn — afgewezen (te traag, blokkeert oplevering).

## A5 · Design: één tokensysteem
- **11:20 · Keuze:** de twee overlappende tokensets in `assets/style.css` (`--brand*` en `--dd-*`) worden geharmoniseerd tot één canoniek systeem (zie DESIGN.md), zonder de bestaande visuele identiteit ("Onderweg", nachtblauw + wegmarkering-geel) weg te gooien. `--brand*` blijft als alias naar de `--dd-*`-waarden bestaan zodat geen enkel component breekt.
- **Motivering:** consistentie zonder regressie; refactor is veilig als aliassen behouden blijven.
- **Alternatief:** alles herschrijven — afgewezen (breekt componenten, hoog risico op live platform).

## A6 · Verificatie zonder headless browser
- **11:20 · Keuze:** verificatie per loop = build-check + `valideer-taal.sh` + geautomatiseerde linkcheck + live HTTP-check + statische controle (regex) op contrast/lang/overflow-risico's. Volledige visuele/pixel-QA en 360px-rendering vereist een browser die in deze omgeving ontbreekt; die punten worden gemarkeerd als "visueel te reviewen door Marco" in EINDRAPPORT.
- **Motivering:** eerlijk over wat wél/niet headless verifieerbaar is; liever een veilige, controleerbare wijziging dan een blind gedeployde redesign die de paywall breekt.
- **Alternatief:** grote visuele redesign blind deployen — afgewezen (betalende gebruikers, §10).
