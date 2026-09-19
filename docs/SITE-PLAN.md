# Lienry Drones: site plan

Version 1. Companion to `docs/DESIGN-RESEARCH.md`. Everything the site says comes from the product brief; nothing in this plan claims customers, results, prices, certifications or approvals.

## 1. What the site has to do

One job: make property owners, building managers and investors want Lienry Drones.

| Audience | What they need to see in the first minute | Where the site does it |
| --- | --- | --- |
| Property owners (homes, apartments, rentals) | They can start a clean from anywhere, nobody has to be there, the drone treats each material correctly, and the property is ready sooner | Hero, landlord story, Homes and Rentals page |
| Building managers | It lives on the roof, re-scans every two days, the software shows the building as a 3D model with live wash progress and debris shading, and nobody works at height | System explainer, 3D building, Commercial page, Safety by design |
| Investors | One drone platform, two systems, a resident model that runs itself, a Sydney team at concept stage raising pre-seed, and a pilot program to join | Two systems, counters, vision letter, Company page, closing CTA |

Positioning line (used in metadata and the footer): Lienry Drones makes a resident cleaning drone that lives on a property and keeps its exterior clean with nobody on site.

## 2. Sitemap

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | Home | The full story in one scroll |
| `/platform` | Platform | The six parts of the system: Dock, Tether, Drone, Scan, Software, Automation |
| `/commercial` | Commercial | The roof capsule system for buildings under 70 metres and the pilot program |
| `/homes-and-rentals` | Homes and Rentals | The ground pod system, the app, the landlord story |
| `/solar` | Solar | Solar panels and solar farms, with the verified soiling statistics |
| `/company` | Company | Founders, Sydney, concept stage, pre-seed, investor enquiries |
| `/register-interest` | Register interest | One enquiry form with a type field: homeowner, landlord, commercial pilot, investor |
| `/privacy` | Privacy | Privacy policy (template for legal review) |

Navigation: Platform, Commercial, Homes and Rentals, Solar, Company, and one Register interest button. Footer: Platform (six parts), Systems (Commercial, Homes and Rentals, Solar), Company (Company, Register interest, Investor enquiries, Privacy), and a pre-launch statement with the Sydney address placeholder.

## 3. Visual identity: First Light

Original identity, not derived from Legora's palette, typeface or button language. Built from what a Lienry clean looks like: warm morning light on render and sandstone, a film of water running down glass, a building that nobody is attending.

### Mark

The mark is Liam's: three building silhouettes rising to a centre peak, with the flight arc cut through them from the ground to the top of the tallest block. It is traced into a vector (`public/brand/lienry-mark.svg`) and inlined in the wordmark, where it fills with the current text colour: ink on plaster, plaster on the dark hero and footer. In the nav it sits 26px tall beside "Lienry Drones", rising into place once on load in step with the hero headline. The favicon, Apple icon, Open Graph image and JSON-LD logo all come from the same paths. No other icon or glyph stands in for the brand.

### Palette

| Token | Hex | Role |
| --- | --- | --- |
| `--plaster` | `#F3EFE7` | Page background, warm off-white like sunlit render, with a 3% monochrome grain |
| `--raised` | `#FBF9F4` | Cards, nav bar (82% with blur), inputs, device frames |
| `--sunken` | `#E9E3D8` | Founder letter band, table stripes, inactive tab wells, footer upper zone |
| `--ink` | `#1C1A17` | Primary text and the dark bands (safety, footer base). Warm basalt, not blue-black |
| `--ink-muted` | `#5E584F` | Secondary text, captions (6.1:1 on plaster). On dark bands `#A9A197` |
| `--glass` | `#0F6A7C` | The one accent, wet glass reflecting morning sky: primary buttons, links, focus rings, active tabs, the drawn tether line. Hover `#0D6072` |
| `--glass-tint` | `#DCEDF0` | Pale accent surface: the "clean" state in the 3D model, selected chips, media overlays |
| `--glass-on-dark` | `#8ED4E0` | Accent on dark bands: links, progress, button fill with ink label |
| `--water` | `#187566` | Success and water flow: clean complete, tether flowing, healthy dock |
| `--debris` | `#B9721C` | Warning: built-up debris shading in the 3D model, "clean needed" flags. Text uses `#8A5210` |
| `--hairline` | `#DCD5C8` | Decorative 1px rules and grid lines |
| `--border-strong` | `#857D70` | Functional borders: inputs, chips, secondary buttons (3.6:1 on plaster) |

