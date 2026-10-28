# Lienry Drones

## Branch and deploy

`main` is production and deploys to www.lienrydrones.com. Work on a feature branch
and open a pull request with desktop (1440px) and mobile (390px) screenshots.
Never push straight to `main`. Run typecheck, lint and build before requesting review.
The user's current project brief wins over older notes in this repository.

## The rules this site is built on

Honesty: no customers, logos, testimonials, results, prices, certifications or approvals
are claimed anywhere. Statistics come only from `src/content/stats.ts`, each cited to its
primary source. The imagery is AI-generated. The owner removed the Concept render captions on
26 September 2026, so no image or film carries one, and `npm run check:rules` fails if one returns.
The coded software preview carries Demo data and an illustrative-model note.
No new or replacement media without the user's instructions. The software window's own recordings
(`public/video/<model>-view-*`, recorded from the coded model by `scripts/record-software-view.mjs`)
are part of the window, not imagery: each model's window brings its own (check 14 lists the stems).

Layout (since 20 October 2026, the owner's brief): the site follows refresh.tech's page
templates, section order and interaction patterns, in Lienry's own words, fonts, colours and
media. White ground, a warm paper band and a pale accent tint; Lienry's glass teal is the one
accent; near-black for the dark band and the footer. Status tones are not accents: the debris amber marks
debris, and with the fit check's soft red (`fit-*` tokens) a Partly or a No and the score's zones; never
a second accent. Section heads may be centred.

Type: two families only, both open-licensed and self-hosted: PT Serif (regular and italic) for
headings, display lines and the footer logo, and Inter for everything else (its italic only in the
footer tagline, loaded on demand). Sizes follow the reference: page titles 40px (30 on phones), home
section titles 48px (36), inner section titles 36px (36), card and row titles 32px (30), with tight
negative tracking. A section's h2 set at the page-title step drops to 36px on phones. No eyebrows: headings stand alone,
with no label above them (the owner's call, 21 October 2026). The header carries no pills.

Shape: buttons are pills (`rounded-pill`, optional round arrow badge); cards are `rounded-card`
(16px), panels `rounded-panel` (20px); feature and story images follow the reference's softer
corners (`Picture rounded="image"`, 12px, 8px from 1024; `rounded="media"`, 10px); small tags and form
fields keep `--radius-hard` (4px). The header bar is 56px (`--nav-h`).
Soft blurred accent glows are allowed behind heroes and accent panels. No text shadows or
gradient text.

Checks: `check:a11y`, `perf:vitals`, `check:layout` and `check:rules` gate every route. Since
20 October 2026 the last two encode this system: the radius set and pills, PT Serif over Inter at
the token sizes, no eyebrows, centred heads centred where they sit,
content inside the rail and the 20px phone margins, the band palette and Band's pads. Their
honesty checks (11 claims, 12 captions, 22 titles, 24 enquiry labels, 44 no ReFresh or Legora)
never relax. `check:layout`, `check:rules` and the motion and screenshot scripts judge each page as a
visitor in a session that has seen the intro (its key seeded); `perf:vitals` and `check:a11y` load home as
a first visit, intro and all; check 45 (in `check:rules`) proves the intro's own rules. Change a check only together with the rule here that it encodes. Hero headings hold
their fallback-font line count on phones (`holdLines`), or the web font arriving shifts the page.

Sticky: only the header, a column under it (a nav, or a block holding a heading, nav or form), and,
below 1024, the fit check's score strip (`data-fit-strip`), which sticks to the bottom of the screen inside
its card's question column (the owner's brief, 26 October 2026). Check 21 encodes it. Nothing is fixed but
the header, the skip link and, while it plays, the intro's overlay.

Intro (the owner's brief, 28 October 2026): when a browser session starts on the home page, a first-visit
intro plays over it, after breakerindustries.com's loader in Lienry's own mark, colours and code: on the
paper, three drones fly in on guide curves and trace the mark's blocks in the accent while they fill, one
leaving along the flight arc; the mark turns ink and fades as the paper fades into the hero film, which
starts again from its first frame. About four seconds, never past five, all CSS
(`src/components/home/Intro.tsx`; the head script in `src/lib/intro.ts` sets `data-intro` before the
first paint). Once per session (sessionStorage), never on another entry page, a reload, a visit from
another page of the site (a home tab opened from inside it), an address with a hash, or under reduced
motion. Any key, press, wheel, touch or scroll ends it at once (a text-fragment link scrolls the page, so
it ends at once too), and a press that ends it while the paper still covers the page never clicks or
hovers what was under it. It is aria-hidden with nothing focusable, and the page renders underneath as normal (never
hidden or inert), so it never delays the LCP.

Header contrast: `npm run contrast -- <frame>` proves the bar stays legible over the hero
film. Run it after touching the header, the hero scrim or the primary button.

Legora and refresh.tech are references for quality and structure only. No Legora or ReFresh
code, text, imagery, icons, logos or assets enter this repository, and the site never loads
one. Where a ReFresh section rests on customers, logos, testimonials or certifications, Lienry
shows an honest stand-in (design facts, cited figures, links into its own pages).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
