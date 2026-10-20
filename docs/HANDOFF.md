# Handoff, 20 October 2026

Read this first in a new session, then `CLAUDE.md` and the Status section of `docs/DESIGN-PASS.md`.
Update this file at the end of each session.

## Where things stand

- The October design pass is finished on every page. Home and the eight inner pages (/platform,
  /commercial, /homes-and-rentals, /solar, /company, /download, /register-interest, /privacy) and
  the 404 page are built on the new system.
- `main` is at `7e53da9` and deploys to www.lienrydrones.com. The work branch was
  `claude/nifty-wozniak-ini85h`; it matches `main`.
- At `7e53da9`, all four gates passed on every route:
  - `check:layout`
  - `check:rules`
  - `check:a11y`
  - `perf:vitals` (mobile, applied throttling, three runs). Median LCP ran from 1.6 s to 2.42 s
    (/commercial is the closest to the 2.5 s limit). CLS was at most 0.08 (/solar).
- PR #13 (the design pass) was closed rather than merged, because the owner asked for each step to
  be pushed straight to `main`. There is no open PR.

## How the owner works

- They want results on `main` fast. Prefer to build, check, commit and push over long plans or
  multi-agent workflows: earlier sessions lost work to restarts mid-workflow.
- To deploy, push the branch, then run `git push origin <branch>:main` as a separate command. A
  combined command was refused once.
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
- **Rules check [14]:** it fails while anything in `public/video` is uncommitted.
- **Proxy:** Chromium does not trust the proxy CA. The scripts route requests through Playwright
  (`scripts/media/lib.mjs` `routed()`), and Node needs `NODE_USE_ENV_PROXY=1`.

## Rules that are easy to break (the checks enforce them)

- **Bands:** every page alternates plaster and ink bands and ends on plaster, because the footer is
  ink. The one exception is a band with `pad="attached"` straight after the hero, in its tone
  (/commercial's steps). No raised or sunken bands.
- **Headings:**
  - Every h1 and h2 has a lowercase eyebrow of 1 to 3 words and runs to 7 words at most.
  - A section has at most one italic, and it is the trailing phrase (`emphasis`) of the band's own
    heading.
  - No heading or band intro may end on a one-word line, at 1440 or at 390.
- **Copy:**
  - Every `p` in `<main>` runs 2 lines at most at 1440. The exceptions are `[data-prose]`, forms,
    `.letter` and `[data-ui]`.
  - The words seen at load stay within 0.667 × the route's figure in `scripts/copy-baseline.json`.
    /solar has about 3 words to spare.
- **Claims:**
  - No customers, results, prices, savings, approvals or certifications.
  - "approval" may appear only in the FAQ's "We do not claim any approvals" and the Honest by default
    rule (`companyPage.values.items`; keep that path).
  - "$" may appear only inside the calculator.
- **Media:**
  - All 29 manifest ids must appear somewhere on the site.
  - An id may show only once per route.
  - Never show a closed ground pod (ho1, y1, p5, so1) beside an open one (m3, p3, p4, y3, y5).
  - No new or replacement imagery without the owner's say. The phone poster of the software
    recording was recompressed in place (same frame) to fit the /download load budget.
- **Spacing:** utilities use the 8px scale only (multipliers 0, px, 2, 4, 6, 8, 10, 12, 16, 20, 24,
  32, 40) or the layout variables, such as `py-(--section-y)` and `mt-(--head-gap)`.
- **Font swap shifts layout:** on a phone, Lighthouse loads pages at 412px. If an h1 wraps
  differently in the fallback font, the hero image moves. /solar's headline was chosen so it wraps
  the same in both fonts, with `breakBefore` from 768.
- **Next.js 16:** read `node_modules/next/dist/docs` before touching framework APIs.

## Building blocks

- **Sections** (`src/components/sections`):
  - `PageHero` (image, film or `after`)
  - `ClosingSection` (collage or image)
  - `CardGrid` (2 or 3 columns, optional anchors)
  - `StepCards` (`pad="attached"` allowed)
  - `FeatureRow`
  - `StatBand` (cited stats from `src/content/stats.ts`)
  - `Faq` (ids from `faqFor(set)` in `src/content/faq.ts`)
  - `CostCalculator`
  - `HeroFilmFrame`
- **Home only** (`src/components/home`): `Hero`, `Benefits`, `Flow`, `PlacesRow`, `VisionLetter`.
  `LandlordStory` (the app story, on ink) also lives there and is used on /homes-and-rentals.
- **Copy:** one module per route in `src/content`.
- **UI** (`src/components/ui`): `Band` / `Container`, `SectionHead`, `MediaCard`, `Picture`,
  `Reveal`, `SnapTrack`, `StepTabs`, `Field`, `Button`.

## Waiting on the owner

1. Which ground pod design is real: the closed lid or the open one?
2. Can `co1-company` and `s5-software` be regenerated to the overcast look?
3. Which system serves solar farms? Until we know, no copy names one.
4. What contact email should /privacy give?
5. Lienry Desktop: the installer URLs and version for `src/lib/download.ts`, and whether signing in
   needs a software plan.

## Possible next steps

- Answer any of the five questions above as the owner replies.
- Take side-by-side screenshots at 1440 and 390 for every page, and look over each page by eye.
- Run `npm run contrast` and `perf:motion`; neither has run since the inner pages were rebuilt.
- Add hover clips to the other benefit cards and the closing collages once films exist (owner
  approval needed).