Contrast: ink on plaster 15.1:1, muted on plaster 6.1:1, glass on plaster 5.4:1 as text, plaster on glass 5.4:1, glass-on-dark on ink 10.5:1. All text pairs meet WCAG AA; debris is used for fills and 24px+ text only.

### Type

- Display: Newsreader Variable (opsz + wght), weights 300 and 400. Light optical-size serif for headlines: the calm of architectural editorial, credible to owners, managers and investors.
- Body and UI: Hanken Grotesk Variable, weights 400 and 500.
- Readouts and labels: Geist Mono Variable, 500 for eyebrows and settings values (every 2 days, 70 m), 300 for large numerals with tabular figures.
- All three self-hosted from Fontsource (`@fontsource-variable/newsreader`, `@fontsource-variable/hanken-grotesk`, `@fontsource-variable/geist-mono`), latin subset, `font-display: swap` with size-adjusted fallbacks so nothing shifts.

Scale (1440 to 390, set with `clamp()` so there is one scale): display 76/80px to 40/44px, -0.015em; H1 60/64 to 36/40; H2 44/50 to 30/36; H3 32/38 to 24/30; H4 (Hanken 500) 22/28 to 19/26; lead 20/30 to 18/28; body 17/26 to 16/26, measure 60 to 68ch; small 15/22; caption 13/18; eyebrow Geist Mono 12/16 +0.08em uppercase; stat numeral Geist Mono 300, 88/88 to 56/56, tabular.

### Surfaces, shape and layout

- Radius: one token, 4px, on every button, card, input, image and container (`rounded-hard`). `rounded-full` is reserved for real circles. No pills, chips, badges or uppercase labels anywhere: a heading gets a short rule above it, and any small supporting text is plain sentence-case sans in the caption size. No tinted backgrounds, glows, blurred blobs or drop shadows; hairline borders and flat section colours only.
- Buttons 44px tall (52px in the hero), 20px horizontal padding, Hanken 500. Primary: glass fill, plaster label, 1px inner top highlight as a glass edge. Secondary: 1px strong border, ink label. Tertiary: text with a drawn water-line underline. On dark: glass-on-dark fill with ink label.
- Surfaces are flat: cards separate by a tone step and a hairline, never a drop shadow. The sticky nav is the one exception, with a 1px hairline under it once the page has scrolled.
- 12-column grid, 24px gutters, page margins 40px at 1280+, 20px at 390. Containers 1280px (grid), 1120px (alternating rows), 880px (statements, founder letter), 700px (prose), 640px (forms). Spacing scale 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160. Section padding 128px desktop, 80px mobile.

### Motion rules

