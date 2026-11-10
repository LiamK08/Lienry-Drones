# Media log

Every image and film on the site is a Blender render of the owner's H1 model: the 27 stills (made on 10 November 2026, see "Stills (Blender, 10 November 2026)", below) and the home hero film (see "Home hero film"). Their masters are in `scripts/media/masters`, listed in the manifest as `repo:` sources; `scripts/media/fetch.mjs` encodes them (locally, as the `prebuild` step on the host, or via the "Fetch and optimise media" GitHub Actions workflow) into `public/media/`. No image or film on the site carries a Concept render caption: the owner removed them on 26 September 2026. One AI-generated asset is left in the manifest, unplaced: the commercial clip (`c2-commercial-clip`). The sections on the Higgsfield set below are its record, kept for history.

The Higgsfield set was regenerated on 18 September 2026 from an approved design sheet, replacing the pale-grey quadcopter renders of 17 and 18 September; the Blender stills replaced it on 10 November 2026 under the same asset ids and file paths.

Credit balance at the start of this round: 138. Spent: 37 on the design sheet (eleven attempts across three models to get a true six-rotor drone), 52 on the 27 stills, 17 on nine regenerations, 24 on the two films. 8 credits remain.

## Stills (Blender, 10 November 2026)

At the owner's request ("change every single image on the website to a higher quality relevant one especially using the current drone model that i have ... make sure that the setting (eg like a house) look extremely realistic"), every still on the site was made again in Blender from the owner's own H1 model, the model the home hero film flies, with refresh.tech's imagery as the bar for realism and framing only: nothing of theirs was used. The 27 asset ids, placements and crops are unchanged, so nothing on the site had to move. No still carries a caption, a sign, a landmark or a person.

Three kinds of scene:

- **Photographs.** The H1 composited into a real photograph: a Poly Haven CC0 backplate, with the camera matched to it (the photograph's focal length and sensor from its EXIF data, its height measured against something of known size in frame, such as a garden table, a planter or a door), the matching CC0 HDRI of the same spot for its light and reflections, shadow catchers for every surface the drone, its hose or its water touches, and the render laid over the linearised photograph in linear light. Wet paving and walls darken the photograph's own pixels under a mask rendered from the wet area, so the bricks and render keep their texture. The H1 and its water are the only CG in frame, except where a dock or a tap is placed too.
- **Built scenes.** A glass office tower, solar farm rows and roofs, modelled in code (curtain wall bays with dusty and washed glass, interiors and blinds behind; 72-cell modules on racking; corrugated and slate roofs with gutters and arrays), lit and reflected by a CC0 HDRI of a real place, which also shows behind them.
- **The dock.** The docks are the owner's own design: the dock the owner's file builds with its `SHOW_DOCK` option (1750 x 1750 x 1100 mm, two clamshell lids, the landing pad with its H and LED ring, the weather mast and hose port), built from the owner's script and composited like the drone. The .blend files stay out of this repository.

Every still is rendered with Cycles on the CPU (64 to 128 samples a pixel, adaptive, denoised with OpenImageDenoise), the props spun with motion blur, depth of field from the matched lens. The spray is geometry: a fan of droplet streaks and mist from the nozzle tip in use, its strike on the surface, and the wet lane behind it. Each still's finish (levels, a light vignette and grain) is set at render, so the house grade is off for these (`grade: false`). The masters are JPEGs at quality 94 in `scripts/media/masters`, named `<id>-h1-<width>x<height>.jpg` (a still made again takes a new name, `-h1-v2-` and on, because the pipeline reuses an encode while its source name is unchanged), listed in the manifest as `repo:` sources. Where a photograph carried a sign (a building name, a fire-hose or exit pictogram), it was retouched out of the plate or toned into the wall behind it, as the table notes; the CG in front of it (a dock's weather mast) was kept by its render alpha.

