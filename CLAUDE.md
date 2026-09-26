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

Type: two families only, Instrument Serif for headings and Inter for everything else.
Every size comes from a step of the scale in `src/app/globals.css`; there is no step
between H3 and body, so every heading element sits on H3 or above. Labels are the only
uppercase. Everything is left aligned except the home hero.

Shape: one radius token, `--radius-hard` at 4px. No pills, chips, badges, pastel tints,
glows, blurs, text shadows or gradient text.

Header contrast: `npm run contrast -- <frame>` proves the bar stays legible over the hero
film. Run it after touching the header, the hero scrim or the primary button.

Legora is a reference for quality and structure only. No Legora code, text, imagery,
icons, logos or assets enter this repository, and the site never loads one.
