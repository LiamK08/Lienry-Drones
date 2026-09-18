# Media log

Every AI-generated asset on the site, with its prompt, model, file path and placement. Assets are generated with the connected Higgsfield account, downloaded and optimised by `scripts/media/fetch.mjs` (locally or via the "Fetch and optimise media" GitHub Actions workflow), and written to `public/media/`. Each carries a "Concept render" label on the site.

Credit balance at the start of production: 210. Costs below are the credits charged per generation. Spent so far: about 65 (M1 x2, M2, M3, H0, 24 derived stills, Kling turbo 10, MiniMax x2 at 12).

## Approval status

| Gate | Status |
| --- | --- |
| M1 drone master still | Approved: variant A (Liam, 18 Sep 2026). |
| M2 capsule and M3 pod masters, H0 hero still | Approved (Liam, 18 Sep 2026). Made from M1 variant A with Seedream 4.5; Nano Banana Pro at 4K needs the Plus plan. |
| Derived stills (S, P, Y, C, Ho, So, F, Co) | Generated with Seedream 4.5 using the approved masters as image references. 24 stills, 1 credit each. |
| H1 hero film | Kling 3.0 pro and Nano Banana Pro are gated to the Plus plan. Two candidates made instead: MiniMax H3 (8 s, 2K, hero still as first and last frame for a seamless loop) and Kling 3.0 Turbo (5 s, 1080p). |
| C2 commercial clip | MiniMax H3, 8 s, capsule still as first and last frame for a seamless loop. |

## Assets

| ID | Placement | Model | Credits | Source | Files | Prompt |
| --- | --- | --- | --- | --- | --- | --- |
| m1-drone-master-a | Review candidate for the drone master | Nano Banana Pro, 2K, 3:2 (served as nano_banana_2) | 2 | job 6a83f653-08d0-4931-9292-e17addc41bb8 | `public/media/m1-drone-master-a-{640,1280,2048}.{avif,webp}` after fetch | Product photograph of a compact autonomous exterior-cleaning drone: a quadcopter with a matte pale-grey composite body, slate-grey accents, four fully shrouded rotors, a slim front spray arm with a small nozzle angled downward, a thin translucent water tether trailing from the underside, two small sensor lenses on the front, clean industrial design, no branding, no text, no logos. It hovers in front of a clean glass curtain wall of a mid-rise office building at first light, a thin sheet of water running down the glass beside it, water beading on the panes, soft diffused morning light, thin haze, long soft shadows, shallow depth of field, 85mm lens, photoreal, muted premium colour grade with cool highlights and warm lifted shadows, no people, no landmarks, no sci-fi elements |
| m1-drone-master-b | Review candidate for the drone master | Same | 2 | job 3c2fec2f-48e6-467e-a2b4-7547b2a9af7e | `public/media/m1-drone-master-b-*` after fetch | Same prompt, second variant |
| m1-drone-master | The drone master the site uses (variant A until a choice is made) | As above | 0 (reuses A) | job 6a83f653 | `public/media/m1-drone-master-*` after fetch | As above |
| m2-capsule-master | Two systems (Commercial), Commercial pilot block, Platform Dock row | Seedream 4.5, high, 3:2, reference: M1 variant A | 1 | job 3553080d-35cd-4878-a11f-ea12f610f5cb | `public/media/m2-capsule-master-*` after fetch | Product photograph of the same matte pale-grey cleaning drone from the reference image, resting on its charging cradle inside a weatherproof rooftop capsule: a low, rounded pale-grey composite shell about 1.2 metres long on a mid-rise commercial building's plant deck, hatch open, a small tether reel and a standpipe beside it, rooftop plant and the city softly out of focus behind, no landmarks, no signage, early morning light with thin haze and long soft shadows, photoreal industrial design photography, 50mm lens, muted premium colour grade with cool highlights and warm lifted shadows, no people, no text, no logos |
| m3-pod-master | Two systems (Home), closing CTA, Homes CTA | Seedream 4.5, high, 3:2, reference: M1 variant A | 1 | job 4876ab70-2682-483a-831c-aeae638b4348 | `public/media/m3-pod-master-*` after fetch | Product photograph of a waterproof ground pod for the same matte pale-grey cleaning drone from the reference image: a compact pale-grey composite pod the size of a large cooler sitting on sandstone pavers beside a garden tap at a quiet Sydney suburban house, a coiled thin water tether connected to the tap, the drone resting on top of the pod on its cradle, terracotta roof tiles and rooftop solar panels softly out of focus behind, dew on the pavers, first light, soft diffused morning light, photoreal, 50mm lens, muted premium colour grade with cool highlights and warm lifted shadows, no people, no text, no logos |
| h0-hero-still | Home hero poster, Platform hero, source frame for the hero film | Seedream 4.5, high, 16:9, reference: M1 variant A | 1 | job f8c02e20-0a9e-4ceb-8e32-b90ac003cd9a | `public/media/h0-hero-still-*` after fetch | Cinematic wide still of the same matte pale-grey cleaning drone from the reference image finishing a wash on the glass facade of a twelve-storey office building at first light, three-quarter view from slightly below, a continuous thin film of water sheeting down the panes, fine mist catching the light, the thin tether rising toward the roof, the street below quiet and empty, soft haze, long soft shadows, cool highlights and warm lifted shadows, photoreal, anamorphic 40mm, premium architectural photography, no people, no landmarks, no text, no logos, no sci-fi elements |