| ID | Scene | Source (CC0) | Script | Placement |
| --- | --- | --- | --- | --- |
| h0-hero-still | Street-level look up a nine-storey glass office tower, the H1 washing a lane high on the face, its reflection and shadow on the glass | HDRI `docklands_02` | `tower.py` | Company page vision band backdrop |
| c1-commercial-hero | The owner's dock open on a rooftop deck in low sun, the H1 lifting off above it on its hose | `rooftop_day` backplate IMG_6246 and HDRI | `dk_roof.py` | Commercial hero, film band poster, first and last frame of the commercial clip |
| ho1-homes-hero | The H1 washing the glass doors of a white gabled house on an overcast day, its hose trailing to the terrace | Poly Haven `lythwood_terrace` backplate DSC08801 and HDRI | `house_bay.py` | Homes and Rentals hero |
| so1-solar-hero | The H1 washing fixed-tilt solar farm rows in low sun, a clean band behind the fan, its shadow on the glass | HDRI `dry_field` (sky, light and ground); `grass_ground` texture | `farm.py` | Solar hero |
| co1-company | Street-level look up the glass tower, the H1 mid-wash with its reflection | HDRI `docklands_02` | `tower.py` | Company page |
| m1-drone-master | The H1 washing a glass curtain wall, three-quarter, 100 mm | HDRI `docklands_02` | `m1.py` | Explainer Drone tab, Platform Drone row |
| m2-capsule-master | The owner's dock open on a roof deck, the H1 parked on its pad (a fire-hose sign and reel behind the glass toned out) | Poly Haven `rooftop_day` backplate IMG_6240 and HDRI | `dk_roof.py` | Two systems (Commercial), Commercial pilot block, Platform Dock row |
| m3-pod-master | The owner's dock open on a wet brick patio by a garden tap, the H1 inside, the cottage behind | Poly Haven `lythwood_terrace` backplate DSC08806 and HDRI | `dk_home.py` | Two systems (Home), closing CTA, Homes CTA |
| s1-dock | The owner's dock, lids nearly closed, on a rain-wet roof deck (a fire-hose sign and reel toned out) | Poly Haven `rooftop_day` backplate IMG_6243 and HDRI | `dk_roof.py` | Explainer Dock tab, Platform Dock row |
| s2-tether | The H1 below a glass facade, its hose rising to the parapet | HDRI `docklands_02` | `m1.py` | Explainer Tether tab, Platform Tether row |
| s4-scan | The H1 holding off the corner of the glass tower, not spraying | HDRI `docklands_02` | `tower.py` | Explainer Scan tab, Platform Scan row |
| s5-software | From inside an office at dusk: a laptop showing the site's own software window (Demo data), the H1 washing outside the window | HDRI `sunset_jhbcentral` (as the hero film); the screen is a capture of the site's software window | `s5_q.py` (`s5_glass.py`) | Explainer Software tab, Platform Software row |
| s6-automation | The owner's dock open on a roof deck, the H1 settling above it on its hose | Poly Haven `rooftop_day` backplate IMG_6228 and HDRI | `dk_roof.py` | Explainer Automation tab, Platform Automation row |
| p1-tower | Street-level look up the glass tower, the H1 washing a lane, 110 mm | HDRI `docklands_02` | `tower.py` | Places carousel: commercial towers |
| p2-apartments | The H1 washing the rendered balcony wall of an apartment block (a building-name sign retouched out of the plate) | Poly Haven `residential_garden` backplate IMG_0600 and HDRI | `house_bay.py` | Places carousel: apartment buildings |
| p3-house | The H1 washing the bay window of a white weatherboard house, cut from a taller frame | Poly Haven `lythwood_terrace` backplate DSC08820 and HDRI | `house_bay.py` | Places carousel: homes |
| p4-rental | The H1 washing the rooftop array of a brick terrace with a slate roof | HDRI `bloem_olive_house`; `brick_wall_09` and `grey_roof_tiles_02` textures | `roof.py` | Places carousel: rental properties |
| p5-solar-farm | The H1 washing a solar farm row, seen from the aisle | HDRI `dry_field`; `grass_ground` texture | `farm.py` | Places carousel: solar farms |
| y1-story-before | The owner's dock closed on the wet patio by the garden tap (an exit sign and extinguisher on the cottage toned out) | Poly Haven `lythwood_terrace` backplate DSC08806 and HDRI | `dk_home.py` | Landlord story beats 1 and 2 |
| y2-story-panels | The H1 washing a rooftop array on a corrugated roof, half the array wet and clean | HDRI `balcony`; `brick_wall_09` texture | `roof.py` | Landlord story beat 3 |
| y3-story-driveway | The H1 washing the brick path along a garden wall in front of the house | Poly Haven `lythwood_terrace` backplate DSC08816 and HDRI | `driveway.py` | Landlord story beat 4 |
| y5-story-done | The owner's dock open on the patio, the H1 back inside | Poly Haven `lythwood_terrace` backplate DSC08806 and HDRI | `dk_home.py` | Landlord story beat 5 |
| so2-solar-closeup | Close on the H1's nozzle turret spraying a dusty solar module, 85 mm | HDRI `dry_field` | `farm.py` | Solar rooftop section |
| f1-tether | The H1 on its hose at the corner of the glass tower, from below | HDRI `docklands_02` | `m1.py` | Safety by design: tether |
| f2-camera | The H1 close beside a glass wall, its sensors toward the pane | HDRI `docklands_02` | `m1.py` | Safety by design: obstacle-avoidance camera |
| f3-surface | The H1 washing a window in a rendered wall | Poly Haven `residential_garden` backplate IMG_0613 and HDRI | `house_bay.py` | Safety by design: onboard surface checks |
| f4-dock | The owner's dock closed on the wet roof deck, the H1 inside (a fire-hose reel toned out) | Poly Haven `rooftop_day` backplate IMG_6243 and HDRI | `dk_roof.py` | Safety by design: weatherproof dock |

Sources: Poly Haven backplates and HDRIs (polyhaven.com, CC0): `lythwood_terrace` (backplates DSC08801, DSC08806, DSC08816, DSC08820; HDRI), `residential_garden` (backplates IMG_0600, IMG_0613; HDRI), `rooftop_day` (backplates IMG_6228, IMG_6240, IMG_6243, IMG_6246; HDRI), and the HDRIs `docklands_02`, `dry_field`, `balcony`, `bloem_olive_house` and (for the laptop still, as in the hero film) `sunset_jhbcentral`; Poly Haven textures `grass_ground`, `brick_wall_09` and `grey_roof_tiles_02`. The solar cells are drawn in code.

