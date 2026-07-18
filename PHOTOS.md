# Fotorealistische beelden — werkwijze

De site toont standaard de **illustraties**. Zodra er een fotobestand bestaat voor een
onderdeel, vervangt die foto automatisch de illustratie op die pagina (na een rebuild).

> De beelden zijn **originele, generieke Nederlandse verkeersscènes** — bewust géén
> reproductie of natekening van de foto's uit het bronboek. Alleen zo mogen ze publiek online.

## Bestandsnaam = koppeling
Elke afbeelding hoort bij een vaste sleutel, bv. `img/module-1_s13.png` = stap 13 (Remmen).
De volledige lijst met sleutels en prompts staat in **photos/prompts.md** en **photos/prompts.json**.
Toegestane extensies: `.png`, `.jpg`, `.jpeg`, `.webp`.

## Optie A — automatisch (OpenAI beeld-API)
```bash
cd "Website/dandan-rijlessen"
export OPENAI_API_KEY=sk-...
node generate-photos.mjs           # genereert img/<key>.png voor alle onderdelen
node build.js                      # zet de foto's in de site
```
Opties (env):
- `VARIANTS=4` → 4 varianten per onderwerp (`_v2`,`_v3`,…) om uit te kiezen. Zo kom je snel op een paar honderd beelden; kies per onderwerp de beste en hernoem die naar `img/<key>.png`.
- `ONLY=module-2_s24,module-3_s35` → alleen die onderwerpen.
- `MODEL` (default `gpt-image-1`), `SIZE` (default `1536x1024`).
- Hervatbaar: bestaande bestanden worden overgeslagen.

## Optie B — handmatig via ChatGPT
```bash
node generate-photos.mjs --dump    # schrijft photos/prompts.md
```
Open **photos/prompts.md**, genereer per regel een beeld in ChatGPT, en sla het op als
`img/<key>.png` in deze map. Daarna `node build.js`.

## Deployen
Na het toevoegen van foto's en `node build.js`:
```bash
npx wrangler pages deploy dist --project-name=dandan-rijlessen
```

## Belangrijk
- Gebruik uitsluitend **AI-gegenereerde of rechtenvrij/gelicenseerde** beelden.
- Geen scans, foto's of illustraties uit het boek.
- De hoofdlesauto is steeds dezelfde compacte rode hatchback met een blauw L-dakbord.
- Als de leerling zichtbaar is, blijft Dandan herkenbaar consistent: volwassen Oost-Aziatische
  vrouw, lang steil donker haar, ronde bril, licht saliegroen shirt, rustige uitstraling.
- Geen merklogo's, leesbare kentekens of tekst in beeld (zit al in de stijlprompt).
