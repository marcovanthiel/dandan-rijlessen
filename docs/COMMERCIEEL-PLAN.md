# Commercieel plan Dandan's rijlessen

| | |
|---|---|
| Status | Concept ter besluitvorming |
| Datum | 9 juli 2026 |
| Auteur | Marco van Thiel (met Claude) |
| Doel | Van gratis lesmateriaal naar commercieel leerplatform |

## 1. Gevraagde besluiten

1. **Merknaam en domein: voorstel "Dandan Drive" (dandandrive.nl).**
   Voorgesteld 9-7-2026: persoonlijk merk rond Dandan (werkt op TikTok en in
   alle talen; sluit aan op de bestaande merkfamilie met dandanshop), "Drive"
   is internationaal begrijpelijk. dandandrive.nl is vrij (RDAP-check
   9-7-2026); .com is bezet, acceptabel omdat de doelgroep in Nederland woont.
   Registratie na akkoord Marco; artnijmegen.nl wordt redirect.
2. **Prijsmodel: BESLOTEN 9-7-2026** (voorstel Claude, akkoord Marco):
   periode-passen zonder automatische verlenging, met voor de doelgroep
   gelukkige prijspunten: **3 maanden €38, 6 maanden €58, 12 maanden €88**.
   Gratis account = ~2% preview. Kortingscodes per campagne.
3. **Betaalprovider: HERZIEN door besluit 5.** Stripe was het advies voor een
   NL-onderneming, maar Stripe bedient geen ondernemingen op het Chinese
   vasteland. Met de Chinese registratie (besluit 5) ligt een **native
   WeChat Pay/Alipay-handelsaccount** voor de hand; dat lost de
   WeChat Pay-wens direct en zonder omweg op. Definitieve keuze zodra de
   Chinese entiteit vaststaat; iDEAL/kaarten voor niet-Chinese klanten
   vergt dan een aanvullende route (te onderzoeken in fase 0).
4. **Doeltalen: BESLOTEN 9-7-2026**: Chinees eerst (staat); nieuwe talen
   activeren op klantvraag uit de kandidatenlijst (Arabisch, Turks, Pools,
   Oekraïens, Spaans, Portugees, Hindi, Vietnamees, Koreaans, Japans, Thai);
   de vertaalpijplijn (§7) maakt dat configuratie in plaats van bouwwerk.
5. **Juridische basis: BESLOTEN 9-7-2026 = commercie via registratie in
   China.** De onderneming en de commercie worden in China geregistreerd;
   Chinese commerciële voorwaarden zijn het uitgangspunt. Consequenties om
   in fase 0 te verifiëren (geen juridisch advies, wel harde aandachtspunten):
   - Verkoop aan consumenten die in de EU wonen: EU-consumentenrecht en de
     AVG gelden voor EU-klanten ongeacht het vestigingsland van de verkoper;
     de voorwaarden worden dus Chinees mét een EU-paragraaf. Juridische
     check inplannen.
   - Hosting kan op Cloudflare blijven (buiten China). Moet de site ook vlot
     bereikbaar zijn ín China (klanten die zich vóór emigratie oriënteren),
     dan is een ICP-licentie + hosting in China nodig; kan met de Chinese
     entiteit, besluit in een latere fase.
   - Domein: dandandrive.nl blijft het voorstel voor de doelgroep in
     Nederland; dandandrive.cn lijkt vrij (rdap.org-check 9-7-2026, bij
     registratie definitief verifiëren) en is defensief het overwegen waard.

## 2. Doel en uitgangspunten

- Eén platform met de praktijkopleiding (RIS, bestaat) én een nieuwe
  **theoriemodule rijbewijs B**; later uitbreidbaar met andere rijbewijsvarianten.
- **Gratis account** ziet ~2% van de content (proefles + enkele oefenvragen);
  volledige toegang na betaling.
- De site is een **aanvulling op het boek**: het boek wordt aangeraden (met
  duidelijke verwijzing en boekpagina-badges), niet verplicht.
- Talen: lescontent in de taal van de klant; **niet** NL/EN als lestaal (daar
  is het boek voor en het examen is in NL/EN). De **frontpagina/marketing wel
  in NL en EN**, plus alle doeltalen.
