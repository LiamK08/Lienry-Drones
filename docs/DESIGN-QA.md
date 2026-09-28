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

# Concept render captions removed — review record

26 September 2026. The owner asked for the Concept render captions to come off the site. Checked on local production builds of `main` and of this change at 1440 and 390, with labelled stand-in media in the real media's ids and aspect ratios (the media CDN is not reachable from the build container).

## What changed

- **No caption on any image or film.** It is gone from under every still (`Picture`), from under the split heroes' films and the home stage, and from the rails of the home hero and the film band. `Picture`'s `tone` prop, which only coloured the caption, and the `.concept-caption` rules go with it.
- **Nothing makes room for it any more.** The stage, `FeatureRow` and `Switcher` no longer hold back the caption's 27.5px, so fact lists and links end on the image's bottom edge.
- **The film rails keep their controls.** The home hero's rail holds the link down to the system and the pause control at the right margin; the film band's holds its pause control.
- **The app card keeps its note.** "Illustrative app interface. Demo data." still captions the coded app fragment. From 1024 the fragment's frame and note share the 4:3 box of the images beside it, so the three product titles stay level. The fragment shows its two ticked rows at every width, which keeps it whole in that shorter frame at 1440 and costs it only its foot at 1280.
- **`check:rules` check 12 is inverted.** It now fails if "Concept render" appears anywhere on the site.

## Validation

| Check | Result |
| --- | --- |
| `npm run typecheck`, `npm run lint`, `npm run build` | Clean |
| `git diff --check` | Clean |
| `npm run check:layout` (E2 checks 2–4, 19) | Every check passes on all 8 routes at 1440 and 390 |
| `npm run check:rules` (E2 checks 5–14, 21–24) | Every check passes on all 8 routes at 1440 and 390, check 12 included, but one: check 21's test that the live software window stops drawing within a second of leaving the screen. It fails on an untouched `main` build in this container too (7 of 8 runs of `/` and `/commercial` at 1440, against 8 of 8 here), because software WebGL lands the last frames after the one-second wait. This change does not touch the window. |
| `npm run contrast` | All three gates pass; against pure white, links 6.02:1, mark 6.02:1, button boundary 3.52:1 |

## Page heights at 1440 (390)

| Route | Before | After |
| --- | --- | --- |
| `/` | 8,643 (11,120) | 8,533 (10,927) |
| `/platform` | 5,613 (7,241) | 5,503 (7,131) |
| `/commercial` | 6,375 (7,977) | 6,265 (7,812) |
| `/homes-and-rentals` | 5,410 (6,973) | 5,328 (6,808) |
| `/solar` | 4,497 (5,572) | 4,415 (5,435) |
| `/company` | 3,994 (4,427) | 3,912 (4,317) |
| `/register-interest` | 1,636 (2,645) | unchanged |
| `/privacy` | 1,257 (2,225) | unchanged |

## Release

The change reached `main` as `212d522` on 26 September 2026. Vercel built its preview but never started a production deployment for that push, so the live site kept the captions. The next commit on `main` was pushed to start a fresh production build.

# Download page — review record

28 September 2026. Built on the `download` branch from `main` at `80ed265`, and checked on a local production build at 1440 and 390 with the real media (downloaded by the prebuild step, not committed).

## What changed

- **A ninth route, `/download`,** for Lienry Desktop: the desktop software an owner uses to see the 3D scan of the building, set cleaning zones and the pressure for each surface, and watch a wash as it happens. It is made from parts the site already has:
  - the /company statement's split head, with the H1 on the left and the lead and download buttons as its aside;
  - the coded software window at full grid width, as on the /platform close, so the product is in the first screen and no image of the interface is needed;
  - the /commercial software strip, listing the three things it does;
  - a `SpecBand` for the system requirements, including what signing in needs;
  - the `Faq`, with three questions.

  Tones run raised, plaster, ink, raised, then the sunken footer.
- **The button follows the visitor's platform.** It reads "Download for Mac" or "Download for Windows", with the other platform's link underneath. Both sets are in the HTML, and an inline script marks the right one while the page is parsed, so a Windows machine never shows the Mac button first. A client check does the same after an in-site navigation.
- **Coming soon.** Until the release is live, each control reads "Download for … · Coming soon" with a muted label. It uses `aria-disabled` rather than `disabled`, so it stays in the tab order and screen readers announce it as dimmed. Register interest sits beside it.
  - `Button` gains this unavailable look on light surfaces: muted text at 6.69:1 on raised, with a border-strong edge at 3.87:1.
  - Download links render as native anchors, so next/link never prefetches an installer.
- **One switch.** `src/lib/download.ts` holds the availability, the version and both installer URLs. With the URLs in place, setting `available: true` does three things:
  - both buttons become download links;
  - the version shows under them;
  - the meta description changes from "coming soon" to "Download".

  A platform without a URL stays on Coming soon.
