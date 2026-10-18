# Design pass, 17 October 2026

This is the record of the design pass of 17 October 2026. It covers:

- what we measured on legora.com and refresh.tech;
- which ideas we took from them, which we left, and why;
- the system the build follows, with the check that enforces each rule;
- the image grade and the crops;
- the page plans, the copy budget and the commands;
- what we still need from the owner.

## Status (18 October 2026)

The owner asked to ship what was done. What is on `main`:

- **Image grade:** every still and film graded to one overcast-morning look (section 8, `docs/MEDIA.md`).
- **Design sheets:** the approved sheets in `docs/references`.
- **Design system:** the spacing scale, tone tokens, role tokens, eyebrows, the one state system and the new primitives (Part B of the build spec).
- **Content:** the copy split into one module per route.
- **FAQ bank:** rewritten from `docs/SITE-PLAN.md` facts.
- **Calculator:** its logic and copy.
- **Loading:** first screens no longer wait for JavaScript, and the mobile load gate uses Lighthouse with applied throttling. On localhost, simulated throttling counts every script and font as blocking.
- **Checks:** the rewritten check scripts (`check:layout`, `check:rules`) and the new ones (`check:a11y`, `perf:vitals`, `perf:motion`).

The home page is rebuilt in eight sections that alternate dark and light:

1. the film hero with one button;
2. four benefit cards, the first playing the commercial clip on hover or focus;
3. the 01 Scan to 05 Report flow driving the coded software window;
4. the cost calculator;
5. five 2:3 portraits on a carousel;
6. the founder letter in the serif;
7. the FAQ;
8. the closing collage.

On the home page, `check:layout`, `check:rules`, `check:a11y` and `perf:vitals` all pass. On a throttled phone, the main content now appears at 1.8 s (Lighthouse with applied throttling), against 7.9 s before.

### Inner pages (18 October 2026)

Every inner page now opens on `PageHero` and closes on `ClosingSection` (or the questions, on /download), with plaster and ink alternating down to the ink footer:

