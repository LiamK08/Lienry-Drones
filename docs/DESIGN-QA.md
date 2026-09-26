# Editorial refinement — review record

22 September 2026. Local production build, Next.js App Router. Reference analysis and decisions are in [DESIGN-RESEARCH.md](DESIGN-RESEARCH.md#10-direct-visual-review--22-september-2026).

## What changed

The previous site repeated large text, boxed components and decorative app framing. The revised hierarchy gives the existing product imagery more space and lets the copy explain one point at a time. It keeps Instrument Serif, Inter, the existing colour tokens, 4px corners, native scrolling and the approved media.

The home page now has an immediate headline, compact product disclosures, unboxed system comparisons, a portrait property gallery, a simpler app illustration, static concept-stage product facts and an editorial footer. The same typography and spacing apply to the seven inner pages. All generated figures have a Concept render caption. The software remains a coded 3D demonstration, with Demo data and an illustrative-model note.

## Validation

| Check | Result |
| --- | --- |
| Production build | Passed (`npm run build`), all routes generated |
| ESLint | Passed (`npm run lint`) |
| TypeScript | Passed (`npm run typecheck`) |
| Patch whitespace | Passed (`git diff --check`) |
| Automated accessibility | All 8 routes at 1440 and 390px: zero axe-core WCAG A/AA violations; home repeated after final interaction changes |
| Browser errors | None recorded during the route audit |
| Horizontal overflow | None on the 8 routes at either audited width |
| Hero/header contrast | `npm run contrast -- public/media/h1-hero-film-poster.jpg` passed; hero white links at least 6.02:1, ink on plaster 15.14:1, muted on plaster 6.14:1, button text 17.36:1 |
| Hero video size | Existing MP4 2,334,928 bytes; WebM 1,289,369 bytes; both below 4MB |
| Media pipeline | 29 existing manifest assets resolved; no source media added or replaced |

Axe's incomplete items include image/video text contrast and media alternatives, which need human review. The contrast script tests the supplied poster and scrim bounds; it is not a frame-by-frame review of the entire film. These checks are evidence of the work, not a claim of independent WCAG certification.

## Interaction checks

- Mobile menu: focus wraps within the header/menu, Escape closes it and returns focus, background content is inert while open.
- System disclosures: keyboard activation updates the open panel and its image; the active panel is labelled expanded.
- Property gallery: next/previous navigation works, including disabled controls at the ends, with native swipe/scroll.
- Desktop software: layer and zone controls update their pressed states, zone selection highlights the selection, and keyboard End sets the wash timeline to 100%.
- Software pause works. Resizing from mobile to desktop replaces the video fallback with the canvas. The expanded panel readout allows native select/keyboard access to the same surface, example pressure, last-washed and debris data available on hover.
- Form: investor query selects Investor; an empty submission displays field errors and focuses Name. Local API returns 422 for invalid input and 503 for valid input when no delivery webhook is configured. No live enquiries were sent during testing.
- Above-the-fold headings, logo and images no longer wait for reveal animations. Below-fold reveals use transform/opacity. Reduced-motion and offscreen pause branches were reviewed in code; reduced-motion behaviour still needs a real device check.

## Performance scope

Local browser instrumentation reported no layout shift on the home page. It is an unthrottled local test, not evidence that mobile LCP meets 2.5 seconds over a real network. The desktop browser's frame timing is also not a reliable real-device 60fps certification. Real mobile network/device measurements remain a launch check. Hero media stays below the requested size cap, fonts remain self-hosted, below-fold images lazy-load, and heavy 3D code is deferred behind device capability checks.

## Screenshots

These are native viewport captures, with no composition edits. All eight changed routes are included at 1440×900 and 390×844. Below-fold sections were also inspected during the full-page accessibility scroll.

| Page | Desktop | Mobile |
| --- | --- | --- |
| Home | [1440](screenshots/editorial/home-1440-top.jpg) | [390](screenshots/editorial/home-390-top.jpg) |
| Platform | [1440](screenshots/editorial/platform-1440-top.jpg) | [390](screenshots/editorial/platform-390-top.jpg) |
| Commercial | [1440](screenshots/editorial/commercial-1440-top.jpg) | [390](screenshots/editorial/commercial-390-top.jpg) |
| Homes and Rentals | [1440](screenshots/editorial/homes-and-rentals-1440-top.jpg) | [390](screenshots/editorial/homes-and-rentals-390-top.jpg) |
| Solar | [1440](screenshots/editorial/solar-1440-top.jpg) | [390](screenshots/editorial/solar-390-top.jpg) |
| Company | [1440](screenshots/editorial/company-1440-top.jpg) | [390](screenshots/editorial/company-390-top.jpg) |
| Register interest | [1440](screenshots/editorial/register-interest-1440-top.jpg) | [390](screenshots/editorial/register-interest-390-top.jpg) |
| Privacy | [1440](screenshots/editorial/privacy-1440-top.jpg) | [390](screenshots/editorial/privacy-390-top.jpg) |

[Desktop contact sheet](screenshots/editorial/all-pages-1440.jpg) · [Mobile contact sheet](screenshots/editorial/all-pages-390.jpg)

## Outstanding owner inputs

Real founder photography, the second founder's name and title, public contact details, and an enquiry delivery service remain outstanding. The existing privacy draft still needs the planned legal review. The hosting plan remains an owner/account launch decision. No approvals, customer results, fabricated staff or generated founder photos were introduced.

The owner explicitly requested publication to main after this review. The pull request preserves the changes, screenshots and validation history.

---

# Reference-structure redesign — review record

26 September 2026. Built from [REDESIGN-SPEC.md](REDESIGN-SPEC.md) on `claude/nifty-wozniak-ini85h`. Legora and ReFresh are references for structure and quality only; nothing of theirs is in the repository.

## What changed

Every page now follows one of the references' page anatomies, filled with Lienry's own copy, media and working software:

- **Home** follows Legora's home anatomy in ReFresh's order:
  - the film hero, then a linked "Built for" row;
  - three product cards: roof capsule, ground pod and phone app;
  - the working 3D software, driven by Map, Plan, Clean and Re-scan step tabs;
  - a click-driven six-part stage, then the places track;
  - the film band with its design facts attached below;
  - the founder letter, the dark safety band, a short FAQ and one closing panel.
- **Inner pages** share ReFresh's feature-page skeleton: a split hero with the product in the first screen, a switcher or step cards, feature rows with fact strips, one ink band (cited `stats.ts` figures, or facts labelled as design intent), a FAQ, sibling cards and a closing panel.
- **The commercial film** finally plays in the /commercial hero.
- **/solar** gains a switcher as its demonstration.
- **Placeholders are gone:** no founder photo boxes and no "to come" text.
- **Section padding** drops from 133px to 96px (56px on phones), and content moves onto the header's 24px edge.

## Validation

| Check | Result |
| --- | --- |
| `npm run typecheck`, `npm run lint`, `npm run build` | Clean |
| `git diff --check` | Clean |
| `npm run check:rules` (E2 checks 5–14, 21–24) | Every check passes on all 8 routes at 1440 and 390, with tabs, parts and beats swept and the reduced-motion pass |
| `npm run check:layout` (E2 checks 2–4, 19) | Every check passes; no empty run over 48px inside a band and no horizontal overflow |
| Local rule audit with labelled stand-in media | 0 violations on all 16 route/width views; every image and film captioned; no console errors |
| `npm run contrast` against the brightest hero frame | All three gates pass: links 6.47:1, mark 8.07:1, button boundary 5.85:1 on the frame; 6.02:1 against pure white |
| Software window off screen | 0 draw calls once it leaves the screen; settling changes draw only while it is visible |
| axe-core WCAG 2.0–2.2 A/AA scan, reduced motion | 0 violations on all 8 routes at 1440 and 390 |
| Real-media review | Built with the real media and captured at 1440 and 390: every page's crops, captions and bands read correctly |

## Page heights at 1440 (390)

| Route | Before | After |
| --- | --- | --- |
| `/` | 11,389 (14,120) | 8,643 (11,120) |
| `/platform` | 8,020 | 5,613 (7,241) |
| `/commercial` | 4,460 | 6,375 (7,977), now with the working software and the hero film |
| `/homes-and-rentals` | 5,601 | 5,410 (6,973) |
| `/solar` | 4,583 | 4,497 (5,572) |
| `/company` | 4,729 | 3,994 (4,427) |
| `/register-interest` | 1,925 | 1,636 (2,645) |
| `/privacy` | 2,246 | 1,257 (2,225) |

## Decisions for the owner

All of these are built and reversible:

1. The home headline moves from the display step to the H1 step, with "Nobody on site." in the italic.
2. The founder photo placeholders are removed. The letter carries the street render, and /company lists Liam as text until real photographs and the co-founder's name are supplied.
3. The closing panels are glass-deep (the deep link colour); the alternative is ink.
4. On ink and glass-deep, the primary button is a plaster fill.
5. Content moves to the header's 24px rail on a 1,392px grid.
6. The six parts appear on home (the stage) and on /platform (the switcher, with specification lines).
7. Home runs product cards, then the working software, then the six-part stage. The landlord story lives on /homes-and-rentals, where the app panel's own button drives it.
8. Every commercial pilot link reads "Book a pilot conversation".
9. The /solar rooftop band is removed; its CER figure stays on /homes-and-rentals.
10. No uppercase label sits above a section heading.
11. Places show four 330px cards on a track at every width, the fifth one step along.
12. The footer wordmark moves to the display step, onto the scale.
13. FAQ questions are 16px Inter at weight 500; the serif is for headings only.
14. Safety renders are 4:3 crops at the bottom of ruled cells.
15. The home stage has an ink sidebar.
16. /company keeps "Two founders, one building at a time." with Liam listed alone for now.
17. The home software steps are Map, Plan, Clean and Re-scan.

## Outstanding owner inputs

These are unchanged from the 22 September record:

- real founder photography;
- the second founder's name and title;
- public contact details;
- an enquiry delivery service;
- the privacy draft's legal review.