## Derived stills (Seedream 4.5, high quality, 1 credit each, 18 September 2026)

All prompts end with the house style clause: first light, soft diffused morning light, thin haze, long soft shadows, cool highlights and warm lifted shadows, muted premium colour grade, photoreal, no people, no landmarks, no signage, no text, no logos, no sci-fi elements. "The same drone/capsule/pod from the reference image" ties each shot to the approved master passed as an image reference.

| ID | Aspect | Reference | Placement | Job | Subject |
| --- | --- | --- | --- | --- | --- |
| s1-dock | 4:3 | M2 | Explainer Dock tab, Platform | cc7adca5 | Capsule at dusk, hatch closing over the resting drone |
| s2-tether | 4:3 | M1 | Explainer Tether tab, Platform | 2eda620e | Tether running down curtain-wall glass with water inside it |
| s4-scan | 4:3 | M1 | Explainer Scan tab, Platform | 0020e81f | Drone off the corner of a building with faint survey lines on the facade |
| s5-software | 4:3 | M2 | Explainer Software tab, Platform | 4247ae21 | Laptop showing a pale 3D building model with amber and cyan shading, no readable text |
| s6-automation | 4:3 | M2, M1 | Explainer Automation tab, Platform | 0c20148e | Capsule open at dawn, drone lifting off, nobody on the roof |
| p1-tower | 2:3 | M1 | Places carousel | 74444578 | Fourteen-storey glass and render building, drone mid-clean |
| p2-apartments | 2:3 | M1 | Places carousel | dc6aa152 | Six-storey apartment building, drone on balcony glass |
| p3-house | 2:3 | M1 | Places carousel | 49788a3e | Terracotta-roofed house, drone on the front glass, wet driveway |
| p4-rental | 2:3 | M1 | Places carousel | 5448168e | Brick rental townhouse, drone over rooftop solar |
| p5-solar-farm | 2:3 | M1 | Places carousel | 2ceb5820 | Solar farm row, drone low with a fine spray |
| y1-story-before | 3:4 | M3 | Landlord story beats 1 and 2 | 7dd6c0cf | Rental house before the clean, dusty driveway and panels, pod by the tap |
| y2-story-panels | 3:4 | M1 | Landlord story beat 3 | 4f39881d | Drone over rooftop panels, half already clean |
| y3-story-driveway | 3:4 | M1 | Landlord story beat 4 | de6d60a7 | Drone washing the driveway, wet half and dry half |
| y5-story-done | 3:4 | M3 | Landlord story beat 5 | 3976b34c | The house after the clean, drone back on its cradle |
| f1-tether | 1:1 | M1 | Safety by design | fc3876f2 | Tether coupling macro |
| f2-camera | 1:1 | M1 | Safety by design | ae903b99 | Forward sensor lenses macro |
| f3-surface | 1:1 | M1 | Safety by design | 8a785562 | Spray arm and nozzle against glass |
| f4-dock | 1:1 | M2 | Safety by design | 465627b1 | Capsule hatch seal with rain beads |
| c1-commercial-hero | 16:9 | M2, M1 | Commercial hero, film band poster, C2 source frame | 28f608d7 | Plant deck at dawn, capsule open, drone rising, facade dropping away |
| ho1-homes-hero | 21:9 | M3 | Homes and Rentals hero | 3ee17cf3 | Ground pod beside the house at first light |
| so1-solar-hero | 21:9 | M1 | Solar hero | 4e9fe8ee | Solar farm rows at first light, drone over the nearest row |
| so2-solar-closeup | 3:2 | none | Solar rooftop section | ff987c59 | Water beads and mist on a panel |
| co1-company | 21:9 | none | Company page | 4cb567a5 | Harbour-side street of mid-rise buildings at dawn, no landmarks |

## Films

