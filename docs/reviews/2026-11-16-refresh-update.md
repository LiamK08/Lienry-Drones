# Lienry and refresh.tech: update review, 16 November 2026

## In short

refresh.tech was republished on 16 November 2026. Its page templates are mostly the ones we reviewed on
6 November, and Lienry already matches those. What changed is how the site behaves: a rebuilt quiz, a
product walkthrough that plays by itself, product screens that assemble as you reach them, and a small
set of hover effects used everywhere. The owner asked for Lienry to be brought up to date, above all
with the hover and other effects.

Eight researchers each studied one part of refresh (home, top and bottom; the header and site-wide
interaction; product pages; solution pages; company pages; articles; tools) against Lienry's live site,
measuring real timings. Their captures stay outside this repository. This document records what we
decided to build and what we left out. As before, refresh is a reference for structure and quality only:
none of its code, text, imagery or assets enters Lienry.

## What refresh changed

- **The quiz asks one question at a time.** Three large answers per screen, it moves on by itself, and
  a live result builds beside it on fanned sheets. On a phone it fits one screen. Ours listed all seven
  questions at once.
- **Buttons flood.** On hover the round arrow badge grows to fill the whole pill while the label rolls
  into the opposite colour. It is the site's most distinctive effect. Ours only darkened.
- **The product walks itself through.** The platform page has a dark panel that opens each module in
  turn on a timer, with a product card building line by line beside it.
- **Product screens assemble on arrival.** Cards over photographs build their rows as they scroll into
  view, on the product, solution and home pages. Sections and headings do not fade in.
- **A grid of product panels on the home page**, and a slow moving row of figure and quote cards.
- **Cards answer the pointer.** Linked cards lift, their pictures zoom a little, tilted cards straighten.
- **The header stays clear over the whole home film** and its menu panel resizes smoothly between menus.
- **Solution pages open on a split hero** with a photograph that carries a cycling product card, and
  end on a row of cards leading to the rest of the product.
- **The About page moves**: the founder's statement lights up word by word as you scroll, and fanned
  photo cards straighten under the pointer.
- **A quiet dot texture** drifts behind dark and accent panels.
- **Articles** have one clean template: a contents column that follows the page, a readable text
  column, related articles and a closing ask.
- **The booking page** offers the calendar in the form's place, with "what you get from the call" below.

## What we are building

### Everywhere
- **The pill's badge flood**, once, in the button component: accent pills flood white, white pills
  flood accent, about 450ms, with the arrow swapping. Keyboard focus gets the same. Reduced motion
  switches colour only.
- **Linked cards lift and their pictures zoom** (3px, 1.04); card grids fade up once as they arrive.
- **A dot texture** behind the night safety panel, the accent closing panel and the product hero, in
  CSS only.
- **Header**: every bar link gets a hover ground; the menu panel resizes between menus; the Platform
  menu's map washes once each time it opens; the phone menu's groups open by height; and on the home
  page the bar stays clear while the film is under it, if the contrast proof holds at every scroll depth.
- **Small motion**: the strip slows to refresh's calmer pace; the footer's round stills arrive once.

### Fit check (home and /fit-check)
- **One question at a time**, with a status row, three full-width answers, automatic advance, Back, and
  a card that never changes height. All scoring, caps, zone names and the indicative note stay.
- **A live result sheet** beside the questions: the score "so far", the zone bar and the seven answers
  filling in, over two blank fanned sheets. The score counts to its new value.
- **The result in place**: every answer editable, the points to talk through, and the send form inline.
- **Three explainer cards** on /fit-check, and the same pressed states and counting totals on the
  calculator.

### Platform
- **The six parts as a walkthrough** that advances by itself only while in view, pauses under the
  pointer or focus, and stops for good once the visitor takes over.
- **Demo data cards play once** as their row arrives.
- **A row of cards leading on** to the solution pages and the software, and the two systems as a
  night band.

### Home, lower half
- **A grid of five product panels**, each with a coded Demo data screen that assembles itself.
- **A slow moving row of cards**: cited figures and stated design facts, each marked for what it is.
- **The three setting cards tilt** and straighten under the pointer.

### Solution pages
- **A split hero** from 1024 with the page's own still and a cycling Demo data card.
- **Cards leading on** before the FAQ, and inline links in the row copy.

### Company and enquiries
- **The vision statement lights up word by word**; the fanned pictures part around the one under the
  pointer; the round's three facts become tilted cards; a mission panel sits under the hero.
- **The enquiry card switches between writing and booking a call**, with two panels and a short FAQ
  below it, and a small finish on the sent state.

### Notes (new)
The owner offered articles "only if you think it is good". We think a small section is: four evergreen
explainers that can be written truthfully today, on one article template, at /notes.

1. What dust costs a solar farm.
2. Rooftop solar and rented homes in Australia.
3. What exterior cleaning adds up to over ten years, and what the sum leaves out.
4. How a Lienry clean is meant to run.

Every figure comes from `src/content/stats.ts` with its source linked. Everything about Lienry is
written as design intent. Two further subjects (working at height and the law; flying a drone beside a
building) wait until their facts are checked against the primary documents and added to the stats file.

## What we are leaving out, and why

- **The announcement strip.** There is no dated message to carry. It can return when there is one.
- **Customer logos, quotes, case studies, the academy, partner pages.** Lienry has none of these, and
  says so.
- **A chat launcher and smooth scrolling.** One is a staffed channel we do not have; the other takes
  the browser's own scrolling away for no gain.
- **Product screens cut into the hero film.** New media needs the owner's instruction.
- **Serif menu headings and a larger row-heading step.** Both change the type rules; they wait for the
  owner's call.
- **Rebuilding /download as a chaptered page, and the orbit diagram.** Good ideas for a later round.

## Where Lienry stays ahead

Keyboard access to every menu, card and tool. Reduced motion honoured everywhere. A live 3D software
window where refresh shows screenshots. A fit check with real scoring. No labels above headings. And
nothing claimed that is not true.