To render them again: the scene scripts are in `scripts/media/stills/`, each reading its settings from the environment; `queue.txt` holds every still's exact settings under its asset id and `queue.sh` renders them in turn into `final/`. Put the owner's .blend next to `h1lib.py` (or set `DRONE` to its path). For the dock, run the owner's own script from that file with its `SHOW_DOCK` and `SAVE_BLEND` options on, which writes `H1_with_dock.blend`, and put that beside the scripts (or set `DOCK_BLEND`); neither file enters this repository. Use the same Python 3.11 virtual environment as the hero film (`pip install bpy==5.0.1 numpy`, as `venv/`, or point `PY` at its python), and fetch the photographs, HDRIs and textures with `fetch_assets.sh`. Finishing: `ho1-homes-hero` and `p3-house` are recomposited with `recomp.py` (`HI=0.82 SAT=1.05`); `p2-apartments` is recomposited with `recomp.py` over its photograph with the building-name sign patched out first (`patchgrad.py` on `rg_IMG_0600.jpg`, rectangle 1728,1412 to 1988,1508 from 75 px below, scaled to the wall at x 1706 to 1726); and `p3-house` is the 1500 x 2250 crop at x 120 of its composite, scaled to 1200 x 1800; the signs noted in the table were toned out with `unsign.py` (with `alpha_png.py`'s render alpha guarding the dock's mast) the extinguisher in `y1-story-before` patched with `patchgrad.py` (a copy of the wall above, scaled row by row to the wall's own shading), and a stray reflected rotor on the glass in `s4-scan` with `patchcopy.py`. Rendered files stay out of the repository (the folder's `.gitignore`).

## House grade (17 October 2026)

The Blender stills and the hero film are finished at render and skip this grade (`grade: false`); it applies to what is left of the Higgsfield set.

Every still and film goes through one house grade in the pipeline (`scripts/media/grade.mjs`), so the set reads as one shoot: an overcast morning, slightly warm in the shadows and mid-tones, with neutral highlights. The sources differed a lot. Some were cold blue-grey (scan, tether, apartments), one was warm interior light (software), several had washed-out blacks and the solar hero was close to grey. A single filter would have left those differences in place, so the grade measures each source in CIE Lab and corrects it toward common targets:

- **Black and white points:** the 1st and 99th percentiles of L* map to 9 and 94.5. No image is whiter than the plaster ground or blacker than the ink.
- **Colour cast by tonal band:** shadows go to b* +2.5, mid-tones to b* +2.5 and highlights to neutral. Each band moves 80% of the way, by at most 9 units, so a strongly coloured scene keeps its colour and skies do not turn peach.
- **Saturation:** mean chroma is scaled toward C* 6, within 0.8 to 1.2.

The transform for each asset is baked into one 33-point 3D colour table:

- **Stills** go through the table in JavaScript before resizing.
- **Films** go through the same table with ffmpeg's `lut3d`.
- **Films made from a still** use that still's measurements (`gradeFrom` in the manifest), so the commercial clip matches the commercial hero. The Blender hero film and its first frames are graded in their own render pipeline and skip the house grade (`"grade": false`).

Each index entry records the grade it was made with, so changing the grade re-processes everything on the next build. Set `"grade": false` on a manifest asset to leave it ungraded, or override any value with `"grade": { … }`. The source files are untouched. No grain is added: it would inflate every AVIF, WebP and film past their size budgets.

Measured on the output, against the ungraded set:

| Measure | Ungraded | Graded |
| --- | --- | --- |
| Black point (L* at 1%) | 1.6 to 16.1 | 7.3 to 10.3 |
| White point (L* at 99%) | 79.6 to 98.7 | 94.0 to 94.7 |
| Mid-tone b* | -11.8 to +10.1 | -2.6 to +4.1 |
| Highlight b* | -8.3 to +9.5 | -1.7 to +2.8 (one outlier at +6.9, the wet driveway) |
| Mean chroma C* | 3.3 to 11.1 | 1.4 to 7.4 |
| Hero film against its still (mean ΔE; the retired MiniMax film) | 0.6 | 1.4 |
| Commercial clip against its still (mean ΔE) | 0.2 | 1.2 |

Two differences a grade cannot fix need the owner: `co1-company` is a backlit sunrise and `s5-software` is an indoor frame, and neither belongs in an overcast exterior set. The ground pod also appears in two designs across the stills.

## Approval status

| Gate | Status |
| --- | --- |
| Design sheet (commercial drone, home drone, roof capsule, ground pod) | Approved (Liam, 18 Sep 2026). Registered as Higgsfield elements (below). The PNGs are in `docs/references` (added 17 October 2026, recompressed losslessly), with their source URLs in the table below. |
| 27 stills | Generated from the approved elements, checked scene by scene with Higgsfield's video analysis, seven regenerated (two of them twice) where the read missed the brief (tether direction, spray running during a scan, twilight instead of morning). Replaced on 10 November 2026 by the Blender stills, at the owner's request. |
| Films | `c2-commercial-clip`: MiniMax H3, 6 s, first and last frame from the approved commercial hero still so it loops seamlessly. The home hero film is not generated: a Blender render of the owner's H1 model, made at the owner's request on 9 November 2026 (see "Home hero film"). |

Model note: the account is on Higgsfield's starter plan, which serves every `nano_banana_pro` request as Nano Banana 2 (2 credits at 2K). Seedream 4.5 (1 credit) was used for the two shots without a product in them. Kling 3.0 pro and Nano Banana Pro at 4K stay gated to the Plus plan.

## The design

The brief is the source of truth: a compact tethered cleaning drone with water and power up one bonded tether, no tank and no battery pack on the airframe. Matte charcoal base, warm off-white upper shell with a visible gasket seam, full circular prop guards with a thin lip in the site accent (`#0F6A7C`), a dark glass sensor bar with two lenses, a scanning sensor on top, a front spray bar with flat fan nozzles (five commercial, three home) over a sprung microfibre pad, two rubber standoff rollers, a rear-underside tether port with a rubber boot, two low skids with charging contacts, a white status light under the nose, a small Lienry Drones wordmark on one arm. Commercial drone: hexacopter about 1.2 m across. Home drone: quadcopter about 0.7 m. Docks in the same materials: a roof capsule with a split sliding lid, and a garden pedestal with a clamshell lid, each holding a cradle with charging contacts and a motorised reel.

### Master references (`docs/references`)

Each file below is in `docs/references` under the name given, downloaded from its source URL.

| File | What | Higgsfield source | URL |
| --- | --- | --- | --- |
| `commercial-drone-sheet.png` | Commercial hexacopter: front, side and three-quarter views composed from three single-view renders | media `be934fa6`, from jobs `30d65140` (front), `7a121950` (side), `6e6a5015` (three-quarter) | https://d2ol7oe51mr4n9.cloudfront.net/user_3J8Mu3IaCOUKKQFrt2Kj5oC8qmY/be934fa6-5088-4e2c-b889-5b834ef50431.png |
| `commercial-drone-top.png` | Straight-down top view of the commercial hexacopter, the view that fixed the six-rotor layout | job `c61ec49e` | https://d8j0ntlcm91z4.cloudfront.net/user_3J8Mu3IaCOUKKQFrt2Kj5oC8qmY/hf_20260918_083747_c61ec49e-e2d4-4579-bb01-33bee2c22279.png |
| `home-drone-sheet.png` | Home quadcopter: front, side, three-quarter | job `cea5609b` | https://d8j0ntlcm91z4.cloudfront.net/user_3J8Mu3IaCOUKKQFrt2Kj5oC8qmY/hf_20260918_082028_cea5609b-5f23-43d1-8588-60c8300362f1.png |
| `roof-capsule-sheet.png` | Roof capsule: closed front, closed side, open three-quarter | job `317872dc` | https://d8j0ntlcm91z4.cloudfront.net/user_3J8Mu3IaCOUKKQFrt2Kj5oC8qmY/hf_20260918_083235_317872dc-221c-428f-8073-d941920744d0.png |
| `ground-pod-sheet.png` | Ground pod: closed front, closed side, open | job `62e47524` | https://d8j0ntlcm91z4.cloudfront.net/user_3J8Mu3IaCOUKKQFrt2Kj5oC8qmY/hf_20260918_083235_62e47524-1898-40b1-9b06-23067bf3ebc4.png |
| `hexacopter-layout-guide.png` | Hand-drawn top-view layout guide (six arms, three per side) used as an image reference to force six rotors | media `bb98094a` | https://d2ol7oe51mr4n9.cloudfront.net/user_3J8Mu3IaCOUKKQFrt2Kj5oC8qmY/bb98094a-b152-43ea-8dd0-1494fcbd486d.png |

Reusable Higgsfield elements, referenced in every scene prompt as `@name`:

| Element | Id | Made from |
| --- | --- | --- |
| `lienry-commercial-drone` | `75e7a0f0-baa8-4a87-9736-bd731d456105` | commercial-drone-sheet.png and the top view |
| `lienry-home-drone` | `d14811de-4c2c-4ba1-9e8d-fe9374feaa4b` | home-drone-sheet.png |
| `lienry-roof-capsule` | `a4dfa32d-2bb2-4abd-94e4-1465f7c40a66` | roof-capsule-sheet.png |
| `lienry-ground-pod` | `0d4df997-813a-40aa-aa4c-262b2c1c44a1` | ground-pod-sheet.png |

### How the sheet was made

Every text-only attempt at the commercial drone (Nano Banana 2, Seedream 4.5 and GPT Image 2.5, eight generations) came back as a quadcopter. What worked: a schematic top view drawn with Pillow (six arms at 60 degree spacing, three per side, nothing pointing forward) passed as an image reference produced a photoreal top view with six guards (job `c61ec49e`, verified by counting the teal guard rings by colour segmentation and by Higgsfield's video analysis). A three-view sheet derived from that top view (job `8b2c8b99`) kept six rotors but put a top view in the front panel, so the final sheet was composed from three single views rendered against that sheet: front `30d65140`, side `7a121950`, three-quarter `6e6a5015`. The docks needed one reframe each: described as a "storage case" they came back with foam inserts and dimension labels; described as a "drone landing station, not a storage case" with "a charcoal-grey braided hose carrying one hairline teal stripe, not blue" they came back right.

Design sheet prompt (commercial drone, the other three follow the same shape with their own object description):

> Industrial design sheet of one original tethered exterior-cleaning HEXACOPTER drone with SIX rotors, shown in three views side by side on a plain warm off-white seamless studio background: front view on the left, side profile view in the middle, three-quarter view on the right, evenly spaced, same scale, exactly one drone per view and nothing else in frame. Six flat swept-back arms arranged in a ring around the body, three on each side, each arm ending in its own full circular prop guard in matte charcoal with a thin deep teal-blue (#0F6A7C) lip. Sealed rounded rectangular fuselage, matte charcoal composite base with a warm off-white upper shell and a visible gasket seam where the upper shell meets the base, small flush vents, no exposed wires or screws. Across the nose a dark glass sensor strip with two camera lenses behind it, and a small puck-shaped scanning sensor on top of the body. On the front a horizontal spray bar with five flat fan nozzles, and below it a sprung arm holding a soft grey microfibre pad; two small soft black rubber standoff rollers on the front frame. A tether port on the rear underside with a flexible black rubber strain-relief boot and a short stub of braided dark grey tether with one thin teal tracer stripe ending in a quick-release brushed metal fitting. Two low landing skids with small metal charging contacts. A thin white status light strip under the nose and a small work light facing forward and down. A small 'Lienry Drones' wordmark in thin grey sans-serif type on one arm and no other text anywhere. Compact and clean: no water tank, no canister, no battery pack, no second hose, no coiled cable. Photoreal product photography, soft diffused studio light, subtle contact shadows, matte materials. Not a quadcopter, not four rotors. No sci-fi glow, no neon, no annotations, no dimension lines, no measurement labels, no numbers, no labels, no watermark, no people.

## House style clause

Every scene prompt below ends with this clause (docks-only shots drop the drone lines):

> Photoreal, real textures and real weather, soft overcast early-morning light, muted premium colour grade with cool highlights and warm lifted shadows, no people, no recognisable landmarks, no text or logos anywhere except the small Lienry Drones wordmark already on the drone, no sci-fi glow, no neon, no hologram overlays, no water tank or battery pack on the drone, no second hose, no taut cable, no rope, no window-cleaning cradle or gondola, no human cleaner, no robot arms.

In the prompts, `@commercial` is the `lienry-commercial-drone` element, `@home` the `lienry-home-drone` element, `@capsule` the `lienry-roof-capsule` element and `@pod` the `lienry-ground-pod` element.

## Higgsfield stills (18 September 2026, replaced 10 November 2026)

The AI-generated set the Blender stills replaced, kept for history: none of these is on the site any more.

All at 2K. Nano Banana 2 unless noted. "Job" is the Higgsfield generation the manifest points at; where a shot was regenerated the first job is listed in the review notes below.

| ID | Aspect | Refs | Placement | Job | Scene prompt |
| --- | --- | --- | --- | --- | --- |
| h0-hero-still | 16:9 | @commercial | Company page vision band backdrop (until 9 November 2026 also the home hero poster and the MiniMax hero film's first and last frame) | 6a0673d6 | Cinematic wide still of the commercial cleaning hexacopter @commercial washing the glass curtain wall of a generic eleven-storey office building, three-quarter view from slightly below at the fourth floor. The drone flies a slow horizontal pass 40 centimetres from the glass, its spray bar throwing a wide flat fan of water that sheets down the panes, the glass behind it clean and wet, the glass ahead of it dull. Its single bonded tether, dark grey with a thin teal tracer stripe, rises in a smooth slack curve toward the roof, never taut, clear of the windows. The drone is 1.2 metres across, in true proportion to the 3.5-metre floors. Quiet empty street below, light haze, anamorphic 40mm, premium architectural photography. |
| m1-drone-master | 3:2 | @commercial | Explainer Drone tab, Platform Drone row | 2bb59c62 | Product photograph of the commercial cleaning hexacopter @commercial hovering in a slow horizontal pass across a clean glass curtain wall, three-quarter front view at eye level filling the frame, spray bar throwing a wide flat fan of water onto the glass, the microfibre pad on its sprung arm touching the pane, the two rubber standoff rollers riding on the glass, its dark grey tether with a thin teal tracer curving up and away with a little slack, the glass behind it clean and wet, 85mm lens, shallow depth of field. |
| m2-capsule-master | 3:2 | @capsule, @commercial | Two systems (Commercial), Commercial pilot block, Platform Dock row | 46e7dba7 | Product photograph of the roof capsule @capsule on the flat roof of a generic mid-rise office building, standing on its adjustable feet and concrete ballast blocks on a grey membrane roof, its two-part lid slid open, the commercial hexacopter @commercial resting on the cradle inside with its skids on the charging contacts, the tether reel beside it, water inlet and small control panel on the side, rooftop plant and the tops of neighbouring buildings soft behind, 50mm lens. |
| m3-pod-master | 3:2 | @pod, @home | Two systems (Home), closing CTA, Homes CTA | b4ef94d8 | Product photograph of the ground pod @pod standing on a concrete paver beside a garden tap at the side of an Australian suburban house with rendered walls, a metal roof and rooftop solar, a short hose to the tap and a short cable to an outdoor power point, its clamshell lid open upward with the home quadcopter @home resting on the cradle inside, tidy garden bed and lawn, dew on the paver, 50mm lens. |
| s1-dock | 4:3 | @capsule, @commercial | Explainer Dock tab, Platform Dock row | de895bd9 | The roof capsule @capsule on a flat commercial roof in soft overcast morning light, its two off-white lid halves sliding closed over the commercial hexacopter @commercial settled on its cradle inside, the status light a soft white line, the grey roof membrane wet from earlier rain, rooftop plant and a generic city skyline soft behind, three-quarter view from standing height. |
| s2-tether | 4:3 | @commercial | Explainer Tether tab, Platform Tether row | d7e0073a | Close view of the single bonded tether of the commercial hexacopter @commercial: an 18 mm dark grey braided sleeve with one thin teal tracer stripe leaving the rear underside of the drone through its flexible black rubber strain-relief boot and quick-release metal fitting, curving upward in a smooth slack arc past the glass of a mid-rise office facade toward the roof, water sheeting down the glass behind, the drone partly in frame at the lower left, shallow depth of field. |
| s4-scan | 4:3 | @commercial | Explainer Scan tab, Platform Scan row | cdbeb491 | The commercial hexacopter @commercial hovering off the corner of a generic mid-rise glass office building in soft overcast morning light, holding still two metres off the facade with its dark glass sensor bar and the small scanning sensor on top facing the building. This is a scan, not a wash: no water spray, nozzles off, the glass dry, the facade reflected in its sensor strip. Its single tether leaves the rear underside and immediately curves upward in a smooth slack arc to the roof parapet above, where it is fed from; nothing hangs below the drone and there is no hose to the ground. Seen from the side and slightly below. |
| s5-software | 4:3 | none (Seedream 4.5) | Explainer Software tab, Platform Software row | 677280bd | A laptop on a plain oak desk by a window showing desktop software with a pale grey 3D model of a mid-rise building, panels on the model shaded in soft teal where they have been washed and in muted amber where debris has built up, a thin progress bar, no readable text, soft overcast daylight from the window, shallow depth of field. |
| s6-automation | 4:3 | @capsule, @commercial | Explainer Automation tab, Platform Automation row | d19b788e | The roof capsule @capsule at dawn on a flat commercial roof, lid slid open, the commercial hexacopter @commercial rising vertically half a metre above the cradle, its tether paying out from the reel in a gentle curve, nobody on the roof, rooftop plant and a generic skyline soft behind, low three-quarter view. |
| p1-tower | 2:3 | @commercial | Places carousel: commercial towers | a8ea2517 | Tall portrait of a generic fourteen-storey glass and render office building under a flat overcast sky, cool diffused morning light with no sun, no golden light and no sunset. The commercial hexacopter @commercial is small in frame mid-clean on the sixth floor, a light flat fan of spray sheeting down the glass, clean wet glass behind it and dull glass ahead. Exactly one line on the whole facade: the drone's single tether, which rises from it in a smooth slack curve up to the roof parapet where the roof capsule feeds it. No other cables, ropes or lines anywhere on the building, nothing hanging below the drone, no hose down to the street. The drone in true 1.2-metre scale against the windows. |
| p2-apartments | 2:3 | @commercial | Places carousel: apartment buildings | 413c0863 | Tall portrait of a six-storey rendered apartment block facade with balconies and glass balustrades in soft overcast morning light, the commercial hexacopter @commercial washing the balcony glass on the third floor in a slow horizontal pass, a light flat fan of spray, not a jet, sheeting down the glass, clean wet glass behind it. Its single tether rises from the drone in a smooth slack curve up to the roof, clear of the balconies; nothing hangs below the drone and there is no hose to the ground. The drone in true scale against the balcony doors. |
| p3-house | 2:3 | @home, @pod | Places carousel: homes | 3521fdcb | Tall portrait of an Australian suburban house with rendered walls, a tile roof and rooftop solar, the home quadcopter @home washing the front windows in a slow horizontal pass, spray fan sheeting down the glass, its tether curving down in a slack arc to the ground pod @pod beside the garden tap at the side of the house, wet driveway, the drone about as wide as the front door. |
| p4-rental | 2:3 | @home, @pod | Places carousel: rental properties | ceb7456c | Tall portrait of a brick rental townhouse with a metal roof and rooftop solar panels in soft overcast morning light, the home quadcopter @home low over the panels in a straight pass, a light flat fan of spray across the panels, half the array already clean and wet. Its single tether hangs from the drone in a relaxed slack curve, never taut, clear of the gutter, down to the ground pod @pod standing by the side fence. |
| p5-solar-farm | 2:3 | @home, @pod | Places carousel: solar farms | 76f91d2b | Tall portrait of rows of ground-mounted solar panels in a paddock at first light, the home quadcopter @home low over the nearest row in a straight pass 40 centimetres above the panels, a light flat fan of spray, panels behind it clean and wet, panels ahead dull with dust, its tether curving back with slack to the ground pod @pod on a concrete pad at the end of the row. |
| y1-story-before | 3:4 | @pod | Landlord story beats 1 and 2 | 62c6eb53 | A rental house on a quiet Sydney street before its clean: rendered walls, a metal roof, dusty rooftop solar panels and a grimy concrete driveway, the ground pod @pod closed on its paver beside the garden tap at the side of the house with its short hose and cable connected, no drone in the air, overcast morning, seen from the footpath. |
| y2-story-panels | 3:4 | @home | Landlord story beat 3 | d5c7c910 | The home quadcopter @home in a straight pass 40 centimetres above the rooftop solar panels of a rendered rental house with a metal roof, a light flat fan of spray, half the array clean and wet behind it and dusty ahead, its tether curving down over the eave with slack and clear of the gutter toward the ground pod below the edge of frame, overcast morning. |
| y3-story-driveway | 3:4 | @home, @pod | Landlord story beat 4 | 6d066e57 | The home quadcopter @home low over the concrete driveway of a rendered rental house, washing it in straight overlapping passes half a metre above the surface, a flat fan of spray sweeping the concrete, the washed half clean and wet and the other half still grimy, its tether curving back with slack to the ground pod @pod by the garden tap, overcast morning. |
| y5-story-done | 3:4 | @pod, @home | Landlord story beat 5 | 191ec774 | Bright overcast mid-morning daylight on a rendered rental house on a quiet Sydney street, everyone out at work: the house dark inside with no lights on, every window and the rooftop solar panels freshly clean, the concrete driveway clean and still wet. Beside the garden tap at the side of the house the ground pod @pod stands with its clamshell lid open and the home quadcopter @home parked on the cradle inside, seen from the footpath. Daytime only: no dusk, no twilight, no evening, no interior lights, no exterior lights. |
| f1-tether | 1:1 | @commercial | Safety by design: tether | 4ddbecc8 | Macro product photograph of the tether coupling of the commercial hexacopter @commercial: the quick-release brushed metal fitting and flexible black rubber strain-relief boot where the 18 mm braided dark grey tether with its thin teal tracer stripe enters the rear underside of the drone, a glass facade soft behind, shallow depth of field. |
| f2-camera | 1:1 | @commercial | Safety by design: obstacle-avoidance camera | 5e82974c | Macro product photograph of the nose of the commercial hexacopter @commercial: the dark glass sensor strip with two camera lenses behind it, the thin white status light beneath it and the small scanning sensor on top of the body, a mid-rise glass facade reflected softly in the strip, shallow depth of field. |
| f3-surface | 1:1 | @commercial | Safety by design: onboard surface checks | 7099fcbe | Macro product photograph of the cleaning head of the commercial hexacopter @commercial against a pane of glass: the spray bar with five flat fan nozzles throwing a thin sheet of water, the sprung arm pressing the soft grey microfibre pad to the glass, a rubber standoff roller riding on the pane, water beading on the glass, shallow depth of field. |
| f4-dock | 1:1 | @capsule | Safety by design: weatherproof dock | 8a45b2ea | Macro product photograph of the lid seam of the roof capsule @capsule: the two off-white lid halves meeting over the rubber gasket, a flush metal latch, rain beads on the lid, the status light a soft white line, the grey roof membrane soft behind, shallow depth of field. |
| c1-commercial-hero | 16:9 | @capsule, @commercial | Commercial hero, film band poster, first and last frame of the commercial clip | 8796da8d | Cinematic wide still on the flat roof of a generic mid-rise office building at first light: the roof capsule @capsule standing on its ballast blocks near the parapet with its lid slid open, the commercial hexacopter @commercial rising half a metre above the cradle with its tether paying out from the reel in a gentle curve, the glass facade dropping away beyond the parapet to a quiet street, rooftop plant behind, nobody on the roof, anamorphic 40mm. |
| ho1-homes-hero | 21:9 | @pod, @home | Homes and Rentals hero | ff8f347b | Wide still of the side of an Australian suburban house at first light, rendered walls, a metal roof and rooftop solar, the ground pod @pod standing on a concrete paver beside the garden tap with its hose and cable connected and its lid closed, the home quadcopter @home in the air washing the nearest window with its tether curving down to the pod in a slack arc, wet pavers, dew on the lawn, 35mm lens. |
| so1-solar-hero | 21:9 | @home, @pod | Solar hero | 7d8db1ea | Wide still of rows of ground-mounted solar panels at first light, the home quadcopter @home low over the nearest row in a straight pass, a fine flat fan of spray, the panels behind it clean and wet catching the sky, the panels ahead dull with dust, its tether curving back along the row with slack to the ground pod @pod on a concrete pad at the end of the row, low mist over the paddock, 35mm lens. |
| so2-solar-closeup | 3:2 | @home | Solar rooftop section | 225fe37a | Close photograph of a solar panel surface at first light with a thin sheet of water and fine beads running down the glass cells, the home quadcopter @home soft and out of focus a metre above the panel with its spray fan catching the light, shallow depth of field, macro lens. |
| co1-company | 21:9 | none (Seedream 4.5) | Company page | 2a8f4edf | Wide still of a generic harbour-side street of mid-rise office and apartment buildings under a soft overcast dawn sky, calm water glimpsed at the end of the street with a few small moored boats soft in the haze, no cargo ships, no recognisable landmarks, no people, no moving cars, cool diffused first light with no golden glow, 35mm lens. |

## Films

| ID | Model | Length | Frames | Credits | Job | Prompt |
| --- | --- | --- | --- | --- | --- | --- |
| c2-commercial-clip | MiniMax H3, 2K, 16:9 | 6 s | c1-commercial-hero as first and last frame | 12 | 257ae3d1-c319-4cd4-bf28-0afc0ec19a55 | The capsule lid is already open. The tethered drone rises vertically forty centimetres above its cradle, pauses, turns slightly toward the parapet, then settles back down onto the cradle. The tether pays out and back in a smooth curve from the reel. The camera is locked off with a slight slow push in. Nobody on the roof, nothing else moves, seamless loop returning exactly to the first frame, silent. |

The home hero plays the Blender film (`h1-hero-film`, on phones too until its portrait cut is added; see "Home hero film"). `c2-commercial-clip` is kept but unplaced.

## Home hero film (Blender, 9 and 10 November 2026)

The home hero film is not AI-generated. At the owner's request ("create the super realistic drone cleaning video using my blender model and then upload that to the website"), it was rendered in Blender from the owner's own H1 model (`Lienry_H1_v3_Revision_B`, supplied as a Blender 4.2 file), with refresh.tech's hero film as the bar for realism only: nothing of theirs was used. The .blend file stays out of this public repository; the scene is built around it in code (`scripts/media/hero-film/`).

What it shows, in 15 s at 24 fps (360 frames): from inside a quiet office, the H1 washes the window from outside, its spray boom aimed at the glass. It works down its lane spraying, stops at the bottom of the lane as the valve closes and the jet dies back, levels out and side-steps one lane to the left; then it climbs to the top of the next lane, leans in as the valve opens again beside the lane it has just washed, and washes down the new lane, still spraying as the film loops. Six shots: a wide through the window (frames 1 to 72, 46 mm), a close-up on the nozzle and the strike on the glass (73 to 124, 70 mm) and a medium on the drone (125 to 192, 60 mm); then the wide again as it climbs (193 to 233), a close-up as the jet opens (234 to 277, 70 mm) and a medium as it washes down (278 to 360, 60 mm). The owner asked for the 15 s cut on 10 November; its first 192 frames are the 8 s film's, unchanged. A phone cut is being rendered again from the same scene in portrait, not cropped from the landscape film; until it is added (as `h3-hero-film-tall`, with its poster `h4-hero-frame-tall`), phones play the landscape film, cropped to the screen.

| Part | Source | Licence |
| --- | --- | --- |
| Drone | The owner's H1 model: its geometry, materials and markings as supplied, posed and flown, its props spun, its strobe set to blink, and its 1.8 m supply hose left out for the scene's longer hose | The owner's |
| City, sky and light | Poly Haven HDRI "Joburg Central Sunset" (`sunset_jhbcentral`, 8K EXR), photographed by Greg Zaal and Dimitrios Savva from a city-centre rooftop at dusk | CC0 |
| Floor and desk | Poly Haven textures `concrete_floor_worn_001` and `black_oak_veneer` (2K) | CC0 |
| Everything else | Built in code: the office, window frame and glass, the dirt on the glass and the clean lane, the water (spray droplets, mist, the sheet on the glass, beads and rivulets), and the supply hose it trails | This repository |

How it was made:

- Renderer: Blender 5.0.1 (the `bpy` module), Cycles on the CPU, AgX with the Medium High Contrast look. Each shot has its own sampling (the wide and the medium up to 48 samples a pixel, adaptive at a 0.08 noise threshold after 8; the close-up up to 24 at a tighter 0.02, so the spray, mist and water sample evenly), denoised with OpenImageDenoise on albedo and normals. Motion blur at a half shutter, depth of field at f/2.0 (the portrait medium at f/1.4).
- Motion: the flight is simulated, not keyframed: a position controller flying the pass against gusts and fine turbulence. While it sprays, the drone leans into the glass against the jet's push; once the valve closes it levels out, and for the second lane it leans back in as the pressure builds over four frames. The cameras are hand-held operators that follow the drone with a slight lag and drift.
- Water: the spray is geometry, rebuilt every frame from the valve's pressure (its cone, speed, droop and splash fall away as the valve closes); the washed lane stays wet behind the strike and drains down the pane.
- Grade (`post.py`, at render, so the house grade is off for these: `grade: false`): fixed levels, a soft highlight shoulder and toe, halation, slight lens softness and colour fringing, a light vignette, saturation 0.93 and fine grain.
- Masters: H.264 High, CRF 17 tuned for grain, BT.709 tags, fast start, no audio; the posters are frame 1 of each graded film (the 8 s film's, unchanged). `scripts/media/fetch.mjs` copies them from `scripts/media/masters` (`repo:` sources) and encodes the site's WebM, MP4 and poster renditions like any other asset; the 15 s film's entry carries `budgetMB: 8`, twice the default size budget, so it keeps the 8 s film's bitrate.

| ID | Master in `scripts/media/masters` | What it is | Placement |
| --- | --- | --- | --- |
| h1-hero-film | `h1-hero-film-v3-1280x720.mp4` | The landscape film, 1280x720, 360 frames | Home hero |
| h2-hero-frame | `h2-hero-frame-v2-1280x720.png` | Frame 1 of h1, graded (encoded at 768 and 1280 wide) | Its poster |

To render it again: put the owner's .blend next to `scripts/media/hero-film/glass.py` (or set `DRONE` to its path); make a Python 3.11 virtual environment there with `pip install bpy==5.0.1 numpy` (as `venv/`, or point `PY` at its python); run `render_final.sh` (here, on four CPU cores, the landscape cut took about fourteen and a half hours, the 15 s extension seven of them; `DEVICE=AUTO` uses a GPU, many times faster), then `finish_final.sh`, which needs ffmpeg and writes the masters and posters into `scripts/media/masters`. The city photograph and textures download on the first run. Rendered frames stay out of the repository (the folder's `.gitignore`). A new render takes new file names (the next version: `-v4` for the films, `-v3` for the posters), changed in `finish_final.sh` and the manifest's `repo:` sources at the same time, so the pipeline encodes it afresh.

## Review notes (Higgsfield video analysis, 18 September 2026)

This session's container cannot reach the Higgsfield CDN, so every still was checked by stitching the results into a short review video in the Higgsfield sandbox (full frame, then a 60 percent centre crop) and reading Higgsfield's scene-by-scene analysis. What it reported, and what changed:

| Shot | First job | Read | Action |
| --- | --- | --- | --- |
| s4-scan | da8e997f | Drone spraying during the scan, tether hanging down, sunset light | Regenerated as `cdbeb491`: scan wording ("no water spray, nozzles off, the glass dry"), tether "immediately curves upward ... to the roof parapet", overcast morning |
| p1-tower | e517c46b | Tether hanging from the drone down to street level | Regenerated as `9688c1a3` with the tether rising to the roof; that read as sunset with extra lines on the facade, so regenerated again as `a8ea2517` ("exactly one line on the whole facade", flat overcast sky) |
| p2-apartments | 3c19aa87 | Tether trailing down over the balcony, dense high-pressure spray | Regenerated as `413c0863`: light flat fan, tether up to the roof |
| p4-rental | 9f4437a1 | Hose read as taut, sunset tint | Regenerated as `ceb7456c`: "relaxed slack curve, never taut", overcast morning |
| s1-dock | 60c12b67 | Twilight and puddles instead of morning | Regenerated as `de895bd9` in overcast morning light |
| y5-story-done | 837fbdce | Twilight, interior lights on | Regenerated as `9a228b05`, which still read as dusk with the lights on, so regenerated again as `191ec774` ("bright overcast mid-morning daylight, everyone out at work ... daytime only") |
| co1-company | b4f7d562 | Golden haze, cargo ships on the horizon | Regenerated as `2a8f4edf` under an overcast dawn with small moored boats |

Everything else read as the product: hexacopter with six guards on the commercial shots, quadcopter on the home shots, one tether with the teal tracer, capsule with reel and cradle, pod by the tap with its hose and cable, water as a fan on the surface, nobody on site. Two soft readings were accepted: the analysis counted two nozzles on m1 and four on f3 where the sheet has five (the count is set by the element, so it stays consistent across shots), and s6 reads as dusk rather than dawn.

## How the files reach the site

`scripts/media/fetch.mjs` downloads every manifest entry, writes the optimised files into `public/media` and keeps a copy of the raw downloads and the finished output in `.next/cache/lienry-media`. Each index entry records the source URL it was made from and is only reused while the manifest still points at that URL, so this regeneration (same ids, new URLs) refetches everything on the next run instead of restoring the old renders from the build cache; files that no current entry lists are deleted at the end of a run. It runs in three places:

1. `npm run media:fetch` on any machine with open internet, after which `public/media` can be committed.
2. `prebuild` (soft mode) before every `next build`, so a Vercel deploy downloads and encodes the set on its first build and restores it from the build cache on later builds. Video encoding uses `ffmpeg-static`, which is a dev dependency, so the build must install dev dependencies (Vercel's default).
3. The "Fetch and optimise media" GitHub Actions workflow, which commits the result back to the branch, once Actions is enabled for the repository.

## Site asset ids the components expect

`h0-hero-still`, `h1-hero-film` (video), `h2-hero-frame`, `m1-drone-master`, `m2-capsule-master`, `m3-pod-master`, `s1-dock`, `s2-tether`, `s4-scan`, `s5-software`, `s5-software-clip` (video, optional), `s6-automation`, `p1-tower`, `p2-apartments`, `p3-house`, `p4-rental`, `p5-solar-farm`, `y1-story-before`, `y2-story-panels`, `y3-story-driveway`, `y5-story-done`, `f1-tether`, `f2-camera`, `f3-surface`, `f4-dock`, `c1-commercial-hero`, `c2-commercial-clip` (video, optional), `ho1-homes-hero`, `so1-solar-hero`, `so2-solar-closeup`, `co1-company`.

Until an id exists in `public/media/index.json` the site shows a labelled placeholder panel in its place.

## Retired

The 27 Higgsfield stills of 18 September 2026 were replaced on 10 November 2026 by Blender renders of the owner's H1 model, at the owner's request; their source URLs and prompts stay in this file ("Higgsfield stills") and in the repository's history.

The 17 September review candidates `m1-drone-master-a` and `m1-drone-master-b` and the Kling 3.0 Turbo alternative `h1-hero-film-kling` are no longer in the manifest. The MiniMax hero film (MiniMax H3, 6 s, job a83c481d-8ce0-41d0-8472-251e408404e3, made from `h0-hero-still`) was replaced at the owner's request on 9 November 2026 by the Blender film; `h0-hero-still` stays as the /company vision band backdrop. The design sheet replaced the candidate pair as the approval gate, and the Kling clip showed the old drone.

## Software view

The home page software view is rendered in code, not generated: a React Three Fiber model of a 12-storey block inside a mock of the desktop window. The commercial hexacopter in it is built from primitives to the design above (charcoal base, off-white shell with a gasket seam, six guarded rotors with the accent lip, sensor bar, scanner, spray bar over the pad, standoff rollers, rear tether port, skids, status light). A Higgsfield or Meshy GLB was not commissioned: the account had 8 credits left when the section was rebuilt, which does not cover a model and a matching film, and a generated mesh could not be inspected from this environment. No film tile plays beside the window any more: `h1-hero-film` plays only in the home hero. `public/video/software-view-{wide,tall}.{mp4,webm}` are recordings of the model made with `scripts/record-software-view.mjs`, kept under 3 MB each, and are not part of the media pipeline.

## Presentation update — 22 September 2026

No images or videos were generated or replaced. The existing 29 manifest assets were downloaded and optimised locally using the existing pipeline for review; generated build outputs are not part of the design source commit. The approved design sheets were retrieved from the source URLs above and inspected locally.

Restored plain Concept render captions to all shared Picture figures and both film components, as required by the current brief. Adjusted display crops: system comparison images use 3:2, the property gallery 4:5, inner-page hero images 2:1, and the home closing image 1:1. The source files and manifest URLs are unchanged. Video pause controls were added. Existing software-view recordings remain; the software panel is still rendered in code on capable desktops.

## Captions removed — 26 September 2026

No images or videos were generated or replaced. At the owner's request the plain Concept render caption is gone from every image and film: the caption under each still, under the six-part stage and under the split heroes' films, and the one in the rails of the home hero and the film band. The manifest, the files and every placement are unchanged.