| ID | Model | Length | Source frame | Credits | Job | Prompt summary |
| --- | --- | --- | --- | --- | --- | --- |
| h1-hero-film | MiniMax H3, 2K, 16:9 | 8 s | H0 as first and last frame | 12 | b22cace8-724c-433f-8cc0-379d3a51010b | Drone holds beside the facade, water sheeting, drifts half a metre and returns, camera pushes in five percent and settles, seamless loop, silent |
| h1-hero-film-kling | Kling 3.0 Turbo, 1080p, 16:9 | 5 s | H0 as first frame | 10 | 4b08e06a-d4ca-4e22-92a2-ea993a2bab2b | Same scene, single slow drift and push-in, no loop frame |
| c2-commercial-clip | MiniMax H3, 2K, 16:9 | 8 s | C1 as first and last frame | 12 | f6f4a8de-b246-4391-a423-f47a062f36df | Capsule hatch open, drone rises forty centimetres, turns toward the edge, settles back, seamless loop, silent |

The site uses `h1-hero-film` for the home hero and `c2-commercial-clip` for the film band. To switch the hero to the Kling clip, rename the ids in `scripts/media/manifest.json` and run the media fetch again.

## Film review (Higgsfield video analysis, 18 September 2026)

Both films the site uses were run through Higgsfield's video analysis so the product read could be checked from this session, where the CDN is blocked.

| Film | Analysis job | What the analysis saw | Verdict |
| --- | --- | --- | --- |
| h1-hero-film | d1659de5 (prefix) | A grey and white drone hovering side-on to an office building's glass facade, tether rising above it and hose below, a fan of water spraying across the glass; steady camera with a slight push-in; golden-hour light. | Reads as the product: drone, tether, water on glass, nobody on site. The analysis counted six rotors where the master has four, so the rotor detail is soft at 2K; acceptable at hero scale behind the headline. The grade is warmer than the first-light stills. A cooler regrade is a follow-up if the hero should match the stills exactly. |
| c2-commercial-clip | 16da67fc (prefix) | A white quadcopter inside a circular guard rising from a light-grey rooftop capsule with its lid open, a white tether to the capsule, fine mist, low warm sun, a tall glass building behind. | Reads as the commercial system: capsule, tether, drone lifting off with nobody on the roof. The analysis called the building a skyscraper; the framing keeps it generic and the copy states the 70-metre limit, so no change. Same warm grade as above. |

## How the files reach the site

`scripts/media/fetch.mjs` downloads every manifest entry, writes the optimised files into `public/media` and keeps a copy of the raw downloads and the finished output in `.next/cache/lienry-media`. It runs in three places:

1. `npm run media:fetch` on any machine with open internet, after which `public/media` can be committed.
2. `prebuild` (soft mode) before every `next build`, so a Vercel deploy downloads and encodes the set on its first build and restores it from the build cache on later builds. Video encoding uses `ffmpeg-static`, which is a dev dependency, so the build must install dev dependencies (Vercel's default).
3. The "Fetch and optimise media" GitHub Actions workflow, which commits the result back to the branch, once Actions is enabled for the repository.

This session cannot reach the CDN, so `public/media/index.json` in the repository is empty and the screenshots in `docs/screenshots` show the labelled placeholders where the renders will sit. The pipeline itself was exercised end to end in the Higgsfield sandbox on 18 September 2026 (see "Pipeline verification" below).

## Site asset ids the components expect

`h0-hero-still`, `h1-hero-film` (video), `m1-drone-master`, `m2-capsule-master`, `m3-pod-master`, `s1-dock`, `s2-tether`, `s4-scan`, `s5-software`, `s5-software-clip` (video, optional), `s6-automation`, `p1-tower`, `p2-apartments`, `p3-house`, `p4-rental`, `p5-solar-farm`, `y1-story-before`, `y2-story-panels`, `y3-story-driveway`, `y5-story-done`, `f1-tether`, `f2-camera`, `f3-surface`, `f4-dock`, `c1-commercial-hero`, `c2-commercial-clip` (video, optional), `ho1-homes-hero`, `so1-solar-hero`, `so2-solar-closeup`, `co1-company`.

Until an id exists in `public/media/index.json` the site shows a labelled placeholder panel in its place.

## Pipeline verification (Higgsfield sandbox, 18 September 2026)

The fetch script was run against the live CDN in the Higgsfield sandbox with the hero still and both films, then run twice more to prove the cache.

| Asset | Output | Size |
| --- | --- | --- |
| h0-hero-still | AVIF and WebP at 768, 1280, 1920 and 2560 | 19 KB to 134 KB per file |
| h1-hero-film | MP4 (H.264, 1080p) / WebM (VP9) / poster | 2.83 MB / 1.43 MB / 93 KB |
| c2-commercial-clip | MP4 / WebM / poster | 2.81 MB / 0.58 MB / 79 KB |

Three assets took 56 seconds of wall time on the sandbox. A second run kept every file, and a run after deleting `public/media` restored all of it from `.next/cache/lienry-media` without downloading or encoding again. Both MP4 files sit under the 4 MB budget.
