# Lienry Drones

## Branch and deploy

`main` is production: Vercel builds it to lienrydrones.com. Work lands on `main`, and
that is what makes a change visible on the live site. A feature branch only ever gets a
Vercel preview URL, so leaving work on one means the site does not change.

Before pushing to `main`, run `npm run typecheck`, `npm run lint` and `npm run build`,
and confirm all three are clean.

## The rules this site is built on

Honesty: no customers, logos, testimonials, results, prices, certifications or approvals
are claimed anywhere. Statistics come only from `src/content/stats.ts`, each cited to its
primary source. The imagery is AI-generated and no longer carries a "Concept render"
label; it was removed on request, so nothing on the page tells a visitor the renders are
not photographs.

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
