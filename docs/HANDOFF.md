# Handoff, 20 October 2026

Read this first in a new session, then `CLAUDE.md`. Update this file at the end of each session.

## Where things stand

- On 20 October the owner asked for the site to follow refresh.tech's layout as closely as possible,
  in Lienry's own words, fonts, colours and media. That is built and live on `main` (`b929b3d` and
  after): the shell (pill buttons, dotted eyebrows, centred heads, the menus header and the near-black
  footer), home, /platform, /commercial, /homes-and-rentals, /solar, /company, /register-interest,
  /download, /privacy (centred legal header, sticky contents beside the policy) and the 404, plus two
  new pages, /fit-check and /calculator.
- Where a ReFresh section rests on things Lienry does not have (customer logos, testimonials, case
  studies, security certifications, articles), the page shows an honest stand-in: a strip of what it
  is designed for, three settings with design-intent and cited figures, link cards into Lienry's own
  pages, and safety-by-design tiles. Keep it that way.
- Gates at `b929b3d`: typecheck, lint and build pass; `check:a11y` passes on all 11 routes;
  `perf:vitals` (mobile, applied throttling, one run each) passes on all 11, LCP 1.7 to 2.3 s, CLS
  under 0.1. `check:layout` and `check:rules` encode the October 4px, left-aligned system and fail by
  design on shape, alignment, eyebrow and headline length; read only their honesty checks (11, 12,
  22, 24), which pass apart from check 13's old demand for a software window on the home page.
- The owner said the imagery is not good enough yet and will be redone in Higgsfield later. Until
  they say so, keep the current stills and film in the new layouts.

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

## Rules that are easy to break

- **Honesty:** no customers, logos, testimonials, results, prices, savings, certifications or
  approvals. "approval" appears only in the FAQ's "We do not claim any approvals" (and the Honest by
  default rule in `companyPage.values.items`; keep that path, check 11 reads it). Figures are design
  intent (say so) or cited from `src/content/stats.ts` with their source links.
- **Original words:** take layout and interaction patterns from refresh.tech, never its text,
  headings, code, imagery, icons or logo. Write every line fresh for Lienry.
- **Font swap:** at Lighthouse's 412px width many headings wrap one line differently in the fallback
  font. Give each hero its `mobileLines` (the fallback line count) or the page shifts.
- **Transitions:** use `transition-[background-color,border-color,color]`, not `transition-colors`,
  on anything focusable: the latter animates the outline colour and the focus ring fails contrast.
- **Media:** no new or replacement imagery without the owner's say. Never pair a closed ground pod
  (ho1, y1, p5, so1) beside an open one (m3, p3, p4, y3, y5) in one view.
- **Next.js 16:** read `node_modules/next/dist/docs` before touching framework APIs.

## Building blocks

- **Pattern blocks** (`src/components/blocks`): `SplitHero` (platform, fit check, calculator),
  `CenterHero` (solution pages), `BubbleHero` (company), `WordStrip`, `FeatureRows` (alternating rows
  with checks, callout, fact strip, or a node such as the software window), `PillarTabs` (the six
  parts; each panel id is the footer anchor), `SafetyBlock`, `AccentPanel` (inset or full bleed),
  `FaqCentered` and `FaqRows`, `ProductClose` (the framed software window), `FitCheck`, `Icon`,
  `holdLines`.
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

## Possible next steps

- Swap in the owner's Higgsfield imagery and films when they have the account (the layouts take
  them as they are: tall 2:3 or 1:1.83 portraits for the expanding cards, 1200x483 for the step panel,
  4:3 for feature rows).
- Update `check:layout` and `check:rules` to the new system (pills, card radius, centred heads,
  dotted capitals eyebrows) so they gate again instead of failing by design.
- Answer any of the five questions above as the owner replies.