- **/platform:** hero, the six parts as a card grid on ink (each card is the anchor the footer's `/platform#dock` to `#automation` links land on), the two systems, the questions, the ask.
- **/commercial:** the commercial film hero with the four steps continuing it on plaster, the software window on ink, the calculator (opening on Commercial building), the questions, the pilot ask with a collage.
- **/homes-and-rentals:** hero, the app told as five beats of one clean on ink, two cited figures, the questions, the ask.
- **/solar:** hero, three cited soiling figures on ink, three cards (p5, y2, y1), the questions, the ask. No copy names the system that serves solar farms.
- **/company:** hero, where the company is, the three rules (Honest by default among them), the founders and the hose-free idea, the investor ask.
- **/download:** hero with the buttons and the working window, what it does, the questions. System requirements are a question; the "active software plan" and automatic update claims are now "still being finalised".
- **/register-interest:** one band, the head and image beside the form, every control a `Field`; success replaces the form and takes the focus.
- **/privacy:** one band, the six sections in `[data-prose]`.
- **404:** a `PageHero` with the way home.

The uncited savings copy ("a cheaper long-term alternative", "Why it costs less over time") is gone. Switcher, CtaPanel, SiblingCards, PageHeroSplit, SpecBand and CtaWithProduct are deleted. `check:layout`, `check:rules` and `check:a11y` pass on all routes. `perf:vitals` (mobile, applied throttling, three runs) passes on all nine: median LCP from 1.6 s (/privacy, /register-interest) to 2.42 s (/commercial), CLS at most 0.08 (/solar).

Sections 5 to 13 describe the build spec of 17 October. Where the research draft and the spec disagreed about what Lienry will do, the spec won.

## 1. The brief and the owner's answers

### The brief (17 October 2026)

The owner asked for a site "as considered as legora.com and refresh.tech". Both sites are references "for quality and structure only. Never copy their code, text, images or exact layouts."

The brief sets these standards:

- a strict 8 pixel spacing scale, with section padding of 120 to 160 pixels on desktop and 72 to 96 on mobile;
- alternating warm off-white and near-black sections;
- copy cut by a third, headlines under 8 words, paragraphs under 3 lines, and no orphaned words in headings;
- deliberate, consistent hover, focus and active states;
- the mobile layout of each section rebuilt deliberately;
- media that reads as one shoot, with matching light direction and a drone, capsule and pod that match;
- no pricing yet;
- checks for accessibility, LCP and 60fps, the check scripts, and this document.

The brief names these ideas to adapt:

- From ReFresh: one italic phrase per section, lowercase eyebrows, a cost calculator that uses only the visitor's own figures, benefit cards with hover clips, a numbered 01 to 05 flow, an FAQ and a collage close.
- From Legora: a calm full-screen hero with one button, fewer and larger sections, a 2:3 portrait carousel, a founder letter in serif and a large grouped footer.

### The owner's answers

- **Captions:** Concept render captions stay off. The owner removed them on 26 September and confirmed this on 17 October. `npm run check:rules` check 12 is unchanged.
- **New shots:** none. Higgsfield has 0 credits. The owner asked whether ChatGPT could make images. It is not connected to this session, so it cannot.
- **Reach:** the reference sites and the media CDN can be reached now. The captures in section 2 were taken today, and crops, grading and LCP are tested on the real graded media.

### Lead decisions on the spec's open items

- **F1 is closed.** The reference captures exist. They were taken today at 1440 and 390, with mid-animation frames.
- **F3 is approved.** The home hover card gets a 540p rendition of `c2-commercial-clip`:
  - the manifest sets `renditions: [540]`;
  - the files are `c2-commercial-clip--540.mp4` and `.webm`;
  - benefit card 1's clip carries `rendition: 540`.
  This is a smaller encode of an existing film, not a new shot, and it is logged in `docs/MEDIA.md`.
- **F12 is approved as a states-only change.** The header button and the phone-menu buttons get the pressed state. Their layout does not change. `npm run contrast` runs again after the change.
- **P10** is this document.

## 2. Method

### Captures

- **When and how:** 17 October 2026, Playwright with Chromium.
- **Widths:** 1440x900 for desktop and 390x844 for mobile.
- **legora.com pages:** home, `/product/agent`, `/solutions/law-firms`, about, `/book-a-demo`, `/legal/privacy-policy` and `/roi-in-house` (a research report).
- **refresh.tech pages:** home, `/platform`, `/platform/risk-intelligence`, `/solutions/industry/manufacturing-construction`, about, `/demo`, `/legal/privacy-policy` and `/readiness-check`.
- **www.lienrydrones.com pages:** home, platform, commercial, homes and rentals, solar, company, register interest and privacy, all as served live.
  - /download was not in the capture set.
  - The live media is ungraded, because the house grade exists only on the working branch.

### Frames saved for each page and width

- The first screen at 0.4s, 2s and 4.5s, to show how it enters.
- At each scroll stop, one frame 90ms later (mid-animation) and one 1s later (settled).
- On desktop, the pointer over each media card at 0.35s and 1.25s.
- The full page.
- `data.json`: the computed styles of headings, paragraphs, buttons, videos and full-width sections. That means family, size, line height, tracking, position, padding, radius, ground colour and maximum width.

### What each measurement means

- **Sizes, x positions, colours and padding** come from the computed styles. On Legora's 1440 home, the `data.json` y values drift from the frames below the hero, so we took vertical positions from the frames instead.
- **Vertical gaps** were measured inside a single frame.
- **Motion** was read by comparing each 90ms frame with its settled frame. A byte-identical pair means nothing moved.
- **Contrast** is the WCAG ratio, computed from the measured colours.
- **Images:** Lienry's 29 stills and film posters were measured in CIE Lab:
  - L* is lightness;
  - b* is warmth (positive is warm) and a* runs from green to red;
  - C* is chroma, or saturation;
  - σL* is contrast (the spread of L*);
  - L1 and L99 are the black and white points (the 1st and 99th percentiles of L*).

### Gaps in the evidence

- Focus states were not captured on any site. Hover was captured only where a page has media cards.
- Two parts of the Legora capture failed. Its scroll-driven stage video never loaded, and its 1440 full-page image is cut off, so we used the viewport frames.
- ReFresh's hero film, its step-panel video and its mobile card videos did not render in headless Chromium. Nothing here describes their content.

### Where the captures live

- The captures are in `/tmp/claude-0/-home-user-Lienry-Drones/0422368e-18fd-5b50-864b-7aad38ce1912/scratchpad/research/`, in the folders `legora/`, `refresh/` and `lienry-before/`, with one folder per page and width.
- The five teardowns are `analysis-0.txt` to `analysis-4.txt` in `/tmp/claude-0/-home-user-Lienry-Drones/0422368e-18fd-5b50-864b-7aad38ce1912/scratchpad/dp/`.
- This is a private working folder. Nothing in it is committed.
- `docs/research/legora/` is git-ignored. Any ReFresh material copied into the repository needs the same treatment.
- Comparison sheets that include reference frames also stay out of the repository.
- This document keeps only measurements and our own descriptions. It quotes no more than two or three words of either site's copy.
- The Lienry site never loads anything from either site.

### Earlier research

- `docs/DESIGN-RESEARCH.md` (September) was written from style data alone. Where its Legora numbers differ from these, today's captures replace them.
- The spec's audits measured a local build of 80ed265. The copy gate's baseline is a build of 1e63818 (section 11).

## 3. What makes legora.com feel premium

Numbers are from the home page at 1440 unless marked.

1. **Size carries the hierarchy, not weight.** 81 of 86 text runs are weight 400 and 5 are Medium. Seven sizes cover the page: 67.5, 41.25, 33.75, 22.5, 18, 15 and 13.1px. Body copy never goes above 18px.
2. **Display type is set solid.** The H1 is 67.5px at line height 1.0 with -0.01em tracking. Body text is at 1.3. Stat numerals use a lighter face, at weight 300 and -0.03em.
3. **Tight inside a block, open between blocks.** Heading to paragraph is 40 to 50px, and paragraph to content is 60 to 90px. Between sections there is 160 to 270px of empty ground, roughly 1:4. Inner pages pad each chapter by 160px at 1440 and 120px at 390.
4. **Few sections, few asks.** There are nine H2s in 13,732px, about one every 1,500px. The whole page has three primary buttons: header, hero and closing card.
5. **One grid.** Margins are 24px at 1440, which leaves 1,392px of content, and 16px at 390. Everything snaps to x 24, to the half line or to a fixed pitch (356px for four cards). On inner pages, content starts on the 34% line (x 491 to 493).
6. **Short measures.** 18px copy runs 396 to 484px wide, about 45 to 55 characters a line. Card copy is 324px wide.
7. **Tone, not hue.**
   - The grounds are #FAFAF9, #E6E6E6, #E1DFDA and #0D1016, with one hue in two shades (#005032 and #003D26).
   - On home, a dark band comes every two or three light ones, and a light, text-led band follows each dark one.
   - Inner pages keep to one dark band, about a tenth of the height (1,031 of 10,823px on the segment page).
   - Ink on ground measures 18.2:1, and grey body text 5.1 to 5.6:1.
8. **Type sits where the film is already dark.** In the hero film, rows at y 100 to 250 average 160 to 175 out of 255, and rows at y 700 to 850 average 4 to 10. The type sits only in that dark band, 60px above the bottom edge, with no box and no text shadow.
9. **One image family per section, fixed crops.**
   - Cards are 4:5 at both widths: 324x404 at 1440 and 173x216 at 390.
   - Films are full-bleed on desktop and recropped on mobile: 2:3 on home, and inner heroes go from 16:9 to 1:1.
   - Corners are square.
10. **Motion is rare and small.** On home, six things move: the hero type, the explainer stage, the carousel timer, the counters, a signature and the footer wordmark. On inner pages, about 85% of mid and settled frame pairs are identical. Elements rise 5px and scale from 0.9 to 1. Everything except the counters settles within 1s.
11. **The hero enters once.** The H1 is invisible at 0.4s and settled by 2s. The 2s and 4.5s frames are byte-identical, and after that only the film moves.
12. **Mobile is rebuilt, not stacked.**
    - The explainer list becomes one docked card with previous and next buttons.
    - Four cards become a 2x2 grid of 173px columns with a 12px gutter.
    - The carousel becomes a 304px card on the margin, with 55px of the next card showing.
    - The footer columns become seven accordion rows of 46px.
    - The mobile home is 0.86 times the desktop height (11,743 against 13,732px).

Where Legora falls short:

- Body text drops to 12.3 to 13.7px on phones.
- White text on its grey pills is 4.5:1.
- A "Loading..." placeholder shows where a video never loaded.
- Scroll-fill text on the about page rests at about 2.2:1.
- The privacy table scrolls sideways at 390.
- Form fields use the placeholder as their only label.

## 4. What makes refresh.tech feel premium

Numbers are from the home page at 1440 unless marked.

1. **One serif at one weight.** Every heading is PT Serif 400, over Inter. Display tracking is -5 to -6% (-2.4px at 48px), at line height 1.1. Inner-page headings step 40, 36 and 32px, and never go higher.
2. **The italic is rationed.** 2 of the 9 home headings use an italic clause. Each time it is the closing phrase, at the same size. In the hero, the italic is the same white as the rest of the line.
3. **Every section opens the same way.** First the eyebrow, then 16px, then the heading. Then about 15px and an intro in a 450px column (about 55 characters). Then 40 to 50px, and the module.
4. **Bands change ground, not rules.** The grounds step between #FFFFFF, #FAFAFA and #F5F5F5, with no borders. Five of the eleven home bands have 96px of padding top and bottom.
5. **Dark is an event.** Each page has two dark plates: one band about 62% of the way down, and the black footer.
6. **One accent.** #5E52FF fills about 31 elements and colours the text of about 8. Everything else uses six neutrals.
7. **The calculator answers with the visitor's own number.**
   - It is a 1,000x408 card, split 500/500.
   - Input on the left: a question, a number field, and a slider with its minimum and maximum.
   - Result on the right: a 44px serif figure, three line items on a 40px pitch, one full-width button, and a footnote that names its research source.
   - It updates live from the slider and does not animate on scroll.
8. **Hover changes the layout.**
   - Five cards of 273x500 sit 4px apart.
   - The hovered card grows to 726px by 0.35s and to about 739px by 1.25s. The other four narrow to 156 to 163px, and the height stays 500px.
   - About 95% of the travel happens in the first 350ms, and a two-line description appears.
   - At 390 the row becomes a one-card swipe track, so the section is 767px tall instead of over 2,000px.
9. **A five-step flow with a timer.** Five tabs, each 224px wide on a 244px pitch. Each tab has a 3px rule that fills linearly, at about 4 to 4.5s per step. The 1,200x483 panel below fades in its new picture over 0.5 to 0.9s.
10. **Scrolling feels instant.** 6 of the 11 home scroll stops give byte-identical mid and settled frames. The others differ only in the logo strip, the step timer or the footer. The first screen is static on 5 of the 7 inner pages.
11. **One shoot per set.** The five benefit portraits share eye-level framing, heads in the top third, warm interior daylight and a tall 1:1.83 crop. The article grid beside them mixes stock photos and illustration, and looks cheaper for it.
12. **A footer that signs off.** A 1,031px black plate with 120px of top padding, a wordmark about 465px wide, and four link columns on a 314px pitch, with links on a 31px pitch.

Where ReFresh falls short:

- Inner-page body text is 14px at line height 1.2, and lines run 130 to 165 characters on the about, segment and privacy pages.
- One page has three left edges, at 44, 56 and 120px.
- The home page uses four section-heading sizes.
- Inactive tabs measure 2.5:1.
- At 390:
  - the hero buttons are clipped;
  - a 1,200px card does not reflow;
  - a 468px black panel stays empty;
  - the gutters are 10px;
  - a chat bubble covers figures.

## 5. Ideas adapted for Lienry

| Idea | Source | Where on Lienry | How it is adapted rather than copied |
| --- | --- | --- | --- |
| Calm full-screen hero with one button | Legora home hero; ReFresh home hero (block anchored to the bottom) | Home hero | The existing `h1-hero-film` fills the viewport (100svh), with no new media. One heading, one support line and one button, "Register interest", are centred and anchored to the bottom: 128px below the button from 768 and 96px at 390. The "See how it works" link is gone. Unlike Legora's, the type does not animate in, because nothing in a first screen reveals. Before the pass the hero h1 was the slowest LCP on the site, at 7.86s. The film fades in over 1.2s once its sources load after the page is idle. At 390 the poster uses h0's portrait variant at "63% 50%", so the drone stays in frame. `npm run contrast` proves the bar and the button. It stays the only centred block on the site. |
| Fewer, larger sections | Legora (tight inside a block, open between; 160px chapters); ReFresh (96px bands) | Every page | Section padding is 128px from 1024, 96px from 768 and 80px below, inside the brief's ranges. Head to content is 64px from 1024 and 40px below. Home goes from 12 sections to 8 plus the footer, and each inner page has five bands, with one idea per section. |
| One italic phrase per section | ReFresh headings | Section h2s and page h1s | At most one italic per band. It is always the heading's trailing phrase, in Instrument Serif italic at the heading's own size and colour. It is never teal, because teal means a link; ReFresh colours one italic word and we do not. Italics never appear in an h3, a paragraph, a question, a button, an eyebrow or the letter. The flow, calculator, letter and FAQ headings stay roman. |
| Lowercase eyebrows | ReFresh section heads; Legora's one sentence-case eyebrow | Above every section h2 and every inner-page h1 | A `<p class="eyebrow">` in Inter on the small step (14px), weight 500, normal tracking, lowercase, in the surface's muted colour. It is 1 to 3 words, 16px above the heading. No dot, no colour, no uppercase. The uppercase `.label` stays only for data labels inside the software window and app panel, and in the header. |
| Cost calculator from the visitor's own figures | ReFresh home calculator | Home (`#cost`) and /commercial (`#cost`, preset to "Commercial building") | Four fields: building type, facade area in m² (1 to 1,000,000), outsourced exterior cleaning spend per year in AUD (1 to 10,000,000), and an optional yearly increase in % (0 to 20, default 0). It shows the totals over 5 and 10 years and the cost per m² in year one, in whole dollars ("Under $1" below $0.50). The figures come from the visitor's own numbers only: no Lienry price, saving, ROI or comparison, and nothing leaves the browser. At 1440 the fields sit in columns 1 to 5, and a raised panel in columns 7 to 12 shows the three figures in light weight on the H2 step. Under the panel: "Uses only the figures you enter. Not a Lienry quote or estimate.", then one text link that follows the building type. Values update on every keystroke with no tween, and a polite status line reads them 600ms after typing stops. There is no slider. At 390 the fields stack over the panel. |
| Benefit cards with a hover clip | ReFresh benefit cards | Home (`#benefits`) | Four whole-card links, each 3 columns wide: a 4:5 still (330x413 at 1440), an H3 title and a 2-line body. On a fine pointer, hover or focus scales the image to 1.03 over 600ms and underlines the title. The card never changes width or height. Card 1 plays `c2-commercial-clip` over its c1 still (the clip's first and last frame), from the approved 540p rendition. The clip loops on hover, and on focus plays once for at most 5s. Cards 2 to 4 keep stills, each with a slot for a future clip. Touch, reduced motion and Save-Data show stills only. At 390 the row becomes a list of 112x140 thumbnails with the title and body beside each. |
| Numbered 01 to 05 flow driving the software window | ReFresh five-step flow; Legora's one-open-at-a-time stage | Home (`#software`) | Five tabs, Scan, Plan, Clean, Check and Report, sit in columns 1 to 10. Each shows a number and one word. A tab sets the coded window's layers and figures and swaps one caption line (200ms crossfade). Scan and Check replay the scan sweep; Report holds the wash at 100%. They are real WAI-ARIA tabs: the arrow keys wrap, and Home and End jump to the ends. The active tab carries a 2px rule. There is no timer, and nothing advances on its own. The band height stays the same on every step. At 390 the tabs form a compact 5-up grid over the 4:5 recording. "Demo data" and the illustrative-model note are unchanged. |
| FAQ | Legora segment FAQ; ReFresh FAQ | Ink band on home, /platform, /commercial, /homes-and-rentals and /solar; plaster on /download | One component on native `details`, with the head in columns 1 to 4 and the list in columns 6 to 12. Rows are hairline-divided and at least 64px tall, with questions on the lead step. The plus turns into a minus in 200ms. Answers are body text in the muted colour, 2 lines at most at 1440. Several rows can be open at once, and find-in-page reaches closed answers. One bank of ten answers lives in `src/content/faq.ts`, and home shows seven of them. No boxes, shadows or booking calendar. |
| Collage close | ReFresh closing CTA and footer collage; Legora inset CTA | Last band of home, /platform, /commercial and /homes-and-rentals | `ClosingSection` on plaster, left aligned: eyebrow, heading, one muted line, one primary button and up to two text links. Beside it are three existing stills with 4px corners and no faces: a 2:3 anchor (330x495 at 1440) and two filled tiles (330x235.5). They enter with the standard reveal and a 60ms stagger, and do not float. Each frame has a slot for a future clip. /solar and /company close with one 3:2 image instead. The teal closing panel is gone. |
| 2:3 portrait carousel | Legora practice carousel and its 390 peek | Home (`#places`) | Five place cards at 2:3, each 448x672 at 1440. Three are in view, on columns 1 to 4, 5 to 8 and 9 to 12, all the same size. The name and a 1 to 2 line body sit below the image, not over it. Two 44px square arrow buttons in the section head, and the arrow keys, reach cards 4 and 5. Nothing advances on its own. At 390 each card is 82% wide (293x440), with the next one showing. The card order keeps the closed-pod p5 out of any view with the open-pod p3 and p4. |
| Founder letter in serif | Legora vision letter | Home (`#letter`) | Instrument Serif on the H3 step (30px at 1440, 24px at 390), line height 1.3, in columns 5 to 12 on plaster. Four short paragraphs, which run 1, 1, 1 and 2 lines at 1440. The name, role and an "About Lienry" link sit in columns 1 to 4. There is no portrait or signature: a slot takes a real photograph only if the owner supplies one. This is the site's one passage of serif running text, and CLAUDE.md names it for the owner to review. |
| Large grouped footer | Legora footer (one colour, oversized wordmark); ReFresh black footer plate | Every page | The footer is ink, so every page ends on a dark beat. Columns 1 to 4 hold a two-line statement on the H2 step and the status line. Four link groups with eyebrow labels sit at x 496, 732, 968 and 1204, each 212 wide, with links in body text on rows at least 44px tall. Then "Lienry Drones" set large in Instrument Serif on the display step, a hairline and the legal line. At 390 the groups form an open 2x2 grid, with no accordions. No portraits. |
| Alternating light and dark | Legora (a dark beat every two or three light bands); ReFresh (dark as an event) | Every page | Sections alternate plaster and ink, and no two neighbours share a tone. The home film counts as dark. Raised and sunken are surfaces inside a section only. The footer is ink. |
| Cited figures | Legora stats rows | /homes-and-rentals (`#australia`), /solar (`#soiling`) | A hairline, then a light numeral (Inter 300 on the numeral step), the label on the lead step, and the source under each figure with a "Source" link that opens a new tab. Every figure comes from `src/content/stats.ts`, with the cited note. There is no count-up: the final value shows at once. Legora's uncited customer percentages are what we leave behind. |
| Art-directed crops per width | Legora inner heroes (16:9 recropped for phones) | Home hero and every inner hero | One shared hero frame: 21:9 from 1024, 16:9 from 768 and 4:3 below. Each width has its own focal point. On phones we use 4:3 rather than Legora's 1:1, because crop arithmetic shows 4:3 keeps c1's drone and capsule at "80% 50%" and ho1's pod and window at "42% 50%". Two variants are cut from existing sources: h0 "portrait" and c1 "m43" (section 9). |
| Mobile rebuilt, not stacked | Legora and ReFresh at 390 | Every page at 390 | The benefits become a thumbnail list, and the flow tabs a 5-up grid. Places become an 82% peek track. The six parts open one at a time, each with its still inside the open part. The system and step cards become snap tracks. The calculator stacks, and the footer is an open 2x2 grid. Every left edge sits on x 16. |
| Enquiry form beside its intro | Legora and ReFresh demo forms | /register-interest | One plaster band. The eyebrow, h1, one lead line and the p2 still sit in columns 1 to 5, and the form in columns 7 to 12. It is a native form in Lienry type: every field has a visible label above it, selects have a drawn chevron, and a chosen radio card fills as well as darkening its border. Focus moves to the success heading. At 390 the form follows the heading and lead, and the image is dropped. |
| Privacy with a contents list | ReFresh privacy contents rail; Legora's numbered sections | /privacy | The index sits in the head beside the h1: six links in a 2x3 grid, labelled "On this page". Each policy section is a row, with the title on the H3 step in columns 1 to 4 and the text in columns 5 to 10. There is no sticky rail; the page is about 1,640px at 1440. At 390 the index stays 2x3, with 44px rows. |

## 6. What we deliberately did not take, and why

- **Proof Lienry does not have.**
  - Left behind: logo strips and marquees, "trusted by" lines, testimonials and named quotes, customer stories and their metric pills, headcount and survey percentages, and the uncited statistic in ReFresh's dark band. Also Legora's security cells with seals and ReFresh's badge tiles: no certification tiles of any kind.
  - Why: Lienry has no customers, results, certifications or approvals, and the honesty rule bans claiming them (check 11).
- **Prices and savings.**
  - Left behind: ReFresh's calculator outputs a cost range from its own assumptions.
  - Why: ours adds up the visitor's own figures and nothing else. Check 33 fails the band if it contains "save", "saving", "ROI", "payback", "cheaper", "less than", "compared", "with Lienry" or a Lienry cost, price or fee.
  - The research draft proposed a solar version that applied the cited soiling percentages to the visitor's output. It is not built, because it goes beyond the visitor's own figures. Choosing "Solar farm" changes only the area label and the follow-on link.
- **Hover that changes the layout.**
  - Left behind: ReFresh widens the hovered card to about 2.7 times its width.
  - Why: our cards keep their size; only the image scales 3% and the clip fades in. Check 40 allows only opacity, transform, translate, scale, rotate, will-change and visibility to change, and check 39 allows a layout count growth of at most 2 per hover.
- **Things that move on their own.**
  - Left behind: ReFresh's step timer, Legora's carousel timer and stage progress, both logo marquees, count-ups, rotating rings, floating portraits, the mesh loop, and autoplay on every card.
  - Why: on Lienry, content changes only when the visitor acts. The films are the exception. Check 21 fails any count-up or scroll-linked motion, and check 41 fails a clip request before hover.
- **Pinned stages.**
  - Left behind: Legora's three screens of pinned scroll with scroll-scrubbed video.
  - Why: task 22 removed pinning from Lienry. Nothing is sticky except the header (check 21).
- **Round shapes.**
  - Left behind: pills of every kind (Legora's 48px-radius buttons and 24px accordion items, ReFresh's 1000px buttons), circular arrow chips, round pagers, cards and panels rounded from 6 to 24px, and ReFresh's rounded footer corners.
  - Why: Lienry has one radius, 4px (check 5).
- **Effects.**
  - Left behind: the frosted header, blur blobs, blurred photo panels, the glow behind a screenshot, the lavender-to-peach band, the animated mesh gradient, translucent grey overlays, hairlines that fade at the ends, and text shadows.
  - Also no gradient scrims beyond the home hero. Only the home film keeps its scrims, and `npm run contrast` proves them. Check 5 fails a gradient anywhere else.
- **Their colours.**
  - Left behind: Legora's green, ReFresh's purple and link blue, tinted callouts, pastel or saturated tiles, and an accent-coloured italic word.
  - Why: Lienry uses one hue, glass teal, for links and the focus ring. Buttons are ink on light and plaster on ink. Amber is for data and errors only.
- **Their type.**
  - Left behind: Legora Sans, Aktiv Grotesk, PT Serif, Inter Display, DM Sans and Adamina; uppercase eyebrows with a coloured dot; mixed section-heading sizes and several H1s on one page; 12 to 14px body text at line height 1.2; lines over 68 characters.
  - Why: two families, one scale and the case rule (checks 6, 7, 8 and 10).
- **Centring.**
  - Left behind: centred section intros, inner heroes, quotes, FAQ heads and closing CTAs, and Legora's centre-emphasis carousel.
  - Why: only the home hero is centred (check 8). The places cards are all one size on the grid.
- **Third-party pieces.** Embedded forms and booking calendars that load late in their own fonts, vendor badges, and a chat bubble that covers content.
- **Their failures.** A visible "Loading..." placeholder, an empty black mobile panel, buttons clipped at 390, a table that scrolls sideways, 10px gutters, content that only hover reveals, placeholder-only form labels and inactive tabs at 2.5:1. Checks 19, 23, 32, 34 and 36 catch each of these on Lienry.
- **Chrome that is not ours.** An announcement bar, a Customers nav item and "Book a demo" wording.
- **Faces and signatures we do not have.** Legora's founder portrait and drawn signature, and ReFresh's footer portraits. We use only real material the owner supplies.
- **Footer accordions on phones.** Legora folds its footer into seven rows. Our four groups hold 16 links and sit open in a 2x2 grid.
- **A sticky privacy rail.** ReFresh's rail with scroll-spy serves very long pages. Our policy is six short rows, so the index sits in the head.
- **A cross-link trio on service pages.** Lienry's sibling cards are deleted. The footer's systems group links the three system pages, and each page ends on its own ask.
- **Their assets and exact layouts.** Copy, photographs, films, illustrations (Legora's cartoons included), icons, wordmarks, code, exact dimensions and section order. Our proportions come from our own 12-column grid. For example, the places card is 448x672, not Legora's 390x486, and the benefit frame is 330x413, not ReFresh's 273x500.

## 7. The system

Each rule below names the check that enforces it. The layout checks run at 1440 and 390 by default and at 1440, 1024, 768 and 390 at integration.

### Spacing scale

- **The rule:** one 8px scale, 8, 16, 24, 32, 40, 48, 64, 80, 96, 128 and 160, everywhere outside `[data-ui]` and the header.
  - Allowed exceptions: 1px hairlines, the 2px focus ring and its 2px offset, and 72 plus a scale value (the bar plus the hero gap).
- **Before:**
  - off-scale line heights of 24.8, 27.55, 34.5, 56.45 and 75.17px;
  - three button heights (30, 44 and 48);
  - four paragraph measures (360, 405, 450 and 540px).
- **Check 31a** (`check-layout.mjs`, at 1440, 1024, 768 and 390):
  - covers every element in main and the footer;
  - margin-top, margin-bottom, all four paddings, row-gap and column-gap must each be within 0.5px of a scale value, its negative, or 72 plus a scale value;
  - skips `[data-ui]`, svg, `.sr-only`, the header and auto margins.
- **Check 31b** (`check-rules.mjs`, a lint over `src`):
  - spacing utilities use the multipliers 0, px, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32 or 40, scale rems, or the spacing tokens;
  - it skips lines marked `frozen-header` and the window, readout, app panel, Nav and three.js files.

Inside a block:

| Gap | Value | Check |
| --- | --- | --- |
| Eyebrow to heading | 16 | 10 (16 ± 1) |
| Heading to intro, when stacked | 24 | 31a |
| Section head to content (`--head-gap`) | 64 from 1024, 40 below | 31a |
| Card: image to text | 16 | 31a |
| Card: index or eyebrow to title, title to body | 8 | 31a |
| Card: body to facts or link | 16 | 31a |

- **Dead space (check 2, `check-layout.mjs`):**
  - no empty horizontal stripe inside a band may be taller than 64px from 1024 or 48px below; it fails above that limit plus 1px;
  - side-by-side `[data-col]` columns must end within the same limit;
  - every tab, part and story beat is checked in turn.

### Section padding

| Band pad | Top | Bottom |
| --- | --- | --- |
| section | S | S |
| hero (inner pages, register, privacy, 404) | 72 + H | S |
| attached | 0 | S |
| footer | S | 24, or 32 from 768 |

- S (`--section-y`) is 128 from 1024, 96 from 768 to 1023 and 80 below. That is inside the brief's 120 to 160 and 72 to 96.
- H (`--hero-gap`) is 64, 48 and 40 at the same breakpoints, so an inner hero starts 136, 120 or 112px from the top.
- **Before:** every band was 96/96 at 1440 and 56/56 at 390. The numbers band had 32px on top, the founder and safety bands were 40/40, and the footer was 64/32.
- **Check 30** (`check-layout.mjs`, at 1440, 1024, 768 and 390): computed padding must be within 0.5px of the table. A non-film band with no padding fails.
- **Check 3:** at 1440 it warns when a band is taller than twice the viewport, unless the band holds the h1 or the software window. It fails when a tab or part changes its band's height by more than 1px.

### The 12-column grid

- From 1024, content sits on 12 columns on the 1,392px rail (`--container-grid` 87rem, `lg:grid-12`).
- At 1440 the columns are 94px wide with 24px gutters:
  - column k starts at x = 24 + 118(k - 1): 24, 142, 260, 378, 496, 614, 732, 850, 968, 1086, 1204 and 1322;
  - n columns span 118n - 24: 3 columns are 330, 4 are 448, 5 are 566, 6 are 684, 7 are 802 and 8 are 920.
- Page margins and gutters are 24px from 768 and 16px below. Below 1024 a section has one column, unless its component sets its own mobile grid.
- Section heads come in two forms:
  - split: heading in columns 1 to 7, aside in 8 to 12, bottom-aligned;
  - stacked.
- One paragraph measure: `p { max-width: 45ch }`, which holds every line to about 68 characters.
- **Before:** inset content missed the columns (CTA text at x 64, safety cells at x 48, 396, 744 and 1092, stage numbers at x 48), and section heads switched between top and bottom alignment.
- **Check 32** (`check-layout.mjs`, at 1440 and 1024):
  - left edges must sit within 1px of a column start. This covers eyebrows, h1, h2, band-level paragraphs, figure frames, the first button of an action row, the calculator, the accordion and a track's first item;
  - figure right edges must sit within 1px of a column end or the rail's right edge;
  - at 390, those left edges must be at 16 ± 1;
  - the home hero is exempt.
- **Check 19:** nothing runs past the viewport, with the phone menu open or closed.

### Tone rhythm

- Page sections alternate plaster #f3efe7 (light) and ink #1c1a17 (dark). The home film counts as dark.
- No two adjacent sections share a tone. The one allowed exception is a band marked `data-attached` that directly follows the h1 band in the same tone.
- Raised #fbf9f4, sunken #e9e3d8 and ink-raised #26221d are surfaces inside a section (cards, panels, fields, the window chrome), never a section.
- The footer is ink, so every page's last section is plaster. The glass-deep closing panel is gone.
- **Before:** three creams, ink and a teal panel. On home, about 11 bands cycled through four tones with no pattern. The creams differ by only 1.09 to 1.21:1, so each light-to-light change needed a hairline.
- **Check 4** (`check-layout.mjs`):
  - (a) every band's tone is plaster, ink or film;
  - (b) bands alternate light and dark;
  - (c) no glass-deep element 100x60 or larger in main;
  - (d) the footer is opposite in lightness to the last band;
  - (e) each band's `data-tone` matches the surface it renders.

### Role tokens and contrast

Components take their colours from the surface through role tokens:

- `text-fg`, `text-fg-muted`, `bg-surface`;
- `border-rule`, `border-control`, `bg-field`;
- `text-link`, `outline-focus`;
- `bg-action`, `text-action-fg`, `bg-action-hover`, `border-action-edge`;
- `text-error`, `bg-media`.

How surfaces are set:

- No component takes a `tone` or `onDark` prop. The exceptions are `Band`, which sets the surface, the frozen header button, and `Faq`, `StatBand` and `FeatureRow`, which pass `tone` through to `Band`.
- `.on-light` restores the light surface inside an ink band, for the software window and the app panel.
- `.on-film` gives white text and an edged ink button over the home film.

Why the tokens matter: muted text on ink measures 2.47:1, and glass-on-dark on plaster 1.45:1. A fixed colour fails as soon as its component moves to another surface.

Contrast, as WCAG ratios against each surface. The focus ring uses the link colour on every surface.

| Role | Light token | Plaster | Raised | Sunken | Dark token | Ink | Ink-raised |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Text | ink #1c1a17 | 15.14 | | | plaster #f3efe7 | 15.14 | 13.78 |
| Muted text, eyebrows | muted #5e584f | 6.14 | 6.69 | 5.51 | muted-on-dark #a9a197 | 6.81 | 6.19 |
| Link and focus ring | glass #0f6a7c | 5.43 | 5.92 | 4.88 | glass-on-dark #8ed4e0 | 10.45 | 9.51 |
| Link hover | glass-deep #0d6072 | 6.24 | 6.80 | | plaster | 15.14 | 13.78 |
| Control edge | border-strong #857d70 | 3.55 | 3.86 | 3.18 | muted-on-dark | 6.81 | 6.19 |
| Error text | debris-text #8a5210 | 5.56 | 6.06 | | debris-on-dark #d08a3a | 6.10 | 5.55 |
| Decorative rule only | hairline #dcd5c8 | 1.27 | 1.39 | | plaster at 20% | 1.82 | |

Primary button:

| Surface | Fill and label | Label contrast | Hover fill | Label on hover | Hover step from rest |
| --- | --- | --- | --- | --- | --- |
| Light | ink, white label | 17.36 | ink-hover #3d3832 | 11.60 | 1.50 |
| Ink | plaster, ink label | 15.14 | plaster-hover #cfc7b8 | 10.35 | 1.46 |
| Home film | ink, white label, white edge at 75% | edge composites to rgb(198,198,197): 3.51 on the brightest frame, 10.16 on ink | ink-hover | 11.60 | |

- Fields rest on the control edge, never the hairline. The hairline measures 1.27:1 and fails WCAG 1.4.11.
- The primary's hover on ink is plaster-hover, not white: white was a 1.15:1 step.
- **Check 36** (`check-a11y.mjs`): axe colour contrast, at load and after each interaction.
- **Check 34:** the focus ring against its background is at least 3:1.
- **Check 37:** the primary's fill or edge is at least 3:1 against its band, and its hover differs from rest by at least 1.3:1.
- **`npm run contrast`:** proves the header and the hero over the film.

### Type

- **Families:** two.
  - Instrument Serif 400 for h1 to h3 and for the founder letter.
  - Inter for everything else.
  - **Check 6** (`check-rules.mjs`): the serif appears only on h1 to h3 and their em, `.letter`, the footer wordmark and the phone menu's links. The three font files must match `src/fonts` byte for byte.
- **Scale:** every size comes from the existing steps. The pass did not change the scale.

| Step | 390 | 1440 | Line height | Tracking | Use |
| --- | --- | --- | --- | --- | --- |
| Display | 52 | 83.2 | 1.05 | -0.02em | The footer wordmark |
| H1 | 44 | 69.6 | 1.08 | -0.02em | Page h1, the home hero included |
| H2 | 36 | 50.4 | 1.12 | -0.02em | Section h2, calculator figures |
| H3 | 24 | 30 | 1.15 | -0.02em | Card titles, parts, policy titles, the letter |
| Lead | 17 | 19 | 1.45 | | Inner-page leads, FAQ questions, step captions |
| Body | 16 | 16 | 1.55 | | Text |
| Small | 14 | 14 | 1.5 | | Eyebrows, buttons, field labels |
| Caption | 13 | 13 | 1.5 | | Notes, help, source lines |
| Label | 12 | 12 | 1.2 | 0.12em, uppercase | Data labels in `[data-ui]` and the header |
| Numeral | 56 | 96 | 1 | -0.02em, Inter 300 | Cited figures |

- **Headings:**
  - every heading element sits on H3 or above, with no step between H3 and body and no h4 to h6 in main. **Check 7:** every size is a scale step at that width, and every text node in `.letter` is on the H3 step.
  - one h1 per page, with the same heading levels at both widths. Headings use `text-wrap: balance`.
  - h1 and h2 headlines are at most 7 words. **Check 25** fails an h1 or h2 over 7 and warns on an h3 over 7.
  - no heading or band-level intro ends on a line holding one word. **Check 26** fails this at 1440 and 390 and warns at 1024 and 768.
- **Before:** the same steps, but with headlines of 8 or more words on four pages and breaks such as "Two / systems". H2 stays 0.72 of H1 (Legora's is 0.61). The pass fixes the breaks with shorter headlines and balancing, not new sizes.
- **Case and alignment:**
  - **Check 8:** uppercase appears only in `.label`, and nothing is centred outside the home hero.
  - **Check 29:** `.label` is allowed only inside `[data-ui]` or `body > header`.

### Eyebrows

- **The rule:** every h2 in main, and every h1 except the home hero's, has a `.eyebrow` directly before it.
  - Style: Inter, small step (14px), weight 500, normal tracking, no text-transform, the muted colour on light and muted-on-dark on ink.
  - Text: lowercase, 1 to 3 words, matching `^[a-z0-9]+(?:[ '’&-][a-z0-9]+){0,2}$`.
  - Placement: 16px above the heading.
  - It is a paragraph, not a heading. The `Eyebrow` component throws in development on a bad string.
- **Exempt:** the home hero h1, the footer h2, the six policy h2s inside `[data-prose]` on /privacy, and the form success h2 inside `[data-form-success]`.
- **Check 10** (`check-rules.mjs`):
  - presence and the text pattern;
  - computed family, size, weight, tracking, transform and colour (within 2 per channel);
  - the gap from the eyebrow's bottom to the heading's top is 16 ± 1, with matching left edges;
  - no h2 stands outside a section head, except in prose and the form success panel.

### Italics

- **The rule:** at most one italic phrase per band. It appears only in the band's labelling heading, always as its trailing phrase, and in the heading's own colour.
  - Italics never appear in an h3, a summary, a paragraph, a button, `.letter` or `.eyebrow`.
  - The `Headline` component renders the phrase from `emphasis`, and `SectionHead` asserts that it is the heading's suffix.
- **Check 9** (`check-rules.mjs`) now applies one rule to every band. The per-page italics table is deleted. Each page's italics are listed in section 10.

### Paragraphs and copy

- **Line limit:** every rendered paragraph in main is at most 2 lines at 1440. This covers section intros, leads, card bodies and FAQ answers, and is how the brief's "under 3 lines" is met.
  - Exempt: the privacy text (`[data-prose]`), form labels, help and errors, `.letter`, `[data-ui]`, statistic source lines and the footer.
  - **Check 27.**
- **Measure:** paragraphs use `max-width: 45ch` and `text-wrap: pretty`.
- **One idea per section.**
- **Copy budget:** visible words in main at load are at most 0.667 of the pre-pass baseline on every route (**check 28**). Section 11 has the figures.
- **Before:** home had 14 paragraphs of 3 or more lines, and the founder letter ran 4, 4 and 4 lines.

### The founder letter exception

- **The style:** `.letter` sets Instrument Serif on the H3 step (30px at 1440, 24px at 390).
  - Line height is 1.3 and tracking -0.01em, in ink on plaster.
  - Paragraphs are 24px apart.
  - Its paragraphs have no `max-width`. The 920px column (columns 5 to 12) sets the measure, about 73 characters a line at 30px.
- **Why the measure is wider:** the global 45ch cap would wrap the letter to about 53 characters a line and break the 2-line rule.
- **How the checks treat it:**
  - check 6 allows the serif on `.letter`;
  - check 7 requires every text node in it to be on the H3 step;
  - check 27 exempts it;
  - check 9 bans italics in it.
- **CLAUDE.md:** the Type paragraph names this one exception. The owner reviews the change in the PR (F9).

### States

States are defined once, in `Button`, `IconButton`, `.link`, `.link-list`, `MediaCard`'s title link and `Field`.

Shared rules:

- Transitions are 200ms `ease-instrument`, and there are none under reduced motion.
- Pressed moves the control 1px down with a translate, never a scale.
- Focus is the global 2px outline in the surface's focus colour, offset 2px. Under forced colours it uses `Highlight`.
- Hover styles apply only on devices that can hover.

| Element | Rest | Hover | Pressed | Unavailable |
| --- | --- | --- | --- | --- |
| Primary button | action fill, action label | action-hover fill | 1px down | transparent, control edge, muted label |
| Secondary button | 1px edge in text colour | fills with text colour, label takes the surface colour | 1px down | control edge, muted label |
| Tertiary button | link colour, 1px underline | link-hover colour, 2px underline | 1px down | muted, no underline |
| IconButton (44x44) | control edge | fills with text colour, glyph takes the surface colour | 1px down | 40% opacity |
| `.link` | link colour, 1px underline, 4px offset | link-hover colour, 2px underline | link-hover colour | |
| `.link-list` (footer, privacy index) | text colour, underline at 40% | 2px underline at full colour | | |
| Whole-card link | | image scales to 1.03 over 600ms `ease-settle`, title underlines | no press | |
| Field | control edge on a raised field | edge in text colour | | edge in error colour, plus the error in words |
| Radio card | control edge | edge in text colour | | checked: edge in text colour and field fill |
| Tab, part, story beat | muted | text colour | | selected: text colour and a 2px rule |

More detail:

- **Buttons:** two heights outside the header, 44px (md) and 48px (lg), each with 24px side padding. Tertiary buttons are at least 44px tall.
- **The current page** in `.link-list` shows its underline at full colour.
- **Focus on special elements:** a card shows its ring on its `::after`, and a radio card on its label.
- **Selects:** a drawn chevron, with text at the same size as the inputs.
- **Before:**
  - hover was a colour or underline swap;
  - the source had zero `active:` styles, and focus was one global ring;
  - selects kept native chevrons, with larger text than the inputs;
  - a selected radio card was only a heavier border.
- **Header:** frozen. Under F12 the header button and the phone-menu buttons get the pressed state and nothing else changes. Check 37 excludes the header, so the header press is checked by hand, and `npm run contrast` runs again.
- **Check 37** (`check-a11y.mjs`, at 1440, with pseudo-states forced through CDP):
  - hover changes the background, colour, border or underline, and a card's `[data-zoom]` scale becomes 1.03;
  - buttons and icon buttons translate 0 1px when pressed;
  - focus shows a 2px solid outline in `--s-focus`, offset 2px;
  - transitions last 0.16 to 0.24s; the 600ms card zoom is checked separately.
- **Check 34** (keyboard):
  - the first stop is "Skip to content";
  - every stop is reached once, in DOM order, with a visible ring, a ring contrast of at least 3:1 and an opacity of at least 0.5;
  - tablists, tracks, `details`, parts, the phone menu, the calculator and the hover-clip card all respond as specified.
- **Check 35:** a focused element is never hidden under the 72px bar (its top is at 71 or more). Targets are at least 24x24, and anything under 44 is a warning.

### Motion

- **Reveals:** Motion `whileInView` on IntersectionObserver.
  - Opacity and a 12px rise, 640ms `ease-settle` (cubic-bezier(0.22, 1, 0.36, 1)), once, with a -10% margin and a 60ms stagger.
  - Nothing in a first screen reveals. Heroes, the register and privacy bands, the calculator form and panel, and FAQ lists never reveal.
- **Never:** pinning, count-ups, scroll-jacking, marquees or floating.

| Moment | Movement | Time |
| --- | --- | --- |
| Reveal | fade and 12px rise, once | 640ms `ease-settle`, 60ms stagger |
| Hover, press, focus | colour, underline, 1px press | 200ms `ease-instrument` |
| Card hover | image scales to 1.03 | 600ms `ease-settle` |
| Hover clip | fades in when it plays, out when you leave | 200ms |
| Flow caption, parts frame, story stills | crossfade | 200ms |
| FAQ | the plus turns into a minus | 200ms |
| Film | fades in over its poster | 1,200ms |
| Carousel | smooth scroll, instant under reduced motion | the browser's |

- **Under reduced motion:** nothing transitions, every reveal shows at once, the hover-clip video is not rendered, the card zoom is off, films show their posters, and tracks jump.
- **Before:**
  - every block used the same reveal;
  - some blocks were still hidden 1s after a scroll (solar at 390, from y 1400 to 3600);
  - the home safety track left about 120px of empty ink at 390.
- **Check 40** (`perf-motion.mjs`): the only properties that change are opacity, transform, translate, scale, rotate, will-change and visibility.
- **Check 39** covers scroll, reveals, hover clips, the carousel, the flow tabs and the FAQ:
  - Long Animation Frame blocking adds up to at most 50ms per scenario;
  - no long task runs over 50ms;
  - layout count grows by at most 2 per hover or reveal;
  - frame pacing (p95 at most 17.5ms, at most 5% of frames over 25ms, max at most 50ms) gates only with `--gpu` on real hardware (F11).
- **Check 21:** under reduced motion nothing plays or reveals. Two videos never play at once, nothing is sticky except the header, nothing moves with the scroll, and no figure counts up.

### Hover clips and films

- **When a clip renders:** only when `(hover: hover) and (pointer: fine)` matches, reduced motion is off and Save-Data is off.
- **Loading:**
  - the clip has `preload="none"`, and its sources attach on the first hover or focus;
  - code reads `video.duration` at run time: the index says 8s, but both films run 6.58s.
- **Playback:**
  - hover loops the clip;
  - focus plays it once and stops it at 5s (WCAG 2.2.2);
  - leaving pauses it and resets it after 220ms;
  - the clip sits over the still, so the card never changes size.
- **One video at a time:** only one video decodes at a time across the site. A new one pauses any other. When it stops, the most recent film still on screen resumes. A film the visitor paused stays paused.
- **Films:**
  - sources load after the page loads and the browser is idle (2s timeout);
  - `<video>` has no `poster` attribute: the `<picture>` under it is the poster and the LCP image;
  - a film plays when 15% of it is visible (20% for the /commercial hero);
  - a pause button sits at the bottom right;
  - reduced motion and Save-Data show the poster only.
- **Check 41** (`check-rules.mjs`, desktop motion pass):
  - no clip request is made after load;
  - on hover, exactly one video plays within 1.2s, and it is that card's;
  - on leave, it pauses within 400ms;
  - when the card's link is focused, it plays and has paused by 5.2s;
  - the card height never changes;
  - at 390 with touch, and under reduced motion, there is no clip element, no request, and the still shows.
- **Check 42** (`perf-vitals.mjs`):
  - no `<video>` has a `poster`;
  - the mobile LCP image transfers at most 80 KB;
  - nothing else over 100 KB finishes before LCP.

### Recorded deviations

- **The footer h2 has no eyebrow.**
  - The footer's h2 ("Resident cleaning. / Designed in Sydney.") has no eyebrow, although decision 3 puts one above every section heading.
  - Check 10 exempts the footer. The footer's group labels inside it use the eyebrow style.
  - This is owner question F10.
- **The places carousel shows no peek at exactly 1440.**
  - Three 448px cards fill columns 1 to 12, and the track bleeds right by the page margin, so at exactly 1440 the fourth card starts at x 1440 and nothing peeks.
  - From 1441 up, the fourth card shows at the right edge.
  - The arrow buttons and arrow keys reach cards 4 and 5.
  - Accepted and recorded (F10).

## 8. The image grade

Every still and film goes through one house grade (`scripts/media/grade.mjs`), so the set reads as one overcast morning:

- shadows and mid-tones slightly warm;
- highlights neutral;
- the same depth everywhere.

The grade measures each source once, on a 256px copy, in CIE Lab. It moves each source toward common targets instead of laying one filter over all of them. It then bakes the whole transform into one 3D colour table per asset.

### Parameters

These are grade v2 values as committed in 1e63818. P9 may tune them on real media. Values change in `GRADE` only, and integration updates this table.

| Parameter | Value | What it does |
| --- | --- | --- |
| `black` | 9 | Target L* of the 1st percentile |
| `white` | 94.5 | Target L* of the 99th percentile, so no image is whiter than the plaster ground |
| `shadows` | a* 0.5, b* 2.5 | Cast target for shadows: full weight below L* 20, fading out by 40 |
| `mids` | a* 0, b* 2.5 | Cast target for mid-tones |
| `highlights` | a* 0, b* 0 | Cast target for highlights, fading in from L* 65 and full from 85, so skies stay white instead of peach |
| `cast` | 0.8 | Each band moves 80% of the way to its target |
| `castLimit` | 9 | The largest shift in a* or b*, so a strongly coloured scene keeps its colour |
| `chroma` | 6 | Target mean C*, measured after levels and casts |
| `chromaLimits` | 0.8 to 1.2 | The range the chroma scale stays in |
| `table` | 33 | Points per axis of the 3D colour table |

- A tonal band that covers less than 1% of an image borrows the mid-tone cast.
- A manifest asset can override any value with `"grade": { … }`. `"grade": false` leaves it ungraded.
- The source files are never touched.
- No grain is added, although the research suggested 1.5 to 2%. It would push every AVIF, WebP and film past its size budget.

### gradeFrom

- `h1-hero-film` is graded from `h0-hero-still`, and `c2-commercial-clip` from `c1-commercial-hero`.
- A film made from a still uses that still's measurements, so the film, its poster and the still share one transform.
- Stills are processed before films. A film's process key includes its still's key, which reads "pending" until the still is done.
- If the still's raw file is missing, `fetch.mjs` downloads it. If that fails, the run stops. Under `--soft` it warns and keys the film's grade to the film itself. It never falls back silently.

### The bt709 film chain

1. Apply the crop, if the manifest sets one.
2. Scale with lanczos, naming bt709 as both the input and the output matrix.
3. Convert to RGB and apply the asset's table with `lut3d` (tetrahedral).
4. Convert back to bt709 limited range, yuv420p.
5. Tag both encodes with bt709 primaries, transfer and matrix, and limited (tv) range.
6. Take the poster from frame 0: decode it in RGB with bt709 limited range, apply the same table, write a PNG, then write `-poster.jpg` and `-poster.webp` with sharp.
7. A rendition uses the same chain at its own height, with the mp4 bitrate scaled by (height/1080)². Under F3, c2 gets `c2-commercial-clip--540.mp4` and `.webm`.

The committed chain scales and applies the table without naming the colour matrix, and writes no colour tags. A browser then has to guess the matrix, and the film can drift from its poster.

**Check (P9 acceptance and D8):** grab the first playing frame in Chrome and compare it with `-poster.webp`. The mean absolute difference must be 2/255 or less per channel.

### How to tune and review it

1. Change values in `GRADE`, or add a `grade` override to one asset in `scripts/media/manifest.json`.
2. Run `npm run media:fetch`. The `prebuild` step also runs it in soft mode. The process key includes a hash of `grade.mjs`, the grade values and each film's still key, so every affected asset re-encodes and nothing else does.
3. Run `npm run media:sheet`. It writes `.next/cache/lienry-media/sheet.jpg`: every graded still plus each film's first frame, six across.
4. Review the sheet as one shoot:
   - the same time of day;
   - the same warmth in the shadows;
   - neutral highlights;
   - no frame whiter than plaster or darker than ink.
   The sheet is scratch output and is never committed.
5. The owner approves the look from the sheet (F2).
6. Log every change in `docs/MEDIA.md`.

If an asset fails under `--soft`, its previous encode is kept, marked stale, and nothing is deleted. Without `--soft` a failure exits non-zero.

### Measured before and after

| Measure | Research target | Ungraded | Grade v2 |
| --- | --- | --- | --- |
| Black point (L* at 1%) | 8 to 10, no frame under 6 | 1.6 to 16.1 | 7.3 to 10.3 |
| White point (L* at 99%) | 94 to 95 | 79.6 to 98.7 | 94.0 to 94.7 |
| Mid-tone b* | +2 to +3 | -11.8 to +10.1 | -2.6 to +4.1 |
| Highlight b* | -1 to +1 | -8.3 to +9.5 | -1.7 to +2.8, with one outlier at +6.9 (the wet driveway) |
| Mean chroma C* | 5 to 6.5, ceiling 7 | 3.3 to 11.1 | 1.4 to 7.4 |
| Hero film against its still (mean ΔE) | within 2 | 0.6 | 1.4 |
| Commercial clip against its still (mean ΔE) | within 2 | 0.2 | 1.2 |

- **Before any grade:** the pictures sat about 6.5 b* cooler than the page (image median -2.3 against plaster's +4.3), so they read blue-grey on the cream.
- **Grade v1 (6746517) got four things wrong, and v2 fixes them:**
  - highlights turned peach (b* +8.5 to +13.6);
  - blacks targeted about L* 4, darker than the page ink at L* 9.4;
  - chroma still ranged from 3.0 to 10.1;
  - the h1 and c2 posters sat 1.8 to 2.7 lower in a* and 2.0 to 2.4 higher in b* than their stills.
- **What the grade cannot fix:** four stills break the overcast set (co1, s5, s6 and ho1), and the ground pod appears in two designs. Both go to the owner (F2, section 9).

## 9. Crops and focal points

A crop, focal point, variant, rendition or grade of an existing manifest asset is not new media. Each one is logged in `docs/MEDIA.md`.

How a frame is set:

- `Picture` takes the page's `position`, or else the manifest `focus`, or else 50% 50%.
- A page can set a different position from 768 to 1023 (`positionMd`) and below 768 (`positionSm`).
- `coverSizes` multiplies each `sizes` entry by k = max(1, image aspect / frame aspect), so a wide still in a narrow frame is fetched large enough. On the home benefit cards, k is 2.24 for c1, 1.25 for f1, 1 for y2 and 2.95 for ho1.

### Manifest additions

| Asset | Change | Detail | Used by |
| --- | --- | --- | --- |
| h0-hero-still | Variant "portrait" | Crop x .466, y 0, w .258, h 1; widths 480 and 710 | Home hero poster below 768 |
| c1-commercial-hero | Variant "m43" | Crop x .256, y 0, w .744, h 1; widths 480, 768 and 1080 | /commercial hero below 768, at 4:3; keeps the drone (x 39 to 57%) and the capsule (x 59 to 92%) |
| f1 to f4 | Widths | 400, 800 and 1200 | Collage tiles and the company detail stills at 2x |
| c2-commercial-clip | Rendition 540 (F3, approved) | `c2-commercial-clip--540.mp4` and `.webm` | Home benefit card 1's hover clip |

- No asset uses the whole-frame `crop` field in this pass. Both art-directed crops are variants.
- `Picture` and the film layer fall back silently until the index lists a variant.
- Both variants are checked by eye on real media.

### Every id

Frames: an inner hero is 21:9 from 1024, 16:9 from 768 and 4:3 below. A "fill" frame stretches to its row.

| Id | Source | Focus | Crop or variant | Use (route: place, frame, position) |
| --- | --- | --- | --- | --- |
| h0-hero-still | 2752x1536 | 50% 50% | Variant portrait | /: hero poster, full viewport, 50% 50% (63% 50% with portrait below 768). /platform: hero, 50% 45% (50% 50% from 768, 58% 50% below) |
| h1-hero-film | Film, 1920x1080, 6.58s, graded from h0 | | | /: hero film, 50% 50% (63% 50% below 768) |
| m1-drone-master | 2528x1696 | 50% 50% | | /platform: part 03 Drone, fill frame, 48% 50% |
| m2-capsule-master | 2528x1696 | 50% 50% | | /platform: system card 1, 3:2, 50% 55%. /commercial: collage tile, 52% 55%. /company: closing image, 3:2, 50% 55% |
| m3-pod-master | 2528x1696 | 35% 50% | | /platform: system card 2, 3:2, 35% 50%. /homes-and-rentals: collage tile, 30% 50% |
| s1-dock | 2400x1792 | 50% 50% | | /platform: part 01 Dock, 50% 55% |
| s2-tether | 2400x1792 | 50% 50% | | /platform: part 02 Tether, 40% 60% |
| s4-scan | 2400x1792 | 50% 50% | | /platform: part 04 Scan, 45% 55% |
| s5-software | 4608x3456 | 50% 45% | | /platform: part 05 Software, 50% 45% |
| s6-automation | 2400x1792 | 50% 50% | | /platform: part 06 Automation, 50% 50%. /company: "where we are", 4:3 fill, 50% 40% |
| p1-tower | 1696x2528 | 50% 50% | | /: places card 3, 2:3. /commercial: collage anchor, 2:3, 50% 50% |
| p2-apartments | 1696x2528 | 50% 50% | | /: places card 4, 2:3. /platform: collage anchor, 50% 50%. /register-interest: beside the form from 1024, 2:3 fill, 50% 45% |
| p3-house | 1696x2528 | 50% 50% | | /: places card 1, 2:3. /homes-and-rentals: collage tile, 50% 70% |
| p4-rental | 1696x2528 | 50% 60% | | /: places card 2, 2:3, 50% 50%. /homes-and-rentals: collage anchor, 50% 50% |
| p5-solar-farm | 1696x2528 | 50% 50% | | /: places card 5, 2:3. /solar: step card 01, 3:4, 50% 60% |
| y1-story-before | 1792x2400 | 50% 50% | | /homes-and-rentals: story beats 01 and 02, 60% 55%. /solar: step card 03, 3:4, 50% 50% |
| y2-story-panels | 1792x2400 | 50% 50% | | /: benefit card 3, 4:5, 45% 45%. /homes-and-rentals: beat 03, 45% 45%. /solar: step card 02, 3:4, 45% 45% |
| y3-story-driveway | 1792x2400 | 50% 50% | | /homes-and-rentals: beat 04, 50% 40% |
| y5-story-done | 1792x2400 | 60% 55% | | /: collage anchor, 2:3, 60% 55%. /homes-and-rentals: beat 05, 60% 55% |
| f1-tether | 2048x2048 | 43% 45% | Widths 400, 800, 1200 | /: benefit card 2, 4:5, 43% 45%. /platform: collage tile, 43% 45%. /company: detail, 1:1, 43% 45% |
| f2-camera | 2048x2048 | 50% 50% | Widths 400, 800, 1200 | /: collage tile, 48% 45%. /platform: collage tile, 48% 45%. /company: detail, 1:1, 48% 45% |
| f3-surface | 2048x2048 | 50% 50% | Widths 400, 800, 1200 | /company: detail, 1:1, 50% 50% |
| f4-dock | 2048x2048 | 60% 55% | Widths 400, 800, 1200 | /: collage tile, 50% 66%. /commercial: collage tile, 60% 60%. /company: detail, 1:1, 60% 55% |
| c1-commercial-hero | 2752x1536 | 50% 50% | Variant m43 | /: benefit card 1 still, 4:5, 73% 50%. /commercial: hero poster, 50% 35% (50% 50% from 768, 80% 50% with m43 below) |
| c2-commercial-clip | Film, 1920x1080, 6.58s, graded from c1 | | Rendition 540 | /commercial: hero film, the same positions as c1. /: benefit card 1 hover clip, 73% 50% |
| ho1-homes-hero | 3168x1344 | 50% 50% | | /: benefit card 4, 4:5, 48% 50%. /homes-and-rentals: hero, 50% 50% (45% 50% from 768, 42% 50% below) |
| so1-solar-hero | 3168x1344 | 50% 50% | | /solar: hero, 50% 50% (62% 50% below 768) |
| so2-solar-closeup | 2528x1696 | 70% 40% | | /solar: closing image, 3:2 (4:3 below 768), 50% 50% (60% 45% below) |
| co1-company | 6048x2592 | 50% 50% | | /company: hero, 50% 50% |

- All 29 ids appear on the site, and no id appears twice in one route.
- **Check 14** (`check-rules.mjs`) enforces both:
  - every `/media/` path is a manifest id;
  - all 29 appear somewhere;
  - no id shows in two frames on a route in any state;
  - a hover-clip frame's still and clip count as one frame.
- **The phone hero windows are confirmed by crop arithmetic:**
  - c1 at 4:3 and "80% 50%" shows x 20 to 95%;
  - ho1 at "42% 50%" shows x 18 to 75%;
  - so1 at "62% 50%" shows x 27 to 83.5%, which keeps the drone and the pod whole (to be checked by eye).

### Hover segments

| Film | Segment | Where | File | Behaviour |
| --- | --- | --- | --- | --- |
| c2-commercial-clip | The whole file, 0 to 6.58s, native loop | Home benefit card 1, over c1 at 73% 50% | The 540p rendition (F3) | Hover loops it. Focus plays it once and stops at 5s. c1 is its first and last frame, so the still hands over to the clip without a jump. The drone stays in the air beside the open capsule throughout. It never settles on the cradle, and the films table in `docs/MEDIA.md` is corrected to say so. |

No other film plays on hover. These slots wait for a future clip (F4):

- benefit cards 2 to 4;
- every collage frame;
- the six parts, the two system cards and the five story beats;
- the three solar step cards;
- a hero film on /platform, /homes-and-rentals, /solar and /company.

### The ground-pod pairing rule

| Group | Stills |
| --- | --- |
| Closed pod (white upper shell, dark base) | ho1, y1, p5, so1 |
| Open pod (light lid tipped back, dark body, reel visible) | m3, p3, p4, y3, y5 |

Until the owner says whether these are one design (F2), no single view places a closed-pod still beside an open-pod still. How each page obeys the rule:

- **Home:**
  - benefit card 3 uses y2, where the pod is out of frame, not y3, which would put an open pod beside ho1's closed pod;
  - the places order (p3, p4, p1, p2, p5) never puts p5 in view with p3 or p4, at three cards or at one card plus a peek;
  - the collage holds y5 alone.
- **/platform:** m3 (open) only.
- **/homes-and-rentals:**
  - the hero is ho1 (closed);
  - the story frame shows one still at a time (y1 closed, then y2, y3 and y5);
  - the collage is all open pods (p4, m3, p3).
- **/solar:** so1, p5 and y1 (all closed) and y2 (no pod).
- **/commercial, /company and /register-interest:** no pod.

This is checked by hand, view by view (D8).

### Light direction

| Still | Light | Note |
| --- | --- | --- |
| h0, h1 | Hazy fog light from the left; the left half is 24.7 L* brighter | Home hero, /platform hero |
| f3 | Right half brighter by 24.1 L* | Studio macro, shallow focus |
| y3 | Right half brighter by 22.1 L* | |
| f1 | Right half brighter by 16.6 L* | Studio macro, shallow focus |
| p1 | Right half brighter by 14.6 L* | |
| c1, c2 | Right half brighter by 10.4 L* | |
| co1 | Backlit sunrise | Breaks the overcast set (F2); /company hero only |
| so1 | Backlit sunrise | /solar hero |
| s5 | Window-lit interior, the only indoor frame | Breaks the set (F2); /platform part 05 only |
| s6 | Reads as dusk, not dawn | Breaks the set (F2); /platform part 06 and /company |
| ho1 | Low warm sun | Breaks the set (F2); home benefit card 4 and the /homes-and-rentals hero |

- The set holds four times of day: fog morning, flat overcast, sunrise and indoors.
- The grade evens out colour and tone, not light direction.
- No frame is mirrored to fix direction, because f1, f2 and m1 carry the wordmark.

## 10. Page plans and tones

Every page ends on a plaster section, followed by the ink footer.

### Home

| Section | Tone | What it does |
| --- | --- | --- |
| Hero (`hero`) | Film (dark) | "Clean exteriors. Nobody on site.", one support line and one button, over `h1-hero-film` |
| Benefits (`benefits`) | Plaster | Four whole-card links. Card 1 plays the c2 hover clip |
| Flow (`software`) | Ink | Five tabs drive the coded window. Demo data and the model note are unchanged |
| Calculator (`cost`) | Plaster | The visitor's own spend over 5 and 10 years and per m² |
| Places (`places`) | Ink | Five 2:3 property cards, three in view at 1440 |
| Letter (`letter`) | Plaster | The founder letter in serif, the sign-off and a link to /company |
| FAQ (`faq`) | Ink | Seven questions from the bank |
| Closing (`closing`) | Plaster | The ask, with y5, f4 and f2 in the collage |

- Italics: "Nobody on site.", "Built to clean.", "your property." and "what comes next.".
- 15 media ids, none shown twice.

### /platform

| Section | Tone | What it does |
| --- | --- | --- |
| Hero (`hero`) | Plaster | "Two systems. Six parts." with h0 |
| Six parts (`parts`) | Ink | One part open at a time beside its still. `#dock` to `#automation` links open a part |
| Two systems (`systems`) | Plaster | Commercial and home system cards, with three facts each |
| FAQ (`faq`) | Ink | All ten questions |
| Close (`register`) | Plaster | The ask, with p2, f1 and f2 |

Italics: "Six parts.", "on the property." and "your property.".

### /commercial

| Section | Tone | What it does |
| --- | --- | --- |
| Hero (`hero`) | Plaster | "Window cleaning that lives on the roof.", with the c2 film over c1 |
| Software (`software`) | Ink | The coded window at its Clean default, and a link to /download |
| Cost (`cost`) | Plaster | The calculator, preset to Commercial building |
| FAQ (`faq`) | Ink | Seven questions for building managers |
| Close (`pilot`) | Plaster | The pilot conversation ask, with p1, m2 and f4 |

Italics: "on the roof.", "over ten years." and "the first buildings.".

### /homes-and-rentals

| Section | Tone | What it does |
| --- | --- | --- |
| Hero (`hero`) | Plaster | "Your property, cleaned from anywhere." with ho1 |
| Story (`story`) | Ink | Five beats of an owner overseas, with the app panel and the stills |
| Stats (`australia`) | Plaster | Two cited figures: rented dwellings and rooftop solar |
| FAQ (`faq`) | Ink | Six questions for owners |
| Close (`register`) | Plaster | The ask, with p4, m3 and p3 |

Italics: "from anywhere.", "from another country." and "on your street.".

### /solar

| Section | Tone | What it does |
| --- | --- | --- |
| Hero (`hero`) | Plaster | "A cleaner surface for solar." with so1 |
| Industry figures (`soiling`) | Ink | Two cited soiling figures |
| How it works (`how`) | Plaster | Three 3:4 cards with p5, y2 and y1 |
| FAQ (`faq`) | Ink | Four questions |
| Close (`register`) | Plaster | The ask, with so2 |

Italics: "for solar.", "on your schedule." and "your panels.".

### /company

| Section | Tone | What it does |
| --- | --- | --- |
| Statement (`hero`) | Plaster | "Built in Sydney for buildings people own." with co1, and no buttons |
| Where we are (`where`) | Ink | Concept stage, pre-seed, the pilot program and one idea being explored, with s6 |
| How we work | Plaster | Three rules beside four detail stills |
| Founders (`founders`) | Ink | The founder list, with a slot for a real photograph |
| Investors (`investors`) | Plaster | The investor ask, with m2 |

Italics: "buildings people own." and "investing.".

### Other routes

| Route | Sections and tones | What it does |
| --- | --- | --- |
| /register-interest | One plaster band | Intro and the p2 still (from 1024) beside the enquiry form |
| /privacy | One plaster band | The head with the six-link index, then six policy rows |
| 404 | One plaster band | "Nothing lives at this address." with a link home and Register interest, no media |
| /download | Plaster hero, ink features, plaster FAQ | Download actions and the coded window; three things the software does; four questions |
| Footer, every page | Ink | Statement, four link groups, the wordmark and the legal line |

## 11. Copy budget per route

The counter covers visible words in main at load. It leaves out `[data-ui]`, `[data-prose]`, forms, `.sr-only`, `aria-hidden` and the old demo selectors.

The gate (check 28) allows at most 0.667 of the baseline in `scripts/copy-baseline.json`. That baseline is written from a build of 1e63818 before any eyebrow is added, so it can differ slightly from the audit figures below.

| Route | Before (spec audits) | Budget at two thirds | Spec estimate | After |
| --- | --- | --- | --- | --- |
| / | 811 | 540 | about 432 | Measured at integration |
| /platform | 455 (plus 101 window words, not counted) | 303 | about 243 | Measured at integration |
| /commercial | 478 (plus 101 window words) | 318 | about 220 | Measured at integration |
| /homes-and-rentals | 452 (plus 21 app panel and 10 screen-reader words) | 301 | about 229 | Measured at integration |
| /solar | 351 (plus 15 screen-reader words) | 234 | about 219 | Measured at integration |
| /company | 324 | 216 | about 198 | Measured at integration |
| /register-interest | 71 page copy (plus 58 form words, exempt) | 47 | 13 | Measured at integration |
| /privacy | 255, of which 224 are policy text (exempt) | 170; about 21 for the head and index | 20 for the head and index | Measured at integration |
| /download | Not audited; F0.0 records its baseline | 0.667 of its baseline | about 132 | Measured at integration |
| 404 | New route | None | | Measured at integration |

- /privacy's recorded baseline includes the old policy text, which was not marked as prose, so its gate is lenient.
- The footer has 52 words. It sits outside main and is not counted.

## 12. The checks and commands

### Commands

Run these in order. Everything must pass before review.

```
npm run typecheck
npm run lint
npm run build
npm run start                    # serves on port 3000
npm run check:layout -- http://localhost:3000 --widths 1440,1024,768,390
npm run check:rules -- http://localhost:3000
npm run check:a11y -- http://localhost:3000
npm run perf:vitals -- http://localhost:3000
npm run perf:motion -- http://localhost:3000
npm run contrast -- <frame>      # after touching the header, the hero scrim or the hero's primary button
```

Media:

```
npm run media:fetch              # graded stills, variants, films, posters and renditions
npm run media:sheet              # contact sheet for the one-shoot review
```

Screenshots and comparisons:

- `node scripts/screenshots.mjs http://localhost:3000 --states --frames`:
  - `--states` forces hover, active and focus-visible on one of each button variant, a card, a field, a tab, a summary and an icon button;
  - `--frames` captures reveals at 0, 160, 320 and 640ms.
- `node scripts/compare-shots.mjs … --labels Lienry,Legora,ReFresh` builds side-by-side sheets from the private capture folder. Sheets that contain reference frames stay out of the repository.
- The Lienry before and after sets at 1440 and 390 are committed under `docs/screenshots/design-pass/`.

### What each check enforces

| Check | Script | Enforces |
| --- | --- | --- |
| 2 | check-layout | No empty stripe inside a band taller than 64px (from 1024) or 48px; side-by-side columns end together |
| 3 | check-layout | A warning for bands over two viewports at 1440; tab and part height within 1px |
| 4 | check-layout | Tones are plaster, ink or film; they alternate; no glass-deep panel; the footer is opposite the last band |
| 19 | check-layout | No overflow past the viewport, with the menu open or closed |
| 30 | check-layout | Section padding within 0.5px of S, 72 + H, or 0 |
| 31a | check-layout | Computed spacing on the scale |
| 32 | check-layout | Edges on column lines at 1440 and 1024; x 16 at 390 |
| 43 | check-layout | An unknown route returns 404 with the header and footer, and passes checks 2, 4, 19 and 30 |
| 5 | check-rules | Radius 0 or 4px; no shadow, blur, text shadow or gradient text; gradients only in the film scrims; rings are outlines |
| 6 | check-rules | Two families; the serif only where allowed; font files byte for byte |
| 7 | check-rules | Sizes on the scale; headings on H3 or above; `.letter` on H3 |
| 8 | check-rules | Uppercase only in `.label`; nothing centred outside the home hero |
| 9 | check-rules | One italic per band, as the heading's trailing phrase, in its colour |
| 10 | check-rules | Eyebrows: presence, pattern, style, and 16 ± 1 above the heading |
| 11 | check-rules | Claim words only in the allowed sentences; "$" only in the calculator; "price" banned; every numeral a cited statistic |
| 12 | check-rules | No "Concept render" anywhere |
| 13 | check-rules | Demo data and the illustrative notes on each window (/, /commercial, /download) and on the app panel (/homes-and-rentals) |
| 14 | check-rules | Media ids from the manifest; all 29 on the site; no id twice on a route |
| 21 | check-rules | Under reduced motion nothing plays or reveals; one video at a time; only the header is sticky; nothing moves with the scroll; no count-up |
| 22 | check-rules | Each route's own title, description, canonical link and share card |
| 23 | check-rules | No placeholders or empty photo boxes |
| 24 | check-rules | Every link to /register-interest carries the one label for its type |
| 25 | check-rules | h1 and h2 at most 7 words |
| 26 | check-rules | No one-word last line in headings or intros at 1440 and 390 |
| 27 | check-rules | Paragraphs at most 2 lines at 1440 |
| 28 | check-rules | Words at load at most 0.667 of the baseline |
| 29 | check-rules | `.label` only inside `[data-ui]` or the header |
| 31b | check-rules | Spacing utilities in `src` on the scale |
| 33 | check-rules | The calculator (below) |
| 41 | check-rules | Hover clips (section 7) |
| 34 | check-a11y | Keyboard order, visible rings, ring contrast, and the interactions of each widget |
| 35 | check-a11y | Focus never under the bar; targets 24px or larger |
| 36 | check-a11y | axe, WCAG 2.2 A and AA, at load and after each interaction |
| 37 | check-a11y | Hover, pressed, focus and transition timing |
| 38 | perf-vitals | Lighthouse 13.5.0, mobile, simulated throttling, median of three runs: LCP at most 2,500ms and CLS at most 0.1 |
| 42 | perf-vitals | No video poster attribute; mobile LCP image at most 80 KB; nothing else over 100 KB before LCP |
| 39 | perf-motion | Main-thread work during scroll, reveals, hover, the carousel, the tabs and the FAQ |
| 40 | perf-motion | Only opacity and transform-family properties change |
| contrast | contrast-hero | The header and hero stay legible over the film, against a real frame and against pure white |

Check 33 runs on every route with a calculator, at 390, 768 and 1440:

- every input and select has a label;
- the one live region is the hidden status line, and it reads the totals within 1s;
- 2,000 m², $30,000 and 0% give $150,000, $300,000 and $15;
- an increase of 3% gives $159,274 and $343,916;
- the maximum (1,000,000 m², $10,000,000 and 20%) gives $74,416,000, $259,586,821 and $10, with no overflow;
- no output shows decimals;
- values change between two frames with no steps in between;
- no network request fires while the visitor types;
- the band contains no saving or comparison words.

Expected mobile LCP images for check 42:

| Route | LCP image |
| --- | --- |
| / | h0 portrait, about 49 KB |
| /platform | h0 1280w, 41 KB |
| /commercial | c1 m43, about 41 KB |
| /homes-and-rentals | ho1 1280w, 57 KB |
| /solar | so1, 54 KB |
| /company | co1, 44 KB |

### Before the pass

These figures come from 80ed265 plus the grade, served locally with real graded media.

- **LCP:** Lighthouse 12 on mobile, with simulated slow 4G and 4x CPU. Every route failed the 2.5s target. CLS was 0.000 on every route.

| Route | LCP | LCP element |
| --- | --- | --- |
| / | 7.86s | The hero h1 |
| /platform | 3.23s | h0 |
| /commercial | 5.04s | c1 |
| /homes-and-rentals | 3.84s | ho1 |
| /solar | 3.70s | so1 |
| /company | 3.49s | s6 |
| /register-interest | 3.38s | The intro paragraph |
| /privacy | 2.85s | The intro paragraph |

- **Keyboard:** every route passed at 1440 and 390, with every control reached, no trap and a visible focus change on every control. The rebuild must keep that.

### Manual checks (recorded in `docs/DESIGN-QA.md`)

- Every page at 1440 and 390, before and after.
- `npm run media:sheet` reviewed against the one-shoot standard.
- Each film within 2/255 of its poster.
- The ground-pod rule, view by view.
- The header's pressed state (F12).
- 60fps in Chrome DevTools on a real machine, and LCP on a real phone (F11).

## 13. What we need from the owner

1. **The grade (F2).** Do you approve the look in the media sheet? Four stills do not sit in an overcast morning: co1 (a backlit sunrise), s5 (an indoor laptop), s6 (reads as dusk) and ho1 (low warm sun). Should they stay, or be replaced when credits allow?
2. **The ground pod (F2).** Are the closed pod (ho1, y1, p5, so1) and the open pod (m3, p3, p4, y3, y5) the same product? Until you say, no view shows both.
3. **The hover clip (F3).** The lead approved a 540p copy of the commercial clip for the home hover card. Without it, the card loads the 1.6 MB webm on hover. It is a smaller encode of an existing film, not a new shot. Are you happy with it?
4. **New shots (F4).** Higgsfield has 0 credits, and ChatGPT is not connected to this session. When credits return, which of these slots should come first?
   - benefit cards 2 to 4;
   - each collage frame;
   - the six parts, the two system cards and the story beats;
   - a hero film for /platform, /homes-and-rentals, /solar and /company.
   Can you supply real photographs of the founders? Per the brief, new stills come to you for approval before animation, and every new asset is logged in `docs/MEDIA.md`.
5. **Solar farms (F5).** Which system serves solar farms? The site no longer says. If it is the home system, we will restore that on /solar, /homes-and-rentals and /platform together.
6. **Lienry Desktop (F6).** Does the software need an active plan? How are updates delivered? The site now says this is still being finalised. What are the installer URLs and the version number?
7. **Privacy contact (F7).** Which email address should people use to ask about their data?
8. **Statistics (F8).**
   - The UNSW figure's label says "studied", while `stats.ts` says "modelling". Which matches the paper?
   - Can we confirm dropping the €3 to 5bn soiling figure from /solar?
9. **Copy (F9).** Will you approve these in the PR?
   - the FAQ bank, with its two-line answers and its "still being finalised" wording;
   - the founder letter;
   - the shorter home and inner-page copy;
   - the CLAUDE.md edits.
10. **Footer and carousel (F10).**
    - Is the footer heading fine without an eyebrow?
    - Is it fine that the places carousel shows no part of a fourth card at exactly 1440?
11. **Real hardware (F11).** Can we confirm 60fps on a real computer and LCP on a real phone? The test machine draws in software, so it cannot measure either.
12. **The header (F12).** The lead approved a states-only change: the header button and the phone-menu buttons now move 1px when pressed, and nothing else in the header changes. Are you happy with it?

## 14. What changed

Filled in at integration.