- Taal kiezen kan vóór het inloggen (eerste pagina); ingelogde klanten krijgen
  altijd hun taalvoorkeur.
- Auteursrecht blijft hard: originele teksten en eigen beeld, nooit
  boekmateriaal of CBR-examenvragen kopiëren.

## 3. Scope

**In scope:** accounts + betaald toegangsmodel, theoriemodule B met
oefenvragen/proefexamens, meertaligheid met taalvoorkeur, kopieer-remming,
marketing-inrichting (SEO, social, campagne-tracking), e-mailflows.
**Buiten scope (nu):** andere rijbewijsvarianten, native apps, WeChat-login,
fysieke producten, B2B-portaal (wel als optie in §9).

## 4. Doelarchitectuur

Van statische site naar het standaard-portaalpatroon van onze sites
(website-standaard-skill): **Cloudflare Worker (Hono) + D1 + R2**, GitHub =
bron, CI-deploy.

- **Content**: `content/*.md` blijft de NL-canon (bron van waarheid); een
  build-stap zet die om naar gestructureerde lesdata in D1, per taalvariant.
  Lescontent wordt **server-side** gerenderd, per ingelogde gebruiker, nooit
  als bulk-JSON naar de browser.
- **Publieke laag** (statisch, SEO): landingspagina's per taal + NL/EN,
  proefcontent, prijzen, veelgestelde vragen.
- **Auth**: e-mailcode/magic-link (bewezen patroon rotary/beroepenavond),
  accounttabel met taalvoorkeur, pasgeldigheid en voortgang.
- **Betalen**: checkout van de gekozen provider (zie besluit 3; native WeChat
  Pay/Alipay bij Chinese entiteit); de **webhook/notificatie is de bron van
  waarheid** voor de toegangsstatus; bevestiging + factuur via Resend.
- Bestaande kwaliteitsbasis blijft: strikte CSP, alles self-hosted, WCAG,
  cookieloze eigen statistiek (uitgebreid met conversie).

## 5. Fasering

| Fase | Resultaat | Afhankelijk van |
|---|---|---|
| 0. Fundament | Besluiten §1 genomen; domein geregistreerd; juridische teksten | Marco |
| 1. Platform | Worker + D1 + auth + accounts + taalvoorkeur; content server-side met 2%-preview; publieke NL/EN-landing | Fase 0 |
| 2. Betalen | Checkout via provider uit besluit 3 (WeChat Pay/Alipay native); periode-passen; webhook + mails; belasting/facturen | Fase 1 |
| 3. Theoriemodule | Eigen theoriecontent B + oefenvragen-engine (quizzen, proefexamens met tijdslimiet, voortgang, foutenanalyse) | Fase 1 |
| 4. Kopieer-remming | Maatregelenpakket §6 volledig actief | Fase 1 |
| 5. Marketing | SEO/hreflang per taal, OG/TikTok-assets, UTM + conversiemeting, leadmagneet, kortings-/campagnecodes, drip-mails | Fase 2 |
| 6. Talen op aanvraag | Vertaalpijplijn NL-canon → doeltaal (AI + terminologielexicon NL-verkeerstermen, per taal gereviewd), taal activeren = configuratie | Fase 1 |

Fasen 2, 3 en 4 kunnen deels parallel; elke fase eindigt live en geverifieerd
volgens de kwaliteitsstandaard.

## 6. Kopieerbescherming: eerlijk verhaal

100% onkopieerbaar bestaat niet (een scherm kan altijd gefotografeerd worden).
We maken kopiëren **onaantrekkelijk, beperkt en herleidbaar**:

1. Server-side paywall: alleen betaalde accounts krijgen content, per les
   opgevraagd; geen bulk-endpoints, geen client-side "verborgen" content.
