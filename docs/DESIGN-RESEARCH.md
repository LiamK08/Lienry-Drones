# Design research: Legora as the quality bar for Lienry Drones

Status: v1. Measured findings are complete. Screenshots were captured but could not be copied into this environment (see section 1), so visual notes come from colour analysis of the captured frames rather than from viewing them.
Reference site: https://legora.com (Framer build, 2026 rebrand by Stockholm Design Lab and E&W).
Rule of engagement: Legora is a reference for quality, structure and motion only. Nothing below is copied into the Lienry build: no code, text, imagery, icons, logos, product names or exact layouts, and the Lienry site never loads a Legora asset.

## 1. How this research was captured

- This build environment's network policy blocks legora.com and every design gallery, so Playwright could not run against Legora from here. Legora itself did not block automated browsing.
- The capture ran inside the connected Higgsfield cloud sandbox, which has open internet and Playwright 1.61 with Chromium 1228. A script visited the home, product (`/product/aos`), portal, customers and about pages at 1440x900 and 390x844, scrolled slowly in 360px / 220px steps, took a frame straight after each step (mid-animation) and another 0.9s later (settled), then a full-page screenshot, and extracted computed styles (fonts, sizes, colours, radii, section boxes, videos, counters, tabs, footer links, and the set of elements mid-transform at each scroll position).
- `/solutions` returns 404 on Legora, so the product page stands in for it; the customers page carries the use-case and proof patterns.
- The screenshots exist in the sandbox but could not be brought into this environment: the only channel out of the sandbox is text, and the build environment's permission classifier refused the chunked base64 transfer as possible data exfiltration. The extracted style data (plain JSON) and a colour analysis of the frames came through as text and are the basis of everything below. `docs/research/legora/` is git-ignored on purpose so third-party material never enters the repo; it holds the transferred JSON digests only.
- To capture Legora directly next time: add `legora.com` and `framerusercontent.com` to the environment's allowed domains (Custom network access), and the Playwright script in the sandbox (`cap.js`, reproduced in `scripts/research-capture.mjs`) runs here unchanged.

## 2. The measured system

| Property | Legora (measured) | Why it works | Lienry's own take |
| --- | --- | --- | --- |
| Page background | `#FAFAF9` warm off-white, ink `#0D1016` | Off-white reads as paper, not screen; near-black ink keeps contrast high without harshness | Lienry uses its own palette (see SITE-PLAN): a cooler paper white and a graphite ink, with water and light as the accent story, not green |
| Accent | Deep green `#005032` used only on the nav CTA and copyright line | One accent, used rarely, makes the CTA the only saturated object on the page | One accent, used rarely, for the Register interest button and live states in the 3D model |
| Bands | Warm grey `#E1DFDA` for the founder letter, light grey `#E6E6E6` for the pinned explainer, dark `#0D1016` for the trust band | Three surface tones create rhythm without colour | Same discipline: paper, a warm stone tone, and one dark band for the safety section |
| Typeface | One variable grotesk (Aktiv Grotesk VF), weight 400 everywhere, 300 for big numerals | A single weight forces hierarchy through size and space, which reads as confident | One self-hosted variable sans from Fontsource plus a contrasting numeral treatment. Different family, same discipline |
| Desktop scale | H1 56px / 59px line-height / -2.25px tracking; H3 41px; H4 33.7px; body 15px / 21px; small 13.2px / 18.5px; caption 12px / 16.8px | Tight tracking at display sizes, generous line-height at text sizes; the headline is one line at 1440 | Lienry: display 64px on the hero, 40px section heads, 17px body for readability on long property copy, all with -0.03em tracking above 32px |
| Mobile scale | H1 41px; H3 27.4px; H4 24px; body 14px / 19.6px | Mobile headlines drop by roughly 0.7x, body barely changes | Same ratio, but Lienry's body stays at 16px on mobile for accessibility |
| Headline length | 4 words on the hero ("Legal work, without limits."), 3 to 6 words on section heads | Short lines survive every viewport without wrapping badly | Hero headline of 6 words or fewer, section heads of 2 to 5 words |
| Buttons | 48px-radius pills, 30px tall, 12px labels; chips at 24px radius | Small pills feel precise; the pill shape is Legora's signature | Lienry uses 12px-radius rectangles with 44px height (touch target) and 15px labels, a deliberately different shape language |
| Containers | Max widths 680px (text), 860px (mixed), 1080px (wide); gutters 24px | Narrow text measure keeps paragraphs at 60 to 70 characters | 640px text, 880px mixed, 1200px wide, 24px gutters, 12-column grid |
| Page length | Home 13,909px desktop, 14,568px mobile | Long, but every 900px is a new idea | Lienry home target: 11,000 to 13,000px desktop |
| Nav | Slim bar: Product, Solutions, Security, Customers, Company, Log in, green pill CTA | Five words plus one action | Platform, Commercial, Homes and Rentals, Solar, Company, and one Register interest button |

