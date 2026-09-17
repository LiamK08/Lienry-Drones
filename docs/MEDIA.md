# Media log

Every AI-generated asset on the site, with its prompt, model, file path and placement. Assets are generated with the connected Higgsfield account, downloaded and optimised by `scripts/media/fetch.mjs` (locally or via the "Fetch and optimise media" GitHub Actions workflow), and written to `public/media/`. Each carries a "Concept render" label on the site.

Credit balance at the start of production: 210. Costs below are the credits charged per generation. Spent so far: 7 (M1 x2, M2, M3, H0).

## Approval status

| Gate | Status |
| --- | --- |
| M1 drone master still | Generated (2 variants). Awaiting Liam's choice. |
| M2 capsule and M3 pod masters, H0 hero still | Generated from M1 variant A with Seedream 4.5 (Nano Banana Pro at 4K needs the Plus plan). Awaiting review. |
| Derived stills (S, P, Y, C, Ho, So, F, Co) | Not yet generated. |
| H1 hero film and C2 clip | Not yet generated. Only from approved stills. |

## Assets

| ID | Placement | Model | Credits | Source | Files | Prompt |
| --- | --- | --- | --- | --- | --- | --- |
| m1-drone-master-a | Review candidate for the drone master | Nano Banana Pro, 2K, 3:2 (served as nano_banana_2) | 2 | job 6a83f653-08d0-4931-9292-e17addc41bb8 | `public/media/m1-drone-master-a-{640,1280,2048}.{avif,webp}` after fetch | Product photograph of a compact autonomous exterior-cleaning drone: a quadcopter with a matte pale-grey composite body, slate-grey accents, four fully shrouded rotors, a slim front spray arm with a small nozzle angled downward, a thin translucent water tether trailing from the underside, two small sensor lenses on the front, clean industrial design, no branding, no text, no logos. It hovers in front of a clean glass curtain wall of a mid-rise office building at first light, a thin sheet of water running down the glass beside it, water beading on the panes, soft diffused morning light, thin haze, long soft shadows, shallow depth of field, 85mm lens, photoreal, muted premium colour grade with cool highlights and warm lifted shadows, no people, no landmarks, no sci-fi elements |
| m1-drone-master-b | Review candidate for the drone master | Same | 2 | job 3c2fec2f-48e6-467e-a2b4-7547b2a9af7e | `public/media/m1-drone-master-b-*` after fetch | Same prompt, second variant |
| m1-drone-master | The drone master the site uses (variant A until a choice is made) | As above | 0 (reuses A) | job 6a83f653 | `public/media/m1-drone-master-*` after fetch | As above |
| m2-capsule-master | Two systems (Commercial), Commercial pilot block, Platform Dock row | Seedream 4.5, high, 3:2, reference: M1 variant A | 1 | job 3553080d-35cd-4878-a11f-ea12f610f5cb | `public/media/m2-capsule-master-*` after fetch | Product photograph of the same matte pale-grey cleaning drone from the reference image, resting on its charging cradle inside a weatherproof rooftop capsule: a low, rounded pale-grey composite shell about 1.2 metres long on a mid-rise commercial building's plant deck, hatch open, a small tether reel and a standpipe beside it, rooftop plant and the city softly out of focus behind, no landmarks, no signage, early morning light with thin haze and long soft shadows, photoreal industrial design photography, 50mm lens, muted premium colour grade with cool highlights and warm lifted shadows, no people, no text, no logos |
| m3-pod-master | Two systems (Home), closing CTA, Homes CTA | Seedream 4.5, high, 3:2, reference: M1 variant A | 1 | job 4876ab70-2682-483a-831c-aeae638b4348 | `public/media/m3-pod-master-*` after fetch | Product photograph of a waterproof ground pod for the same matte pale-grey cleaning drone from the reference image: a compact pale-grey composite pod the size of a large cooler sitting on sandstone pavers beside a garden tap at a quiet Sydney suburban house, a coiled thin water tether connected to the tap, the drone resting on top of the pod on its cradle, terracotta roof tiles and rooftop solar panels softly out of focus behind, dew on the pavers, first light, soft diffused morning light, photoreal, 50mm lens, muted premium colour grade with cool highlights and warm lifted shadows, no people, no text, no logos |
| h0-hero-still | Home hero poster, Platform hero, source frame for the hero film | Seedream 4.5, high, 16:9, reference: M1 variant A | 1 | job f8c02e20-0a9e-4ceb-8e32-b90ac003cd9a | `public/media/h0-hero-still-*` after fetch | Cinematic wide still of the same matte pale-grey cleaning drone from the reference image finishing a wash on the glass facade of a twelve-storey office building at first light, three-quarter view from slightly below, a continuous thin film of water sheeting down the panes, fine mist catching the light, the thin tether rising toward the roof, the street below quiet and empty, soft haze, long soft shadows, cool highlights and warm lifted shadows, photoreal, anamorphic 40mm, premium architectural photography, no people, no landmarks, no text, no logos, no sci-fi elements |

## Site asset ids the components expect

`h0-hero-still`, `h1-hero-film` (video), `m1-drone-master`, `m2-capsule-master`, `m3-pod-master`, `s1-dock`, `s2-tether`, `s4-scan`, `s5-software`, `s5-software-clip` (video, optional), `s6-automation`, `p1-tower`, `p2-apartments`, `p3-house`, `p4-rental`, `p5-solar-farm`, `y1-story-before`, `y2-story-panels`, `y3-story-driveway`, `y5-story-done`, `f1-tether`, `f2-camera`, `f3-surface`, `f4-dock`, `c1-commercial-hero`, `c2-commercial-clip` (video, optional), `ho1-homes-hero`, `so1-solar-hero`, `so2-solar-closeup`, `co1-company`.

Until an id exists in `public/media/index.json` the site shows a labelled placeholder panel in its place.
