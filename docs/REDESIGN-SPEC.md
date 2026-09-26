# Lienry Drones redesign: build spec

**Status.** Final build spec. Baseline: `main` at pull request 9 (merge 50ffe59, the owner's 22 September refinement). The feature branch starts identical to it: its only earlier change, ca89b8f, removed the Concept render captions against the current rules and was reverted by bd54837. The rules in `CLAUDE.md` and the owner's standing briefs bind everything here. Where a line in this spec and a rule disagree, the rule wins and the engineer flags the conflict in the pull request. A critical review raised 28 issues against the first version (6 blocking); all are resolved in this text.

**Since the build.** On 26 September 2026 the owner removed the Concept render captions. Every caption line below (B7, the Picture, MediaCard and film anatomies, the stage and row paddings that made room for the caption, and E2 check 12) is superseded: no image or film carries one, and check 12 now fails if one returns.

**References.** legora.com and refresh.tech are references for quality, structure and motion only. This document describes their patterns by structure. No code, text, imagery, icons, logos or assets from either site enter the repository, and the site never loads anything from them.

**Which reference each page follows**
- **Home** takes Legora's home anatomy: a film hero, a quiet row under it, product cards, a stage for the parts, a gallery of contexts, a film band with its numbers attached, a founder band beside a dark specification band, a closing card and a compact footer. It runs in the order ReFresh's home uses: what you buy comes first, then the working product in a tabbed band. It adds ReFresh's short home FAQ before the close.
- **/platform** takes ReFresh's platform page: split hero, pillar switcher, feature rows, one saturated band, FAQ, and the ask with the product under it.
- **/commercial, /homes-and-rentals and /solar** take ReFresh's feature page: split hero, a demonstration, rows or cards, one saturated band, FAQ, sibling cards and the close. /homes-and-rentals and /solar use Legora Agent's step cards where ReFresh has a switcher, because their renders are portraits.
- **/company** takes ReFresh's about page: a statement over one wide image, two-column narrative blocks, the founders, then the ask. It is left aligned.

---

## A. Design principles

1. **Full plates, never padded voids.** Legora packs its coloured bands to about 30px of their edges and runs films edge to edge. ReFresh separates bands by a change of fill rather than by empty gaps. The weak spots in both are what the owner objects to: Legora's 200–270px paper gaps and ReFresh's empty side margins around centred columns. On Lienry:
   - every band changes tone from its neighbour;
   - no empty run inside a block exceeds 48px;
   - no band is taller than 900px at 1440, except the heroes, the software bands and the two one-band pages (/register-interest and /privacy).
2. **One rail from header to footer.** Legora hangs its header links, content and footer from one 24px gutter with a 1,392px measure. Lienry moves its content from x=48 to x=24 at 1440, the edge its header links already use. The header itself does not change.
3. **What you buy, then how it works, then the parts.** ReFresh's home puts three product cards straight after its system intro and follows them with a tabbed product band. Legora's Agent page shows product media inside the first viewport. Lienry's home order is: the Built-for row, then the two docks and the app, then the working software, then the six parts. Every inner page shows product media in its first screen.
4. **One device per band, driven by click and keyboard.** Legora's layer column works as index, accordion and progress bar at once. ReFresh's tabs swap one panel in place and nothing is pinned. Lienry uses a disclosure stage, tabs and snap tracks. Nothing pins and nothing is linked to scroll position.
5. **Every heading has a partner.** ReFresh fills the empty right half of a section head by centring it, which Lienry's alignment rule forbids. Every Lienry section head therefore pairs the heading (columns 1–7) with an aside (columns 8–12): an intro, a link or controls. A heading never sits beside an empty half.
6. **Hierarchy from size and ink, not weight.** Legora sets everything at one weight. ReFresh runs two levels, a large serif over small sans. Lienry uses Instrument Serif only on the H1, H2 and H3 steps and Inter for everything else. There is no step between H3 and body.
7. **The italic payoff is rationed.** ReFresh pairs a roman line with an italic payoff line. On its inner pages it keeps this to the H1 and at most two section heads, and it drops the device on the closing heading. Lienry keeps the same budget, sets the italic in the heading's own colour (never teal, which means link), and lists each page's italic in section C.
8. **Honest furniture in the same slots.** Both references spend slots on customer logos, testimonials, certification seals, traction numbers and pricing. Lienry fills each structural slot with something true:
   - the Built-for row, in place of the logo row;
   - safety-by-design cells beside the plain status line, in place of certification seals;
   - the founder's signed letter, in place of the testimonial;
   - cited `stats.ts` figures;
   - design facts labelled as design intent, in place of traction numbers.
9. **Media fills fixed frames.** Legora works with a few ratios, and ReFresh's crops always fill their frames. Lienry uses:
   - 16:9 for heroes and films;
   - fill frames that stretch to their text for rows and stages, with a floor and a ceiling;
   - 4:5 or 1:1 for cards.

   Every frame has 4px corners and object-fit cover, and every render carries Concept render.
10. **Same modules, same order, same names.** ReFresh repeats one module order on its feature pages and one vocabulary across nav, tabs and cards. Legora closes every page with the same card and footer. Lienry's inner pages share one skeleton: split hero, demonstration, rows or cards, one ink band, FAQ, siblings, closing panel. Each enquiry route has exactly one link label everywhere.

---

## B. Global system

### B1. Tokens (`src/app/globals.css`)

No colour, radius, family or type step is added.

```css
@theme {
  --container-grid: 87rem;   /* was 84rem: 1,392px, so content starts at x=24 at 1440 */
  /* --container-rows and --container-statement are deleted in the closing step (F9) */
}
@layer base {
  :root {
    --page-margin: 1rem;                              /* 16px below 768px (was clamp 20–40px) */
    --band-y:   clamp(3.5rem, 2rem + 4.5vw, 6rem);    /* 56px at 390, 96px at 1440 */
    --plate-y:  clamp(2rem, 1rem + 2vw, 2.5rem);      /* 32px at 390, 40px at 1440 */
    --gap-head: clamp(2rem, 1.25rem + 2.5vw, 3rem);   /* 32px at 390, 48px at 1440 */
    --section-y: var(--band-y);                       /* old name, kept until F9 so unconverted pages follow the new rhythm */
  }
  @media (min-width: 48rem) { :root { --page-margin: 1.5rem; } }  /* 24px: the header's own edge */
  button { text-align: inherit; }   /* the UA centres button text; labels centre by flex (B4), so no text is centred outside the home hero */
}
@layer components {
  .on-accent { color: var(--color-white); }
  .on-accent :focus-visible { outline-color: var(--color-glass-on-dark); }   /* 4.31:1 on glass-deep, above the 3:1 needed */
  /* A hairline where two light tones meet: plaster, raised and sunken differ by only 1.09–1.21:1. */
  :where([data-tone="plaster"], [data-tone="raised"], [data-tone="sunken"])
    + :where([data-tone="plaster"], [data-tone="raised"], [data-tone="sunken"]) {
    border-top: 1px solid var(--color-hairline);
  }
}
```

- **Delete now:** `.hairline-y`, `.signature`, `@keyframes mark-rise` and `.mark-rise`. None of them has a remaining user once P6 lands.
- **Keep exactly:** `.nav-bar { transition: none; }`, because `scripts/contrast-hero.mjs` reads it for Gate 3. Also keep `.label`, `.readout`, `.numeral`, `.caption`, `.water-link`, `.timeline`, `.no-scrollbar`, `.on-dark .caption` and `.on-dark .concept-caption`.
- **Add, unlayered:** directly after the existing unlayered `.on-dark .concept-caption` rule at the end of the file, add `.on-accent .concept-caption { color: var(--color-plaster); }`. Both must stay outside every `@layer`, because unlayered rules beat the utilities: without the new rule the caption inside the glass-deep `CtaPanel` computes to muted-on-dark at 2.81:1, a WCAG 1.4.3 failure; with it, plaster at 6.24:1.
- **`src/lib/fonts.ts`:** set `preload: true` on `instrumentSerifItalic`. The italic now appears in first-screen headings (the home hero and every inner H1).

### B2. Grid, widths and rails

**Columns**
- From 1024px: 12 columns with 24px gutters, a 1,392px maximum, centred, and 24px page margins. At 1440 one column is 94px. The spans are 3 = 330, 4 = 448, 5 = 566, 6 = 684, 7 = 802, 8 = 920 and 12 = 1,392.
- Below 1024px: one column with 16px gaps. The page margin is 16px below 768px and 24px from 768px to 1023px. A section stacks unless it says otherwise.

**Rails**
- The header is not changed. Its links sit 24px in from 768px up and 15px in on phones. At 1440 the content now starts on the same x=24 edge.
- Above 1440 the grid centres and the header stays hard left, as briefed.

**Container widths:** `grid` (87rem), `prose` (45ch, the existing cap) and `form` (40rem). The `rows` and `statement` widths go in F9.

**Measures:** paragraphs keep the 45ch cap. Headings run to at most two lines at 1440, which is about 50 characters a line for an H2 in 7 columns.

### B3. Section rhythm and tones

**Spacing**

| Measure | 1440 | 390 |
|---|---|---|
| Band padding (`Band pad="band"`) | 96 top and bottom | 56 top and bottom |
| Plate padding (`pad="plate"`, the home founder and safety pair only) | 40 | 32 |
| Split hero (`pad="hero"`) | top nav + 32, bottom 48 | top nav + 24, bottom 32 |
| Statement, register and privacy (`pad="page"`) | top nav + 48, bottom 96 | top nav + 32, bottom 56 |
| Attached (`pad="attached"`, the findings row under the film) | top 32, bottom 96 | top 32, bottom 56 |
| Heading row to content (`--gap-head`) | 48 | 32 |
| Image to caption | 8 | 8 |
| Caption to meta, label or title | 16 | 16 |
| Label to title | 8 | 8 |
| Title to body | 12 (8 in cards) | 8 |
| Body to link | 16 | 16 |
| Body to facts | 24 | 24 |
| Card and column gutter | 24 | 16 |
| Largest empty run inside a band | 48 | 48 |

**Surfaces.** Only these tokens are used as surfaces:
- `plaster` #f3efe7, the page;
- `raised` #fbf9f4;
- `sunken` #e9e3d8;
- `ink` #1c1a17, with `on-dark`;
- `glass-deep` #0d6072, only as the surface of `CtaPanel`, with `on-dark on-accent`;
- film, for full-bleed media only.

**Tone rules**
1. Adjacent bands never share a tone. Where two light tones meet, the lower band shows the automatic 1px hairline from B1.
2. Each page has at most one ink band and at most one glass-deep panel. The home stage's ink sidebar sits inside a raised band and does not count.
3. Inner-page heroes are raised.
4. The footer is sunken, so the band before it is never sunken.
5. There are no tints, washes, glows, blurs, shadows or gradient text. Scrims exist only over film and film posters, and those are the existing ones.

**Band height.** At 1440 no band is taller than 900px, except:
- the home hero (900);
- the software bands: `SoftwareBand` on home and /commercial, and `CtaWithProduct` on /platform, which holds the window;
- the media heroes: `PageHeroSplit` and the /company statement band;
- the `pad="page"` bands of /register-interest (the untouched form alone is about 1,000px) and /privacy.

**Column markers.** Every two-column layout marks each column with `data-col`: `SectionHead` (heading and aside), `FeatureRow`, the `Switcher` panel columns, `FactRow`, `FounderBand`, `LandlordStory`, `CtaPanel`, /register-interest and /privacy. `check:layout` uses the markers for its 48px column-balance test, so a component without them silently escapes the check.

### B4. Type in use

The scale is unchanged. Values are resolved at 1440 / 390.

| Role | Step | 1440 / 390 | Family | Element |
|---|---|---|---|---|
| Home hero headline and every page H1 | `text-h1` | 69.6 / 44 | Instrument Serif | h1 |
| Section heading, `FeatureRow` title, film band heading, closing panel heading | `text-h2` | 50.4 / 36 | Instrument Serif | h2 |
| Card, step, part, beat, cell and person names; footer tagline | `text-h3` | 30 / 24 | Instrument Serif | h3 (the footer tagline is an h2 at this step) |
| Footer wordmark (a logotype) | `text-display` | 83.2 / 52 | Instrument Serif | `p aria-hidden` |
| Leads, closing body, findings lead, statement, app property name | `text-lead` | 19 / 17 | Inter | p |
| Body, tabs, FAQ questions (weight 500), Built-for links | `text-body` | 16 | Inter | — |
| Card bodies, facts, buttons, links, stage body | `text-small` | 14 | Inter | — |
| Captions, notes, sources, readouts | `text-caption` | 13 | Inter | — |
| Labels | `.label` | 12, uppercase, 0.12em, weight 500 | Inter | — |
| Figures | `.numeral` | 96 / 56, weight 300 | Inter | — |

**Size rules**
- The display step is used only for the footer wordmark.
- `text-[0.8125rem]` in `Nav.tsx` and `Button.tsx` becomes `text-caption`, the same 13px.
- The footer's `text-[clamp(4rem,12vw,11rem)]` becomes `text-display`.
- A source index uses `sup.text-label` (12px), never the browser's smaller sup.
- Every `h3` that wraps a disclosure button carries `text-h3` on the h3 itself, so its computed size is on the scale.

**Family exceptions.** Instrument Serif appears only on h1–h3 and their `em`, with two exceptions:
- the footer wordmark, which is a logotype;
- the phone menu's link list, which is part of the briefed header and stays as built.

Everything else is Inter. That includes FAQ questions, the app panel's "Rental, Sydney", the company statement and the founder's name in the letter's sign-off.

**Italic payoff**
- The `emphasis` string must be the trailing phrase of the headline. `Headline` splits it off and renders `{prefix} <em>{emphasis}</em>`, so content strings stay whole.
- `breakBefore` inserts `<br className="hidden md:inline">` before the `em`.
- The italic takes the heading's colour: ink on light, plaster on ink, white on film.
- The budget per page is the H1 plus at most two section H2s. It is never used in an h3, a `FeatureRow` title, an FAQ heading or question, a closing heading, or any body text.
- The italic used on each page:

| Page | H1 | Section heads |
|---|---|---|
| Home | "Nobody on site." | stage "Built to clean."; places "your property." |
| /platform | "Six parts." | switcher "fit together." |
| /commercial | "on the roof." | switcher "then it runs itself." |
| /homes-and-rentals | "from anywhere." | story "Wherever you are." |
| /solar | "for solar." | step cards "on your schedule." |
| /company | "for the buildings people own." | none |
| /register-interest and /privacy | none | none |

**Labels (the only uppercase)**
- A label is short and names a thing or a state. It never sits directly above an h1 or h2; the owner removed above-heading marks in PR 5 and PR 8.
- Allowed places:
  - "Built for";
  - system names and step numbers on cards;
  - part and step labels inside switcher panels;
  - spec keys;
  - the "By design" facts row;
  - software window chrome ("Preview", "Demo data", "Zones", "This clean", stat names, "Wash");
  - the app panel's "Demo data";
  - the /company aside label "In development";
  - footer column heads;
  - the static software step list;
  - the phone menu status line, as built.
- A sentence-case subtitle uses `text-caption muted`, not `.label`.

**Weights.** Inter at 400, and 500 for labels, buttons, fact terms and FAQ questions. Numerals at 300. Instrument Serif at 400.

**Alignment.** Everything is left aligned. The home hero is the only centred text. No section heading is centred anywhere. Button labels centre inside the button by flex, which is not text alignment.

### B5. Primitives (foundation; these props are the contract other packages build against)

```ts
// src/lib/types.ts (new)
export type Tone = "plaster" | "raised" | "sunken" | "ink";
export type Action = { label: string; href: string };
export type ImageRef = { id: string; alt: string; position?: string };   // id: a manifest still id
export type FilmId = "h1-hero-film" | "c2-commercial-clip";
export type PosterId = "h0-hero-still" | "c1-commercial-hero";
```

**`Band` and `Container`** (`src/components/ui/Band.tsx`; they replace `Section` and `Container` in `ui/Section.tsx`, which is deleted in F9)

```ts
export type BandPad = "band" | "plate" | "hero" | "page" | "attached" | "none";
export type BandProps = {
  id?: string;
  tone: Tone;
  pad?: BandPad;                        // default "band"; values in B3
  as?: "section" | "header" | "div";    // default "section"
  labelledBy?: string;                  // aria-labelledby
  ariaLabel?: string;                   // aria-label, now forwarded (today's Section drops it: Blocks.tsx:50, solar/page.tsx:29)
  className?: string;
  children: React.ReactNode;
};
export type ContainerProps = { width?: "grid" | "prose" | "form"; className?: string; children: React.ReactNode };
```

`Band` renders the full-bleed background and `page-x`. `ink` adds `on-dark bg-ink text-plaster`. It emits `data-band={id ?? "band"}` and `data-tone={tone}`, which the hairline rule and the acceptance scripts use. The film bands (`Hero`, `FilmBand`) emit `data-tone="film"` themselves.

**`SectionHead` and `Headline`** (`src/components/ui/SectionHead.tsx`)

```ts
export type SectionAside =
  | { intro: string; label?: string; link?: Action; action?: React.ReactNode }
  | { intro?: string; label?: string; link: Action; action?: React.ReactNode }
  | { intro?: string; label?: string; link?: Action; action: React.ReactNode };   // at least one is required
export type SectionHeadProps = {
  id: string;                    // heading id; the band's labelledBy
  as?: "h1" | "h2";              // default "h2"
  size?: "h1" | "h2";            // default follows `as`
  headline: string;              // the whole heading, as stored in content
  emphasis?: string;             // trailing phrase of `headline`, set in the italic; throws in development if it is not a suffix
  breakBefore?: boolean;
  below?: React.ReactNode;       // under the heading in the left column (the software band's body)
  aside: SectionAside;           // required: no heading sits beside an empty half
  tone?: "light" | "dark";
  layout?: "split" | "stack";    // default "split" (from 1024)
  reveal?: boolean;              // default true; false in first-screen use
  className?: string;
};
export function Headline(p: { text: string; emphasis?: string; breakBefore?: boolean }): React.JSX.Element;
```

- **Split (1024 and up):** the heading takes columns 1–7 and the aside columns 8–12. The row is `items-end`, so both columns bottom-align and a short heading never ends far above a tall aside (or the reverse). Both columns carry `data-col`. The aside holds, in order: the `.label`, 8, the intro (`text-body muted`, or `muted-on-dark`), 16, then the link (tertiary) or the action.
- **Stack (below 1024, or `layout="stack"`):** heading, 16, below, 16, aside.

**`Button`** (`src/components/ui/Button.tsx`, changed; existing calls keep working)

```ts
type Variant = "primary" | "secondary" | "tertiary" | "inverse";
type Size = "sm" | "md" | "lg";
type CommonProps = {
  variant?: Variant;       // default "primary"
  size?: Size;             // default "md"; tertiary ignores it
  onDark?: boolean;        // over film or on ink: unchanged meaning
  onAccent?: boolean;      // on the glass-deep CtaPanel
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
};
// plus the existing link form (href) and native button form, unchanged
```

| Variant | Light | `onDark` (film, ink) | `onAccent` (glass-deep) |
|---|---|---|---|
| primary | Ink fill, white label, hover `ink-raised` | Ink fill plus white/75 hairline (contrast-proven 3.51:1; unchanged) | not used |
| inverse (new) | not used | Plaster fill, ink label (15.1:1), hover `raised`. Used on ink bands | Plaster fill, ink label; plaster against glass-deep 6.24:1 |
| secondary | 1px ink border | 1px white/60 border | not used |
| tertiary | Glass text, 1px underline at a 6px offset, 2px on hover | `glass-on-dark` | White text and underline (7.16:1; glass-on-dark would be only 4.31:1) |

- Sizes: `sm` 30px (header only; its label becomes `text-caption leading-none`), `md` 44px, `lg` 48px.
- Labels are `text-small` weight 500 with an optional arrow glyph after them. Corners are 4px; there are never pills or arrow discs.
- Tertiary now always carries `min-h-11 inline-flex items-center`, so every standalone text link is a 44px target. Inline links inside paragraphs stay `.water-link`.
- Each band has one primary.

**`Picture`** (`src/components/ui/Picture.tsx`, changed; existing calls keep working)

```ts
type PictureProps = {
  id: string;                       // manifest still id (checked by scripts/check-rules.mjs)
  alt: string;
  sizes?: string;                   // default "100vw"
  aspect?: "16/9" | "21/9" | "2/1" | "3/2" | "4/3" | "1/1" | "4/5" | "3/4";   // default "3/2"
  fit?: "aspect" | "fill";          // fill: take the grid cell's height
  fillFrom?: "lg";                  // fill only from 1024; below it the frame uses `aspect`
  minHeight?: string;               // fill only: floor, e.g. "24rem"
  maxHeight?: string;               // fill only: ceiling
  position?: string;                // object-position, default "50% 50%"
  tone?: "light" | "dark" | "accent";   // caption colour: muted / muted-on-dark / plaster
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  /** @deprecated ignored; removed in F9 */ placeholderText?: string;
};
```

- **Anatomy:** `figure` (a flex column at `h-full` when `fit="fill"`), then the frame (4px, `overflow-hidden`, sunken while loading), with the `img` using object-cover at `position`. Then, 8px below, `figcaption.concept-caption` reading exactly "Concept render". No prop removes the caption.
- **With `fit="fill"`:** the frame is `flex-1` with a `min-height` of `minHeight` and a `max-height` of `maxHeight`, and the image is absolutely positioned to fill it.
- **With `fillFrom="lg"`:** the fill applies from 1024 only; below 1024 the frame uses `aspect`, so a stacked phone layout never collapses to the floor height. `FeatureRow`, `Switcher`, `CtaPanel` and the /register-interest image use it.
- **Missing asset:** an empty sunken frame with `aria-hidden` and `data-media-placeholder`, no text and no caption. The build fetches every asset (`prebuild`), and the caption check fails if one is missing.

**Film media** (`src/components/ui/FilmMedia.tsx`, new; extracted from `Hero` and `FilmBand`)

```ts
export function useFilm(o: { videoId: FilmId; threshold: number }): {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  showVideo: boolean;     // asset present, motion allowed, Save-Data off
  paused: boolean; toggle: () => void;
  ready: boolean; onCanPlay: () => void;
};
export function FilmLayer(p: {
  film: ReturnType<typeof useFilm>; videoId: FilmId; posterId: PosterId;
  position?: string; priority?: boolean; fadeIn?: boolean;   // fadeIn: the hero's 1,200ms opacity fade
  overlays?: React.ReactNode;                                // scrims, drawn above the media
}): React.JSX.Element;       // absolute inset-0, aria-hidden, bg-ink: poster <picture> always, <video muted loop playsInline preload="metadata"> when showVideo
export function FilmPause(p: { film: ReturnType<typeof useFilm>; name: string; className?: string }): React.JSX.Element | null;
```

- `FilmPause` is a 44×44 button: ink fill, white/75 hairline, 4px corners, with a pause or play glyph. Its `aria-label` is "Pause {name}" or "Play {name}". It renders only when `showVideo` is true.
- Playback goes through the existing `bindPlayback`, so only one video decodes across the site.

**`SnapTrack`** (`src/components/ui/SnapTrack.tsx`, new; PR 9's `PlacesCarousel` behaviour, generalised)

```ts
export type SnapTrackProps = {
  label: string;        // e.g. "Property types. Use left and right arrow keys to browse."
  prevLabel: string;    // e.g. "Previous property"
  nextLabel: string;
  columns: 3 | 4 | 5;   // grid columns from `from` up
  from?: "lg" | "xl" | "none";   // where the track becomes a static grid; default "lg"; "none" keeps a track at every width
  visible?: 3 | 4;      // with from="none": items visible at once from 1024 (default 4)
  tone?: "light" | "dark";
  children: React.ReactNode;   // <li> items
};
```

- **Below `from`:**
  - a `ul` with `tabIndex=0` and `aria-label={label}`, set only while it scrolls (`useMediaQuery`);
  - `snap-x snap-mandatory`, bleeding to the right screen edge;
  - items 82% wide below 768, 46% to 1023, and 31% from 1024 to 1279 where `from="xl"`; with `from="none"`, from 1024 each item is (100% − (visible − 1) × 24px) / visible; gap 16 (24 from 768);
  - ArrowLeft and ArrowRight move one item;
  - 44px previous and next buttons above the track at the right (4px, `border-strong` border on light; `muted-on-dark` border on dark, 6.81:1 against ink, because `plaster/25` would be only 2.14:1), with arrow glyphs `aria-hidden`;
  - at the ends the buttons get `aria-disabled="true"`, dim, and ignore clicks, so focus never drops;
  - `behavior: "instant"` under reduced motion.
- **From `from` up** (never, with `from="none"`): a plain grid of `columns`, with no `tabIndex`, no label and no buttons.

**`MediaCard`** (`src/components/ui/MediaCard.tsx`, new)

```ts
export type MediaCardProps = {
  media:
    | { kind: "image"; id: string; alt: string; aspect: "4/3" | "4/5" | "1/1" | "2/1"; position?: string; sizes: string }
    | { kind: "fragment"; node: React.ReactNode; aspect: "4/3"; ariaLabel: string; note: string };
  meta?: string;        // sentence-case subtitle, text-caption muted
  label?: string;       // .label: system name or step number
  title: string;        // h3.text-h3
  body: string;         // text-small muted, at most 4 lines
  link?: Action;        // tertiary
  wholeCard?: { href: string };   // the title becomes the link; a stretched ::after makes the card one target, focus ring on the card
  tone?: "light" | "dark";
};
```

- **Anatomy, top to bottom:** media (4px, cover), 8, the caption ("Concept render" for images, `note` for fragments), 16, meta or label, 8, title, 8, body, 16, link.
- There is no box, border, fill or shadow; the image is the card.
- A fragment frame is `role="img"` with `aria-label={ariaLabel}`, and its inner node is `aria-hidden`.

**`FactList`** (`src/components/ui/FactList.tsx`, new; ReFresh's feature strip)

```ts
export type FactListProps = {
  items: { term?: string; text: string }[];
  columns?: 1 | 2 | 3 | 4;                      // from 768 up; one column below
  termStyle?: "caption" | "label" | "strong";   // default "caption"; strong = text-body weight 500; "label" only for spec keys
  tone?: "light" | "dark";
  className?: string;
};
```

- It renders a `dl` when any item has a term and a `ul` otherwise.
- Each item: a 1px rule on top (hairline, or `plaster/20` on ink), 12, the term, 4, the text (`text-small`, ink or plaster), 12.
- When `columns > 1`, 1px vertical rules separate the columns from 768 up.

### B6. Section components

**`PageHeroSplit`** (`src/components/sections/PageHeroSplit.tsx`, foundation; ReFresh platform split hero, plus Legora Agent's product media in the first viewport)

```ts
export type PageHeroSplitProps = {
  id: string;            // h1 id
  headline: string; emphasis?: string; lead: string;
  primary: Action; secondary?: Action;   // secondary renders tertiary
  media:
    | { kind: "image"; id: string; alt: string; position?: string }
    | { kind: "film"; videoId: FilmId; posterId: PosterId; alt: string; name: string; position?: string };
};
```

- **1440:** a raised `Band` with `pad="hero"` and `as="header"`.
  - Text in columns 1–5, vertically centred on the media: H1 (at most 3 lines), 24, lead (`text-lead muted`), 32, then the primary `lg` and the tertiary link on one row, 24 apart.
  - Media in columns 6–12: 802×451 at 16:9, with its caption.
  - The band ends about 630px down, so the next heading shows inside the 900px first screen.
- **390:** H1, 16, lead, 24, primary, 16, link, 24, media at 16:9, caption.
- **Image media:** `Picture` with `priority`.
- **Film media:** the frame is `<div class="relative">` holding a 16:9 `div` with `role="img"` and `aria-label={alt}` (containing `FilmLayer` with the poster at priority), and, as its sibling, `FilmPause` inset 12px from the bottom-right corner. The `figcaption` sits under the frame. The button is never inside the `role="img"` element.
- Nothing in it reveals on scroll.

**`Switcher`** (`src/components/sections/Switcher.tsx`, foundation; ReFresh's pillar and sub-feature switcher)

```ts
export type SwitcherItem = {
  id: string;            // hash key and panel DOM id
  tab: string; label: string; title: string; body: string;
  image: ImageRef;
  facts: { term: string; text: string }[];
  link?: Action;
};
export type SwitcherProps = {
  id: string; tone: Tone;
  headline: string; emphasis?: string; intro: string;
  tabsLabel: string;     // aria-label of the tablist
  items: SwitcherItem[];
  hashSync?: boolean;
};
```

- **1440:** `SectionHead` split with the intro as the aside, then 48, then the tablist.
  - The tablist is text tabs on a full-width 1px hairline track: 44px tall, `text-body`, 32 between tabs. The active tab is ink with a 2px ink rule; the inactive ones are muted. Then 32.
  - All panels sit stacked in one grid cell. Inactive panels are `visibility:hidden`, `inert` and `aria-hidden`, so the cell holds the tallest panel's height and switching never moves the page.
  - Each panel has the image in columns 1–6 (`Picture fit="fill" fillFrom="lg"`, floor 385px, ceiling 684px) and the text in columns 8–12: `.label`, 8, h3 title, 12, body (`text-body muted`), 24, `FactList` (1 column, `termStyle="caption"`), 16, optional tertiary link. Both columns carry `data-col`.
  - Every panel's text must end within 48px of the tallest panel's. Section C sizes the facts for that.
- **Below 1024:**
  - the tablist becomes a grid of underline text tabs (3 columns for six tabs, 2 for four), each 44px, with a hairline under all of them and a 2px ink rule under the active one. There are no fills, borders or chips;
  - each panel stacks: image at 4:3 with caption, label, title, body, facts, link.
- **Motion:** a 200ms opacity crossfade, instant under reduced motion.
- **Accessibility:** WAI-ARIA tabs. The tablist has `aria-label={tabsLabel}`; each tab has an `id`, `aria-selected` and `aria-controls`; roving tabindex with ArrowLeft/ArrowRight, Home and End; automatic activation; panels have `aria-labelledby`.
- **`hashSync`:** on load and on `hashchange`, a hash equal to an item id selects that item and scrolls the band's top into view with `behavior:"instant"`. Panel DOM ids equal item ids, so `/platform#dock` also works as a plain anchor. Selecting a tab does not rewrite the hash. Because next/link changes the URL with `history.pushState`, which fires no `hashchange`, the switcher also listens for clicks on same-page anchors (`a[href$="#{item id}"]` whose path is the current page, including the footer's `/platform#part` links) and selects the item before the browser scrolls.

**`FeatureRow`** (`src/components/sections/FeatureRow.tsx`, foundation; ReFresh feature row with its strip, anchored top and bottom like Legora Agent's rows)

```ts
export type FeatureRowProps = {
  id: string; tone: Tone; side: "left" | "right";   // image side from 1024
  title: string;           // h2 at the H2 step, no italic, nothing above it
  body: string;
  link?: Action;
  facts: { term?: string; text: string }[];         // 3–4 items
  termStyle?: "caption" | "strong";
  image: ImageRef;
};
```

- **1440:**
  - The image takes 6 columns (`Picture fit="fill" fillFrom="lg"`, floor 385px, ceiling 684px). One column is left empty, then the text takes 5 columns. Both columns carry `data-col`.
  - The text column is a flex column. At the top: title, 12, body (`text-body muted`), 16, link. Then at least 24px. At the bottom: `FactList` in 1 column, ending on the image's bottom edge.
  - Sides alternate within a page.
- **390:** image at 4:3 with caption, then title, body, link, facts.

**`StepCards`** (`src/components/sections/StepCards.tsx`, P4; Legora Agent's four-step cards and ReFresh home's tall cards)

```ts
export type StepCardsProps = {
  id: string; tone: Tone;
  headline: string; emphasis?: string; intro: string;
  numbered: boolean; columns: 3 | 4; aspect: "4/5" | "1/1";
  items: { n?: string; title: string; body: string; image: ImageRef }[];
  track: { label: string; prevLabel: string; nextLabel: string };
};
```

- **1440:** `SectionHead` split, 48, then `MediaCard`s in a `SnapTrack from="lg"`. When `numbered`, each card's label is its number.
- **390:** the `SnapTrack`.

**`StatBand`** (`src/components/sections/StatBand.tsx`, P4; ReFresh's one saturated band, filled honestly)

```ts
import type { Stat } from "@/content/stats";
export type DesignFact = { term: string; value: string; unit?: string; text: string };
export type StatBandProps = {
  id: string; headline: string; emphasis?: string; intro: string; note: string; action?: Action;
} & ({ kind: "cited"; items: Stat[] } | { kind: "design"; items: DesignFact[] });
```

- **1440:** an ink `Band`: `SectionHead` split (dark), 48, then two to four equal columns. Each column: a 1px `plaster/20` rule, 16, then:
  - design kind only: the term (`text-caption muted-on-dark`), 8;
  - the `.numeral` value in plaster, with the unit (`text-small muted-on-dark`) on the baseline 8px after it;
  - 12, the label or text (`text-body` plaster, at most 2 lines);
  - cited kind only: 12, then the source line in `text-caption muted-on-dark`: `sup.text-label` index, `stat.source`, then a glass-on-dark "Source" link opening in a new tab with `rel="noreferrer noopener"`.
- After the columns: 32, then a last row with `note` on the left (`text-caption muted-on-dark`, 45ch) and, when present, the `inverse` primary `md` on the right.
- **390:** columns stack, then the note, then the action.
- **Notes:**
  - cited: "These figures describe the industry, not Lienry's results. Lienry Drones is pre-launch and has no customer results to report.";
  - design: "Design intent. Concept stage."
- Nothing counts up.

**`SpecBand`** (`src/components/platform/SpecBand.tsx`, P3; Legora's dark certification table, used as a specification sheet)

```ts
export type SpecBandProps = { id: string; headline: string; intro: string; rows: readonly (readonly [string, string])[] };
```

- **1440:** an ink `Band`: `SectionHead` split (dark), 48, then a 3×3 grid of 4-column cells. Each cell: a 1px `plaster/20` rule, 12, `dt.label` in muted-on-dark, 8, `dd` in `text-body` plaster.
- **390:** nine stacked rows.

**`Faq`** (`src/components/sections/Faq.tsx`, foundation; ReFresh's FAQ, left aligned and full width)

```ts
export type FaqProps = { id: string; tone: Tone; headline: string; intro: string; link: Action; items: { id: string; q: string; a: string }[] };
```

- `SectionHead` split with the intro and link in the aside. The heading is never italic. Then 48.
- A list across columns 1–12 with a hairline on top and between rows. Each `details > summary` is at least 56px tall, with the question in `text-body` weight 500 ink and today's 20px glass plus mark on the right, whose vertical stroke turns 90° when open (200ms, off under reduced motion).
- The answer is a `p` in `text-body muted`, 45ch, with 20px bottom padding.
- It works without JavaScript.

**`SiblingCards`** (`src/components/sections/SiblingCards.tsx`, P4; ReFresh's cards for sibling feature pages)

```ts
export type SiblingCardsProps = { current: "commercial" | "homes" | "solar" };
```

- A sunken `Band` with `SectionHead` split: H2 `siblings.headline`, and an aside with `siblings.intro` and the link `siblings.link` ("See the platform" → /platform).
- Then 48 and the two other product pages as `MediaCard`s with `wholeCard`, 6 columns each: image at 2:1 (684×342), caption, h3 title followed by an arrow glyph (`aria-hidden`), then a one-line body.
- **390:** the two cards stack 24px apart.
- It never includes the current page.

**`CtaPanel`** (`src/components/sections/CtaPanel.tsx`, foundation; Legora's closing card)

```ts
export type CtaPanelProps = { id: string; headline: string; body: string; primary: Action; links?: Action[]; image: ImageRef };
```

- A plaster `Band` (padding band) holding one full-grid panel: glass-deep, 4px, `on-dark on-accent`.
- **1440:**
  - Left, columns 1–6, padding 40. At the top: H2 (white, no italic), 16, body (`text-lead` plaster). Pinned to the bottom: the `inverse` primary `lg`, 16, then a row of `onAccent` tertiary links 24 apart.
  - Right, columns 7–12: the image inset 16px from the panel's top, right and bottom (`Picture fit="fill" fillFrom="lg" aspect="16/9" tone="accent"`), with its plaster caption inside the inset. Both columns carry `data-col`.
  - The panel's height follows the text, about 430px.
- **390:** padding 24. H2, body, image at 16:9 with caption, primary, then the links stacked.

**`CtaWithProduct`** (`src/components/platform/CtaWithProduct.tsx`, P3; ReFresh's close with the product under the ask)

```ts
export type CtaWithProductProps = { id: string; tone: Tone; headline: string; body: string; primary: Action; secondary?: Action; children: React.ReactNode };
```

`SectionHead` split: the H2 on the left; the aside holds the body, then the primary `lg` with a tertiary link beside it. Then 48 and the children at full grid width.

**`SoftwareWindow` and `useSoftwareLive`** (`src/components/software/SoftwareWindow.tsx`, foundation; the window extracted from `home/SoftwareView.tsx`)

```ts
import type { StepId } from "@/content/software";
export type SoftwareWindowProps = { preset?: StepId; tone?: "raised" | "sunken" };   // tone sets the border: sunken → border-border-strong/40, raised → hairline
export function useSoftwareLive(): boolean;   // useCanRender3d() && !reduced motion: the existing `live`
```

Everything PR 9 built is kept:
- the title bar with "Lienry Desktop", "Demo building, 12 storeys", "Preview" and "Demo data";
- the layer toggles with `aria-pressed` in the "Layers" group;
- the zone buttons with `aria-pressed` and camera flights;
- the canvas and tooltip `aria-hidden`;
- the "This clean" stats;
- "Pause preview" and "Play preview";
- the "Wash progress" range with End = 100%;
- rendering on demand that stops off screen;
- rotation off on touch;
- `PanelReadouts` behind "Inspect panel data";
- the note "Model is illustrative. The software will render each property from its scan."

The changes are:
1. **Preset.** When `preset` changes in live mode, write `controlRef.current` and the React state together, then call `requestFrame()`:

   | Preset | Layers | Other fields |
   |---|---|---|
   | map | scan only | `selected = null`, `flyTo = "overview"`, `scanStartedAt = now()` |
   | plan | zones only | `selected = null`, `flyTo = "overview"` |
   | clean | `DEFAULT_LAYERS` (wash, debris) | `flyTo = "overview"`, `playing = true` |
   | rescan | debris only | `flyTo = "overview"` |

   The first run with `clean` skips the flight, so the first paint is unchanged. Manual toggles still work afterwards: a tab is a preset, not a mode.
2. **Poster underlay.** In live mode the canvas box shows `/video/software-view-wide-poster.jpg` (object-contain on the scene's raised background, because the poster is 1020×756 and object-cover would crop the building's roof and base) until the scene's first rendered frame. `SoftwareScene` gains an optional prop `onFirstFrame?: () => void`, called once from a `useFrame` after the first render; the window sets `painted`, fades the poster out over 200ms and unmounts it. The window never shows an empty rectangle, including in headless captures.
3. **Layout.** The three panes (zones 216 | canvas | stats 240) start at 1024. From 768 to 1023 the canvas is 16:10; in live mode the four zone buttons (44px, `aria-pressed`, with their camera flights) run as a row between the canvas and the stats, and the stats run as a 5-column row under them. Zone buttons are hidden only in recording mode, where they never worked. Below 768: a 4:5 canvas with the tall recording and the stats in 2 columns. The canvas is 34rem (544px) tall from 1024 (it was 38rem). The whole window is about 672px at 1440.
4. **Recording mode** (not live: below 768, reduced motion, weak device or no WebGL):
   - the layer bar shows only "Recording of the model" (`text-caption muted`) with the existing 28px pause button at its right ("Pause preview" or "Play preview", disabled under reduced motion, where the video has native controls);
   - the layer toggles and the timeline row are not rendered;
   - the zones render as a plain list with the hint "Two passes per floor, top down.";
   - the stats show the demo values (64%, 204 / 320).

   This replaces disabled buttons that looked pressed.
5. **Camera** (`src/components/three/software/layout.ts`). In the overview preset at 1440 (canvas about 936×544), the building's silhouette must span about 70–85% of the canvas height, close to the recording's framing, so the poster's fade is not a jump. It is about 40% today. Measure it in a capture before changing anything. If it falls short:
   - lower the overview headroom in `presetBounds("overview")` from +2.2m to +0.8m;
   - then relax the overview's fit limits in `fitDistance` from x ±0.95, y −0.95…0.9 to x ±0.98, y −0.97…0.95;
   - re-measure.

   The zone presets are unchanged.
6. **Notes row.** The window always renders its own notes row under its frame: the illustrative-model note on the left and "Inspect panel data" (`PanelReadouts`) on the right. `SoftwareBand` and `CtaWithProduct` add no notes of their own, so the note is never missing or doubled.

**`SoftwareBand`** (`src/components/software/SoftwareBand.tsx`, foundation; ReFresh's tabbed product band)

```ts
export type SoftwareBandProps = {
  id: string; tone: "sunken" | "raised";
  headline: string; body: string;
  steps?: boolean;                               // home: step tabs driving the window's presets
  strip?: { term: string; text: string }[];      // /commercial: FactList under the window
};
```

- **With `steps` in live mode, at 1440:**
  - `SectionHead` split: `below` holds the body (`text-body muted`). The aside's `action` holds the tablist (four underline text tabs, 44px, `text-body`, over a full-width hairline track; the active tab ink with a 2px ink rule, the others muted), then 12, then the tabpanel: the caption in `text-body` ink and the hint in `text-small muted` on its own line. The tabpanel reserves the tallest step's height (a one-cell grid holding the active caption and hint plus `aria-hidden` invisible copies of all four), so the tab row never moves under the pointer.
  - Then 48 and the window at full grid width, which renders its own notes row (SoftwareWindow change 6).
  - The tabs follow WAI-ARIA: the tablist is labelled "Software steps", with roving tabindex, arrow keys, Home and End, and automatic activation. One tabpanel holds the caption and is labelled by the active tab. The caption crossfades in 200ms.
  - The default tab is Clean.
- **With `steps` when not live** (phones, reduced motion, no WebGL), and during server render, where live is false: in place of the tabs, a static ordered list of the four steps on hairline rows (`.label` "01 · Map", 4, the `short` line in `text-small`), set above the window. The swap to tabs after hydration happens below the fold.
- **Without `steps`:** the body is the aside's intro.
- **With `strip`:** 32 after the notes row, `FactList` in 3 columns with `termStyle="strong"`.

**`AppPanel`** (`src/components/app/AppPanel.tsx`, foundation; replaces the internal `AppPreview`)

```ts
export type AppState = "map" | "select" | "start" | "progress" | "done";
export type AppPanelProps = { mode: "fragment" } | { mode: "control"; state: AppState; onAdvance: () => void };
```

**Control mode**
- A raised panel with a hairline border, 4px corners and 20px padding; `role="group"` with `aria-label="Illustrative mobile app, demo data"`. It is `h-full` as a flex column, with the bar and the note pinned to the bottom.
- The header row: "Your property" (`text-small` weight 500) and `.label` "Demo data".
- "Rental, Sydney" in `text-lead` Inter weight 500. Before this change it was in the serif.
- "Choose the areas for this clean" in `text-caption muted`.
- Three 44px rows (Driveway, Solar panels, Windows). Their tick marks are `aria-hidden`; each row's state is text.
- The bar is a real `<button type="button">`: full width, 44px, ink, with a white `text-small` weight 500 label.
- A visually hidden `<p role="status" aria-live="polite">`, empty on first render.
- The note "Illustrative app interface."

Every change is user-initiated and immediate. There are no timers and no count-up.

| State (beat) | Driveway, Solar panels | Button label → next state | Status line |
|---|---|---|---|
| map (1) | unticked | "Choose surfaces" → select | "Choose the areas for this clean." |
| select (2) | ticked, "Selected" | "Start clean" → start | "Driveway and solar panels selected." |
| start (3) | ticked, "Starting" | "See progress" → progress | "Clean started." |
| progress (4) | ticked, "31%" and "64%" | "See the finished clean" → done | "Cleaning in progress: driveway 31%, solar panels 64%." |
| done (5) | ticked, "Complete" | "Start again" → map | "Clean complete." |

**Fragment mode** (the home product card)
- A static, compact version of the select state: 16px padding; the header row; "Rental, Sydney"; Driveway and Solar panels ticked and marked "Selected"; and the ink bar "Start clean" as a `div`, not a button.
- No note: the card caption carries it.
- It is decorative inside the card's `role="img"` frame.

**`Footer`** (`src/components/site/Footer.tsx`, P6; Legora's footer, compact)
- Sunken, with the 1px hairline on top. Padding 64 top and 32 bottom at 1440; 48 and 24 at 390.
- **1440:**
  - Columns 1–5: the tagline "Resident cleaning. / Designed in Sydney." as an `h2.text-h3` (today it is a serif `p`), 16, then `brand.status` in `text-small muted`.
  - Columns 7–12: the three `footerColumns`, two columns each, with `.label` muted heads and `text-small` links 12 apart.
  - 48, then the wordmark "Lienry Drones" (`p aria-hidden`, `font-display text-display leading-none`, left aligned).
  - 32, then a `border-strong/40` rule, 16, and the legal row: "© 2026 Lienry Drones. Sydney, Australia." on the left, and "In development." with the Privacy link on the right (`text-caption muted`).
- **390:** tagline, status, the three native `details` groups (56px summaries, 44px links, as built), the wordmark, then the legal row stacked.
- **Copy change** in `src/lib/site.ts`: the link label "Book a pilot" becomes "Book a pilot conversation".

**`Nav`** (`src/components/site/Nav.tsx`, P6)
- Unchanged as briefed: links hard left, the mark centred, "Register interest" as a solid ink `sm` button hard right; white over the home hero behind its scrim, solid plaster with a hairline past 80px; the full-screen phone menu with its focus trap, Escape, inert background and scroll lock.
- The only edit: `text-[0.8125rem]` becomes `text-caption`, the same 13px.
- No announcement bar.

### B7. The Concept render caption on each media treatment

The caption is always the plain text node "Concept render" in sentence case at `text-caption`. It has no fill, border, radius, padding, icon or uppercase, so it is never a badge, and no prop removes it. It sits over an image only in a film rail, on that film's scrim.

| Treatment | Where | Position | Colour and legibility |
|---|---|---|---|
| Full-bleed film | Home `Hero`, home `FilmBand` | In the frame's bottom rail: left edge on the page margin, 24px from the bottom (16px on the film band). The pause button is at the rail's right end. On the hero, "See how it works ↓" sits beside it. | White on the existing scrims. The hero's bottom gradient reaches 92% ink at the edge; the film band's left scrim is 86% ink at the left edge. Both unchanged. |
| Full-bleed still (the film's poster under reduced motion or Save-Data, or with no video) | Same frames | Same rail, with no pause button | Same |
| Framed film | /commercial `PageHeroSplit` | `figcaption` 8px under the frame at its left edge; pause button inset in the frame | Muted on raised, 6.69:1 |
| Row, panel, stage and hero image | `FeatureRow`, `Switcher`, `SystemStage`, `PageHeroSplit`, `FounderBand`, /company statement, `LandlordStory`, /register-interest | `figcaption` 8px under the frame at its left edge. In `SystemStage` it sits under the frame at the image area's left edge (x=472 at 1440), once for the six stacked images | Muted: 6.14:1 on plaster, 6.69:1 on raised, 5.51:1 on sunken. Muted-on-dark on ink: 6.81:1 |
| Card image | `MediaCard` (product, place, step, sibling), `Safety` cells | `figcaption` 8px under the image, before the card's meta, label or title | As the row image |
| Panel image | `CtaPanel` | Under the inset image, inside the panel | Plaster on glass-deep, 6.24:1 |
| Coded UI | `SoftwareWindow`, `AppPanel`, the app fragment | Not a render, so no Concept render. "Demo data" appears as a `.label` in the window or panel chrome, with the illustrative line beneath: "Model is illustrative. The software will render each property from its scan.", "Illustrative app interface.", and for the fragment the caption "Illustrative app interface. Demo data." | As built |

### B8. Motion

- **Reveals.** `Reveal`, `RevealList` and `RevealItem` are kept as they are: `whileInView` (IntersectionObserver), opacity 0 to 1 and translateY 12px to 0, 640ms on `--ease-settle`, once, with a −10% bottom margin and a 60ms stagger for card rows.
  - Used on section heads, card rows, `FeatureRow` text and `StatBand` columns.
  - Never on first-screen content, films, the stage frame or the software window.
- **Crossfades.** Opacity only, 200ms or less: the stage images, switcher panels and the software step caption.
- **Films.** Only on screen and one decoding at a time (`bindPlayback`), each with a pause control. Posters only under reduced motion or Save-Data.
- **3D.** `frameloop="demand"`. It renders only while on screen, with the tab visible and the preview playing. Rotation is off on touch.
- **Scrolling.** Native only, with `scroll-behavior: auto` kept. No pinned sections, and no sticky element other than the header: the PR 9 sticky image in the explainer and the sticky story panel both go.
- **Reduced motion.** `MotionConfig reducedMotion="user"` and the CSS kill switch are kept. Reveals, crossfades and snaps are instant; films show posters; the window shows the recording with native controls.
- **No count-ups anywhere.**

---

## C. Pages

Copy marked with a key is existing content from `src/content`. Copy in quotes and marked "new" is added to content by the foundation (F2 lists every shape). Heights are at 1440 / 390.

### C1. Home `/` (12 sections)

**Order and tone:**

| # | Section | Tone |
|---|---|---|
| 1 | Hero | film |
| 2 | Built for | plaster |
| 3 | Product cards | raised |
| 4 | Software | sunken |
| 5 | System stage | raised |
| 6 | Places | plaster |
| 7 | Film band | film |
| 8 | Findings | plaster, attached |
| 9 | Founder | sunken plate |
| 10 | Safety | ink plate |
| 11 | Questions | raised |
| 12 | Closing | plaster, with the glass-deep panel |
| — | Footer | sunken |

**Media on this page, each once (23 ids):** `h1-hero-film`, `h0-hero-still`, `m2-capsule-master`, `m3-pod-master`, `s1-dock`, `s2-tether`, `m1-drone-master`, `s4-scan`, `s5-software`, `s6-automation`, `p1-tower`, `p2-apartments`, `p3-house`, `p4-rental`, `p5-solar-farm`, `c2-commercial-clip`, `c1-commercial-hero`, `co1-company`, `f1-tether`, `f2-camera`, `f3-surface`, `f4-dock`, `ho1-homes-hero`.

#### 1. Hero · `Hero` (P2) · `section[aria-labelledby="hero-heading"]`, `data-tone="film"`

- **Adapts:** Legora's home hero (a full-screen film, one short line low in the frame, a support line and one action on a single row) with ReFresh's italic turn in the headline.
- **1440:**
  - 100svh, with content anchored 112px above the bottom.
  - The H1 is centred on one line, about 690px wide.
  - 28px below it, one centred row: the support line (`text-body` white) and the primary `md` `onDark` button with an arrow, 32 apart.
  - The bottom rail, 24px up: "Concept render" at the left margin, the "See how it works ↓" link (`text-caption` white, 44px), and the pause button at the right margin.
  - The scrims are byte-for-byte today's: the 25% ink veil; the header scrim (50% black through 72px, gone by 220px); the bottom 70% gradient to 92% ink.
- **390:** 100svh. The H1 at 44px, centred on two lines; the support line on two lines; the button; the same rail.
- **Copy:**
  - H1 `hero.headline` "Clean exteriors. Nobody on site." with `hero.emphasis` "Nobody on site.";
  - support `hero.support`;
  - button `hero.primary` "Register interest" → /register-interest;
  - rail link `hero.secondary` "See how it works" → `#system`. This replaces the hard-coded "Explore the system" at `Hero.tsx:85`.
- **Media:** `h1-hero-film` over the `h0-hero-still` poster, decorative (`alt=""` in an `aria-hidden` layer), captioned in the rail.
- **Interaction:**
  - `useFilm` with threshold 0.1; `FilmPause` named "hero film"; `FilmLayer` with `priority` and `fadeIn`, and the three scrims as `overlays`.
  - Poster only under reduced motion or Save-Data, and then no pause button.
  - Nothing animates on load except the film's own 1,200ms opacity fade-in (`fadeIn`), an allowed media fade.
- **Change:** the headline drops from the display step (83px) to the H1 step (70px) and gains the italic. Run the contrast proof.

#### 2. Built for · `PropertyStrip` (P2) · `Band tone="plaster" pad="none" ariaLabel="Property types Lienry is built for"`

- **Adapts:** the customer-logo row directly under both references' heroes. Customer logos cannot be used honestly; property types can.
- **1440:** one row 72px tall (14px padding, 44px link targets): `.label` "Built for" at x=24, then five `text-body` ink links spread `justify-between` across the rest of the grid, underlined on hover and focus.
- **390:** the label, 12, then a 2-column grid of 44px links. About 190px.
- **Copy:** `propertyStrip.label`, and `propertyStrip.items[].label` with the new `href`:
  - "Commercial buildings under 70 m" and "Apartment buildings" → /commercial;
  - "Homes" and "Rental properties" → /homes-and-rentals;
  - "Solar farms" → /solar.
- **Media:** none.
- **Interaction:** links.

#### 3. Product cards · `ProductCards` (P1) · id `products`, raised

- **Adapts:** ReFresh home's three cards straight after the system intro, and Legora home's product cards (image-led cards with two to four lines and one link, with software shown as a UI crop running off the card edge). Lienry has three things a buyer chooses between, so there are three cards.
- **1440:** `SectionHead` split (H2 on one line, intro in the aside), 48, then three `MediaCard`s at 4 columns (448) with images at 4:3 (448×336). The band is about 870px and starts at y≈972; the dock images are in view from y≈1,190.
- **390:** `SectionHead` stacked, then the three cards stacked 32 apart, full width at 4:3. The same up to 1023; three across from 1024.
- **Copy:**
  - H2 `productCards.headline` "The right system for your property." (no italic).
  - Intro `productCards.intro` (new): "A roof capsule for commercial buildings under 70 metres, or a ground pod for homes, rentals and solar farms. Both run from the desktop software, and the home system adds a phone app."
  - **Card 1:** meta "For buildings under 70 metres" (= `twoSystems.systems[0].subtitle`); title "Commercial system"; body "A weatherproof capsule on the roof, a tether fed from above, and desktop software that runs the whole building." (the first sentence of `commercialPage.lead`); link "Commercial system" → /commercial.
  - **Card 2:** meta "For houses, apartments, rentals and solar farms"; title "Home system"; body "A waterproof ground pod, a drone that knows each material, and an app that starts the clean wherever you are." (the first sentence of `homesPage.lead`); link "Home system" → /homes-and-rentals.
  - **Card 3:** meta "For the home system"; title "Phone app"; body (new) "Start a clean from another suburb or another country. Choose the areas, and the drone sets the pressure for each material."; link "See the app" → /homes-and-rentals#story.
- **Media:**
  - Card 1: `m2-capsule-master` at position 50% 50%, alt "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", captioned.
  - Card 2: `m3-pod-master` at 35% 50%, alt "The Lienry ground pod open beside a garden tap, the home drone inside", captioned.
  - Card 3: `AppPanel mode="fragment"` on a sunken ground inside the 4:3 frame. The panel sits 24px from the top (16px at 390) and 32px from the left, and runs 24px past the right edge (the UI crop). The frame has `aria-label` "Illustrative phone app, demo data: driveway and solar panels selected, ready to start a clean", and the caption reads "Illustrative app interface. Demo data."
- **Interaction:** links; `RevealList` with a 60ms stagger.

#### 4. Software · `SoftwareBand steps` (foundation, composed by P1) · id `software`, sunken

- **Adapts:** ReFresh home's tabbed product band, where four verbs each change the caption and the interface in place. Legora's home has no working product, so this is Lienry's strongest evidence, placed right after what a buyer chooses between.
- **1440:** `SectionHead` split: H2 and body on the left; tabs and caption on the right, aligned to the bottom. Then 48, the window at 1,392 wide (about 672px tall, canvas 544px), 16, and the notes row. The band is about 1,150px (a software band, exempt from the 900px limit) and starts at y≈1,842, with the window at y≈2,190.
- **390:** `SectionHead` stacked, the static four-step list, 32, the window in recording mode (title bar, the "Recording of the model" bar with pause, a 4:5 canvas playing `software-view-tall`, stats in 2 columns), 16, then the notes stacked.
- **Copy:**
  - H2 `softwareSection.headline` "The software sees the whole building." (no italic); body `softwareSection.body`.
  - Steps `softwareSteps` (new, in `src/content/software.ts`):

    | Tab | Caption | Hint | Phone line (`short`) |
    |---|---|---|---|
    | Map (`map`) | "The drone maps the structure and dimensions of the building, and the software builds its model from that scan." | — | "The drone maps the building, and the model is built from the scan." |
    | Plan (`plan`) | "Each zone has its own surface, preset and pressure." | "Select a zone in the window to fly to it." | "Each zone gets its own surface, preset and pressure." |
    | Clean (`clean`) | "The clean moves down the facade, two passes per floor, top down." | "Drag the timeline to scrub it." | "The clean moves down the facade, two passes per floor." |
    | Re-scan (`rescan`) | "On its interval the drone re-scans the building, and built-up debris is shaded where the next clean is needed." | — | "The re-scan shades built-up debris where the next clean is needed." |

    The step names are Lienry's own process words (it maps, plans, cleans and re-scans), and none of them repeats a layer toggle in the window (Scan, Wash, Debris, Zones), so no two controls share a name.

  - Window copy is unchanged: `project`, `zones`, `layers`, "Preview", "Demo data", "Auto orbit. Drag to look around." or "Recording of the model", and the illustrative-model note.
- **Media:** the coded model. The recordings `public/video/software-view-{wide,tall}` are used only inside the window. No Concept render caption; Demo data and the notes instead.
- **Interaction:** the step tabs apply the presets in B6; every PR 9 window control is kept.

#### 5. System stage · `SystemStage` (P1) · id `system`, raised

- **Adapts:** Legora home's platform stage: a column of layer names that works as index, accordion and progress at once, beside one large object, ending on a path to the platform page. The pin is dropped. The stage is one screen tall and driven by click and keyboard, because the owner's brief bans pinned runways (Legora's is about 4,000px carrying a few sentences).
- **1440:**
  - `SectionHead` split: the H2 on one line in columns 1–7, the intro in the aside. Then 48.
  - **The frame:** full grid width, 4px corners, `overflow-hidden` for the corners only. Its height is the sidebar's height with its tallest part open (floor 480px), about 572px, so nothing clips and switching parts never moves the page.
  - **Sidebar** (columns 1–4, 448px, ink, padding 24), a flex column:
    - six rows, each an `h3.text-h3 > button` at least 48px tall with `py-2` and a 1px `plaster/15` rule between rows. The button holds the number (`.readout text-caption muted-on-dark`, `aria-hidden`), the part name (`text-h3` plaster) and "+" or "−" at the right (`aria-hidden`);
    - under the open row, its region: 8, body (`text-small` plaster), 12, readout (`text-caption muted-on-dark`), 16;
    - the region's content sits in a one-cell grid together with `aria-hidden` invisible copies of all six bodies and readouts, so the region always takes the tallest part's height;
    - pinned to the bottom (margin-top auto, at least 16): the 44px square buttons "Previous part" and "Next part" (`ink-raised` fill, `muted-on-dark` border at 6.81:1 so the boundary clears WCAG 1.4.11's 3:1, arrow glyphs `aria-hidden`, `aria-disabled` at 01 and 06), the counter "01 / 06" (`text-caption muted-on-dark`, `aria-hidden`), and at the right the `onDark` tertiary "Explore the platform" → /platform.
  - **Image area** (the rest of the frame, 944px wide from x=472):
    - the six images stacked absolutely with object-cover: the active one at opacity 1, the others at 0 and `aria-hidden`, crossfading over 200ms;
    - one "Concept render" caption 8px under the frame at x=472;
    - all six load together, because lazy loading sees them all in view at once.
  - From 1024 to 1279 the sidebar takes 5 columns.
  - The band is about 890px. If it measures over 900, reduce the row padding first, never the band padding.
- **390:**
  - `SectionHead` stacked.
  - One ink panel (full width, 4px, padding 24 by 16) with the six rows and the open region. After the readout come 16 and the part's image at 4:3 with a muted-on-dark caption.
  - Previous, next, the counter and the link sit at the bottom.
  - There is no separate image area: this is PR 9's phone disclosure.
- **Copy:**
  - H2 `systemExplainer.headline` "Designed to stay. Built to clean." with `systemExplainer.emphasis` "Built to clean." (italic 1 of 2 on this page); intro `systemExplainer.intro`.
  - Rows from `tabs[].tab`, bodies from `tabs[].body`, readouts from `tabs[].readout`. Two readouts change so the findings row owns the numbers: scan becomes "Structure and dimensions, mapped first" and automation becomes "Start a clean from anywhere".
- **Media:**

  | Part | Image | Position | Alt |
  |---|---|---|---|
  | Dock | `s1-dock` | 50% 55% | "The roof capsule's lid closing over the drone on a wet roof" |
  | Tether | `s2-tether` | 50% 60% | "The drone's tether rising from its fitting past a wet glass facade" |
  | Drone | `m1-drone-master` | 50% 50% | "The Lienry drone washing a glass wall, its spray bar, pad and rollers on the pane" |
  | Scan | `s4-scan` | 50% 40% | "The drone holding off the corner of a glass building to scan it, with no spray" |
  | Software | `s5-software` | 50% 50% | "A laptop on a desk showing the desktop software's shaded 3D building" |
  | Automation | `s6-automation` | 50% 40% | "The roof capsule open at dawn, the drone rising from its cradle" |

  All are captioned "Concept render". Check the drone at 1440 and adjust the positions if it is clipped.
- **Interaction:**
  - PR 9's disclosure semantics exactly: the button inside an h3; `aria-expanded`, `aria-controls`, and `aria-disabled` on the open one; the region with `role="region"` and `aria-labelledby`; inactive regions `hidden`; ids `part-{id}` and `part-panel-{id}`; exactly one open, Dock first.
  - Previous and next open the adjacent part and keep focus on themselves.
  - Nothing is hover-only or linked to scroll.

#### 6. Places · `PlacesRow` (P1) · id `places`, plaster

- **Adapts:** Legora home's gallery of contexts (portrait architecture, one card per context, a track that runs on past the edge). Four of Lienry's five contexts show at once from 1024 (PR 9 showed three), at a size where the drone in each render still reads, and the fifth is one step along the track.
- **1440:** `SectionHead` split, 48, then a `SnapTrack from="none" visible={4}` of five `MediaCard`s with `wholeCard`, images at 4:5 (330×412), with the previous and next buttons above the track at the right. About 870px.
- **390:** `SectionHead` stacked, then the track of 82% cards at 4:5 with previous and next above it at the right. From 768 to 1023, two cards (46%) are visible.
- **Copy:**
  - H2 `places.headline` "Built around your property." with `places.emphasis` "your property." (italic 2 of 2).
  - Intro `places.intro` (new): "Five kinds of property, one platform. Each card shows which system does the work and opens its page."
  - Cards: label `places.cards[].system`, title `.title` (the whole-card link), body `.body`, href `.href` (new): the tower and apartments go to /commercial, the house and rental to /homes-and-rentals, the solar farm to /solar.
- **Media:** `p1-tower`, `p2-apartments`, `p3-house`, `p4-rental`, `p5-solar-farm` (position 50% 60%), each with alt "{title}: {body}" and captioned.
- **Interaction:** whole-card links. At every width the track has the label "Property types. Use left and right arrow keys to browse." and the buttons "Previous property" and "Next property".

#### 7. Film band · `FilmBand` (P2) · `section[aria-labelledby="film-heading"]`, `data-tone="film"`

- **Adapts:** Legora home's full-bleed film band introducing the evidence, with its numbers attached directly beneath (section 8). Nothing sits above the heading.
- **1440:** `min-height` 85svh (765px). Today's layout and left scrim (86% ink to 25%) are kept: the copy sits bottom-left within 544px (H2, 20, body, 32, tertiary link), and the rail is 16px from the bottom.
- **390:** 70svh (590px), same order.
- **Copy:**
  - H2 `filmBand.headline` "The building checks itself." at the H2 step (it was on the H1 step), no italic.
  - Body `filmBand.body` (new): "The capsule stays on the roof between cleans. When the scan says the glass needs it, the drone goes out, washes and comes home. Nobody books it. Nobody attends it."
  - Link `filmBand.cta` "The commercial system" → /commercial (`onDark` tertiary).
  - `filmBand.eyebrow` is not rendered.
- **Media:** `c2-commercial-clip` over the `c1-commercial-hero` poster, decorative, captioned in the rail.
- **Interaction:** `useFilm` with threshold 0.2 and `FilmPause` named "product film" (so "Pause product film" and "Play product film", as today). Poster only under reduced motion or Save-Data.
- **Props kept:** `{ videoId, stillId, eyebrow?, headline, body, cta }` (see F4).

#### 8. Findings · `FactRow` (P1) · id `by-design`, `Band tone="plaster" pad="attached" ariaLabel="By design"`

- **Adapts:** Legora home's findings row (a lead paragraph beside large hairline-topped numerals, about 32px under the film). Customer percentages cannot be copied, so Lienry's design facts, labelled as design intent, fill the slot. The three numerals run side by side, so the lead column never sits beside a void.
- **1440:**
  - Columns 1–4: `.label` "By design", 12, the lead (`text-lead` ink), 16, the note (`text-caption muted`).
  - Columns 5–12: three equal columns, each a 1px hairline, 16, the term (`text-caption muted`), 8, the `.numeral` value with its unit (`text-small muted`, 8px after it on the baseline), 12, the text (`text-caption muted`).
  - About 320px.
- **390:** label, lead, note, then three rows, each a hairline with the 56px numeral on the left and the term and text stacked on the right.
- **Copy:** `designFacts` (new):
  - label "By design";
  - note "Design intent. Concept stage.";
  - lead "Three numbers the commercial system is designed around. They are design intent, not results: Lienry is at concept stage and nothing is in service yet.";
  - facts:
    - Re-scan interval, 2 days: "between re-scans on commercial buildings, and you can change it";
    - People on site, 0: "during a clean";
    - Building height, <70 m: "the commercial system is designed for buildings under 70 metres".
- **Media:** none.
- **Interaction:** static; nothing counts up.

#### 9. Founder · `FounderBand` (P1) · id `founder`, `Band tone="sunken" pad="plate"`

- **Adapts:** Legora home's founder band: the heading top-left, the letter in the right half, a large image, and the sign-off level with the image's bottom edge. A portrait, a handwritten signature and an office photograph cannot be used, because no real photo exists and no generated people or offices are allowed. The name is set in Inter, and the side image is the street render.
- **1440:**
  - Columns 1–5, a flex column with space between: the H2 at the top; at the bottom, `co1-company` at its native 21:9 (566×243) with its caption.
  - Columns 7–12: the three paragraphs (`text-body` ink, 45ch, 16 apart), then at the bottom the sign-off: the name (`text-body` weight 500, Inter), 4, the title (`text-caption muted`).
  - The columns end on the same line. About 490px.
- **390:** H2, 24, paragraphs, 24, sign-off, 24, then the image at 21:9 with its caption.
- **Copy:** `visionLetter.headline` "Why we are building Lienry." (no italic), the three `visionLetter.paragraphs`, and `visionLetter.signature` ("Liam Kennedy", "Founder and CEO, Lienry Drones"). No photo placeholder and no co-founder slot.
- **Media:** `co1-company`, alt "A harbour-side street of mid-rise buildings at dawn", captioned in muted.
- **Interaction:** none.

#### 10. Safety · `Safety` (P2) · id `safety`, `Band tone="ink" pad="plate"`

- **Adapts:** Legora home's dark compliance band (a heading and a short line, then equal cells with text at the top and a mark at the bottom). Certification seals cannot be used. Each cell carries its detail render where a seal would be, and the plain status line stands where a certification list would.
- **1440:**
  - `SectionHead` split (dark): the H2 in columns 1–7; the aside intro is `safety.note`. Then 32.
  - Four equal cells in a ruled row: a 1px `plaster/20` rule above and below the row and between cells.
  - Each cell has padding 24 and is a flex column: h3 (plaster), 8, body (`text-small muted-on-dark`), then, with `margin-top: auto` and at least 24px above, the image at 4:3 (300×225) with its muted-on-dark caption. The images line up along the bottom.
  - About 650px.
- **390:** `SectionHead` stacked, then a `SnapTrack` (tone dark) of the four cells at 82% width, with the same anatomy and a top rule on each. The label is "Safety details. Use left and right arrow keys to browse.", with "Previous detail" and "Next detail".
- **Copy:** H2 `safety.headline` "Safety starts with the design." (no italic: the page's budget is spent); note `safety.note`; cells `safety.items[]` (title, body).
- **Media:** `f1-tether`, `f2-camera`, `f3-surface` and `f4-dock` as 4:3 crops of 1:1, alt = title, captioned.
- **Interaction:** the track below 1024 only.

#### 11. Questions · `Faq` (foundation, composed by P1) · id `faq`, raised

- **Adapts:** ReFresh home's FAQ before its close, left aligned and full width instead of a narrow centred column.
- **1440:** `SectionHead` split with intro and link, 48, then five rows. About 625px.
- **390:** stacked. About 680px.
- **Copy:**
  - H2 `platformFaq.headline` "What people ask first." (no italic).
  - Intro `platformFaq.intro` (new): "Straight answers, including what we cannot claim yet."
  - Link `homeFaqLink` (new): "All questions" → /platform#faq.
  - Items `faqSets.home`: "Where does the water come from?", "How tall a building can it work on?", "Does anyone need to be there?", "Is Lienry operating yet?", "What does it cost?"
- **Interaction:** native `details`.

#### 12. Closing · `ClosingCta` (P2, renders `CtaPanel`) · id `closing`

- **Adapts:** Legora's closing card: one saturated container, the heading and button pinned to its corners, and an image inset in a mat. There is no demo to book, so the panel carries Lienry's three real enquiry routes.
- **Layout:** as `CtaPanel` in B6. About 620px.
- **Copy:**
  - `closing.headline` "Help shape what comes next." (no italic); `closing.body`;
  - primary `closing.buttons[0]` "Register interest" → /register-interest?type=homeowner;
  - links `closing.buttons[1]` "Book a pilot conversation" (was "Commercial pilot enquiries") → ?type=commercial, and `closing.buttons[2]` "Investor enquiries" → ?type=investor.
- **Media:** `closing.imageId` = `ho1-homes-hero`, position 60% 50%, alt "The Lienry ground pod beside a house at first light, the drone washing a window", plaster caption. This replaces the page's second use of `m3`.
- **Interaction:** links.

---

### C2. `/platform` (ReFresh platform page, a hub; 7 sections)

**Order and tone:**

| # | Section | Tone |
|---|---|---|
| 1 | Hero | raised |
| 2 | Six parts | plaster |
| 3 | Commercial system | raised |
| 4 | Home system | sunken |
| 5 | Specifications | ink |
| 6 | Questions | plaster |
| 7 | Close with the product | raised |
| — | Footer | sunken |

**Media:** `h0-hero-still`, `s1-dock`, `s2-tether`, `m1-drone-master`, `s4-scan`, `s5-software`, `s6-automation`, `m2-capsule-master`, `m3-pod-master`, plus the coded window. The film band and its repeat of the hero shot are removed.

#### 1. Hero · `PageHeroSplit` (foundation)

- **Adapts:** ReFresh's platform split hero: text left, one image right, the next heading visible at the fold.
- **Copy:**
  - H1 `platformPage.headline` "One platform. Two systems. Six parts." with `platformPage.emphasis` "Six parts.";
  - lead `platformPage.lead`;
  - primary "Register interest" → /register-interest;
  - secondary "See the six parts" → #parts.
- **Media:** `h0-hero-still` at 16:9 (native), alt `platformPage.heroAlt` "The Lienry drone finishing a glass wash at first light", captioned.

#### 2. Six parts · `Switcher hashSync` (foundation) · id `parts`, plaster

- **Adapts:** ReFresh's pillar switcher (tabs named exactly as the parts, with one image-and-text panel). The home stage shows the parts as a trailer; this panel adds the specification lines and links.
- **1440:** about 775px. **390:** 3×2 underline tab grid, then the panel.
- **Copy:**
  - H2 `platformPage.partsSection.headline` "How the six parts fit together." with emphasis "fit together." (italic 1 of 1 on this page);
  - intro `systemExplainer.intro`;
  - `tabsLabel` "The six parts";
  - tab = `tabs[].tab`; label "01 · Dock" to "06 · Automation"; title `tabs[].title`; body `tabs[].body`;
  - facts and links from `platformPage.partFacts` (new):

  | Part | Facts (term: text) | Link |
  |---|---|---|
  | Dock | Commercial dock: "Weatherproof roof capsule, water tether fed from above"; Home dock: "Waterproof ground pod, power and water through the same tether" | "Compare the two systems" → #commercial-system |
  | Tether | Water: "Fed through the tether for the whole clean"; Carried water: "None. The drone never carries water."; Home system: "Fed from the ground pod, on the same line that powers it" | none |
  | Drone | Surfaces: "Glass, solar panels, walls, roofing, driveways"; Pressure: "Set by the software for each material, adjustable in the app"; Routes: "Short and planned, with the tether kept clear" | none |
  | Scan | Scan: "Maps the structure and dimensions of the building before the first clean"; Re-scan interval: "Every two days on commercial buildings, adjustable in settings" | "The commercial system" → /commercial |
  | Software | Control: "Desktop software for both systems; personalised mobile app for the home system"; Shows: "A 3D model of the building, live wash progress and debris shading" | "See the software working" → #demo |
  | Automation | People on site: "None during a clean"; Starting a clean: "From the app or the desktop software, from anywhere" | "Register interest" → /register-interest |

  - If a panel ends more than 48px short of the tallest at 1440, add or drop a fact line. The alternate for Automation is Status: "Concept stage; pilot program in preparation".
- **Media:** the six stills with the alts and positions from C1 section 5, captioned.
- **Interaction:**
  - tabs with `hashSync`: all six footer links (`/platform#dock` … `#automation`) open their part;
  - panel DOM ids are `dock`, `tether`, `drone`, `scan`, `software`, `automation`;
  - no element on this page has any other id equal to a part id.

#### 3. Commercial system · `FeatureRow side="left"` (foundation) · id `commercial-system`, raised

- **Adapts:** ReFresh's platform feature row, with its strip as the bottom of the text column. No label sits above the title.
- **Copy:**
  - title `platformPage.rows.commercial.title` "Commercial system";
  - body (new) "A roof capsule for buildings under 70 metres. The drone lives on the roof, fed from above, and the whole building runs from the desktop software.";
  - facts: the four `twoSystems.systems[0].points`;
  - link "The commercial system" → /commercial.
- **Media:** `m2-capsule-master` at 50% 50% (alt as in C1 section 3), captioned. About 700px.

#### 4. Home system · `FeatureRow side="right"` · id `home-system`, sunken

- **Copy:**
  - title "Home system";
  - body (new) "A ground pod for homes, rentals and solar farms. The pod powers the drone and feeds it water, and you start a clean from your phone wherever you are.";
  - facts: the four `twoSystems.systems[1].points`;
  - link "The home system" → /homes-and-rentals.
- **Media:** `m3-pod-master` at 35% 50%, captioned.

#### 5. Specifications · `SpecBand` (P3) · id `specs`, ink

- **Adapts:** ReFresh's one saturated band per page, holding the structure of Legora's dark specification table. No statistic fits this page honestly.
- **Copy:**
  - H2 `platformPage.specs.headline` "What we can say today."
  - Intro `platformPage.specs.intro` (new): "Design intent at concept stage. None of it has been tested in service yet."
  - Rows: the nine `platformPage.specs.rows`.
- About 590px at 1440 and 945px at 390.

#### 6. Questions · `Faq` · id `faq`, plaster

- **Copy:** H2 `platformFaq.headline` (no italic); intro `platformFaq.intro`; link `platformFaq.link` "Register interest" → /register-interest; items: all seven (`faqSets.platform`).
- The home FAQ's "All questions" link lands here.

#### 7. Close with the product · `CtaWithProduct` (P3) · id `demo`, raised

- **Adapts:** ReFresh's platform close, where the full product sits under the ask. Lienry shows the working window instead of a screenshot.
- **Copy** (`platformPage.close`, moved from the page file):
  - H2 "Be part of the first buildings."
  - Body "Register interest for your property, or book a conversation about the commercial pilot program."
  - Primary "Register interest" → /register-interest; tertiary "Book a pilot conversation" → /register-interest?type=commercial.
- **Child:** `SoftwareWindow tone="raised"` with Demo data, the illustrative-model note and "Inspect panel data". No step tabs.
- **Siblings:** none; the hub links out through its tabs and rows.
- About 1,070px (a software band).

---

### C3. `/commercial` (ReFresh feature page; 8 sections)

**Order and tone:**

| # | Section | Tone |
|---|---|---|
| 1 | Hero | raised |
| 2 | How it works | plaster |
| 3 | The software | sunken |
| 4 | By design | ink |
| 5 | Over time | raised |
| 6 | Questions | plaster |
| 7 | Siblings | sunken |
| 8 | Pilot | plaster, with the panel |
| — | Footer | sunken |

**Media:** `c2-commercial-clip` with the `c1-commercial-hero` poster, `m2-capsule-master`, `s4-scan`, `s5-software`, `s6-automation`, `s1-dock`, `ho1-homes-hero`, `so1-solar-hero`, `h0-hero-still`, plus the coded window.

#### 1. Hero · `PageHeroSplit` with film

- **Adapts:** ReFresh's split hero, with Legora Agent's product film inside the first viewport. This finally uses `commercialPage.heroVideoId`.
- **Copy:**
  - H1 `commercialPage.headline` "Window cleaning that lives on the roof." with emphasis "on the roof.";
  - lead `commercialPage.lead`;
  - primary `commercialPage.pilot.cta` "Book a pilot conversation" → ?type=commercial;
  - secondary "See the platform" → /platform.
- **Media:** `c2-commercial-clip` over `c1-commercial-hero`, alt `commercialPage.heroAlt` "The Lienry roof capsule on a plant deck at dawn, the drone rising from its cradle"; `FilmPause` named "commercial film"; caption under the frame.

#### 2. How it works · `Switcher` · id `how`, plaster

- **Adapts:** ReFresh's sub-feature switcher.
- **Copy:**
  - H2 `commercialPage.steps.headline` "Four steps, then it runs itself." with emphasis "then it runs itself.";
  - intro (new) "From an empty roof to a building that decides when it needs a clean.";
  - `tabsLabel` "Steps";
  - tabs (new): "Install", "Scan", "Run", "Re-scan", with item ids `install`, `scan`, `run` and `rescan`; labels "Step 01" to "Step 04";
  - titles and bodies from `commercialPage.steps.items`;
  - facts (new, `steps.items[].facts`):

  | Step | Facts (term: text) | Image |
  |---|---|---|
  | Install | Dock: "Weatherproof roof capsule"; Water: "Tether fed from above"; Carried water: "None" | `m2-capsule-master`, 50% 50% |
  | Scan | Scan: "Structure and dimensions of the building"; Output: "A model in the desktop software"; When: "Before the first clean" | `s4-scan`, 50% 40% |
  | Run | Pressure: "Set by the software for each material"; Route: "Planned on the model of the building"; Tracking: "Live progress on a 3D model of the building" | `s5-software`, 50% 50% |
  | Re-scan | Re-scan interval: "Every two days, adjustable in settings"; Decision: "The re-scan decides whether a clean is needed"; People on site: "None during a clean" | `s6-automation`, 50% 40% |

- Alts as in C1 section 3 (m2) and section 5 (s4, s5, s6), captioned.

#### 3. The software · `SoftwareBand` with strip, no steps · id `software`, sunken

- **Adapts:** ReFresh's feature row with its strip. The working window replaces the three text tiles that used to describe it.
- **Layout:** `SectionHead` split, 48, `SoftwareWindow tone="sunken"`, 16, notes row, 32, `FactList` in 3 columns (`termStyle="strong"`).
- **Copy:**
  - H2 `commercialPage.software.headline` "What the desktop software shows." (no italic);
  - intro `softwareSection.body`;
  - strip: the three `commercialPage.software.tiles` (term = title, text = body).

#### 4. By design · `StatBand kind="design"` (P4) · id `by-design`, ink

- **Adapts:** ReFresh's statement band. `stats.ts` has no commercial figure, and no solar or housing figure is borrowed to fill the slot.
- **Copy:**
  - H2 `commercialPage.byDesign.headline` (new) "Designed around three numbers."
  - Intro (new) "Design intent for the pilot, not results."
  - Items: the three `designFacts.items`.
  - Note "Design intent. Concept stage."
  - Action (`inverse`) "Book a pilot conversation" → ?type=commercial.

#### 5. Over time · `FeatureRow side="right"` · id `cost`, raised

- **Adapts:** ReFresh's feature row with its callout list; the tinted callout becomes a hairline list.
- **Copy:**
  - title `commercialPage.cost.headline` "Why it costs less over time.";
  - body `commercialPage.cost.body` (it keeps the line about not publishing prices before the pilot);
  - facts `commercialPage.cost.points` (new; moved from `commercial/page.tsx`): "No crews to book for each visit", "No access equipment to arrange at height", "No waiting for a slot: the re-scan decides when a clean is due", "The building is planned, tracked and reported in one place".
- **Media:** `s1-dock` at 50% 55%, alt "The Lienry roof capsule lid closing on a wet roof", captioned.

#### 6. Questions · `Faq` · id `faq`, plaster

- **Copy:** the heading, intro and link from `platformFaq`, with the link "Book a pilot conversation" → ?type=commercial. Items `faqSets.commercial`: height, water, decide, attend, operating, cost.

#### 7. Siblings · `SiblingCards current="commercial"` · id `more`, sunken

- **Adapts:** ReFresh's cards for sibling feature pages; they go sideways, never back to this page.
- **Cards:** Home system (`ho1-homes-hero`) and Solar (`so1-solar-hero`), from `siblings.cards`.

#### 8. Pilot · `CtaPanel` · id `pilot`

- **Copy:**
  - H2 `commercialPage.pilot.headline` "A small number of buildings, first."; body `pilot.body`;
  - primary `pilot.cta` "Book a pilot conversation";
  - link "Investor enquiries" → ?type=investor.
- **Media:** `h0-hero-still` at 50% 50%, alt "The Lienry drone washing a glass curtain wall, its tether rising to the roof".

---

### C4. `/homes-and-rentals` (ReFresh feature page with Legora Agent's step cards; 7 sections)

**Order and tone:**

| # | Section | Tone |
|---|---|---|
| 1 | Hero | raised |
| 2 | How it works | plaster |
| 3 | The app | raised |
| 4 | In Australia | ink |
| 5 | Questions | plaster |
| 6 | Siblings | sunken |
| 7 | Register | plaster, with the panel |
| — | Footer | sunken |

**Media:** `ho1-homes-hero`, `m3-pod-master`, `p3-house`, `p4-rental`, `p5-solar-farm`, `y1-story-before`, `y2-story-panels`, `y3-story-driveway`, `y5-story-done`, `c1-commercial-hero`, `so1-solar-hero`, `so2-solar-closeup`.

#### 1. Hero · `PageHeroSplit`

- **Copy:**
  - H1 `homesPage.headline` "Your property, cleaned from anywhere." with emphasis "from anywhere.";
  - lead `homesPage.lead`;
  - primary "Register interest" → ?type=homeowner;
  - secondary "I own rentals" → ?type=landlord.
- **Media:** `ho1-homes-hero` as a 16:9 crop of 21:9 at 60% 50%, alt `homesPage.heroAlt` "The Lienry ground pod beside a house at first light, the drone washing a window", captioned. Check that both the pod and the drone stay in frame.

#### 2. How it works · `StepCards numbered columns={4} aspect="4/5"` (P4) · id `how`, plaster

- **Adapts:** Legora Agent's four-step card row. It is chosen over a switcher because these renders are portraits.
- **1440:** `SectionHead` split, 48, four cards of 330px with images 330×412. About 880px.
- **390:** a `SnapTrack` with "Previous step" and "Next step" and the label "Setup steps. Use left and right arrow keys to browse."
- **Copy:**
  - H2 `homesPage.steps.headline` "Set up once. Start from anywhere." (no italic);
  - intro (new) "Four steps from a new pod to a clean you start from your phone.";
  - items from `homesPage.steps.items`: the number as the label, then title and body.
- **Media** (`steps.items[].image`, new):
  - 01 `m3-pod-master` at 30% 50%, alt "The ground pod open beside a garden tap";
  - 02 `p3-house`, "The home drone washing the front windows of a suburban house";
  - 03 `p4-rental` at 50% 40%, "The home drone over rooftop solar panels on a rental townhouse";
  - 04 `p5-solar-farm` at 50% 60%, "The home drone low over a solar farm row, its tether running back to the pod".

  All captioned.

#### 3. The app · `LandlordStory` (P4) · id `story`, raised

- **Adapts:** ReFresh home's tabbed product band applied to the phone app (states chosen from a list, the app panel beside the scene), with ReFresh's strip underneath. Legora has no counterpart.
- **1440:**
  - `SectionHead` split, then 48.
  - One row with all three columns stretched to the same height, about 404px:
    - columns 1–5: the five-beat disclosure list. Every title fits on one line at this width;
    - columns 6–9: `AppPanel mode="control"`;
    - columns 10–12: the active beat's image (`Picture fit="fill"`) with its caption.
  - No sticky.
  - Then 32 and `FactList` in 4 columns (`termStyle="strong"`) of `homesPage.app.items`, with no label.
  - About 850px.
- **390:** `SectionHead` stacked; the beat list with the image at 4:3 inside the open beat (as built); 32; `AppPanel`; 32; `FactList` in one column.
- **Copy:**
  - H2 `landlordStory.headline` "Your property. Wherever you are." with emphasis "Wherever you are.";
  - intro `landlordStory.intro`;
  - the five `landlordStory.beats`;
  - panel strings from `appPanel` (new; the table in B6).
- **Media:** `y1-story-before` (beats 1 and 2), `y2-story-panels`, `y3-story-driveway` and `y5-story-done`, each with alt = the beat title, captioned.
- **Interaction:**
  - One shared state (the active beat index 0–4). A beat button sets it; the panel's button advances it by one (and "Start again" returns to 0).
  - The image and the panel follow it, and the status line announces each change.
  - The beats keep PR 9's semantics exactly: `h3.text-h3 > button`, `aria-expanded`, `aria-controls`, `aria-disabled` on the open one, regions with `aria-labelledby`, inactive regions `hidden`, ids `story-{app}` and `story-panel-{app}`, numbers `aria-hidden`.
  - The disclosures stay on phones.

#### 4. In Australia · `StatBand kind="cited"` · id `australia`, ink

- **Copy:**
  - H2 `homesPage.statsHeadline` "Why it matters in Australia."
  - Intro `homesPage.statsIntro` (new): "Two cited figures about the homes the system is designed for."
  - Items: `australiaStats` in the order `abs-renting` (30.6%), then `cer-rooftop` (1 in 3), each with its label, source and link.
  - The cited note.
  - Action (`inverse`) `homesPage.statsAction` "I own rentals" → ?type=landlord.

#### 5. Questions · `Faq` · id `faq`, plaster

- **Copy:** the heading, intro and link from `platformFaq`, with the link "Register interest" → ?type=homeowner. Items `faqSets.homes`: surfaces, water, attend, operating, cost.

#### 6. Siblings · `SiblingCards current="homes"` · id `more`, sunken

- **Cards:** Commercial system (`c1-commercial-hero`) and Solar (`so1-solar-hero`).

#### 7. Register · `CtaPanel` · id `register`

- **Copy** (`homesPage.close`, moved from the page file):
  - H2 "Tell us about your property."
  - Body "Homes, apartments, rental properties and solar farms. We are pre-launch and reply personally."
  - Primary "Register interest" → ?type=homeowner; link "I own rentals" → ?type=landlord.
- **Media:** `so2-solar-closeup`, alt "Water beading on a clean solar panel". This replaces today's second use of `m3`.

---

### C5. `/solar` (ReFresh feature page; 6 sections)

**Order and tone:**

| # | Section | Tone |
|---|---|---|
| 1 | Hero | raised |
| 2 | What soiling costs | ink |
| 3 | How Lienry cleans panels | plaster |
| 4 | Questions | raised |
| 5 | Siblings | sunken |
| 6 | Register | plaster, with the panel |
| — | Footer | sunken |

**Media:** `so1-solar-hero`, `so2-solar-closeup`, `p5-solar-farm`, `y2-story-panels`, `c1-commercial-hero`, `ho1-homes-hero`, `m3-pod-master`.

#### 1. Hero · `PageHeroSplit`

- **Copy:**
  - H1 `solarPage.headline` "A cleaner surface for solar." with emphasis "for solar.";
  - lead `solarPage.lead`;
  - primary "Register interest" → ?type=homeowner;
  - secondary "See the home system" → /homes-and-rentals.
- **Media:** `so1-solar-hero` as a 16:9 crop at 50% 50%, alt "A solar farm row at first light with the Lienry drone low over the panels", captioned.

#### 2. What soiling costs · `StatBand kind="cited"` · id `soiling`, ink

- **Adapts:** ReFresh's statement band. It moves up from ReFresh's late position because on this page the problem is the argument.
- **Copy:**
  - H2 `solarPage.statsHeadline` "What soiling costs." (no italic);
  - intro `solarPage.statsIntro`, trimmed to its first sentence: "These figures are from peer-reviewed and international sources; each is cited." The cited note says the rest.
  - Items `solarStats` in the order `unsw-soiling`, `iea-soiling`, `joule-soiling`;
  - the cited note;
  - no action: the hero's is 600px above.

#### 3. How Lienry cleans panels · `Switcher` (foundation) · id `how`, plaster

- **Adapts:** ReFresh's sub-feature switcher, the same device /platform and /commercial use. It is this page's demonstration: one image-and-text panel per way the home system treats solar, driven by click and keyboard.
- **1440:** as `Switcher` in B6. About 775px. **390:** a 3-column underline tab grid, then the panel stacked.
- **Copy:**
  - H2 `solarPage.how.headline` "The right pressure, on your schedule." with emphasis "on your schedule." (italic 2 of 2 on this page);
  - intro (new) "The home system cleans rooftop panels and solar farm rows from the same ground pod.";
  - `tabsLabel` "How the home system cleans panels";
  - items (ids, tabs and labels new; titles and bodies from `solarPage.how.items`; facts new):

  | Id | Tab | Label | Title and body | Facts (term: text) | Image |
  |---|---|---|---|---|---|
  | `panels` | Panels | 01 · Panels | "It knows a panel is a panel" | Material: "Identified during the clean"; Pressure: "Set for solar glass, adjustable in the app"; Water: "Fed through the tether, so the drone never carries it" | `so2-solar-closeup`, 50% 50%, "Water beading on a solar panel" |
  | `roofs-and-farms` | Roofs and farms | 02 · Roofs and farms | "Roofs and farms" | Rooftops: "The home system, working from a ground pod"; Solar farms: "The same pod and tether"; People on site: "None during a clean" | `p5-solar-farm`, 50% 60%, "The home drone passing low over a row of solar panels" |
  | `interval` | Your interval | 03 · Your interval | "Your interval" | Interval: "How often the drone checks and cleans"; Changes: "Adjust it in the app whenever conditions change"; Start: "Start a clean yourself from the app, from anywhere" | `y2-story-panels`, 50% 45%, "The home drone over rooftop panels, half the array already clean" |

  All captioned. No links in the panels (the hero and the close carry the actions).

#### 4. Questions · `Faq` · id `faq`, raised

- **Copy:** the heading, intro and link from `platformFaq`, with the link "Register interest" → ?type=homeowner. Items `faqSets.solar`: surfaces, decide, water, operating, cost.

#### 5. Siblings · `SiblingCards current="solar"` · id `more`, sunken

- **Cards:** Commercial system (`c1-commercial-hero`) and Home system (`ho1-homes-hero`).

#### 6. Register · `CtaPanel` · id `register`

- **Copy** (`solarPage.close`, moved from the page file):
  - H2 "Rooftop or solar farm, tell us about it."
  - Body "We are pre-launch. Register interest and we will let you know as the pilot program takes shape."
  - Primary "Register interest" → ?type=homeowner; link "See the home system" → /homes-and-rentals.
- **Media:** `m3-pod-master` at 35% 50%, alt "The Lienry ground pod open beside a garden tap, the home drone inside".

**Removed from this page:** the rooftop band (see D).

---

### C6. `/company` (ReFresh about page, left aligned; 5 sections)

**Order and tone:**

| # | Section | Tone |
|---|---|---|
| 1 | Statement | raised |
| 2 | Where we are | plaster |
| 3 | How we work | raised |
| 4 | Founders and what is next | sunken |
| 5 | Investors | plaster, with the panel |
| — | Footer | sunken |

**Media:** `co1-company`, `s6-automation`, `f3-surface`, `m2-capsule-master`.

#### 1. Statement · `Band as="header" tone="raised" pad="page"` with `SectionHead as="h1" size="h1" reveal={false}` (P5)

- **Adapts:** ReFresh's about opening (a statement over one wide image), left aligned. The statement moves off the serif.
- **1440:**
  - The H1 in columns 1–7; the aside (columns 8–12) holds the statement in `text-lead` ink through `SectionHead`'s `action` slot (its `intro` is `text-body muted`), bottom-aligned with the H1.
  - 48, then `co1-company` at 21:9 across the full grid (1,392×597) with `priority`, captioned.
  - About 1,040px (a media hero).
- **390:** H1, statement, image at 21:9, caption.
- **Copy:** H1 `companyPage.headline` "Built in Sydney for the buildings people own." with emphasis "for the buildings people own."; statement `companyPage.statement`.
- **Media:** `co1-company`, alt `companyPage.heroAlt` "A harbour-side street of mid-rise buildings at dawn".

#### 2. Where we are · `FeatureRow side="left"` · id `where`, plaster

- **Adapts:** ReFresh's about narrative block (a heading and text beside a photograph), with its strip as the fact list.
- **Copy:**
  - title `companyPage.where.headline` "Concept stage, pre-seed, pilot in preparation.";
  - body `where.body` (new) "Everything on this site describes the design. None of it is in service yet.";
  - facts: the four `where.items` (term = title, text = body).
- **Media:** `s6-automation` at 50% 40%, alt "The roof capsule open at dawn, the drone rising from its cradle", captioned.

#### 3. How we work · `FeatureRow side="right"` · id `values`, raised

- **Copy:**
  - title `companyPage.values.headline` "Three rules we build by.";
  - body `values.body` (new) "The rules behind every decision on the platform and on this site.";
  - facts: the three `values.items` (`termStyle="strong"`).
- **Media:** `f3-surface`, alt "The drone's spray bar, pad and roller on a pane of glass", captioned.

#### 4. Founders and what is next · `Band tone="sunken"` holding two two-column blocks · id `founders`

- **Adapts:** ReFresh's about blocks (a heading on one side, the text on the other) and its founders row. Founders appear as text only until real photographs exist; no generated portraits.
- **Landmarks:** the band is `aria-labelledby` Block A's H2; Block B is its own nested `section` labelled by its H2.
- **1440:**
  - **Block A:** `SectionHead` split. H2 `companyPage.founders.headline` "Two founders, one building at a time." The aside `action` is a `FounderList` of the published people: the name as `h3.text-h3`, 4, the title (`text-small muted`), 8, the bio (`text-body`).
  - 48, then a hairline.
  - **Block B:** `SectionHead` split. H2 `companyPage.exploring.headline` "What we are exploring." The aside has the label `exploring.eyebrow` "In development" and the intro `exploring.body`. This is the hose-free idea's single required mention.
  - About 440px, with no image.
- **390:** the blocks stack.
- **Copy:**
  - `companyPage.founders.people` (restructured): Liam Kennedy, "Founder and CEO", bio "Liam leads Lienry Drones from Sydney with his co-founder.", `published: true`.
  - The co-founder entry is kept with `published: false` and empty strings. It is not rendered until the owner supplies a name and title.
  - A `photo` renders above a name only when the owner supplies a real photograph. The slot stays in code, and there is never a placeholder box.

#### 5. Investors · `CtaPanel` · id `investors`

- **Adapts:** ReFresh's about closing card. It also fills the backers slot honestly: no investor names, logos or amounts.
- **Copy:**
  - H2 `companyPage.investors.headline` "Talk to us about the pre-seed round.";
  - body `investors.body` followed by `investors.note` (new) "Liam Kennedy, our founder and CEO, replies directly.";
  - primary `investors.cta` "Investor enquiries" → ?type=investor;
  - links "Register interest" → /register-interest and "Book a pilot conversation" → ?type=commercial.
- **Media:** `m2-capsule-master` at 50% 50%, alt as in C1 section 3.

---

### C7. `/register-interest` (1 band)

- **Adapts:** the ask alone on its page, context left and form right, as both references do.
- **Layout:** `Band tone="plaster" pad="page"`.
- **1440:**
  - Columns 1–5, a flex column: H1 `registerPage.headline` (no italic), 20, lead `registerPage.lead`, 40, the three-route `dl` (unchanged), 32, then `registerPage.image` as `Picture fit="fill" minHeight="16rem"`, stretching the column to the form's bottom.
  - Columns 7–12: `EnquiryForm`, untouched.
- **390:** H1, lead, routes, form, with no image.
- **Media:** `h0-hero-still` at 60% 50%, alt "The Lienry drone washing a glass curtain wall, its tether rising to the roof", captioned. This keeps the left column from ending about 400px above the form.
- **Behaviour:** unchanged:
  - fieldset and legend, with `?type=` preselecting;
  - labels and autocomplete;
  - zod validation with `aria-invalid` and `aria-describedby`, and focus moving to the first invalid field;
  - `aria-busy` while sending;
  - `role="alert"` and `role="status"` messages;
  - the honeypot and the privacy note;
  - the 503 without a webhook.

### C8. `/privacy` (global changes only)

- `Band tone="plaster" pad="page"` on the new rail, split so that no heading sits beside an empty half (a 45ch column alone in the 1,392px grid would leave about 900px of empty paper beside it):
  - columns 1–4: the H1 (H1 step, no italic), 16, the "Last updated" line and "Template for legal review before launch." (`text-caption muted`), 24, an in-page index of the six section titles as tertiary anchor links, 44px each. Nothing is sticky;
  - columns 5–10: the prose at 45ch, each section title an `h2.text-h3` with its own id, 32 between sections.
- **390:** H1, note, index, prose.
- Both columns carry `data-col`.

### C9. Media map (all 29 manifest assets; none twice on a page)

| Id | Where |
|---|---|
| `h1-hero-film` | Home hero |
| `h0-hero-still` | Home hero poster; /platform hero; /commercial pilot panel; /register-interest |
| `c2-commercial-clip` | Home film band; /commercial hero |
| `c1-commercial-hero` | Home film poster; /commercial hero poster; sibling card on /homes-and-rentals and /solar |
| `m1-drone-master` | Home stage (Drone); /platform switcher (Drone) |
| `m2-capsule-master` | Home product card; /platform commercial row; /commercial step Install; /company investors panel |
| `m3-pod-master` | Home product card; /platform home row; /homes-and-rentals step 01; /solar panel |
| `s1-dock` | Home stage; /platform switcher; /commercial cost row |
| `s2-tether` | Home stage; /platform switcher |
| `s4-scan` | Home stage; /platform switcher; /commercial step Scan |
| `s5-software` | Home stage; /platform switcher; /commercial step Run |
| `s6-automation` | Home stage; /platform switcher; /commercial step Re-scan; /company where row |
| `p1-tower`, `p2-apartments` | Home places |
| `p3-house`, `p4-rental` | Home places; /homes-and-rentals steps 02 and 03 |
| `p5-solar-farm` | Home places; /homes-and-rentals step 04; /solar card |
| `y1-story-before`, `y3-story-driveway`, `y5-story-done` | /homes-and-rentals story |
| `y2-story-panels` | /homes-and-rentals story; /solar card |
| `f1-tether`, `f2-camera`, `f4-dock` | Home safety |
| `f3-surface` | Home safety; /company values row |
| `ho1-homes-hero` | Home closing panel; /homes-and-rentals hero; sibling card on /commercial and /solar |
| `so1-solar-hero` | /solar hero; sibling card on /commercial and /homes-and-rentals |
| `so2-solar-closeup` | /solar card; /homes-and-rentals register panel |
| `co1-company` | Home founder band; /company statement |

Beyond the manifest, only these existing files are used: `public/video/software-view-*` (recordings of the coded model, inside the window only), `public/brand/*`, `public/og.png` and the icons. Nothing is generated, added or replaced.

---

## D. Removed or merged from today's site, and why

### Home

1. **`SystemExplainer` becomes `SystemStage`.** The six disclosures now sit in a full-width stage whose height follows its tallest part, instead of a 757×568 sticky picture beside a serif list. Nothing is sticky, all six names stay visible, and the stage follows the software instead of opening the page. Rows go from 64px to at least 48px, still above the 44px target, so the band stays within one screen.
2. **`SoftwareView` is split** into the shared `SoftwareWindow` and `SoftwareBand`. It keeps every behaviour and gains the step tabs, the poster underlay, a shorter canvas, a tighter camera and an honest recording mode. It moves to straight after the product cards.
3. **`TwoSystems` becomes `ProductCards`.** Two 648px columns with four-point lists become three cards, and the app gets its own card. The points move to /platform's rows, beside the systems they describe. Both docks now show in the second screen; today the pod first appears 3.7 screens down.
4. **`PlacesCarousel` becomes `PlacesRow`.** Four places show at once from 1024 (PR 9 showed three at 432px; five-up would shrink each drone to about 40px), each card links to its system page, and the fifth is one step along the `SnapTrack`, whose buttons, label and keyboard behaviour work at every width.
5. **`LandlordStory` leaves home.** It stays on /homes-and-rentals, where it already appears, and its panel now drives it. On home it cost 1,040px and duplicated the software band's job; home keeps the app as its third product card.
6. **`Counters` becomes `FactRow` under the film band.** A 545px band that was 49% padding, with five facts said elsewhere on the page, becomes three numerals attached to the film that introduces them. "5 surfaces" and "2 systems" are dropped because the stage and the cards say them.
7. **`VisionLetter` becomes `FounderBand`.** The empty 256×320 photo box, "Photo of Liam Kennedy to come" and "Co-founder / Name and title to come" all go, and `co1-company` fills the image slot.
8. **`Safety` becomes a ruled table** with the image at the bottom of each cell. The status line moves beside the heading; it used to sit alone in an otherwise empty 1,000px row. On phones the four cells scroll sideways instead of stacking 2,425px.
9. **`ClosingCta` becomes a `CtaPanel`.** This removes the 1:1 crop with about 68px of dead space above and below it, the 262px dead gutter (which PR 9 had brought back after b603ed0 removed it at the owner's request), and the page's second use of `m3`.
10. **A short FAQ is added** before the close.
11. **The hero's hard-coded "Explore the system"** becomes `hero.secondary.label`.

### Inner pages

12. **`PageHero` becomes `PageHeroSplit`.** The stacked hero left about three quarters of its first screen empty, and a 133px spacer div followed it on four pages. Both go.
13. **`AlternatingRows` becomes a `Switcher` plus two system `FeatureRow`s.** The old rows took 38% of /platform with six 544px images on a 1,120px rail, and repeated the explainer's six images. The uppercase labels above row headings go with them, so no label sits above a section heading anywhere.
14. **/platform's `FilmBand` is removed.** It repeated the hero shot (`h1`/`h0`) on the same page.
15. **`SpecTable` becomes the ink `SpecBand`** in a 3×3 grid. The old table left a 480px empty column.
16. **`CtaBlock` becomes `CtaPanel`, or `CtaWithProduct` on /platform.** On three pages it was a dark band with an empty right half, and its primary button looked the same as its secondary.
17. **Text-only `Steps`** become a `Switcher` on /commercial and `StepCards` on /homes-and-rentals.
18. **`Tiles` merge into the blocks they describe.**
    - The commercial software tiles become the strip under the real window.
    - The homes app tiles become the strip under the app story. The heading "Made for the way you own property." is retired.
    - The solar tiles become image cards.
    - Company "where" and "values" become `FeatureRow` facts.
19. **`StatsBlock` becomes the ink `StatBand`,** one per page.
20. **The /solar rooftop band is removed.** Its CER figure stays on /homes-and-rentals, where it is cited. Its sentence is covered by the "Roofs and farms" card. `so2` moves into the cards.
21. **The /company founders section** loses its two empty photo boxes and "to come" copy. It becomes a text-only row listing Liam, with the photo slot kept in code.
22. **The /company serif statement paragraph** becomes `text-lead` Inter beside the H1, because the serif is for headings.

### System

23. **Spacing and widths.** `--section-y` (133px) becomes `--band-y` (96px) plus tone changes. The margins go from 40/20 to 24/16, and the grid from 84rem to 87rem. `--container-rows` and `--container-statement` go.
24. **The footer wordmark** was set at 12vw (173px), off the scale and larger than the promise. It moves to the display step.
25. **Labels and names.**
    - The ignored `eyebrow` props and content keys go.
    - Every commercial pilot link reads "Book a pilot conversation". The footer said "Book a pilot" and home said "Commercial pilot enquiries".
26. **Dead code deleted:**
    - `ui/Counter.tsx`, the `Wordmark` component, `useActiveStep` and the unused `lib/motion.ts` exports;
    - `.hairline-y`, `.signature` and `mark-rise`;
    - `PhotoPlaceholder` and the `blocks/` folder.
27. **Defects fixed on the way:**
    - `Section` dropping `aria-label`;
    - the unused `commercialPage.heroVideoId`;
    - the blank canvas before WebGL paints;
    - phone layer buttons that looked pressed while disabled;
    - serif on non-headings (the footer tagline, "Rental, Sydney", the company statement);
    - the app panel's `aria-label` on a role-less `div`, which becomes `role="group"`;
    - `sup` sizes falling off the scale.
28. **Docs.**
    - Correct `docs/SITE-PLAN.md` §3 (line 91) and §8 (line 227), and the introduction of `docs/MEDIA.md` (line 3). They still say the Concept render captions were removed, and that stale note is what led to ca89b8f.
    - Also correct `docs/DESIGN-RESEARCH.md` line 40 (the label "has since been removed on request"), `docs/SITE-PLAN.md` line 86 (sticky media columns and counters) and `README.md` (founder photo placeholders, labelled placeholders for missing assets, and the two preloaded font files, now three).
    - The lead writes every documentation change; package engineers describe doc changes in their notes instead of editing `.md` files.
    - Add this redesign's record to `docs/DESIGN-QA.md`.

### Not adopted from the references

- **Announcement bar.** It adds fixed chrome and would change the briefed header.
- **Pinned scroll stages.** The scrolling brief rules them out.
- **Centred section heads and a centred FAQ column.** The alignment rule rules them out.
- **Pills, chips, arrow discs, translucent overlays, tinted washes and glows.** The shape and effect rules rule them out.
- **Customer logos, testimonials, compliance seals, outcome percentages, press and investor logos, pricing, log in, chat launchers and AI summary pills.** These fail on honesty, or there are no accounts and no live support.
- **A full-screen footer.** It is a band of empty paper.
- **Hand-drawn illustration in the closing card.** No new media is allowed.
- **Count-up numerals.** Nothing shown is a measured result.

---

## E. Acceptance

### E1. Targets

Heights include the header area and the footer; the tolerance is ±8%. Sections are the bands inside `<main>`.

| Route | Sections | 1440 | 390 | Today (1440 / 390) |
|---|---|---|---|---|
| `/` | 12 | ≈ 8,700 (8,000–9,400) | ≈ 11,200 (10,300–12,100) | 11,389 / 14,120 |
| `/platform` | 7 | ≈ 5,850 (5,400–6,300) | ≈ 7,800 (7,200–8,400) | ≈ 8,020 / — |
| `/commercial` | 8 | ≈ 6,450 (5,950–6,950) | ≈ 8,100 (7,450–8,750) | — |
| `/homes-and-rentals` | 7 | ≈ 5,600 (5,150–6,050) | ≈ 6,900 (6,350–7,450) | — |
| `/solar` | 6 | ≈ 4,600 (4,250–4,950) | ≈ 5,200 (4,800–5,600) | — |
| `/company` | 5 | ≈ 4,050 (3,700–4,400) | ≈ 4,550 (4,200–4,900) | — |
| `/register-interest` | 1 | today −70px ±10% | today ±10% | — |
| `/privacy` | 1 | today ±10% | today ±10% | — |

Expected home at 1440:

| Section | Height | Top y |
|---|---|---|
| Hero | 900 | 0 |
| Built for | 72 | 900 |
| Product cards | 870 | 972 |
| Software | 1,150 | 1,842 |
| System stage | 880 | 2,992 |
| Places | 870 | 3,872 |
| Film band | 765 | 4,742 |
| Findings | 320 | 5,507 |
| Founder | 490 | 5,827 |
| Safety | 650 | 6,317 |
| Questions | 625 | 6,967 |
| Closing | 620 | 7,592 |
| Footer | 530 | 8,212 |

### E2. Checks

Each check passes on all eight routes at 1440×900 and 390×844 unless it says otherwise. The scripts are delivered by P7.

1. **Build.** `npm run typecheck`, `npm run lint` and `npm run build` are clean, and `git diff --check` is clean.
2. **No dead space over 48px inside a block** (`npm run check:layout`, `scripts/check-layout.mjs`, Playwright, loaded the same way as `scripts/screenshots.mjs`). For every `[data-band]` except the two film bands:
   - Collect the visible content boxes inside the band's content box (padding excluded): text line rectangles via `Range.getClientRects`; `img`, `video`, `canvas`, `svg`, `button`, `input`, `select` and `textarea`; and any element with a visible border or a background different from the band's (for example the stage sidebar, the app panel, the window).
   - Fail if any horizontal stripe taller than 48px holds no content.
   - Fail if, among siblings marked `data-col`, a column's content ends more than 48px above its tallest sibling. Mark the split columns of `SectionHead`, `FeatureRow`, `Switcher` panels, `FactRow`, `FounderBand`, `LandlordStory`, `CtaPanel` and /register-interest.
   - Repeat with every `Switcher` tab selected, every stage part open and every story beat open.
   - Zero failures, plus a visual pass of every band screenshot.
3. **Band heights.** At 1440 no `[data-band]` is taller than 900px, except the home hero, the software bands (home and /commercial `SoftwareBand`, /platform `CtaWithProduct`), the media heroes (`PageHeroSplit`, the /company statement) and the `pad="page"` bands of /register-interest and /privacy.
4. **Tones.**
   - No two adjacent `data-tone` values are equal.
   - At most one `ink` band and one glass-deep panel per page.
   - The band before the footer is never sunken.
   - Every light-to-light boundary shows the 1px hairline.
5. **Shapes and effects.**
   - Every computed `border-radius` is 0 or 4px.
   - `rg -P "rounded-(?!hard)" src` finds nothing (ripgrep needs `-P` for the look-ahead).
   - No `box-shadow`, `text-shadow`, `filter: blur`, `backdrop-filter` or `background-clip: text` anywhere.
   - The only gradients are the existing hero and film-band scrims and the `.timeline` fill.
6. **Two families.**
   - Every text node's computed family is the Instrument Serif stack (roman or italic) or the Inter stack.
   - Instrument Serif appears only on h1–h3 and their `em`, plus the footer wordmark and the phone menu's links.
   - The only fonts loaded are the three `src/fonts` woff2 files.
7. **Every size on the scale.**
   - Every computed `font-size` is a step at that width:
     - 1440: 83.2, 69.6, 50.4, 30, 19, 16, 14, 13, 12, 96;
     - 390: 52, 44, 36, 24, 17, 16, 14, 13, 12, 56.
   - Every h1, h2 and h3 computes to 30px or more at 1440 and 24px or more at 390.
   - There is no h4–h6 in `<main>` and no `text-[` in `src`.
8. **Case and alignment.** Only `.label` has `text-transform: uppercase`. No text element outside the home hero computes `text-align: center`. Form controls are excluded; native buttons inherit their alignment (B1), and button labels centre by flex.
9. **Italic budget.** On each page, `em` appears exactly as the table in B4 lists. It never appears in an h3, a `summary`, a `p`, a `FeatureRow` title or a closing heading.
10. **Labels.** No `.label` is the element immediately before an h1 or h2 in its container.
11. **No claims.**
    - The rendered text contains none of these, case-insensitive and as whole words: customer(s), client(s), trusted by, partner(s), testimonial, certified, certification, accredited, award, guarantee, savings, saves, ROI, per month, `$`, "price(s)" outside the FAQ cost answer.
    - The allowed sentences are exactly: the FAQ answer to "Is Lienry operating yet?", the FAQ answer to "What does it cost?" and `commercialPage.cost.body` (both say prices are not published before the pilot), the "Honest by default" value (which may say "approvals"), the two cited notes, and the solar stats intro.
    - "Approval" appears only in "We do not claim any approvals" and the "Honest by default" value.
    - Every figure (a `.numeral`, a `StatBand` or `FactRow` value, a window or app readout, or a `SpecBand` value; not digits in running text such as "under 70 metres", "every two days", "12 storeys" or the copyright year) is one of:
      - a `stats.ts` item inside a cited `StatBand`, with its source link and note;
      - a `designFacts` item under "Design intent. Concept stage.";
      - demo data inside the window, the app panel or the specification sheet.
12. **Every image and film captioned.**
    - Every `img` from `/media/` is inside a `figure` whose `figcaption` reads exactly "Concept render", or is the poster of a film frame whose rail reads it.
    - Every `/media/` `video` sits in such a frame.
    - Per route, the number of media frames equals the number of Concept render captions. The stage's six stacked images are one frame.
13. **Coded demos labelled.**
    - Every `SoftwareWindow` shows "Demo data" in its title bar and "Model is illustrative. The software will render each property from its scan." beneath it.
    - `PanelReadouts` keeps "Demo data. These readings are illustrative, not operating specifications."
    - `AppPanel` shows "Demo data" and "Illustrative app interface."
    - The fragment's caption reads "Illustrative app interface. Demo data."
14. **Only the 29 manifest assets.**
    - Every `/media/{id}` in the built HTML and JS is a manifest id, and all 29 appear on the site (C9).
    - No id is visible twice on a route. `display:none` and `[hidden]` copies are ignored, and a film and its own poster count once.
    - `public/media` is written only by `npm run media:fetch`. No file is added to `public/media`, `public/video` or `media-src`.
15. **Crops.** A visual pass at both widths; adjust `position`, never the ratio, when a subject is cut:
    - `m2` and `m3` at 4:3 and in fill rows;
    - `m3` at 4:5 (/homes-and-rentals step 01);
    - `s1`–`s6` and `m1` at about 1.7:1 in the stage and the switchers;
    - `p1`–`p5` at 4:5, and `p5` at 1:1;
    - `y2` at 1:1; `y1`–`y5` in the fill column;
    - `so2` at 1:1 and in the panel;
    - `f1`–`f4` at 4:3;
    - `c1`, `ho1` and `so1` at 2:1 and 16:9;
    - `co1` at 21:9;
    - `h0` at 16:9 and in fill.
16. **Every 22 September accessibility behaviour preserved,** re-tested by keyboard and screen reader:
    - **Skip link and anchors:** the skip link to `#main`; `scroll-padding-top: var(--nav-h)`; `lang="en-AU"`.
    - **Focus:** a 2px glass ring, glass-on-dark inside `.on-dark` and `.on-accent`.
    - **Mobile menu:** burger `aria-expanded` and `aria-controls` with the Open/Close label; `role="dialog"`, `aria-modal` and "Menu" while open; Tab and Shift+Tab wrap; Escape closes and returns focus to the burger; `#main`, the footer and the skip link are `inert`; `<html>` gets `overflow: hidden`; auto-close past 64rem and on link click; `aria-current="page"`; the mark link is "Lienry Drones home".
    - **Header:** transparent white over the hero, solid plaster past 80px, no low-contrast frame between; `.nav-bar { transition: none; }`.
    - **Films:** 44px pause and play on the hero, the film band and the /commercial film; one video decoding at a time; posters only under reduced motion or Save-Data; nothing in the first screen waits for a reveal.
    - **Disclosures** (home stage, /homes-and-rentals story): button in an h3, `aria-expanded`, `aria-controls`, `aria-disabled` on the open one, `role="region"` with `aria-labelledby`, inactive regions `hidden`, numbers and signs `aria-hidden`, rows of 44px or more, Enter and Space.
    - **Native `details`:** the FAQ, the footer on phones and "Inspect panel data" work with JavaScript off.
    - **Gallery (`SnapTrack`):** labelled 44px previous and next buttons, `aria-disabled` at the ends; a focusable, labelled track moved by the arrow keys; native snap and swipe; instant under reduced motion; place-card alt text is title plus body.
    - **Software window:**
      - the `role="group"` "Lienry Desktop, demo window";
      - the "Layers" group with `aria-pressed`, and zone buttons with `aria-pressed` and camera flights (live mode), present from 768 (as a 44px row from 768 to 1023);
      - "Pause preview" and "Play preview", disabled under reduced motion;
      - the "Wash progress" range with End = 100% (live mode);
      - canvas and tooltip `aria-hidden`;
      - `PanelReadouts` with a `select`, an `aria-live` `dl` and a `role="status"` loading line;
      - rotation off on touch;
      - the recording's `aria-label`, with native controls under reduced motion.
    - **App panel:** "Illustrative mobile app, demo data" (now on `role="group"`), with the ticks `aria-hidden`.
    - **Form:** every behaviour in C7.
    - **Landmarks:** every band is `aria-labelledby` its heading or has a forwarded `aria-label`; decorative film images are `alt=""` in `aria-hidden` layers; every target meets WCAG 2.2 SC 2.5.8 (24×24px, or enough spacing), and the new standalone controls (tabs, disclosure rows, `SnapTrack` and stage buttons, `FilmPause`, standalone tertiary links, the app panel's button) are 44px or more. The briefed header, inline links in running text, the desktop footer link lists and the software window's 28px toolbar buttons keep their built sizes.
17. **New interactive parts.**
    - The switcher and software step tabs follow the WAI-ARIA tabs pattern: roving tabindex, arrow keys, Home and End.
    - `/platform#dock` … `#automation` open the right part from a cold load, from `hashchange`, and from clicking the footer's part links while already on /platform.
    - The home software steps are Map, Plan, Clean and Re-scan, and /solar's switcher has Panels, Roofs and farms, and Your interval.
    - The stage's previous and next buttons keep focus and are `aria-disabled` at 01 and 06.
    - The app panel's button advances the shared state and the status line announces it.
    - Everything works by keyboard alone.
18. **axe-core.** Zero WCAG A and AA violations on all eight routes at both widths, as in PR 9. Run it again after opening a disclosure, choosing a tab, advancing the app panel and opening the phone menu. The Concept render caption inside every `CtaPanel` computes to plaster (6.24:1 on glass-deep), never muted-on-dark (2.81:1).
19. **No horizontal overflow.** `document.documentElement.scrollWidth <= clientWidth` at 390 and at 1440, with the menu open and closed. Snap tracks scroll inside themselves.
20. **Header contrast.** `npm run contrast -- public/media/h1-hero-film-poster.jpg` passes all three gates (run `npm run media:fetch` first). The header is pixel-identical to PR 9 over the hero and past 80px.
21. **Motion.**
    - With reduced motion: no video autoplays; no reveal, crossfade or smooth snap runs; the window shows its recording.
    - Without it: scrolling from the hero to the film band never has two videos playing, and `control.active` turns false when the window leaves the screen.
    - No sticky element other than the header, no pinning, no count-up.
22. **Titles.** `<title>` is "Lienry Drones" on every route.
23. **No placeholders.** No "to come", no empty photo box and no `data-media-placeholder` in production output.
24. **One label per enquiry route.** The link text for each destination is identical everywhere:

    | Destination | Label |
    |---|---|
    | /register-interest and ?type=homeowner | "Register interest" |
    | ?type=commercial | "Book a pilot conversation" |
    | ?type=investor | "Investor enquiries" |
    | ?type=landlord | "I own rentals" |

### E3. Delivery

- **Branch.** Work lands on the feature branch `claude/nifty-wozniak-ini85h`. Each package is built on its own local branch and merged into it by the integrator. It goes to the owner as one pull request to `main`. Nothing is pushed straight to `main`.
- **The pull request carries:**
  - 1440×900 and 390×844 screenshots of all eight routes: the top of each page and one frame per band, with the software band on its Wash step and the app story on its progress beat;
  - the heights table from E1, before and after;
  - the output of `check:layout`, `check:rules`, axe and `npm run contrast`;
  - the media map from C9;
  - the documentation corrections from D28 and the new `docs/DESIGN-QA.md` record.
- **Decisions flagged for the owner** (listed in the pull request, all built and all reversible):
  1. The home headline moves from the display step (83px) to the H1 step (70px), with "Nobody on site." in the italic.
  2. The founder photo placeholders are removed, although PR 9 chose to keep them. The home letter carries the `co1` street render. /company lists Liam as text; the co-founder is mentioned in his line and listed once you supply a name and title. The photo slots stay in code for real photographs.
  3. The closing panel on every page except /platform is filled with glass-deep, the deep shade of the link colour. The alternative is ink.
  4. The primary button on ink and glass-deep becomes a plaster fill (`inverse`), so the main action leads on dark.
  5. Content moves to the header's 24px rail on a 1,392px grid (16px margins on phones).
  6. The six parts appear on both home (the stage) and /platform (the switcher, with specification lines).
  7. Home now runs: the product cards straight under the Built-for row, then the working software, then the six-part stage. The landlord story moves off home and stays on /homes-and-rentals, where its panel now drives it.
  8. Every commercial pilot link reads "Book a pilot conversation", including the footer and the home closing panel.
  9. The /solar rooftop band leaves the page; its CER figure stays on /homes-and-rentals.
  10. No uppercase label sits above any section heading, including the platform rows that had them.
  11. Places show four 330px cards on a track at every width, the fifth one step along. PR 9 showed three at 432px; five across would shrink each drone to about 40px.
  12. The footer wordmark moves from 173px, which is off the scale, to the display step (83px at 1440). PR 9 kept it as one large identity line.
  13. FAQ questions move from 30px Instrument Serif to 16px Inter at weight 500, because the serif is for headings only.
  14. The safety renders move from 1:1 squares above the text to 4:3 crops at the bottom of ruled cells.
  15. The home stage has an ink sidebar inside a raised band.
  16. /company keeps "Two founders, one building at a time." and lists Liam alone until the co-founder's name and title are supplied; Liam's line mentions his co-founder. No "to come" text returns.
  17. /solar gains a switcher (Panels, Roofs and farms, Your interval) as its demonstration, and the home software band's steps are Map, Plan, Clean and Re-scan.

---

## F. Build plan

### F1. Packages at a glance

Every file belongs to exactly one package at a time. Three foundation packages come first, then seven page packages build in parallel, then the integrator merges everything and runs the closing step (F9).

| Step | Package | Scope | Where it is built |
|---|---|---|---|
| 1 | F2a · Foundation UI | Tokens, types, primitives, shared sections, the typed software and app stubs, `/dev/kit` | The feature branch, first |
| 1 | F2b · Foundation content | Every content addition and edit in `src/content` | Its own branch, in parallel with F2a; merged before step 2 |
| 2 | F2c · Foundation software | The real `SoftwareWindow`, `SoftwareBand` and `AppPanel` behind the stubs' props, the scene and camera changes, `/dev/kit/software` | The feature branch, in parallel with P1–P7 |
| 2 | P1 · Home composition and new bands | F3 | Its own branch |
| 2 | P2 · Home bands rebuilt in place | F4 | Its own branch |
| 2 | P3 · /platform | F5 | Its own branch |
| 2 | P4 · /commercial, /homes-and-rentals, /solar | F6 | Its own branch |
| 2 | P5 · /company, /register-interest, /privacy | F7 | Its own branch |
| 2 | P6 · Site chrome | F8 | Its own branch |
| 2 | P7 · Checks and screenshots | F8 | Its own branch |
| 3 | Integration and F9 | Merge, closing step, full checks | The feature branch |

**Why the lands never break the build**
- The foundation only adds files, or changes shared ones in backward-compatible ways: new optional props, and deprecated props kept.
- F2a ships `SoftwareWindow`, `SoftwareBand` and `AppPanel` as typed stubs with their final props, each rendering a plain box of its real size. P1, P3 and P4 build and type-check against the stubs while F2c fills them in, and F2c never changes their props.
- F2b edits a few existing keys in place (listed under F2b). Until the owning package lands, the baseline pages render the new values. That interim state is expected and is never shipped.
- P2 and P4 rebuild existing components in place, keeping their export names and call signatures, so P1's new home page and the old pages both compile against them.
- A file still imported by more than one package's baseline pages is deleted only in F9.
- During step 2 the packages check their work with the local QA tools (a build with labelled stand-in media, a rule audit and screenshots). P7's `check:layout` and `check:rules` join at integration.

### F2. Foundation: F2a and F2b first, then F2c

**Files**

| Path | Package | Action | Contents |
|---|---|---|---|
| `src/app/globals.css` | F2a | change | B1, including `button { text-align: inherit; }` and the unlayered `.on-accent .concept-caption` rule |
| `src/lib/fonts.ts` | F2a | change | `instrumentSerifItalic.preload = true`; update its comment |
| `src/lib/types.ts` | F2a | new | `Tone`, `Action`, `ImageRef`, `FilmId`, `PosterId` (B5) |
| `src/lib/hooks.ts` | F2a | change | delete `useActiveStep` (unused) |
| `src/lib/motion.ts` | F2a | change | keep `settle` and `instrument`; delete `reveal`, `revealTransition`, `staggerChildren` |
| `src/components/ui/Band.tsx` | F2a | new | `Band`, `Container` (B5) |
| `src/components/ui/SectionHead.tsx` | F2a | new | `SectionHead`, `Headline`, `SectionAside` (B5) |
| `src/components/ui/Button.tsx` | F2a | change | `inverse`, `onAccent`, `text-caption` for `sm`, tertiary `min-h-11` (B5) |
| `src/components/ui/Picture.tsx` | F2a | change | `fit`, `fillFrom`, `minHeight`, `maxHeight`, `position`, `tone`; empty fallback; `placeholderText` deprecated (B5) |
| `src/components/ui/FilmMedia.tsx` | F2a | new | `useFilm`, `FilmLayer`, `FilmPause` (B5) |
| `src/components/ui/SnapTrack.tsx` | F2a | new | B5, including `from="none"` and `visible` |
| `src/components/ui/MediaCard.tsx` | F2a | new | B5 |
| `src/components/ui/FactList.tsx` | F2a | new | B5 |
| `src/components/ui/Counter.tsx` | F2a | delete | unused count-up |
| `src/components/sections/PageHeroSplit.tsx` | F2a | new | B6 |
| `src/components/sections/Switcher.tsx` | F2a | new | B6, including `hashSync` and same-page anchor clicks |
| `src/components/sections/FeatureRow.tsx` | F2a | new | B6 |
| `src/components/sections/Faq.tsx` | F2a | new | B6 |
| `src/components/sections/CtaPanel.tsx` | F2a | new | B6 |
| `src/components/software/SoftwareWindow.tsx` | F2a stub, then F2c | new | F2a: the typed stub (`SoftwareWindowProps`, `useSoftwareLive`) rendering a plain 4px box of the window's real size (about 672px tall from 1024) with "Demo data" and the illustrative-model note. F2c: the window extracted from `home/SoftwareView.tsx` with changes 1–6 (B6) |
| `src/components/software/SoftwareBand.tsx` | F2a stub, then F2c | new | F2a: the typed stub, laid out with `SectionHead`, the static step list and the window. F2c: the full band with step tabs (B6) |
| `src/components/app/AppPanel.tsx` | F2a stub, then F2c | new | F2a: the typed stub (`AppPanelProps`, `AppState`). F2c: B6 |
| `src/components/software/PanelReadouts.tsx` | F2c | new | moved copy of `home/PanelReadouts.tsx`, unchanged |
| `src/components/three/SoftwareScene.tsx` | F2c | change | optional `onFirstFrame` prop (B6, change 2) |
| `src/components/three/software/layout.ts` | F2c | change | overview framing (B6, change 5) |
| `src/content/home.ts` | F2b | change | shapes below |
| `src/content/pages.ts` | F2b | change | shapes below |
| `src/content/software.ts` | F2b | change | shapes below |
| `src/app/dev/kit/page.tsx` | F2a | new, temporary | a `noindex` route rendering every B5 and B6 foundation component with existing content or sample props, so packages can see them working; excluded from the checks; deleted in F9 |
| `src/app/dev/kit/software/page.tsx` | F2c | new, temporary | a `noindex` route showing the real window on every preset, the band with its step tabs, and the app panel in both modes; deleted in F9 |

`docs/REDESIGN-SPEC.md` (this document) is committed by the lead before step 1.

**F2b runs in parallel with F2a**, so the content files never import from `src/lib/types` or any component. They stay plain literals whose shapes match: ImageRef-compatible `{ id, alt, position }` objects and Action-compatible `{ label, href }` objects. `FounderEntry` is defined in `pages.ts` and `StepId` in `software.ts`. The film ids are typed `as const` so they satisfy `FilmId` and `PosterId`: `hero.videoId` and `hero.posterId`, `filmBand.videoId` and `filmBand.stillId`, and `commercialPage.heroVideoId` and `commercialPage.heroImageId`. `FilmBand` declares its `videoId` and `stillId` props as `FilmId` and `PosterId` (P2).

**F2b edits these existing keys in place**, and the baseline pages show the new values until their owning package lands: `companyPage.founders.people` (P5), `systemExplainer.tabs[3].readout` and `tabs[5].readout` (P1), `filmBand.body` (P2), `closing.imageId` and `closing.buttons[1]` (P2), and `solarPage.statsIntro` (P4). Everything else is an addition.

**Hero actions and track labels live in content too**, so no page hard-codes them: `platformPage.actions`, `commercialPage.actions`, `homesPage.actions` and `solarPage.actions` as `{ primary, secondary }` with the values in C2–C5, and `places.track`, `safety.track` and `homesPage.steps.track` as `{ label, prevLabel, nextLabel }` with the strings in C1 and C4.

**Content shapes.** Additions only; existing keys and types stay until F9.

```ts
// src/content/home.ts (additions and edits)
hero.emphasis = "Nobody on site.";
propertyStrip.items[i].href = "/commercial" | "/commercial" | "/homes-and-rentals" | "/homes-and-rentals" | "/solar"; // in item order
export const productCards = {
  headline: "The right system for your property.",
  intro: "A roof capsule for commercial buildings under 70 metres, or a ground pod for homes, rentals and solar farms. Both run from the desktop software, and the home system adds a phone app.",
  cards: [
    { meta: "For buildings under 70 metres", title: "Commercial system", body: "A weatherproof capsule on the roof, a tether fed from above, and desktop software that runs the whole building.", link: { label: "Commercial system", href: "/commercial" }, image: { id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", position: "50% 50%" } },
    { meta: "For houses, apartments, rentals and solar farms", title: "Home system", body: "A waterproof ground pod, a drone that knows each material, and an app that starts the clean wherever you are.", link: { label: "Home system", href: "/homes-and-rentals" }, image: { id: "m3-pod-master", alt: "The Lienry ground pod open beside a garden tap, the home drone inside", position: "35% 50%" } },
    { meta: "For the home system", title: "Phone app", body: "Start a clean from another suburb or another country. Choose the areas, and the drone sets the pressure for each material.", link: { label: "See the app", href: "/homes-and-rentals#story" }, fragment: { ariaLabel: "Illustrative phone app, demo data: driveway and solar panels selected, ready to start a clean", note: "Illustrative app interface. Demo data." } },
  ],
};
systemExplainer.emphasis = "Built to clean.";
systemExplainer.tabs[i].alt / .position  // the table in C1 section 5
systemExplainer.tabs[3].readout = "Structure and dimensions, mapped first";
systemExplainer.tabs[5].readout = "Start a clean from anywhere";
places.emphasis = "your property.";
places.intro = "Five kinds of property, one platform. Each card shows which system does the work and opens its page.";
places.cards[i].href = "/commercial" | "/commercial" | "/homes-and-rentals" | "/homes-and-rentals" | "/solar";
filmBand.body = "The capsule stays on the roof between cleans. When the scan says the glass needs it, the drone goes out, washes and comes home. Nobody books it. Nobody attends it.";
export const designFacts = {
  label: "By design",
  note: "Design intent. Concept stage.",
  lead: "Three numbers the commercial system is designed around. They are design intent, not results: Lienry is at concept stage and nothing is in service yet.",
  items: [
    { term: "Re-scan interval", value: "2", unit: "days", text: "between re-scans on commercial buildings, and you can change it" },
    { term: "People on site", value: "0", text: "during a clean" },
    { term: "Building height", value: "<70", unit: "m", text: "the commercial system is designed for buildings under 70 metres" },
  ],
};
landlordStory.emphasis = "Wherever you are.";
export const appPanel = {
  property: "Rental, Sydney",
  prompt: "Choose the areas for this clean",
  rows: ["Driveway", "Solar panels", "Windows"],
  rowState: { select: "Selected", start: "Starting", progress: ["31%", "64%"], done: "Complete" },
  buttons: { map: "Choose surfaces", select: "Start clean", start: "See progress", progress: "See the finished clean", done: "Start again" },
  status: { map: "Choose the areas for this clean.", select: "Driveway and solar panels selected.", start: "Clean started.", progress: "Cleaning in progress: driveway 31%, solar panels 64%.", done: "Clean complete." },
  note: "Illustrative app interface.",
};
closing.imageId = "ho1-homes-hero";
closing.imageAlt = "The Lienry ground pod beside a house at first light, the drone washing a window";
closing.imagePosition = "60% 50%";
closing.buttons[1].label = "Book a pilot conversation";
```

```ts
// src/content/pages.ts (additions and edits)
export type FounderEntry = { name: string; title: string; bio: string; photo: null | { src: string; alt: string; width: number; height: number }; published: boolean };
platformPage.emphasis = "Six parts.";
platformPage.heroAlt = "The Lienry drone finishing a glass wash at first light";
platformPage.partsSection = { headline: "How the six parts fit together.", emphasis: "fit together.", tabsLabel: "The six parts" };
platformPage.partFacts = { dock: { facts, link }, tether: { facts }, drone: { facts }, scan: { facts, link }, software: { facts, link }, automation: { facts, link } }; // the table in C2 section 2
platformPage.rows = {
  commercial: { title: "Commercial system", body: "A roof capsule for buildings under 70 metres. The drone lives on the roof, fed from above, and the whole building runs from the desktop software.", link: { label: "The commercial system", href: "/commercial" }, image: { id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", position: "50% 50%" } },
  home: { title: "Home system", body: "A ground pod for homes, rentals and solar farms. The pod powers the drone and feeds it water, and you start a clean from your phone wherever you are.", link: { label: "The home system", href: "/homes-and-rentals" }, image: { id: "m3-pod-master", alt: "The Lienry ground pod open beside a garden tap, the home drone inside", position: "35% 50%" } },
};
platformPage.specs.intro = "Design intent at concept stage. None of it has been tested in service yet.";
platformPage.close = { headline: "Be part of the first buildings.", body: "Register interest for your property, or book a conversation about the commercial pilot program.", primary: { label: "Register interest", href: "/register-interest" }, secondary: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" } };
platformFaq.items[i].id = "surfaces" | "height" | "water" | "decide" | "attend" | "operating" | "cost"; // in item order
platformFaq.intro = "Straight answers, including what we cannot claim yet.";
platformFaq.link = { label: "Register interest", href: "/register-interest" };
export const homeFaqLink = { label: "All questions", href: "/platform#faq" };
export const faqSets = {
  home: ["water", "height", "attend", "operating", "cost"],
  platform: ["surfaces", "height", "water", "decide", "attend", "operating", "cost"],
  commercial: ["height", "water", "decide", "attend", "operating", "cost"],
  homes: ["surfaces", "water", "attend", "operating", "cost"],
  solar: ["surfaces", "decide", "water", "operating", "cost"],
} as const;
commercialPage.emphasis = "on the roof.";
commercialPage.heroAlt = "The Lienry roof capsule on a plant deck at dawn, the drone rising from its cradle";
commercialPage.steps.emphasis = "then it runs itself.";
commercialPage.steps.intro = "From an empty roof to a building that decides when it needs a clean.";
commercialPage.steps.tabsLabel = "Steps";
commercialPage.steps.items[i].tab / .image / .facts   // the table in C3 section 2
commercialPage.byDesign = { headline: "Designed around three numbers.", intro: "Design intent for the pilot, not results." };
commercialPage.cost.points = ["No crews to book for each visit", "No access equipment to arrange at height", "No waiting for a slot: the re-scan decides when a clean is due", "The building is planned, tracked and reported in one place"];
commercialPage.cost.image = { id: "s1-dock", alt: "The Lienry roof capsule lid closing on a wet roof", position: "50% 55%" };
commercialPage.pilot.image = { id: "h0-hero-still", alt: "The Lienry drone washing a glass curtain wall, its tether rising to the roof", position: "50% 50%" };
commercialPage.pilot.links = [{ label: "Investor enquiries", href: "/register-interest?type=investor" }];
homesPage.emphasis = "from anywhere.";
homesPage.heroAlt = "The Lienry ground pod beside a house at first light, the drone washing a window";
homesPage.steps.intro = "Four steps from a new pod to a clean you start from your phone.";
homesPage.steps.items[i].image   // the list in C4 section 2
homesPage.statsIntro = "Two cited figures about the homes the system is designed for.";
homesPage.statsAction = { label: "I own rentals", href: "/register-interest?type=landlord" };
homesPage.close = { headline: "Tell us about your property.", body: "Homes, apartments, rental properties and solar farms. We are pre-launch and reply personally.", primary: { label: "Register interest", href: "/register-interest?type=homeowner" }, links: [{ label: "I own rentals", href: "/register-interest?type=landlord" }], image: { id: "so2-solar-closeup", alt: "Water beading on a clean solar panel", position: "50% 50%" } };
solarPage.emphasis = "for solar.";
solarPage.heroAlt = "A solar farm row at first light with the Lienry drone low over the panels";
solarPage.statsIntro = "These figures are from peer-reviewed and international sources; each is cited.";
solarPage.how.emphasis = "on your schedule.";
solarPage.how.intro = "The home system cleans rooftop panels and solar farm rows from the same ground pod.";
solarPage.how.tabsLabel = "How the home system cleans panels";
solarPage.how.items[i].id / .tab / .label / .facts / .image   // the table in C5 section 3 (ids panels, roofs-and-farms, interval)
solarPage.close = { headline: "Rooftop or solar farm, tell us about it.", body: "We are pre-launch. Register interest and we will let you know as the pilot program takes shape.", primary: { label: "Register interest", href: "/register-interest?type=homeowner" }, links: [{ label: "See the home system", href: "/homes-and-rentals" }], image: { id: "m3-pod-master", alt: "The Lienry ground pod open beside a garden tap, the home drone inside", position: "35% 50%" } };
companyPage.emphasis = "for the buildings people own.";
companyPage.heroAlt = "A harbour-side street of mid-rise buildings at dawn";
companyPage.founders.people = [
  { name: "Liam Kennedy", title: "Founder and CEO", bio: "Liam leads Lienry Drones from Sydney with his co-founder.", photo: null, published: true },
  { name: "Co-founder", title: "", bio: "", photo: null, published: false },
] satisfies FounderEntry[];
companyPage.where.body = "Everything on this site describes the design. None of it is in service yet.";
companyPage.where.image = { id: "s6-automation", alt: "The roof capsule open at dawn, the drone rising from its cradle", position: "50% 40%" };
companyPage.values.body = "The rules behind every decision on the platform and on this site.";
companyPage.values.image = { id: "f3-surface", alt: "The drone's spray bar, pad and roller on a pane of glass", position: "50% 50%" };
companyPage.investors.note = "Liam Kennedy, our founder and CEO, replies directly.";
companyPage.investors.links = [{ label: "Register interest", href: "/register-interest" }, { label: "Book a pilot conversation", href: "/register-interest?type=commercial" }];
companyPage.investors.image = { id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", position: "50% 50%" };
registerPage.image = { id: "h0-hero-still", alt: "The Lienry drone washing a glass curtain wall, its tether rising to the roof", position: "60% 50%" };
export const siblings = {
  headline: "The rest of the platform.",
  intro: "Both systems share one platform: the scan, the desktop software and a clean with nobody on site.",
  link: { label: "See the platform", href: "/platform" },
  cards: {
    commercial: { title: "Commercial system", body: "A roof capsule for commercial buildings under 70 metres.", href: "/commercial", image: { id: "c1-commercial-hero", alt: "The Lienry roof capsule on a plant deck at dawn", position: "60% 55%" } },
    homes: { title: "Home system", body: "A ground pod for homes, rentals and solar farms, run from your phone.", href: "/homes-and-rentals", image: { id: "ho1-homes-hero", alt: "The Lienry ground pod beside a house at first light", position: "60% 50%" } },
    solar: { title: "Solar", body: "Panels cleaned at the right pressure, on the interval you set.", href: "/solar", image: { id: "so1-solar-hero", alt: "A solar farm row at first light with the Lienry drone low over the panels", position: "50% 50%" } },
  },
};
```

```ts
// src/content/software.ts (additions)
export type StepId = "map" | "plan" | "clean" | "rescan";
export const softwareSteps: { id: StepId; tab: string; caption: string; hint?: string; short: string }[]; // the table in C1 section 4
export const softwareDefaultStep: StepId = "clean";
export const softwareStepsLabel = "Software steps";
```

`src/content/stats.ts` is unchanged: `solarStats` (`iea-soiling`, `unsw-soiling`, `joule-soiling`) and `australiaStats` (`cer-rooftop`, `abs-renting`).

**Done means**
- **F2a:** every B5 and B6 foundation component exists with exactly the props in B5 and B6 and renders correctly on `/dev/kit` at 1440 and 390; the three stubs type-check with their final props; every baseline route still builds and renders (the only change on those routes is the new rail, rhythm and hairlines); `npm run contrast` passes, because `Button` changed; typecheck, lint and build are clean.
- **F2b:** every content addition in F2 and section C compiles and matches the spec's copy exactly; every media id is in the manifest and every stat in `stats.ts`; typecheck and lint are clean.
- **F2c:** on `/dev/kit/software` the window shows the poster until its first frame, meets the 70–85% camera target, applies all four presets, keeps the zone buttons from 768 in live mode, and shows the honest recording mode at 390 and under reduced motion; the app panel's five states and status lines work by keyboard; the stubs' props are unchanged; typecheck, lint and build are clean.

### F3. P1 · Home: composition and new bands

| Path | Action |
|---|---|
| `src/app/page.tsx` | change: the 12 sections in C1 order |
| `src/components/home/ProductCards.tsx` | new (C1 section 3) |
| `src/components/home/SystemStage.tsx` | new (C1 section 5) |
| `src/components/home/PlacesRow.tsx` | new (C1 section 6) |
| `src/components/home/FactRow.tsx` | new (C1 section 8) |
| `src/components/home/FounderBand.tsx` | new (C1 section 9) |
| `src/components/home/TwoSystems.tsx`, `PlacesCarousel.tsx`, `SystemExplainer.tsx`, `SoftwareView.tsx`, `PanelReadouts.tsx`, `Counters.tsx` | delete: only the home page imports them |

The five new components take no props and read content. `page.tsx` renders, in order:
1. `<Hero />`
2. `<PropertyStrip />`
3. `<ProductCards />`
4. `<SoftwareBand id="software" tone="sunken" headline={softwareSection.headline} body={softwareSection.body} steps />`
5. `<SystemStage />`
6. `<PlacesRow />`
7. `<FilmBand {...filmBand} />`
8. `<FactRow />`
9. `<FounderBand />`
10. `<Safety />`
11. `<Faq id="faq" tone="raised" …faqSets.home… />`
12. `<ClosingCta />`

It no longer imports `VisionLetter` or `LandlordStory`.

**Done means:**
- Home sections 3, 4, 5, 6, 8, 9 and 11 match C1 at 1440 and 390.
- The local QA audit and a visual pass at 1440 and 390 are clean for them, with every stage part opened; `check:layout` confirms it at integration.
- The italic budget holds for the stage and the places (P2 verifies the hero's).
- Home media are the 23 ids, each once.
- The stage keeps PR 9's disclosure semantics.
- The FAQ works with JavaScript off.
- Band screenshots at 1440 and 390 are captured for the lead.

### F4. P2 · Home: film, strip, safety and closing bands (rebuilt in place)

| Path | Action | Export and props kept |
|---|---|---|
| `src/components/home/Hero.tsx` | change (C1 section 1) | `Hero()` |
| `src/components/home/PropertyStrip.tsx` | change (C1 section 2) | `PropertyStrip()` |
| `src/components/home/FilmBand.tsx` | change (C1 section 7) | `FilmBand({ videoId, stillId, eyebrow?, headline, body, cta })` |
| `src/components/home/Safety.tsx` | change (C1 section 10) | `Safety()` |
| `src/components/home/ClosingCta.tsx` | change (C1 section 12; renders `CtaPanel` from `closing`) | `ClosingCta()` |

**Done means:**
- The five bands match C1 at both widths.
- The hero scrims are unchanged, and `npm run contrast` passes.
- Hero and film-band pause and play work, one video plays at a time, and only posters show under reduced motion.
- The safety track has keyboard, label and `aria-disabled` behaviour.
- The closing panel's contrasts are those in B5 (plaster 6.24:1, white links 7.16:1).
- The local QA audit and a visual pass at 1440 and 390 are clean for these bands; `check:layout` and `check:rules` confirm it at integration.

### F5. P3 · /platform

| Path | Action |
|---|---|
| `src/app/platform/page.tsx` | change: C2 sections 1–7 |
| `src/components/platform/SpecBand.tsx` | new (B6) |
| `src/components/platform/CtaWithProduct.tsx` | new (B6) |

**Done means:**
- /platform matches C2.
- All six footer part links open the right switcher panel, from a cold load and from in-page links.
- `#demo` reaches the live window.
- The tabs pass the WAI-ARIA pattern.
- No `FilmBand` and no `h0` repeat.
- The local QA audit and a visual pass at 1440 and 390 are clean with every tab selected; `check:layout` and `check:rules` confirm it at integration.

### F6. P4 · Product pages

| Path | Action |
|---|---|
| `src/app/commercial/page.tsx` | change: C3 |
| `src/app/homes-and-rentals/page.tsx` | change: C4 |
| `src/app/solar/page.tsx` | change: C5 |
| `src/components/sections/StepCards.tsx` | new (B6) |
| `src/components/sections/StatBand.tsx` | new (B6) |
| `src/components/sections/SiblingCards.tsx` | new (B6) |
| `src/components/home/LandlordStory.tsx` | change in place: `LandlordStory()` with no props (C4 section 3; uses `AppPanel mode="control"`) |

**Done means:**
- The three pages match C3, C4 and C5.
- The /commercial hero film plays and pauses.
- The switcher, story and step tracks meet their accessibility behaviour.
- The app panel's five states, its status lines, and its shared state with the beats all work.
- Cited stats show sources and the note; design facts show the design-intent note.
- Every sibling card excludes the current page.
- Each page has one ink band and one glass-deep panel.
- The local QA audit and a visual pass at 1440 and 390 are clean with every tab and beat selected; `check:layout` and `check:rules` confirm it at integration.

### F7. P5 · Company, register and privacy

| Path | Action |
|---|---|
| `src/app/company/page.tsx` | change: C6; stops importing `PhotoPlaceholder` |
| `src/app/register-interest/page.tsx` | change: C7 (`Band pad="page"`, image column); `EnquiryForm` untouched |
| `src/app/privacy/page.tsx` | change: C8 |
| `src/components/company/FounderList.tsx` | new: `FounderList({ people }: { people: readonly FounderEntry[] })`, rendering only `published` entries |

**Done means:**
- The pages match C6, C7 and C8.
- No "to come" text and no placeholder box.
- Every form behaviour in C7 is re-tested.
- The /register-interest columns end within 48px of each other at 1440, and /privacy's index and prose sit side by side.
- The local QA audit and a visual pass at 1440 and 390 are clean; `check:layout` and `check:rules` confirm it at integration.

### F8. P6 · Site chrome, and P7 · Checks and screenshots

**P6**

| Path | Action |
|---|---|
| `src/components/site/Nav.tsx` | change: `text-[0.8125rem]` becomes `text-caption`; nothing else |
| `src/components/site/Footer.tsx` | change (B6) |
| `src/components/ui/Wordmark.tsx` | change: delete the unused `Wordmark` component and `Mark`'s `animate` prop; keep `MARK_VIEWBOX`, `MARK_PATHS` and `Mark` |
| `src/lib/site.ts` | change: `footerColumns` "Book a pilot" becomes "Book a pilot conversation" |

**P6 done means:**
- The header is pixel-identical to PR 9 at 1440 and 390, over the hero and past 80px, and `npm run contrast` passes.
- Every menu behaviour in E2 check 16 is re-tested.
- The footer matches B6, with the wordmark on the display step, and its phone groups work without JavaScript.

**P7**

| Path | Action |
|---|---|
| `scripts/check-layout.mjs` | new: E2 checks 2, 3, 4 and 19, with state sweeps |
| `scripts/check-rules.mjs` | new: E2 checks 5–14 and 21–24, including the claims allow-list |
| `scripts/screenshots.mjs` | change: an optional per-band capture into a directory given on the command line (default `docs/screenshots/redesign/`) |
| `package.json` | change: add the `check:layout` and `check:rules` scripts, each taking a base URL. No dependency is added |

Both scripts take the base URL of a served build. They resolve Playwright from the project's `node_modules` first and then from a global install, the way `scripts/screenshots.mjs` does; if neither is found they exit with a clear message naming `npm i -D playwright && npx playwright install chromium`. Adding a dependency would change the lockfile and every Vercel install, so that is left to the owner.

**P7 done means:**
- Both scripts run against a served build of the F2a branch with clear, per-band failure messages, and they sweep the state of every switcher tab, stage part and story beat.
- At integration, after F9, they report zero failures.

### F9. Foundation closing step (after P1–P7 merge)

- **Owner:** the integrator, on the feature branch, after merging P1–P7 (and F2c, which already lives on the feature branch).
- **Delete files:** `src/components/blocks/Blocks.tsx`, `src/components/blocks/PageHero.tsx`, `src/components/blocks/Faq.tsx` (the whole `blocks/` folder), `src/components/ui/Section.tsx`, `src/components/home/VisionLetter.tsx` (with `PhotoPlaceholder`), `src/app/dev/kit/page.tsx` and `src/app/dev/kit/software/page.tsx`.
- **`src/app/globals.css`:** delete `--container-rows`, `--container-statement`, `.section-y` and `--section-y`.
- **`src/components/ui/Picture.tsx`:** delete `placeholderText`.
- **Remove content keys nothing reads any more:**
  - every `eyebrow` except `companyPage.exploring.eyebrow`;
  - `hero.eyebrow`; `propertyStrip.items[].icon`; `counters`; `visionLetter.cofounder`; `platformPage.parts`; `homesPage.app.headline`; `solarPage.closeImageId`.
  - Confirm each with `rg` before removing it.
- **Then run everything:**
  - the full E2 suite;
  - screenshots at both widths;
  - `npm run contrast`;
  - axe on all eight routes;
  - typecheck, lint, build and `git diff --check`.
- **Then the lead** writes the documentation changes in D28 and the `docs/DESIGN-QA.md` record, captures the 1440 and 390 screenshots with the real media, and opens the pull request to `main` with the E3 contents.

**Done means:** every E2 check passes, the E1 heights are within tolerance, and the pull request carries the screenshots, outputs and flagged decisions.
