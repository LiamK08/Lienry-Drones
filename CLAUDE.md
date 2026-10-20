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

Type: two families only, Instrument Serif for headings, display lines and the footer logo, and
Inter for everything else. Eyebrows are an accent dot and 12px capitals (`.eyebrow`).

Shape: buttons are pills (`rounded-pill`, optional round arrow badge); cards are `rounded-card`
(16px), panels `rounded-panel` (20px); small tags and form fields keep `--radius-hard` (4px).
Soft blurred accent glows are allowed behind heroes and accent panels. No text shadows or
gradient text.

Checks: `check:a11y` and `perf:vitals` gate every route. `check:layout` and `check:rules` still
encode the earlier 4px, left-aligned system, so their shape, alignment, eyebrow and headline
checks fail by design; their honesty checks (11 claims, 12 captions, 22 titles, 24 enquiry
labels) still apply. Hero headings hold their fallback-font line count on phones (`holdLines`),
or the web font arriving shifts the page.

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
