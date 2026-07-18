# FOTO-OPDRACHTEN — dandandrive.nl

Per gewenst fotobeeld een kant-en-klare genereeropdracht. Foto's zijn origineel/rechtenvrij
(AI-gegenereerd via `generate-photos.mjs`, gpt-image-1), géén boekbeeld. Sleutel = bestandsnaam
`img/<sectie>-<n>_<key>.<ext>`; na plaatsen vervangt de foto automatisch de SVG bij rebuild.

| Bestandsnaam | Plek | Doelmaat | Onderwerp | Stijl | Prompt |
|---|---|---|---|---|---|
| _(nog te vullen in de visualisatie-loops)_ | | | | | |

Richtlijn stijl (consistent met bestaand): fotorealistische, generieke Nederlandse
verkeers-/lesscènes, daglicht en herkenbaar NL straatbeeld. De hoofdlesauto is steeds
dezelfde rode hatchback met blauw L-dakbord; de leerling is consequent Dandan (volwassen
Oost-Aziatische vrouw, lang steil donker haar, ronde bril, licht saliegroen shirt).
Doelmaat 1536×1024, daarna WebP. Geen merken/kentekens leesbaar, geen boekreproductie.

## Fotorealistisch voorbeeld op de landing (18-7-2026) — KLAAR
`assets/landing-priority.webp` vervangt het bovenaanzicht-SVG in de voorbeeldles. De foto
toont een gelijkwaardig Nederlands kruispunt zonder borden of haaientanden: de rode
Dandan-lesauto komt van rechts en rijdt eerst, terwijl de grijze auto zichtbaar wacht.

## Landing-hero rijfoto (13-7) — KLAAR 16-7-2026
De foto stond al klaar als `assets/landing-hero.webp` (gegenereerd in een eerdere ronde,
voldeed volledig aan de opdracht) en is nu geïntegreerd in de hp-landing-hero:
fotokaart in `.hp-showcard`, glas-kaart overlapt de onderrand, orbits eromheen.
Geen nieuwe generatie nodig geweest.
| Bestandsnaam | Plek | Doelmaat | Onderwerp | Stijl | Prompt |
|---|---|---|---|---|---|
| `img/hero-rijles.webp` | landing-hero (rechterkolom, i.p.v./achter de glas-kaart) | 1200×900 → WebP q82 | Moderne rijles in een Nederlandse straat: instructeur + leerling in een auto, daglicht, herkenbaar NL straatbeeld (fietspad, bakstenen huizen) | fotorealistisch, warm daglicht, rustig, geen leesbare merken/kentekens | "Photorealistic modern driving lesson in a Dutch residential street, instructor and learner in a car seen from outside through the windscreen, daylight, red-brick houses and a bicycle lane, neutral friendly people, no readable brands or licence plates, 1536x1024" |
