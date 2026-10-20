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
No new or replacement media without the user's instructions.

Layout (since 20 October 2026, the owner's brief): the site follows refresh.tech's page
templates, section order and interaction patterns, in Lienry's own words, fonts, colours and
media. White ground, a warm paper band and a pale accent tint; Lienry's glass teal is the one
accent; near-black for the dark band and the footer. Section heads may be centred.

Type: two families only, both open-licensed and self-hosted: PT Serif (regular and italic) for
headings, display lines and the footer logo, and Inter for everything else (its italic only in the
footer tagline, loaded on demand). Sizes follow the reference: page titles 40px (30 on phones), home
section titles 48px (31), inner section titles 36px (30), card titles 32px (26), with tight negative
tracking. Eyebrows are an accent dot and 12px capitals (`.eyebrow`).

Shape: buttons are pills (`rounded-pill`, optional round arrow badge); cards are `rounded-card`
(16px), panels `rounded-panel` (20px); feature and story images follow the reference's softer
corners (`Picture rounded="image"`, 12px, 8px from 1024; `rounded="media"`, 10px); small tags and form
fields keep `--radius-hard` (4px). The header bar is 56px (`--nav-h`).
Soft blurred accent glows are allowed behind heroes and accent panels. No text shadows or
gradient text.

Checks: `check:a11y`, `perf:vitals`, `check:layout` and `check:rules` gate every route. Since
20 October 2026 the last two encode this system: the radius set and pills, PT Serif over Inter at
the token sizes, dotted capital eyebrows on their heading, centred heads centred where they sit,
content inside the rail and the 20px phone margins, the band palette and Band's pads. Their
honesty checks (11 claims, 12 captions, 22 titles, 24 enquiry labels, 44 no ReFresh or Legora)
never relax. Change a check only together with the rule here that it encodes. Hero headings hold
their fallback-font line count on phones (`holdLines`), or the web font arriving shifts the page.

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
