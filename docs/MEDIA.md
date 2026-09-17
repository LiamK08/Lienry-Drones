# Media log

Every AI-generated asset on the site, with its prompt, model, file path and placement. Assets are generated with the connected Higgsfield account, downloaded and optimised by `scripts/media/fetch.mjs` (locally or via the "Fetch and optimise media" GitHub Actions workflow), and written to `public/media/`. Each carries a "Concept render" label on the site.

Credit balance at the start of production: 210. Costs below are the credits charged per generation.

## Approval status

| Gate | Status |
| --- | --- |
| M1 drone master still | Generated (2 variants). Awaiting Liam's choice. |
| M2 capsule and M3 pod masters, H0 hero still | Not yet generated. Made from the approved M1. |
| Derived stills (S, P, Y, C, Ho, So, F, Co) | Not yet generated. |
| H1 hero film and C2 clip | Not yet generated. Only from approved stills. |

## Assets

| ID | Placement | Model | Credits | Source | Files | Prompt |
| --- | --- | --- | --- | --- | --- | --- |
| m1-drone-master-a | Review candidate for the drone master | Nano Banana Pro, 2K, 3:2 (served as nano_banana_2) | 2 | job 6a83f653-08d0-4931-9292-e17addc41bb8 | `public/media/m1-drone-master-a-{640,1280,2048}.{avif,webp}` after fetch | Product photograph of a compact autonomous exterior-cleaning drone: a quadcopter with a matte pale-grey composite body, slate-grey accents, four fully shrouded rotors, a slim front spray arm with a small nozzle angled downward, a thin translucent water tether trailing from the underside, two small sensor lenses on the front, clean industrial design, no branding, no text, no logos. It hovers in front of a clean glass curtain wall of a mid-rise office building at first light, a thin sheet of water running down the glass beside it, water beading on the panes, soft diffused morning light, thin haze, long soft shadows, shallow depth of field, 85mm lens, photoreal, muted premium colour grade with cool highlights and warm lifted shadows, no people, no landmarks, no sci-fi elements |
| m1-drone-master-b | Review candidate for the drone master | Same | 2 | job 3c2fec2f-48e6-467e-a2b4-7547b2a9af7e | `public/media/m1-drone-master-b-*` after fetch | Same prompt, second variant |

## Site asset ids the components expect

`h0-hero-still`, `h1-hero-film` (video), `m1-drone-master`, `m2-capsule-master`, `m3-pod-master`, `s1-dock`, `s2-tether`, `s4-scan`, `s5-software`, `s5-software-clip` (video, optional), `s6-automation`, `p1-tower`, `p2-apartments`, `p3-house`, `p4-rental`, `p5-solar-farm`, `y1-story-before`, `y2-story-panels`, `y3-story-driveway`, `y5-story-done`, `f1-tether`, `f2-camera`, `f3-surface`, `f4-dock`, `c1-commercial-hero`, `c2-commercial-clip` (video, optional), `ho1-homes-hero`, `so1-solar-hero`, `so2-solar-closeup`, `co1-company`.

Until an id exists in `public/media/index.json` the site shows a labelled placeholder panel in its place.
