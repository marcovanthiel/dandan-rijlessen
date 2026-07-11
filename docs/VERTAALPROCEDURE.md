# Vertaalprocedure: nieuwe lestaal toevoegen

Reproduceerbaar draaiboek (voor het eerst uitgevoerd 10-7-2026 voor 10 talen).
Kosten: geen, mits uitgevoerd met Claude-subagents binnen het abonnement.
Vertaalmodel: Opus (afspraak Marco). Review: door een moedertaalspreker in de
live omgeving, in te plannen vóór actieve campagnes in die taal.

## Stappen
1. Controleer dat de taalcode (ISO, 2 letters) in `i18n.js` bestaat (chrome).
   Nieuwe chrome-taal? Voeg een blok met alle sleutels toe en draai de
   pariteitscheck (commando staat in DEPLOY.md).
2. Voeg de taal toe aan STAPWOORD in `build.js` en `features.js`.
3. Start een subagent (model: Opus) met het promptsjabloon hieronder.
4. Valideer: `./valideer-taal.sh <code>` — alles moet groen zijn
   (16/16 bestanden, 0 dashes, 85/85 vragen, 48 stap-delen, 52 foto-delen).
5. Commit `content/<code>/`, `content/vragen-vertalingen/<code>.json` en de
   geregenereerde `worker-content.js`; push (CI deployt).
6. Live-steekproef: testaccount op die taal zetten (/account), één
   theoriepagina en één examenvraag controleren.
7. De build weigert onvolledige talen automatisch (veiligheidsklep), dus een
   halve ronde kan nooit live komen.

## Promptsjabloon voor de vertaal-subagent
Vervang {TAAL} (bv. KOREAANS) en {code} (bv. ko); geef de agent model Opus.

---
Je bent vertaler voor het leerplatform Dandan Drive (werkmap
/Users/mvt/Developer/dandandrive). Vertaal de volledige lesinhoud naar het
{TAAL} (taalcode {code}). Doelgroep: volwassenen die in Nederland het
rijbewijs B halen; toon helder en instructief.

BRONNEN (lezen):
- content/zh/*.md (16 lesbestanden; Chinese lestekst, Nederlandse referentiekoppen)
- content/vragen/vragen-kennis.json en content/vragen/vragen-gevaar.json
  (85 vragen; veld "nl" is de brontekst, "zh" is toonreferentie)
- content/lexicon.json (verkeersterminologie; gebruik EXACT vert.{code})

MAAK:
1. Map content/{code}/ met 16 bestanden, BESTANDSNAMEN IDENTIEK aan content/zh/.
2. content/vragen-vertalingen/{code}.json

HARDE FORMAATREGELS (parser breekt anders):
- Frontmatter behouden; titel vertaald (quotes bij dubbele punt in de waarde).
- H1: "# {vertaalde titel} · {Nederlands deel exact zoals na de laatste ' · '
  in de bron}"; in het vertaalde deel NOOIT " · " (module 5: komma-opsomming).
- Sectiekoppen "## {vertaling} ({Nederlands deel exact uit de bron})".
- Praktijk-stapkoppen: "### Stap N · {vertaalde titel} ({NL exact})"; het
  letterlijke woord "Stap" met westers nummer (ook 27a/27b/29a/29b) is
  verplicht; 48 stuks totaal.
- Blockquotes/lijsten/vet behouden; doelgroep-intro aanpassen aan de editie.
- Nederlandse verkeerstermen zichtbaar naast de vertaling waar de bron dat doet.
- VERBODEN: em-dash en en-dash; gebruik komma, dubbele punt of koppelteken.
- {code}.json: JSON-object met ALLE 85 vraag-id's; per id
  {"v": "...", "opts": [zelfde aantal en volgorde], "uitleg": "..."}.

VERBODEN: andere bestanden wijzigen, git-commando's, build draaien.
Controleer zelf voor afronden: 16 bestanden, {code}.json met 85 sleutels en
identieke id-set, 48 Stap-koppen, geen verboden streepjes.
Rapporteer kort: aantallen en twijfelpunten.
---

## Bij contentwijzigingen (bestaande talen bijwerken)
Wijzigt een hoofdstuk of komen er vragen bij: geef een subagent per taal
alleen de gewijzigde bestanden/vraag-id's met hetzelfde sjabloon (sectie
"MAAK" beperken tot de delta). Valideer en push identiek.

## Verrijking per rijstap (sinds 11-7-2026)
De praktijkmodules bevatten per stap een of twee verrijkingsparagrafen:
"veelgemaakte fouten" en "examentip" (plus een examendag-checklist in module 5).
De build herkent ze aan het VETTE LABEL aan het begin van de paragraaf en
rendert er gekleurde chips van (p-fout amber, p-tip rood). De labels staan
per taal vast in `build.js` (LABEL_FOUT / LABEL_TIP); vertalers gebruiken ze
EXACT, vet, met dubbele punt binnen het vet: bv. "**Częste błędy:** tekst".
Nieuwe lestaal? Voeg de taal ook aan LABEL_FOUT/LABEL_TIP toe.