- Water and light move; buildings do not. Layout elements settle once and never drift, parallax or float. Continuous motion is reserved for water, the tether line, scan lines and the drone in footage.
- Reveals: opacity 0 to 1 and y 12px to 0, 640ms, `cubic-bezier(0.22, 1, 0.36, 1)`, once, staggered 60ms across at most six siblings.
- State changes (tabs, chips, accordions): 240 to 320ms, `cubic-bezier(0.4, 0, 0.2, 1)`.
- Scroll-linked sequences (system explainer, landlord story, 3D scan sweep): transform and clip-path only, mapped to scroll progress through a spring, linear underneath.
- Counters: 1200ms, once, tabular figures so nothing shifts.
- Scale never exceeds 1.03 on content; hover never scales. No speed ramps, no HUD, no whoosh.
- Native scrolling only. Reveals are driven by IntersectionObserver (Motion's `whileInView`), never by per-frame scroll maths, and only `transform` and `opacity` animate. Nothing pins the page: the system explainer and the landlord story are scroll-through lists with a sticky media column that follows the step nearest the viewport centre. The 3D building renders on demand and plays its sequence once each time it comes on screen. Videos preload metadata only and one clip decodes at a time.
- `prefers-reduced-motion`: no smooth anchor scrolling, crossfades become instant, counters render their final value, the hero video is replaced by its poster, the 3D building shows its finished state.

### Imagery direction

Photoreal AI stills and short loops, each with a small "Concept render" label. Early morning light only (sun 15 to 30 degrees, or bright overcast), soft haze, long soft shadows, cool highlights, warm lifted shadows. Subjects: mid-rise commercial glass under 70 metres (6 to 18 storeys, never a skyline tower), a rooftop plant deck with the weatherproof capsule, thin sheets of water running down curtain-wall glass, solar panels beaded with water, a wet driveway on a quiet suburban street, the ground pod beside a garden tap, a solar farm row at first light. No landmarks, no signage, no logos, no faces, no aviation markings, no sci-fi.

## 4. Copy direction

Voice: plain, confident, specific. Short declaratives. Australian English. Pre-launch wording throughout: register interest, pilot program, in development. The brand name is always "Lienry Drones", shortened to "Lienry" in running copy.

### Home

- Eyebrow: Resident exterior cleaning
- Headline: **Clean exteriors. Nobody on site.**
- Support: A resident cleaning drone that lives on your property and washes glass, solar panels, walls, roofing and driveways on buildings under 70 metres. Start a clean from anywhere.
- Primary button: Register interest. Secondary: See how it works (scrolls to the system explainer).
- Property strip: Commercial towers under 70 m, Apartment buildings, Homes, Rental properties, Solar farms.
- System explainer: "One drone. Six parts that run themselves." Tabs Dock, Tether, Drone, Scan, Software, Automation, each with a one-sentence claim and a two-sentence body drawn only from the brief.
- 3D building: "The software sees the whole building." Scan sweep, wash progress, debris shading, with a caption that the model is illustrative.
- Two systems: "Commercial system" (roof capsule, tether fed from above, desktop software, re-scan every two days) and "Home system" (waterproof ground pod, material-aware pressure, personalised app and desktop software, start a clean remotely).
- Places it works: "Built for the buildings people own." Five portrait cards.
- Landlord story: "Between tenants, from another country." Five beats: They open the app. They select the driveway and the solar panels. They tap start. The drone cleans while nobody is there. The property is ready for the next tenant sooner.
- Counters: 2 days between re-scans (owner adjustable), 0 people on site during a clean, 70 m maximum building height, 5 surfaces, 2 systems on 1 platform.
- Vision letter: "Why we are building Lienry." Three short paragraphs signed Liam Kennedy, Founder and CEO, with a placeholder for his photo and a card for the co-founder.
- Safety by design: "Safe by design, not by supervision." Tether, obstacle-avoidance camera, onboard surface checks, weatherproof dock, and a plain pre-launch line.
- Closing: "Be first on the roof." Buttons: Register interest, Book a pilot for commercial buildings, Investor enquiries.

### Other pages

- Platform: "One platform. Two systems. Six parts." Alternating rows for each part, then a specifications list of true facts only.
- Commercial: "Window cleaning that lives on the roof." Capsule, tether fed from above, scan to software, re-scan every two days, a cheaper long-term alternative to outsourced commercial window cleaning, and the pilot program invitation.
- Homes and Rentals: "Your property, cleaned from anywhere." Ground pod, material-aware pressure, personalised app, the landlord story in full.
- Solar: "Panels that stay at full output." Verified soiling statistics with citations (below), how the drone treats panels as their own material.
- Company: "Built in Sydney for the buildings people own." Statement, two founders, concept stage, pre-seed round, the hose-free model as an idea in development (the one mention on the site), investor enquiries.
- Register interest: "Tell us about your property." Type, name, email, phone (optional), property type, location, message.

### Verified statistics (the only ones the site may use, each cited on the page)

| Statistic | Source | Placement |
| --- | --- | --- |
| Soiling is responsible for an average 4–7% global energy loss and multi-billion-euro annual revenue losses | IEA PVPS Task 13/16 Fact Sheet, Understanding, Measuring, and Mitigating Soiling Losses in PV Power Systems, September 2025 | Solar page |
| Most operational Australian solar farms studied lose 8–9% of energy output to dust build-up between rainfall events | Prasad, Nishant and Kay, Applied Energy vol. 310, 2022, doi:10.1016/j.apenergy.2022.118626 | Solar page |
| Even with optimised cleaning, soiling cut global solar output by at least 3–4% in 2018, at least €3–5 billion a year | Ilse et al., Joule vol. 3 no. 10, 2019, doi:10.1016/j.joule.2019.08.019 | Solar page (secondary) |
| Australia passed 4 million small-scale renewable energy installations in December 2024; 1 in 3 suitable homes have rooftop solar | Clean Energy Regulator, 3 December 2024 | Solar page, Homes and Rentals |
| 30.6 per cent of occupied private dwellings in Australia are rented | ABS, Housing: Census 2021 | Homes and Rentals |

Candidates that were found but not verified against their primary source in this session (Safe Work Australia falls-from-height figures, IBISWorld cleaning market size, UNSW strata counts) are left out of the site until verified.

## 5. Page plans

### Home (most effort)

| # | Section | Content and media | Motion |
| --- | --- | --- | --- |
| 1 | Hero | Full-viewport film (H1 shot), poster image, eyebrow, headline, support line, two buttons, "Concept render" label, scroll cue | Headline words settle in over 900ms after the poster loads; video fades in when ready |
| 2 | Property strip | Five property types as a quiet mono-label row with small line icons | Reveal only |
| 3 | System explainer | Scroll-through list of six steps on the left, sticky still on the right that follows the step in view | IntersectionObserver picks the active step; stills crossfade with opacity only |
| 4 | 3D building | React Three Fiber: a low-poly mid-rise block of glass and render, a scan sweep line, wash progress filling facade tiles in glass-tint, debris zones shaded in debris amber, a legend, and a "Model is illustrative" note. Video fallback (from the Software still) on low-power phones and reduced motion | Scroll-linked sweep and progress; pointer orbit within 20 degrees |
| 5 | Two systems | Two portrait cards (M2 and M3 stills), three-line spec lists, links to the system pages | Reveal, stagger |
| 6 | Places it works | Horizontal card carousel of five tall portraits (P1 to P5), drag, arrow keys, dots | Transform-driven track, 320ms ease |
| 7 | Landlord story | Scroll-through list of five beats with a sticky phone frame and still from lg up; each beat carries its own still below lg | IntersectionObserver picks the active beat; app states and stills crossfade with opacity only |
| 8 | Counters | Five true-fact counters in Geist Mono 300 | Count up once over 1200ms |
| 9 | Vision letter | Sunken band, letter from Liam Kennedy, photo placeholder, co-founder card | Reveal |
| 10 | Safety by design | Dark band, four columns with small stills (F1 to F4), pre-launch statement | Reveal, stagger |
| 11 | Closing CTA | One sentence, M3 still, three buttons | Reveal |
| 12 | Footer | Four columns, statement, wordmark | None |

### Platform

Hero (statement headline, H0 still cropped 21:9), six alternating rows (Dock, Tether, Drone, Scan, Software, Automation; stills S1 to S6, image 6 columns, text 5 columns offset 1), specifications list (true facts), safety summary, closing CTA.

### Commercial

Hero with the capsule film (C2) or still (C1), "How a Lienry clean works on a commercial building" as four steps, "What the software shows" as three tiles (3D model, live wash progress, debris shading), "Why it costs less over time" written as a comparison of what is no longer needed (no prices), pilot program block with the Book a pilot button.

### Homes and Rentals

Hero with the ground pod still (Ho1), "How the home system works" as four steps, the landlord story in full, app features (start a clean from anywhere, choose the areas, adjust pressure per material), the ABS renting statistic and the rooftop solar statistic, register interest block.

### Solar

Hero with the solar farm still (So1), the three verified soiling statistics as large cited numerals, "How Lienry cleans panels" (identifies the material, adjusts pressure, re-scans on the interval you set), rooftop and solar farm use cases, close-up still (So2), register interest block.

### Company

Statement paragraph, founders (Liam Kennedy, Founder and CEO, photo placeholder; co-founder card with name and photo placeholders), "Where we are" (Sydney, concept stage, raising pre-seed, pilot program), "What we are exploring" (the hose-free model, one sentence), investor enquiries block.

### Register interest

Form: type (homeowner, landlord, commercial pilot, investor; pre-selected from `?type=`), name, email, phone (optional), property type, suburb or city, message. Client and server validation with zod, honest success state, API route stub that logs and forwards to an optional webhook URL.

### Privacy

Plain-English template covering what the form collects, how it is used, no sale of data, contact details placeholder, and a note that it must be reviewed before launch.

## 6. Higgsfield shot list

Models, chosen from the connector's catalogue:

- Master stills and hero-grade stills: Nano Banana Pro (`nano_banana_pro`, 4 credits at 4K, 2 credits at 2K). Best photoreal product rendering in the catalogue and accepts image references, which is how every later shot keeps the product identical.
- Derived stills in volume: Seedream 4.5 (`seedream_v4_5`, 1 credit, up to 4K, precise control, accepts image references). Nano Banana Pro is used instead where a shot is hero-grade.
- Video: Kling 3.0 pro (`kling3_0`, 8.75 credits for 5s, 17.5 for 10s at 16:9, start image supported) for calm camera moves from an approved still. Seedance 2.0 (72 credits for 8s at 1080p) is the reserve for the hero if Kling cannot hold the product identity. Cinema Studio 3.0 (80 credits per 8s) and Veo 3.1 (58 credits) are outside the budget.
- Balance at planning time: 210 credits. Plan below totals about 135 credits including one retake per video, leaving a margin.

Every shot uses the approved master stills as image references, carries the imagery direction above in its prompt, and is logged in `docs/MEDIA.md` with prompt, model, file path and placement. Stills are made before videos; only stills that pass review are animated.

Production note (18 September 2026): the account is on Higgsfield's starter plan, which gates Nano Banana Pro at 4K and Kling 3.0 pro to the Plus plan. The masters and every derived still were made with Seedream 4.5 instead (1 credit each), and the films with MiniMax H3 (first and last frame from the approved still, so each loops seamlessly) and Kling 3.0 Turbo. The final list of what was made is in `docs/MEDIA.md`.

| ID | Purpose | Placement | Aspect | Length | Model | Credits | Draft prompt |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M1 | Drone master still | Reference for every shot; Platform "Drone" row | 3:2 | still | Nano Banana Pro 2K, 2 variants | 4 | Compact autonomous exterior-cleaning quadcopter, matte pale-grey composite body, slate accents, four shrouded rotors, slim front spray arm, thin translucent water tether from the underside, two small sensor lenses, hovering before a clean glass curtain wall at first light, thin sheet of water on the glass, soft diffused light, 85mm, photoreal, no text, no logos, no people |
| M2 | Roof capsule master still | Two systems (Commercial), Platform "Dock" | 3:2 | still | Nano Banana Pro 4K with M1 reference | 4 | Weatherproof rooftop capsule, low rounded pale-grey composite shell about 1.2 m long on a mid-rise plant deck, hatch open, the same drone resting on its cradle inside, tether reel and standpipe beside it, city rooftops soft behind, morning light, no landmarks, no text |
| M3 | Ground pod master still | Two systems (Home), closing CTA, Platform "Dock" | 3:2 | still | Nano Banana Pro 4K with M1 reference | 4 | Waterproof ground pod, compact pale-grey composite unit on pavers beside a garden tap at a Sydney suburban house, coiled tether to the tap, the same drone resting on top, terracotta roof and solar panels soft behind, dew on the pavers, early morning |
| H0 | Hero still (start frame and poster) | Home hero poster, Open Graph image, Platform hero | 16:9 | still | Nano Banana Pro 4K with M1 reference | 4 | The drone finishing a glass wash on a mid-rise facade, three-quarter view from slightly below, water sheeting down the panes in a continuous film, mist catching first light, the street quiet and empty, warm lifted shadows |
| H1 | Hero film | Home hero | 16:9 | 10s loop | Kling 3.0 pro from H0 | 17.5 (+17.5 retake) | Slow dolly-in of 10 percent, the drone drifts one metre along the facade, water keeps sheeting, no camera shake, seamless loop feel, silent |
| S1–S6 | System explainer tabs: Dock, Tether, Drone, Scan, Software, Automation | Home explainer, Platform rows | 4:3 | stills | Seedream 4.5 with M1/M2/M3 references (Software tile is built in code, so five stills) | 5 | Dock: capsule hatch closing at dusk on the roof. Tether: close view of the thin tether against glass with water inside it. Drone: hero product three-quarter. Scan: the drone hovering off a corner of the building with faint horizontal scan lines drawn on the facade. Automation: the capsule at dawn with the drone lifting off, nobody on the roof |
| P1–P5 | Places it works portraits: commercial tower under 70 m, apartment building, house, rental property, solar farm | Home carousel | 2:3 | stills | Seedream 4.5 with references, Nano Banana Pro for P1 and P5 | 7 | Each a quiet early-morning exterior with the drone small in frame mid-clean, water on the surface being cleaned, no people |
| Y1–Y5 | Landlord story beats: driveway before, panels being cleaned, drone over the driveway, drone returning to the pod, house clean and empty | Home story, Homes and Rentals | 4:5 | stills | Seedream 4.5 with M3 reference | 5 | Rental house on a quiet Sydney street, no people, progression from grimy driveway and dusty panels to clean, morning light |
| C1 | Commercial hero still | Commercial page hero | 21:9 | still | Nano Banana Pro 4K with M2 reference | 4 | Plant deck at dawn, capsule open, drone lifting, a 12-storey glass facade dropping away below |
| C2 | Commercial clip | Commercial hero (optional) | 16:9 | 5s | Kling 3.0 pro from C1 | 8.75 | The hatch is already open, the drone rises 40 cm and turns toward the edge, slow, silent |
| Ho1 | Homes hero still | Homes and Rentals hero | 21:9 | still | Nano Banana Pro 4K with M3 reference | 4 | Ground pod beside the house at first light, drone on its cradle, wet pavers |
| So1, So2 | Solar farm row at first light with the drone; close-up of mist on a panel | Solar page | 21:9, 3:2 | stills | Nano Banana Pro 4K, Seedream 4.5 | 5 | Solar farm row, dew, the drone low over the panels, no people; macro of water beads on a panel |
| F1–F4 | Safety details: tether close-up, sensor camera close-up, nozzle and surface check, dock hatch seal | Home safety band, Platform | 1:1 | stills | Seedream 4.5 with M1/M2 references | 4 | Product macro, soft light, no text |
| Co1 | Company page still | Company page | 21:9 | still | Seedream 4.5 | 1 | A harbour-side mid-rise street in Sydney at dawn, generic, no landmarks |

Approval gates: M1 (this round), then M2, M3 and H0 together, then everything else in one batch. Videos are only made from stills that pass review. No extra videos without asking.

## 7. Build plan

- Next.js 16 (App Router, Turbopack), TypeScript 5.9, Tailwind CSS 4 with the identity as `@theme` tokens, Motion for React 13, React Three Fiber 9 and drei 10 for the building, zod 4 for the form, sharp for image work. Fonts from Fontsource.
- Structure: `src/app` (routes, layout, sitemap, robots, API route), `src/components` (primitives, sections, three), `src/content` (all copy, navigation, statistics with citations), `src/lib` (motion presets, IntersectionObserver hooks, video playback helper, utilities), `public/media` (optimised assets), `scripts/media` (download and optimise pipeline), `scripts/screenshots.mjs`.
- Performance budget: hero video under 4 MB as MP4 and WebM with a poster; images as AVIF/WebP with explicit sizes; everything below the fold lazy; the 3D scene loaded only on capable desktops; largest contentful paint under 2.5s on mobile, which means the hero poster is a small, preloaded AVIF and the film is deferred.
- Accessibility: WCAG AA contrast for every text pair, visible focus rings, full keyboard operation of tabs, carousel and form, `prefers-reduced-motion` respected everywhere, alt text on every image, no motion that cannot be paused.
- SEO: per-page metadata, Open Graph image, favicon, `sitemap.xml`, `robots.txt`, canonical URLs, JSON-LD Organization.

## 8. Honesty checklist

- No customers, logos, testimonials, results, prices, certifications or CASA approval anywhere.
- Every statistic on the site is in the verified table above and cited on the page.
- The hose-free model appears once, on the Company page, as an idea in development.
- Every AI visual carries a "Concept render" label. No AI portraits of the founders.
- Pre-launch wording on every page: register interest, pilot program, in development.

## 9. Open items for Liam

1. Approve or reject the M1 drone master stills (two variants) so the rest of the shot list can be made with the product locked.
2. Confirm the headline "Clean exteriors. Nobody on site." or pick another line.
3. Supply the co-founder's name, title and photo, plus Liam's photo, for the Company page and the vision letter.
4. Confirm the email address that enquiries should go to, or a webhook URL for the form.
5. Confirm the domain (the plan assumes lienry.com for metadata).
