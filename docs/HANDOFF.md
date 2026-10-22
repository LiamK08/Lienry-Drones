# Handoff, 22 October 2026

Read this first in a new session, then `CLAUDE.md`. Update this file at the end of each session.

## Where things stand

- On 20 October the owner asked for the site to follow refresh.tech's layout as closely as possible,
  in Lienry's own words, fonts, colours and media. That is built and live on `main` (`b929b3d` and
  after): the shell (pill buttons, dotted eyebrows, centred heads, the menus header and the near-black
  footer, PT Serif headings over Inter at the reference's sizes), home, /platform, /commercial, /homes-and-rentals, /solar, /company, /register-interest,
  /download, /privacy (centred legal header, sticky contents beside the policy) and the 404, plus two
  new pages, /fit-check and /calculator.
- Where a ReFresh section rests on things Lienry does not have (customer logos, testimonials, case
  studies, security certifications, articles), the page shows an honest stand-in: a strip of what it
  is designed for, three settings with design-intent and cited figures, link cards into Lienry's own
  pages, and safety-by-design tiles. Keep it that way.
- Second pass (20 October, PR #14): every inner page was measured against its reference page and
  rebuilt to it: the solutions template (/commercial, /homes-and-rentals, /solar: hero, word strip,
  one white features run, one paper band, the FAQ on white, the 1328x400 closing panel), /company
  (900px bubble hero, asymmetric story rows, funding inside the story band), /register-interest
  (enquirer tabs tied to the form's "I am a" radios), /fit-check (compact hero, one 684px column with
  a seven-segment bar, explainer and FAQ cards), /calculator (title hero, featured row, sidebar and
  card listing) and /privacy (legal tab strip, contents beside the policy). Shared: a 56px header
  that is a soft white veil at the top of inner pages, 20px phone margins, 42px pills whose label
  rolls up on hover, softer image corners, restyled FAQ rows.
- Third pass (20 October, PR #15): `check:layout` and `check:rules` were rewritten to this system and
  gate again (spec and probe data were in the session scratchpad; the scripts' header comments are now
  the spec). Retired: tone alternation, the 8px spacing scale (31a, 31b), headline length (25),
  paragraph lines (27) and the copy budget (28). New: check 44, refresh.tech and Legora never load and
  are never named. The honesty checks 11, 12, 22, 24 and 33 are unchanged. Site fixes the new checks
  found: sentence-case eyebrows on /download, three one-word last lines, the platform part tabs share
  one grid cell (switching no longer moves the page on phones) and the Drone part got a "See the
  surfaces" pill, the bleed AccentPanel keeps the 20px phone margin, /calculator's featured row sits
  80px under the lead below 1024, the 404 drops its 70svh floor from 768 to 1023, and the bubble hero
  stops popping in under reduced motion.
- Gates: typecheck, lint and build pass; `check:layout` passes on all 12 routes at 1440, 390, 1024 and
  768; `check:rules` (with motion) passes on all 12 routes at 1440 and 390; `check:a11y` passes on all
  12 routes; `perf:vitals` (three runs each) passes on all 11 pages.
- 21 October: at the owner's request the home hero shows only the headline and the support line,
  64px above the strip from 768 (80 on phones): its two pills and the film's pause control are gone.
  The owner chose to drop the pause control entirely, knowing WCAG 2.2.2 asks for one on a looping
  film; reduced motion and Save-Data still get the still poster instead of the film. The two word
  strips lost their pause buttons the same day, on the same call. Headings on phones now follow the
  reference: section titles 36px (h2, h2s, and an h2 set at the h1 step), card and row titles 30px.
  The header lost its Download and Register interest pills, in the bar and the phone menu, on the
  owner's call: Lienry Desktop stays in Resources, and every page still closes on its own call to act.
  The same day the owner retired every eyebrow (the dotted capitals label above a heading) across
  the site, header menu card included; check 10 now fails if one renders, and CLAUDE.md says so.
- Later on 21 October: the solution pages' feature rows run text, then picture, below 1024 (as on
  /platform): with the eyebrows gone the first picture had risen into the phone's first screen and
  become a slow lazy LCP image. The home "Built for the buildings you own." band is now short: a
  centred head and three compact link cards (icon, name, one line, round arrow) straight to
  /commercial, /homes-and-rentals and /solar, on the compact band padding; its figures are gone. The
  "What changes when the drone lives on site." cards draw each picture once at the open card's width
  (centred, `100cqw` of the row), so hover pans the picture out instead of zooming in; while one card
  is open the others' titles fade (`.why-row` / `.why-text` in globals.css).
- Also 21 October: the software window (`SoftwareWindow`, on /platform, /commercial and /download)
  was redesigned to read as real desktop software. A paper title bar with a breadcrumb, "Preview" and
  a "Demo data" tag; the layers as a segmented control with each layer's key; an Overview button; a
  status chip ("Washing North facade, Level 9, pass 2 of 2") and a compass over the model; the wash
  route's four zones with their own progress; an inspector with the clean's percentage, a canvas
  facade map (the north and east elevations and the roof glazing, one cell per planned panel:
  pending, one pass, washed, debris still on it) and the figures as rows; a timeline cut into the
  zones' spans. The scene reports what it draws (`control.cells`, `activity`, `spans`, `azimuth`), so
  every readout follows the model. The pure dimensions and debris moved to
  `src/components/three/software/dims.ts` (no three.js) so the window can draw the map without the
  WebGL chunk; `layout.ts` re-exports them. The layout follows the window's own width (container
  queries at 38rem and 56rem), and the recording mode renders the same rows at the same heights. The
  phone recordings in `public/video` were not re-recorded: the 3D model itself did not change.
  An independent review then fixed: the facade map is SVG (a canvas there read as the live model to
  check 21), counts follow the plan's progress even with the Wash layer hidden, the compass holds
  its overview heading until the scene draws, and a window 26 to 38rem wide (/commercial's half
  column from 1024 to 1309) gets a compact layout instead of the 1.5k px phone stack.
- /download on phones had a latent LCP race (it failed on `main` too, median 4.8 s): Chrome floors
  the video's painted rect but rounds the image's, so the recording's first frame could be one row
  larger than its poster image and take over as LCP. The recording now loads only after its poster
  has loaded, and sits 1px short at the top (`SoftwareWindow`, commented). Keep both.
- 22 October: the 3D building reads as a real glass tower (owner's request): dark reflective glass
  that varies pane to pane, with a lit ceiling and some part-drawn blinds behind it; dusty, hazy glass
  until the wash clears it (so washed panes are the dark ones, as on the facade map); dark spandrels,
  aluminium mullions and copings, metal parapet cladding, a grey roof membrane
  (`three/software/materials.ts`, `Structure.tsx`). The phone and reduced-motion recordings and both
  posters were re-recorded to match: `node scripts/record-software-view.mjs http://localhost:3000`
  (about 20 minutes in software GL; it captures the model on /download at a fixed view size, crops to
  1020x756 and 720x900 and writes the posters with mozjpeg 76; `--encode-only` re-encodes from
  `.next/cache/software-view-frames`). Re-record whenever the model's look changes.
- Also 22 October (owner's request): /solar has its own software window, a demo solar array instead
  of the building (`<SoftwareWindow model="solar" />`, the "Every row planned, washed and tracked"
  row). The window is generic over a model (`src/components/software/models.ts`: project, zones,
  cells, status lines, map, legend, recordings; `SCENES` in `three/SoftwareScene.tsx`: cameras,
  framing, sway, contact shadows, content). The array (`three/solar/`): four rows of 2 x 10 landscape
  modules tilted 20° north on galvanised posts, rafters and rails, a combiner box at each row end and
  the tether reel on a concrete pad in front. The module glass is drawn in a shader (half-cut cells,
  busbars, frame; the cell grid fades out when it is too small to draw cleanly) and carries its own
  soiling as a warm matte film, heaviest along the lower frame, that the wash clears to deep blue
  glass. The drone hovers about a metre over the line it washes, nearly level and facing the glass,
  with a fan of spray down onto it; upper line west to east, lower line back, then over the table to
  the next row; its tether lies in the aisle in front of the row. The scan sweeps west to east. The
  overview sways between two azimuths instead of circling (the backs of the panels say nothing), and
  its framing is fitted across the whole sway. The map is an SVG array map (rows A to D). Recordings:
  `node scripts/record-software-view.mjs http://localhost:3000 --model=solar` writes
  `public/video/solar-view-{wide,tall}` and posters (about 17 minutes; the recorder holds every window
  at /download's 1006px so a half-column window is not clipped). Check 13 expects the window on
  /solar too; checks 14 and 21 know each window's recordings (`SPEC.windowRecordings`), and CLAUDE.md
  says a model's window may bring its own (they are recordings of the coded model, not imagery).
- Also 22 October (owner's request): the /homes-and-rentals app demo is interactive. Nothing is
  ticked at first; the visitor chooses Driveway, Solar panels and/or Windows, starts the clean, and
  each chosen area washes in turn (about 2.5 s each, instant under reduced motion) while the picture
  beside it follows: the house before, each chosen area being washed, then the house after, with a
  caption chip (`AppPanel` `useCleanDemo`, `LandlordStory`). The row's media column is wider
  (`FeatureRows` `wideMedia`: 7 of 12 columns from 1280, 8 of 12 from 1024) and the picture shows on
  phones too, under the app. The windows picture is `p3-house`, so the materials row above it now
  shows `p4-rental` (check 14: no picture in two frames on a route in any state).
- Gates on 22 October: typecheck, lint and build pass; `check:layout` (1440, 390, 1024 and 768),
  `check:rules` (with motion on /solar and /homes-and-rentals, without on the rest), `check:a11y` and
  `perf:vitals` pass on /solar, /homes-and-rentals, /commercial, /download and /platform.
- The owner said the imagery is not good enough yet and will be redone in Higgsfield later. Until
  they say so, keep the current stills and film in the new layouts.

## How the owner works

- They want results fast. Prefer to build, check, commit and push over long plans or multi-agent
  workflows: earlier sessions lost work to restarts mid-workflow.
- Since 22 October the owner deploys themselves: push changes to the feature branch only, never to
  `main`. They review the branch's Vercel preview, then merge it into `main` from their own terminal.
  Tell them the branch name when the work is pushed.
- Keep the replies short. End with what changed and what you need from them.

## Running the site and the checks in a fresh container

```sh
npm ci
NODE_USE_ENV_PROXY=1 npm run media:fetch   # public/media is gitignored; this downloads and grades all 29 assets
git checkout -- public/media/index.json    # fetch rewrites it; never commit that change
npm run typecheck && npm run lint
NODE_USE_ENV_PROXY=1 npm run build         # prebuild runs the fetch again with --soft
nohup npx next start -p 3000 > "$SCRATCH/next.log" 2>&1 &
node scripts/check-layout.mjs http://localhost:3000 [routes]
node scripts/check-rules.mjs  http://localhost:3000 [routes] [--no-motion]
node scripts/check-a11y.mjs   http://localhost:3000 [routes]
NODE_USE_ENV_PROXY=1 node scripts/perf-vitals.mjs http://localhost:3000 [routes] --runs 3
```

- **Restarting the server:** never run `pkill -f "next start"`, because it matches and kills your
  own shell. Find the `next-server` pid with `ps -eo pid,args | grep next-server` and kill that.
- **Run order:** run `perf-vitals` alone. Run `check-a11y` alone, or with at most one other check:
  under heavy load it times out mid-transition on the home carousel and step tabs.
- **Rules check [14]:** it fails while anything in `public/video` is uncommitted, and on any file
  added there on the branch except a software window's own recordings (`SPEC.windowRecordings`). `c2-commercial-clip`
  is in the manifest but on no page since the refresh layout dropped hover clips; `SPEC.unplaced` in
  `scripts/check-rules.mjs` lists it with that reason, and check 14 fails if it is placed again while
  still listed.
- **Run time:** a full `check:rules` run with motion takes about 25 minutes; iterate with `--no-motion`
  and a few routes. Both checks take `--inject <file.js>`, an init script added to every page, to break a
  rule on purpose and prove the check fails on it.
- **Proxy:** Chromium does not trust the proxy CA. The scripts route requests through Playwright
  (`scripts/media/lib.mjs` `routed()`), and Node needs `NODE_USE_ENV_PROXY=1`.

## Rules that are easy to break

- **Honesty:** no customers, logos, testimonials, results, prices, savings, certifications or
  approvals. "approval" appears only in the FAQ's "We do not claim any approvals" (and the Honest by
  default rule in `companyPage.values.items`; keep that path, check 11 reads it). Figures are design
  intent (say so) or cited from `src/content/stats.ts` with their source links.
- **Original words:** take layout and interaction patterns from refresh.tech, never its text,
  headings, code, imagery, icons or logo. Write every line fresh for Lienry.
- **Fonts:** PT Serif and Inter (OFL), self-hosted in `src/fonts`. Only the upright Inter and the two
  PT Serif files are preloaded; preloading anything else (the Inter italic is 80 KB) pushes /download
  over the 2.5 s LCP budget.
- **Font swap:** a heading can wrap one line differently in the fallback font at phone widths. Give
  each hero its `mobileLines` (the larger of the two wraps from 360 to 412) or the page shifts.
- **Motion:** like the reference, sections do not fade in as they scroll; `Reveal` only animates with
  `animate` (the questions' heading). The home step timer runs 6 s a step; the reason cards widen over
  700 ms (the owner asked for half the reference's speed).
- **Logo strip:** the home strip shows what the system is designed for, set as marks. Never put real
  companies' logos there or anywhere as customers, partners or backers.
- **Transitions:** use `transition-[background-color,border-color,color]`, not `transition-colors`,
  on anything focusable: the latter animates the outline colour and the focus ring fails contrast.
- **Tailwind token collisions:** the theme defines `--container-grid`, so `inline-grid` compiles to
  `inline-size: 1392px`, not a display. Write `[display:inline-grid]`.
- **Hydration and LCP:** never put visible text under a Suspense fallback that is swapped after
  hydration (useSearchParams): the swap repaints it late and LCP jumps (/register-interest hit 4.8 s).
  Read the URL in a small child under Suspense and keep the visible tree outside it.
- **Media:** no new or replacement imagery without the owner's say. Never pair a closed ground pod
  (ho1, y1, p5, so1) beside an open one (m3, p3, p4, y3, y5) in one view.
- **Next.js 16:** read `node_modules/next/dist/docs` before touching framework APIs.

## Building blocks

- **Pattern blocks** (`src/components/blocks`): `SplitHero` (platform, fit check, calculator),
  `CenterHero` (solution pages), `BubbleHero` (company), `WordStrip`, `FeatureRows` (alternating rows
  with checks, callout, fact strip, or a node such as the software window), `PillarTabs` (the six
  parts; each panel id is the footer anchor), `SafetyBlock`, `AccentPanel` (inset or full bleed),
  `FaqCentered` and `FaqRows`, `ProductClose` (the framed software window, `frame="inset"`), `FitCheck`, `Icon`,
  `holdLines`; from the second pass `TitleHero` (/calculator), `FaqCards` (/fit-check),
  `FiguresPanel` (cited figures in the solutions paper band), `SplitHero variant="compact"`,
  `FeatureRows variant="solutions"`, `FitCheck layout="column"`, `CostCalculator layout="listing"`,
  `EnquiryTypeTabs` (with `EnquiryTypeProvider`).
- **Home** (`src/components/home`): `Hero`, `Strip` (marquee), `WhyFit`, `ExpandCards`, `StepTimer`,
  `SystemCards`, `Explore`, `SafetyPanel`, `FaqForm`; `LandlordStory` is used on /homes-and-rentals.
- **Earlier sections still in use**: `StatBand` (cited figures), `CostCalculator`, `PageHero` (404),
  `Faq` types.
- **Copy:** one module per route in `src/content` (`tools.ts` for /fit-check and /calculator). Menus
  and footer links in `src/lib/site.ts`.
- **Tokens** (`src/app/globals.css`): `bg-paper`, `bg-tint`, `bg-night`, `border-line`, `text-accent`,
  `rounded-card`, `rounded-panel`, `rounded-pill`; Band tones `plaster` (white), `paper`, `tint`,
  `ink`, `night`.

## Waiting on the owner

1. Which ground pod design is real: the closed lid or the open one?
2. Can `co1-company` and `s5-software` be regenerated to the overcast look?
3. Which system serves solar farms? Until we know, no copy names one.
4. What contact email should /privacy give?
5. Lienry Desktop: the installer URLs and version for `src/lib/download.ts`, and whether signing in
   needs a software plan.
6. `c2-commercial-clip`: show it on a page again, or retire it from the manifest?

## Owner's calls left open by the second pass

- /company's hero fades to white later than the reference (an extra stop at 72%) so the lead keeps
  4.5:1; delete that stop to match the reference exactly.
- Check 8 lets a centred run be 6 lines below 768 (4 from 768): the reference's centred hero and tab
  leads run 5 to 6 lines in the phone column. Lower `SPEC.maxCentredLines.phone` to 4 and those leads
  need cutting or left-aligning on phones.
- The Drone part's new pill reads "See the surfaces" and links to #features; reword it if wanted.

## Possible next steps

- Swap in the owner's Higgsfield imagery and films when they have the account (the layouts take
  them as they are: tall 2:3 or 1:1.83 portraits for the expanding cards, 1200x483 for the step panel,
  4:3 for feature rows).
- Turn the mutation files used to prove the checks (`--inject`) into a committed self-test, so a
  later edit to either script cannot quietly stop a rule from failing.
- Answer any of the six questions above as the owner replies.