- **Header and footer.**
  - The Download link sits hard right beside Register interest, in the nav links' own 13px style, with the hairline underline when it is the current page.
  - It is the last item in the phone menu.
  - The footer's Platform column ends with it.
- **Metadata.** The page has its own title, description, canonical URL and Open Graph and Twitter tags, reusing `og.png`, and it is in the sitemap. The shared Open Graph fields moved to `openGraphBase` in `src/lib/site.ts`, so the layout's output is unchanged.
- **Checks.**
  - `check:rules`, `check:layout` and the screenshot scripts now cover nine routes.
  - Check 22 reads the new page's title from content.
  - Check 21 used to scroll a window near the top of a short page to the page's top, which tested it on screen. It now scrolls to the page's end, which clears the window.
  - `contrast-hero.mjs` gates the new header link.

## Validation

| Check | Result |
| --- | --- |
| `npm run typecheck`, `npm run lint`, `npm run build` | Clean; `/download` prerenders as static |
| `git diff --check` | Clean |
| `npm run check:layout` (E2 checks 2–4, 19) | Every check passes on all 9 routes at 1440 and 390 |
| `npm run check:rules` (E2 checks 5–14, 21–24) | Every check passes on all 9 routes at 1440 and 390. On /download the live window draws 344 calls in 0.8s on screen and 0 off screen. |
| `npm run contrast` | All three gates pass. The Download link measures 9.42:1 on the brightest hero frame and 6.02:1 against pure white. |
| axe-core WCAG 2.0–2.2 A/AA on /download | 0 violations at 1440 and 390, with and without reduced motion, with every question open and with the phone menu open |
| axe-core on the header of every route at 1440 | 0 violations |
| Keyboard | Order: skip link, header, Download for Mac (announced dimmed), Download for Windows (dimmed), Register interest. Enter, Space and clicks on an unavailable button do nothing. The 2px glass focus ring shows on each stop. |
| Platform | A Windows browser sees the Windows set before any script bundle loads, after hydration and after navigating in from /platform. A Mac browser sees the Mac set. |
| Header geometry | At 1024 the centred mark keeps its 55px clearance from the left links, as before, and the Download link sits 245px to its right. No overflow on any route at 1024, 1099, 1100, 1280 or 1440. |
| Existing pages | The untouched `main` commit was built on the same machine for comparison. Every band of /, /platform and /company sits at the same y and height; only the shared footer grows, by 33px at 1440 for its new link and not at 390, where it folds. |
| Live switch | A scratch build with `available: true`, a version and placeholder URLs: both buttons become native download links, the version shows and the description changes (screenshot below). The committed file still says `available: false`. |

## Page heights at 1440 (390)

| Route | Before | After |
| --- | --- | --- |
| `/download` | new | 3,019 (3,540) |
| `/` | 8,554 (10,927) | 8,587 (10,927) |
| `/platform` | 5,503 (7,131) | 5,536 (7,131) |
| `/company` | 3,912 (4,317) | 3,945 (4,317) |

"Before" at 1440 is the untouched `main` commit measured on the same machine. At 390 it is the 26 September record, which this change matches exactly. The other routes gain the same 33px at 1440, because the footer is shared. The 8,533 recorded for `/` on 26 September came from a different container with stand-in media.

## Screenshots

| View | Desktop | Mobile |
| --- | --- | --- |
| /download, full page | [1440](screenshots/download/download-1440.jpg) | [390](screenshots/download/download-390.jpg) |
| /download, first screen | [1440](screenshots/download/download-1440-top.jpg) | [390](screenshots/download/download-390-top.jpg) |
| A Windows visitor | [1440](screenshots/download/download-1440-windows-top.jpg) | |
| The phone menu | | [390](screenshots/download/download-390-menu.jpg) |
| The switch set live (scratch build, placeholder URLs and version) | [1440](screenshots/download/download-1440-live-preview.jpg) | |
| The header on all nine routes, including over the home film, past 80px and with focus on Download | [1440](screenshots/download/header-1440-all-routes.jpg) · [1024](screenshots/download/header-1024-all-routes.jpg) | |

## Decisions for the owner

All of these are built and reversible:

1. **The tab title.** Since 22 September every route has been titled "Lienry Drones" alone. This brief asked for a page title, so /download reads "Download Lienry Desktop | Lienry Drones". To go back to the old rule, set `downloadPage.meta.title` to "Lienry Drones" and drop the page from `titles` in `scripts/check-rules.mjs`.
2. **Where Download sits in the header.** It sits hard right, as a utility link beside Register interest. As a sixth link on the left it would run into the centred mark at every width below about 1,190px.
3. **The name "Lienry Desktop"** comes from the coded window's title bar.
4. **Before release, Register interest is the page's live action.** Once the downloads are live it gives way to the version line.

## Outstanding owner inputs

- The two installer URLs and the version number.
- Confirmation of the name "Lienry Desktop", the system requirements and the "active software plan" wording.
