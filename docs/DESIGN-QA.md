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