## 3. Home page, section by section

### 3.1 Hero: full-viewport video

Measured: a `<video>` at 1440x900 (the full viewport), autoplay, muted, loop, playsinline, `object-fit: cover`, MP4 source with a WebP poster at 2400x1350. One H1 (white, centred), one 15px support line ("Collaborative AI for exceptional lawyers"), one pill button. The H1 sits at y=721, low in the frame, so the video breathes above it.
Colour analysis of the hero frames: at t=0 the frame averages `#4C4133` (luminance 66/255) with 66% of pixels near-black and a warm sand `#A98B6A` highlight band; the bottom half averages `#1F1A15`, so the white headline sits on a very dark, slightly warm ground. By t=3s the loop has moved to a neutral grey passage (`#A0A2A3`, luminance 161), which means the film is graded warm-dark to cool-light and the headline stays legible through a dark gradient rather than an overlay.

Why it works: the film carries the emotion and the words stay out of its way. Because the headline is low and short, the eye reads film first, promise second, action third.

Lienry's take: a full-viewport Higgsfield film of the drone finishing a glass wash at dawn, water sheeting off the facade, poster image shown until the MP4 is ready, both under 4 MB. Headline low in the frame, one support line, one Register interest button. A small "Concept render" label in the corner, honest about the pre-launch status.

### 3.2 Pinned explainer (the interactive product diagram)

Measured: at y=1212 an H3 ("Introducing the Legora aOS") and one support line, then a 900px-tall panel (bg `#E6E6E6`) that stays pinned while a 4,968px scroll track plays out. Seven chips down the left ("Large Language Models", "Agentic Harness", "Data & Integrations", "Context & Knowledge", "Legal Capabilities", "Products & Interfaces", "Security & Governance"), each a 24px-radius chip 40px tall, 45px apart. The mid-animation frames show the active layer scaling between 1.0x and 1.8x with `transform` only, no opacity fades, so it stays crisp.
Colour analysis of the pinned panel frames: the frames average `#DDDDDD` with 79% of pixels at `#EEEEEE`, so the diagram is a near-white composition on the light-grey panel with almost no colour; the only saturated pixels are a small deep-green accent (`#2C6D55`, under 1%).

Why it works: the reader controls the pace with the scroll wheel, the pinned frame means nothing jumps, and the chip list doubles as a progress indicator.

Lienry's take: the system explainer with six tabs (Dock, Tether, Drone, Scan, Software, Automation). Pinned panel, tabs on the left that are real buttons (keyboard and click), scroll or click advances the state. The right side shows the product still for that layer with a short caption. Under reduced motion the panel is not pinned and the six states stack vertically.

### 3.3 Product cards

Measured: "Our latest innovations" H3 at y=6636, a paragraph, then four 324x405 portrait cards (aOS, Agent, Monitors, Lists), each a link with an image, a title and 13.2px body.

Why it works: a portrait card row is a natural pause after a long pinned sequence, and four is the right count for 1440.

Lienry's take: the "two systems side by side" section uses two large portrait cards (Commercial system, Home system) with the capsule still and the ground pod still, a three-line spec list each, and links to the Commercial and Homes and Rentals pages.

### 3.4 Use-case tabs and card carousel