2. Rate limiting + gedragsdetectie (te veel pagina's te snel = tijdelijke rem).
3. Sessiebeheer: beperkt aantal gelijktijdige apparaten per account.
4. **Forensisch watermerk**: accountgebonden markering in tekst en beeld
   (zichtbaar subtiel + onzichtbaar), zodat gelekte content herleidbaar is.
5. Kopieer-remming in de browser: user-select uit, kopieer/print-events
   geblokkeerd op lespagina's, geen PDF-export.
6. Beelden via R2 met accountgebonden, kortlevende URL's; hotlink-bescherming.
7. Juridisch: voorwaarden verbieden delen; accountblokkade bij misbruik.

## 7. Meertaligheid

- **Taal in de URL** voor publieke pagina's (SEO + hreflang, dandanshop-patroon);
  taalkiezer op de eerste pagina; ingelogd = taalvoorkeur uit het account.
- NL-canon in `content/`; doeltalen gegenereerd via AI-vertaling met een
  **terminologielexicon** (NL-verkeerstermen blijven overal zichtbaar naast de
  vertaling, zoals nu bij Chinees; het examen is immers in het NL/EN).
- Nieuwe taal toevoegen = lexicon + vertaalronde + review; geen structuurwerk.
- Frontpagina ook in NL en EN (marketing en uitleg voor rijscholen/partners).

## 8. Marketing-inrichting

- SEO-landing per taal en per onderwerp ("rijbewijs B theorie in het
  [taal]"), hreflang/canonical, OG- en TikTok-kaarten met eigen beeld.
- Campagnemeting zonder cookies: UTM-parameters + server-side conversielog in
  D1 (bezoek → gratis account → betaald), dashboard in admin.
- Leadmagneet: gratis proefles + 10 oefenvragen na accountaanmaak (de 2%).
- Kortings- en campagnecodes (per TikTok-video/influencer traceerbaar).
- Deelbare resultaatkaarten ("Ik scoorde 42/50 op het proefexamen") als
  organische groeimotor.
- E-mailflows (Resend): welkom, studieplanning, "je pas verloopt", win-back.

## 9. Verbetervoorstellen (bevestigde backlog, uitvoering later; besluit Marco 9-7-2026)

1. **Oefenexamen-simulator als kernproduct**: CBR-achtige opzet (tijdslimiet,
   vraagtypen, direct feedback, foutenanalyse per onderwerp): dit is waar
   klanten voor betalen; de lesstof is de onderbouwing.
2. **Voortgang en leerpad**: per stap/onderwerp afvinken, "klaar voor examen"-
   indicator, studieschema richting examendatum.
3. **Begrippentrainer/flashcards** NL-verkeerstermen ↔ doeltaal, met audio-
   uitspraak van de NL-termen.
4. **Rijschool-partnerprogramma (B2B)**: rijscholen kopen passen in bulk voor
   leerlingen met korting; aparte partnerpagina in NL/EN.
5. **Referral**: geef een vriend korting, verdien zelf verlenging.
6. **Boek-verwijzing te gelde maken**: affiliatelink of bundelafspraak met de
   uitgever; de aanbeveling staat er toch al.
7. **Reviews/slagingsverhalen** per taalgroep als sociaal bewijs.
8. **PWA** voor app-gevoel (beperkt offline: alleen voortgang, geen content,
   vanwege kopieerbescherming).
9. Later: rijbewijsvarianten (A, C/D, taxi) als aparte modules op hetzelfde
   platform; eventueel andere landen met dezelfde motor.

## 10. Kosten en risico's

- **Vaste kosten laag** (Cloudflare gratis/laag tarief, domein ~ €15/jr,
  Resend gratis segment); **variabel**: Stripe ~1,5-3% + €0,25 per transactie
  (WeChat Pay/Alipay iets hoger), AI-vertaalrondes per taal (eenmalig,
  vooraf begroten per taal).
- Risico's: (1) WeChat Pay vereist Stripe-activatie per account, vooraf
  aanvragen; (2) vertaalkwaliteit zonder moedertaal-review kan schaden →
  review inplannen; (3) kopieer-remming kan legitiem gebruik hinderen →
  maatregelen meetbaar en omkeerbaar invoeren; (4) "onbeperkt" beloven bij
  passen vermijden; heldere voorwaarden; (5) juridisch: geen CBR-vragen of
  boekmateriaal reproduceren (hard, bestaand beleid).

## 11. Vervolg

Na akkoord op §1 start fase 1. Elke fase wordt opgeleverd volgens de
website-standaard-skill (meertalig, WCAG, CSP, geverifieerd, gedocumenteerd)
en bijgehouden in dit document plus DEPLOY.md.
