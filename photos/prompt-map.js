/* Prompt-manifest voor fotorealistische beelden — Dandan's rijlessen.
   BELANGRIJK: dit zijn ORIGINELE, generieke scènes van de Nederlandse rijlesstof.
   Het zijn nadrukkelijk GEEN reproducties of natekeningen van de foto's uit het bronboek.
   De 'key' bepaalt de bestandsnaam (img/<key>.png) en koppelt aan het juiste onderdeel op de site. */

const STYLE = "Photorealistic instructional photo, modern Netherlands (Dutch) driving-school context, realistic Dutch roads, markings and signage, natural daylight, clear and clean composition, documentary style, safe and correct driving behaviour. The featured learner car is always the same compact vivid-red hatchback with a small blue learner roof sign bearing a simple white L; other traffic uses neutral colours. Whenever the learner driver is visible, she is Dandan: an adult East Asian woman with long straight dark hair, round glasses, a light sage-green shirt and a calm focused expression, seated on the left-hand driver side. Keep her face, hair, glasses and wardrobe visually consistent across the full series. Natural skin, fabric and automotive texture; no CGI or illustration look. No text, no captions, no watermark, no readable licence plates, no brand logos, 3:2 landscape.";

const MANIFEST = [
  // Module 1 — voertuigbeheersing
  { key:'module-1_leermodel', title:'Taakprocessen / observeren', prompt:'A focused learner driver behind the wheel of a car, scanning the road ahead through the windshield on a calm Dutch street.' },
  { key:'module-1_s1', title:'Controle buiten de auto', prompt:'A person doing a pre-drive walk-around inspection of a car on a driveway, crouching to look at a front tyre and the bodywork.' },
  { key:'module-1_s2', title:'Controle in de auto', prompt:'Close interior view of a modern car dashboard with the instrument cluster illuminated, a driver checking the warning lights.' },
  { key:'module-1_s3', title:'Instappen', prompt:'A person about to get into the driver seat of a car parked at the side of a quiet residential street, looking around first.' },
  { key:'module-1_s4', title:'Uitstappen', prompt:'A driver stepping out of a car, glancing back over the shoulder before opening the door on a street.' },
  { key:'module-1_s5', title:'Zithouding', prompt:'A driver adjusting the seat and sitting in a correct, relaxed posture behind the steering wheel, seatbelt on.' },
  { key:'module-1_s6', title:'Stuurhouding', prompt:'Close view of two hands correctly holding a steering wheel at the nine and three o clock positions.' },
  { key:'module-1_s7', title:'Spiegels afstellen', prompt:'A driver reaching to adjust the left side mirror of a car before driving off.' },
  { key:'module-1_s8', title:'Starten', prompt:'Close view of a driver hand pressing a car start button / turning the ignition key.' },
  { key:'module-1_s9', title:'Gas geven', prompt:'Close view of a driver right foot resting gently on the accelerator pedal inside a car.' },
  { key:'module-1_s10', title:'Scannen', prompt:'View from behind a driver looking far ahead and scanning a Dutch road with other traffic.' },
  { key:'module-1_s11', title:'Sturen', prompt:'Close view of hands performing a smooth push-pull steering motion on a steering wheel.' },
  { key:'module-1_s12', title:'Positie op de weg', prompt:'A car neatly centred in its lane on a Dutch road with lane markings, slightly elevated viewpoint.' },
  { key:'module-1_s13', title:'Remmen', prompt:'A car braking smoothly and slowing down as it approaches a stop on a town street.' },
  { key:'module-1_s14', title:'Ontkoppelen', prompt:'Close view of a left foot pressing the clutch pedal fully in a manual car footwell.' },
  { key:'module-1_s15', title:'Stoppen', prompt:'A car coming to a controlled stop at a white stop line on a Dutch street.' },
  { key:'module-1_s16', title:'Koppelen', prompt:'A car pulling away smoothly from standstill on a quiet street, gentle start.' },
  { key:'module-1_s17', title:'Schakelen', prompt:'Close view of a hand on a manual gear stick shifting gears inside a car.' },
  { key:'module-1_s18', title:'Technisch wegrijden', prompt:'A car pulling away from a parking spot and moving smoothly into a residential street.' },
  // Module 2 — eenvoudige verkeerssituaties
  { key:'module-2_s19', title:'Wegrijden en stoppen', prompt:'A driver checking the mirror and over the shoulder while pulling out from a roadside parking spot.' },
  { key:'module-2_s20', title:'Volgafstand', prompt:'Two cars driving on a road with a clearly safe following distance between them.' },
  { key:'module-2_s21', title:'Ruimtekussen', prompt:'A car driving with generous open space all around it on an open Dutch road.' },
  { key:'module-2_s22', title:'Tegemoetkomen', prompt:'Two cars passing each other on a narrow country road, one easing slightly onto the grass verge.' },
  { key:'module-2_s23', title:'Ingehaald worden', prompt:'A car being overtaken by another vehicle, seen from the overtaken driver perspective with mirror view.' },
  { key:'module-2_s24', title:'Kruispunt', prompt:'Rear three-quarter view of Dandan in the red learner car, stopped completely before a transverse row of correctly oriented shark teeth whose points face the car, yielding beside a B6 sign to a grey car on the crossing priority road.' },
  { key:'module-2_s25', title:'Afslaan', prompt:'A car turning right at a junction with its indicator on, cyclists nearby on a Dutch street.' },
  { key:'module-2_s26', title:'Hellingproef', prompt:'A car performing a hill start on an inclined road without rolling back.' },
  { key:'module-2_s27a', title:'Achteruit rechte lijn', prompt:'A car reversing in a straight line along the right side of a quiet street, driver looking back.' },
  { key:'module-2_s27b', title:'Achteruit bocht', prompt:'A car reversing around a corner into a side street, driver watching over the shoulder.' },
  { key:'module-2_s28', title:'Parkeren', prompt:'A car performing a reverse parallel parking manoeuvre between two parked cars on a Dutch street.' },
  { key:'module-2_s29a', title:'Omkeren halve draai', prompt:'A car making a U-turn on a wide quiet street to reverse direction.' },
  { key:'module-2_s29b', title:'Omkeren steken', prompt:'A car performing a three-point turn on a narrow residential street.' },
  // Module 3 — complexe verkeerssituaties
  { key:'module-3_s30', title:'Rijstrook wisselen', prompt:'A car changing lanes on a multi-lane Dutch road with its indicator on.' },
  { key:'module-3_s31', title:'Voorbijgaan', prompt:'A car passing a stationary parked vehicle, briefly using the oncoming side with clear view.' },
  { key:'module-3_s32', title:'Inhalen', prompt:'A car overtaking a slower vehicle on a rural two-lane road with clear visibility.' },
  { key:'module-3_s33', title:'Invoegen', prompt:'A car merging onto a Dutch motorway from an acceleration lane, matching traffic speed.' },
  { key:'module-3_s34', title:'Uitvoegen', prompt:'A car leaving a motorway via an exit slip road, slowing on the deceleration lane.' },
  { key:'module-3_s35', title:'Rotonde', prompt:'A Dutch roundabout with a car entering, clear lane markings and give-way signs.' },
  { key:'module-3_s36', title:'Erf / woonerf', prompt:'A Dutch woonerf residential living-street with pedestrians and a car driving very slowly.' },
  { key:'module-3_s37', title:'Spoorwegovergang', prompt:'A Dutch railway level crossing with barriers and Andreas-cross signs, a car waiting.' },
  { key:'module-3_s38', title:'Zebrapad', prompt:'A pedestrian on a zebra crossing while a car stops to give way on a town street.' },
  { key:'module-3_s39', title:'Bushalte', prompt:'A bus stopped at a bus stop with passengers, another car passing slowly at a safe distance.' },
  // Module 4 — verantwoord rijgedrag
  { key:'module-4_s40', title:'Moeilijke omstandigheden', prompt:'A car driving at dusk with headlights on in reduced visibility on a wet Dutch road.' },
  { key:'module-4_s41', title:'Ritvoorbereiding', prompt:'A driver setting up navigation and planning a route before starting a trip, car interior.' },
  { key:'module-4_s42', title:'ROSO-training', prompt:'A driving skills training on a closed course with traffic cones, wet skid area.' },
  { key:'module-4_s43', title:'Milieuverantwoord rijden', prompt:'Eco driving scene: a car cruising economically, dashboard eco indicator, calm road.' },
  { key:'module-4_s44', title:'Defensief rijden', prompt:'A driver keeping a safe distance and anticipating in busy but calm city traffic.' },
  { key:'module-4_s45', title:'Aangepast rijden', prompt:'A car driving at an appropriate, smooth speed through a Dutch town centre.' },
  { key:'module-4_s46', title:'Mentaliteit', prompt:'A calm, responsible driver fastening the seatbelt before driving, relaxed and sober.' },
  // Module 5 — examen / ADAS / oefeningen
  { key:'module-5_examen', title:'Rijexamen', prompt:'A driving exam scene: a calm candidate driving while an examiner sits in the passenger seat with a clipboard.' },
  { key:'module-5_adas', title:'ADAS-systemen', prompt:'A modern car dashboard and windshield view showing driver-assistance systems active on a motorway.' },
  { key:'module-5_oefening', title:'Controleoefeningen', prompt:'A driving instructor and a learner practising a manoeuvre next to a car in a quiet area.' },

  // Rijbewijsvarianten en rijbewijsproces
  { key:'am-1_voertuigtypen', title:'AM-voertuigtypen', prompt:'Dandan and an instructor compare a red moped scooter and a compact four-wheel brommobiel on a closed Dutch training lot.' },
  { key:'am-1_praktijk', title:'AM-praktijkexamen', prompt:'Dandan safely rides a red moped through a marked Dutch practical-exam course while an examiner observes.' },
  { key:'aanhanger-1_exam', title:'Aanhangerexamen', prompt:'The red learner car with a small box trailer performs a controlled reversing exercise on a spacious Dutch training ground.' },
  { key:'aanhanger-1_koppeling', title:'Trekhaak controleren', prompt:'Close rear view of the uncoupled red learner car showing one correct compact European swan-neck towbar, spherical 50 mm tow ball, separate closed 13-pin socket and dedicated breakaway-cable eyelet; trailer parked out of focus at a clear distance.' },
  { key:'info-1_gezondheidsverklaring', title:'Gezondheidsverklaring', prompt:'Dandan completes a professional eye test in an optometrist consultation room as part of driving fitness.' },
  { key:'info-1_theorie-examen-tolk', title:'Theorie-examen met tolk', prompt:'Dandan takes an individually supervised driving-theory exam at a computer while an interpreter translates spoken instructions.' },
  { key:'info-1_rijschool', title:'Rijschool kiezen', prompt:'Dandan and a female driving instructor discuss a trial lesson beside the open driver door of the red learner car.' },
  { key:'motor-1_categorieen', title:'Motorcategorieën', prompt:'Dandan and an instructor compare three motorcycles that visibly progress from lightweight A1 to medium A2 and larger full-A class.' },
  { key:'motor-1_avb', title:'AVB-oefening', prompt:'Dandan in full protective gear performs a controlled slow slalom between cones on a Dutch motorcycle training ground.' },
  { key:'motor-1_avd-examen', title:'AVD-examen', prompt:'Dandan rides safely through a Dutch urban bend during an AVD road exam while the examiner follows by motorcycle.' },
  { key:'motor-1_beschermende-kleding', title:'Motorkleding', prompt:'Full-body view of Dandan beside a motorcycle in certified helmet, jacket, trousers, gloves and ankle-covering boots.' },

  // Aanvullende theoriebeelden
  { key:'theorie-1_fietser-naast-auto', title:'Fietser naast de auto', prompt:'Dandan in the stationary red learner car looks directly toward a cyclist riding beside the car on the right at a Dutch junction.' },
  { key:'theorie-2_afslaan-v2', title:'Afslaan', prompt:'At a coherent Dutch junction, Dandan waits in the red learner car entirely before a continuous red-asphalt cycle crossing, looks right toward a cyclist riding fully on that cycle path and signals before turning right.' },
  { key:'theorie-2_hulpdienst', title:'Hulpdienst ruimte geven', prompt:'Dandan moves the red learner car safely to the right and stops without blocking a junction so an ambulance with blue lights can pass.' },
  { key:'theorie-2_uitrit', title:'Uitrit', prompt:'Frontal view from across the road: the red learner car faces outward from a private driveway and stops fully before a continuous grey sidewalk; a pedestrian walks only on that sidewalk and a cyclist rides only on the separate red-asphalt cycle path in front of it.' },
  { key:'theorie-3_bordcategorieen', title:'Bordcategorieën', prompt:'Dandan and an instructor study a naturally installed group of correct Dutch speed, yield, mandatory-direction and parking signs.' },
  { key:'theorie-4_sec2', title:'Rood verkeerslicht', prompt:'Front-on view from across a Dutch junction: the red learner car waits entirely behind a transverse stop line with a clear asphalt gap, while Dandan turns to her own right and looks directly at the red signal on the viewer\'s left.' },
  { key:'theorie-4_negenoog', title:'Negenoog', prompt:'A Dutch city bus proceeds straight in a dedicated red bus lane beneath a prominent black nine-eye signal with exactly nine lenses in a 3-by-3 grid and two vertically aligned white proceed lights, while the red learner car remains in the adjacent ordinary lane.' },
  { key:'theorie-4_spoorwegovergang', title:'Spoorwegovergang', prompt:'Rear view from behind Dandan\'s red learner car, stopped completely before a visible stop line and lowered barrier while a red crossing light flashes and a train passes ahead.' },
  { key:'theorie-4_verkeersbrigadier', title:'Verkeersbrigadier', prompt:'A fluorescent-clad crossing guard helps children cross while the red learner car waits well before the crossing.' },
  { key:'theorie-6_fietser-inhalen', title:'Fietser veilig inhalen', prompt:'On an open Dutch rural road the red learner car overtakes an adult cyclist with a clearly generous lateral gap.' },
  { key:'theorie-7_parkeerverbod', title:'Parkeerverbod', prompt:'Dandan continues past a prohibited parking location with a correct European no-parking sign toward a legal bay farther ahead.' },
  { key:'theorie-7_parkeerschijf', title:'Parkeerschijf', prompt:'Dandan places a blue parking disc on the dashboard after correctly parking the red learner car in a Dutch blue zone.' },
  { key:'theorie-7_pech', title:'Pech op de snelweg', prompt:'The broken-down red learner car stands on the motorway shoulder while Dandan and the instructor wait behind the guardrail with a warning triangle placed behind the car.' },
  { key:'theorie-8_scootmobiel', title:'Scootmobiel', prompt:'Dandan stops the red learner car well before a raised crossing to let an older mobility-scooter user cross safely.' },
  { key:'theorie-8_vrachtwagen-dode-hoek', title:'Vrachtwagen en dode hoek', prompt:'The red learner car waits well behind a truck preparing a wide right turn while a cyclist remains visible near the truck blind-spot area.' },
  { key:'theorie-9_alcohol-keuze', title:'Niet rijden na alcohol', prompt:'Dandan responsibly hands the red learner-car keys to a sober friend outside a restaurant while the car stays parked.' },
  { key:'theorie-9_medicijnen', title:'Medicijnen en rijden', prompt:'At a pharmacy counter Dandan asks whether prescribed medicine affects driving and deliberately leaves the red car keys on the counter.' },
  { key:'theorie-9_vermoeidheid', title:'Vermoeidheid', prompt:'Dandan has safely parked at a Dutch motorway rest area and takes a break to stretch and drink water.' },
  { key:'theorie-9_telefoon-opbergen', title:'Telefoon opbergen', prompt:'Before setting off in the stationary red learner car Dandan places her smartphone in a closed center-console compartment.' },
  { key:'theorie-10_lading-zekeren', title:'Lading zekeren', prompt:'Dandan tightens a correctly routed ratchet strap over boxes and a suitcase inside a utility trailer attached to the red car.' },
  { key:'theorie-10_schade-afhandelen', title:'Schade afhandelen', prompt:'After a minor fender incident Dandan and the driver of a grey car calmly exchange details and complete a blank damage form.' },
  { key:'theorie-11_verborgen-kind', title:'Verborgen gevaar', prompt:'A child on a small bicycle begins to emerge from behind a parked van while the approaching red learner car is already braking with ample space.' }
];

module.exports = { STYLE, MANIFEST };