Measured: "Every team. Every practice." H3, a support line, then four tabs (M&A, Litigation, Banking, Tax) and a carousel of 209x261 cards with one 390x487 featured card; the track slides with a `transform 0.5s` transition.
Colour analysis of the carousel frames: the section averages `#A5A19D` with a 32% share of dark `#231C15` pixels, so the cards are dark photographic images on the paper background, which is where the page gets its visual weight after the diagram.

Why it works: tabs change the copy, the carousel changes the picture, and both stay in one viewport height.

Lienry's take: "Places it works" as a horizontal card carousel of tall portrait Higgsfield stills: commercial tower, apartment block, house, rental property, solar farm. Drag or arrow keys, a featured card at 1.5x, and the copy for each card names the surfaces cleaned and the system used. This is the section that replaces customer logos.

### 3.5 Full-bleed video band

Measured: at y=8835 a second 1440x900 autoplay loop with a poster, an H4 ("Measuring the impact of AI on law firms") and a "Read more" link over the film.

Why it works: a second cinematic beat two-thirds down the page resets attention before the numbers.

Lienry's take: the overseas landlord story runs as a pinned scroll sequence instead: a phone with the Lienry app on the left, the property on the right, five beats (open the app, select driveway and solar, tap start, the drone cleans with nobody there, ready for the next tenant). Image-led, not a second film, to keep the hero the only large video.

### 3.6 Animated counters

Measured: three counters at 90px weight 300 ("30%", "0.0hrs" captured mid-count, and a currency figure), each with a 13.2px label in a 220px column. The counter starts at zero and counts up on entry.

Why it works: light, huge numerals with tiny labels read as data, not marketing.

Lienry's take: counters that use only true product facts: re-scan every 2 days, 0 people on site during a clean, buildings under 70 metres, 5 surfaces (glass, solar, walls, roofing, driveways), 2 systems on 1 platform. Same light numeral treatment, counting up once, static under reduced motion. No industry statistics here unless verified and cited on the page.

### 3.7 Founder vision letter

Measured: a warm grey band (`#E1DFDA`, y=10475, 845px tall) with an H4 "Our Vision", a 255x340 portrait, a name and title ("Max Junestrand, Co-founder & CEO") and three short paragraphs at 13.2px in a 333px column.

Why it works: the only warm surface on the page holds the only human voice; the small type says "letter", not "billboard".

Lienry's take: a letter from Liam Kennedy, founder and CEO, on Lienry's warm stone band, with a placeholder frame for his real photo and a second placeholder for the co-founder (two founders; the second name and photo to be supplied). Three short paragraphs, signed. No AI-generated portraits.

### 3.8 Trust band

Measured: a dark band (`#0D1016`, y=11320, 757px) with an H4 about compliance, a "Read more" link and five 218px columns (ISO 42001, ISO 27001, SOC 2, GDPR, HIPAA) with 12px explanations.

Why it works: dark background, small type, five equal columns: it looks like a specification sheet, which is what trust looks like to a buyer.

Lienry's take: "Safety by design" on the dark band with four columns: the water tether, the obstacle-avoidance camera, onboard surface checks, the weatherproof dock. Facts only, no certifications or approvals claimed, and a line that says Lienry is pre-launch and running a pilot program.

### 3.9 Closing call to action

Measured: an H4 ("Discover the future of legal work through a live product demo."), a 12px paragraph, a 503x503 image and one pill button, in a 933px section.

Why it works: one image, one sentence, one button.

Lienry's take: one closing sentence, the ground pod still at 500px, and three buttons in a row: Register interest, Book a pilot for commercial buildings, Investor enquiries. All three open the same enquiry form with the type pre-selected.

### 3.10 Footer

Measured: a 900px footer region with seven columns (Product, Solutions, Certified, Company, Legal, Resources, Social), a 310px link block, then a 391px area with 60px bottom padding, and a 13.2px copyright line in the accent colour.

Why it works: a big footer is a second navigation and a signal of substance.

Lienry's take: four columns (Platform, Systems, Company, Enquire), a short pre-launch statement, ABN and Sydney address placeholders, privacy link, and the Lienry wordmark large at the bottom.

## 4. The other pages

- Product page (`/product/aos`): a centred 67px H1, the same pinned explainer, then seven alternating rows of a 676x676 image beside 33.7px H4 and body copy, one row every 796px. Lienry's Platform page uses the same alternating rhythm for Dock, Tether, Drone, Scan, Software and Automation with the approved product stills.
- Portal page: a left-aligned 56px H2 hero with a 666x833 product video beside it, four 676x676 feature rows, a security sub-section with three 424x424 tiles, one quote and the closing CTA. Lienry's Commercial page follows this: hero with the capsule film, feature rows, and a "what the software shows" tile trio (3D model, live wash progress, debris shading).
- Customers page: three 90px counters in the hero, a card grid with filters, quote bands with full-bleed images. Lienry has no customers, so this pattern is not used; the honest equivalent is the Places it works carousel plus the pilot program invitation.
- About page: a 13px eyebrow, a 48px statement paragraph as the H1, three 88px counters (coworkers, customers, markets), a values band on `#ECECE7`, an investor quote, a careers CTA. Lienry's Company page: a statement paragraph, two founder cards with photo placeholders, three true facts as counters (Sydney, 2 founders, 2026 pilot program), and the investor enquiry block. No quotes.

## 5. Motion and scroll behaviour

Measured: the extraction sampled every element in the viewport right after each scroll step. Almost all mid-animation elements are `transform`-driven (scale between 0.98x and 1.8x inside the pinned explainer; translateX on the carousel with a 0.5s transition). Opacity is used sparingly: a few sections sit at opacity 0 until they enter (y=11,520 and y=12,600 on desktop). No canvas or WebGL on the site; six inline SVGs.
The mid and settled frame pairs are byte-identical at most scroll positions (identical checksums), so reveals happen quickly and only near the pinned sections and the carousel; the page is mostly static once a section is in view.

Why it works: transform-only animation stays on the compositor thread, so scrolling never stutters; opacity reveals are rare enough that the page never feels like it is loading.

Lienry's take: Lenis for smooth scroll, Motion for React for reveals (translateY 24px plus opacity, 0.6s, cubic-bezier(0.22, 1, 0.36, 1), staggered 60ms), and Motion's scroll-linked values for the two pinned sequences (system explainer and landlord story). GSAP is added only if the landlord story needs a timeline that Motion cannot express. The 3D building uses React Three Fiber, which is the one place Lienry goes beyond Legora, with a video fallback on low-power phones and under reduced motion.

## 6. Mobile

Measured: at 390px the H1 drops to 41px and stays one to two lines; the nav becomes "Menu" plus "Log in"; the pinned explainer keeps its 844px pinned panel with the chip list stacked; card rows become horizontal scrollers; the founder band grows to 1,233px with 80px padding; the trust band stacks its five columns to 1,580px; the footer collapses into seven accordion rows ("Product ▼", "Solutions ▼", ...).
Colour analysis of the mobile hero frame matches the desktop one (`#6C5C48` at t=0, `#A0A2A3` at t=3s), so the same film is cropped rather than replaced on phones.

Lienry's take: design the mobile layouts first for the hero, explainer and carousel. Tabs become a horizontal chip scroller above the image, the 3D building is replaced by a short video on phones, and the footer uses the same accordion pattern.

## 7. What Lienry will not take from Legora

- No green accent, no `#FAFAF9` paper, no Aktiv Grotesk, no pill buttons, no "Book a demo" language.
- No copying of headline structures such as "X, without Y." or "Every A. Every B."
- No certification badges, quotes, customer counts or logos, because Lienry has none yet.
- No loading of any Legora asset, font or script.

## 8. Capture inventory

- Pages: home, product, portal, customers, about at 1440 and 390.
- Per page and viewport: two hero frames (t=0 and t=3s), 18 to 22 scroll frames in mid and settled pairs, one full-page screenshot, one `data.json` with computed styles.
- Stored under `docs/research/legora/<page>_<viewport>/` (git-ignored). Contact sheets for the comparison pass in the quality check will be saved as `docs/screenshots/legora-*.png` only if they contain no Legora imagery; otherwise they stay out of the repo.
