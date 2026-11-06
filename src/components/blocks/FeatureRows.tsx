import type { ReactNode } from "react";
import type { Action, ImageRef } from "@/lib/types";
import { RowPanel, type RowPanelId } from "@/components/blocks/RowPanel";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";

export type FeatureRowItem = {
  /** The row's anchor id, e.g. "dock". */
  id: string;
  eyebrow?: string;
  title: string;
  paragraphs: readonly string[];
  checks?: readonly string[];
  /** A white card under the text: a title and a short list. */
  callout?: { title: string; items: readonly string[] };
  /** A small muted line under the checks (the cited note beside cited figures). */
  note?: string;
  link?: Action;
  image?: ImageRef;
  /** In place of the image (the software window, the app panel, a figures panel). */
  media?: ReactNode;
  /** A strip of four short facts under the row. */
  facts?: readonly { title: string; text: string }[];
  /** The picture's frame from 1024. Default "4/3"; "16/9" is the wide, shorter frame. Ignored by the
   *  solutions variant, whose pictures are 3:2 from 1024 and 5:4 below. */
  aspect?: "4/3" | "16/9";
  /** The row's pill: the white one (default) or the accent one, both with the arrow badge. */
  linkStyle?: "secondary" | "primary";
  /** Solutions variant only: the media takes 8 of the 12 columns from 1024 and 6 from 1280, the text 4
   *  (the software window, the /homes-and-rentals app demo). Other solutions rows give the text 5 and
   *  the picture 6 from 1024, then the text 4 and the picture 5 from 1280. */
  wideMedia?: boolean;
  /** A static, coded Demo-data card over the row's picture (RowPanel), on the `corner` side away from
   *  the subject (default: the picture's outer side). Never on a software-window or app row.
   *  `solarFirst` lists the solar glass first in the pressure card (/solar). */
  panel?: { id: RowPanelId; corner?: "start" | "end"; solarFirst?: boolean };
};

/**
 * A check: a 20px tint square with the 4px corners and a 1.5px accent tick. On a tinted band (tint,
 * paper, mist) it turns white, so it still reads as a chip; on a white card (`onCard`) it stays tint.
 */
function Check({ onCard = false }: { onCard?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-hard bg-tint text-accent ${onCard ? "" : "in-data-[tone=mist]:bg-white in-data-[tone=paper]:bg-white in-data-[tone=tint]:bg-white"}`}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m4.25 8.25 2.5 2.5 5-5.5" />
      </svg>
    </span>
  );
}

type Cells = { text: string; media: string };

// The default rows (/platform, /fit-check) sit on the page's 12-column grid from 1024, inside the one
// rail (Container): the text in 5 columns and the media in 6, one column apart, the side alternating.
// Both cells share row 1, so the DOM order (text first) stays the reading and phone order whichever side
// the media takes. Below 1024 the text keeps the paragraphs' 30rem measure, so a callout card or the
// check list never runs wider than the copy above it.
const defaultCells = (right: boolean): Cells =>
  right
    ? { text: "lg:col-span-5 lg:row-start-1", media: "lg:col-span-6 lg:col-start-7 lg:row-start-1" }
    : { text: "lg:col-span-5 lg:col-start-8 lg:row-start-1", media: "lg:col-span-6 lg:col-start-1 lg:row-start-1" };

// The solutions chapters run on the calmer measure of columns 2 to 11 from 1280: the text in 4 columns,
// one free, then the picture in 5 (mirrored: the picture in 2-6, the text in 8-11). A wide-media row (the
// software window, the app demo) gives the media 6 columns beside the text's 4, the text held 32px off
// the media's edge. From 1024 to 1279 the rail is too narrow for that measure (a 309px text column, a
// 393px picture under a 256px card, a 172px picture beside the app), so the rows take the full twelve:
// the text in 5 and the picture in 6, or the text in 4 and the wide media in 8.
const solutionCells = (right: boolean, wide: boolean): Cells => {
  if (wide) {
    return right
      ? { text: "lg:col-span-4 lg:row-start-1 lg:pr-8 xl:col-start-2", media: "lg:col-span-8 lg:col-start-5 lg:row-start-1 xl:col-span-6 xl:col-start-6" }
      : { text: "lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:pl-8 xl:col-start-8", media: "lg:col-span-8 lg:col-start-1 lg:row-start-1 xl:col-span-6 xl:col-start-2" };
  }
  return right
    ? { text: "lg:col-span-5 lg:row-start-1 xl:col-span-4 xl:col-start-2", media: "lg:col-span-6 lg:col-start-7 lg:row-start-1 xl:col-span-5" }
    : { text: "lg:col-span-5 lg:col-start-8 lg:row-start-1 xl:col-span-4", media: "lg:col-span-6 lg:col-start-1 lg:row-start-1 xl:col-span-5 xl:col-start-2" };
};

const sizes = {
  default: "(min-width: 1440px) 684px, (min-width: 1024px) 47vw, (min-width: 768px) calc(100vw - 3rem), calc(100vw - 2.5rem)",
  solutions: "(min-width: 1440px) 566px, (min-width: 1280px) 39vw, (min-width: 1024px) 47vw, (min-width: 768px) calc(100vw - 3rem), calc(100vw - 2.5rem)",
};

/**
 * Feature rows: text beside a rounded picture, the side alternating row by row (the first row's
 * picture on the right). Text: the row title at the card step, paragraphs (16/1.6 in the palette's
 * ink-hover, about 10:1, on light bands), a check list (16/1.5 ink, 10 apart, each on a square chip), a
 * white callout card, a small muted note and a pill with its arrow badge. A row may close with four
 * short facts, each over a hairline. A row's `panel` lays a still Demo-data card over its picture.
 *
 * variant "default" (/platform, /fit-check): one band at its own pad, the rows stacked in it; 4:3 or
 *   16:9 pictures; below 1024 the picture follows the text.
 * variant "solutions" (/commercial, /homes-and-rentals, /solar): chapters. Each row is a band of its
 *   own at the feature pad (88 from 1024, 64 below), the tones alternating tint then white from the
 *   word strip down, so a long page reads in steps; from 1280 the rows sit on the calmer measure of
 *   columns 2 to 11; pictures are 3:2 from 1024 and 5:4 below. Below 1024 the text comes first, then
 *   its picture, so on a phone the first picture stays under the fold.
 */
export function FeatureRows({
  id,
  tone = "plaster",
  items,
  startSide = "right",
  pad = "section",
  variant = "default",
  label = "Features",
}: {
  id: string;
  /** The band's tone (default variant). The solutions chapters alternate tint and plaster. */
  tone?: "plaster" | "paper" | "mist";
  items: readonly FeatureRowItem[];
  startSide?: "left" | "right";
  /** "feature" is the platform's 88px row band. Ignored by the solutions variant (always "feature"). */
  pad?: "section" | "feature";
  variant?: "default" | "solutions";
  /** The band's accessible name (default variant). Default "Features". */
  label?: string;
  /** @deprecated Ignored: the site has no eyebrows (owner, 21 October 2026). */
  eyebrow?: string;
}) {
  const solutions = variant === "solutions";

  const picture = (r: FeatureRowItem, image: ImageRef) =>
    solutions ? (
      <Picture
        id={image.id}
        alt={image.alt}
        position={image.position}
        positionMd={image.positionMd}
        positionSm={image.positionSm}
        aspect="3/2"
        aspectMd="5/4"
        aspectSm="5/4"
        rounded="image"
        sizes={sizes.solutions}
      />
    ) : (
      <Picture
        id={image.id}
        alt={image.alt}
        position={image.position}
        positionMd={image.positionMd}
        positionSm={image.positionSm}
        aspect={r.aspect ?? "4/3"}
        aspectSm="4/3"
        rounded="image"
        sizes={sizes.default}
      />
    );

  // The media cell: the picture (or the row's own media), and the row's still card. From 1280 the card
  // sits 24px inside the picture's bottom corner on its side; below 1280 (where the picture is too small
  // to carry it) it follows the picture in the flow, 16px in from that side, rising 40px over the
  // picture's foot, always whole.
  const media = (r: FeatureRowItem, right: boolean) => {
    const own = r.media ?? (r.image ? picture(r, r.image) : null);
    if (!r.panel || r.media || !r.image) return own;
    const end = (r.panel.corner ?? (right ? "end" : "start")) === "end";
    return (
      <>
        {own}
        <div className={`relative z-[1] -mt-10 flex px-4 xl:absolute xl:bottom-6 xl:mt-0 xl:w-[16rem] xl:px-0 ${end ? "justify-end xl:right-6" : "justify-start xl:left-6"}`}>
          <RowPanel id={r.panel.id} solarFirst={r.panel.solarFirst} />
        </div>
      </>
    );
  };

  const row = (r: FeatureRowItem, right: boolean, at: Cells) => (
    <>
      <div className="grid items-center gap-y-10 lg:grid-12 lg:gap-y-0">
        <Reveal className={`max-lg:max-w-[30rem] ${at.text}`}>
          <h2 id={`${r.id}-heading`} className="text-h3">
            {r.title}
          </h2>
          <div className="mt-5 space-y-4">
            {r.paragraphs.map((p) => (
              <p key={p} className="text-body leading-[1.6] text-ink-hover">
                {p}
              </p>
            ))}
          </div>
          {r.checks ? (
            <ul className="mt-7 space-y-2.5">
              {r.checks.map((c) => (
                <li key={c} className="flex gap-3 text-body leading-[1.5] text-fg">
                  <Check />
                  {c}
                </li>
              ))}
            </ul>
          ) : null}
          {r.callout ? (
            <div className="mt-7 rounded-card border border-line bg-white p-5 md:p-6">
              <p className="text-body font-medium leading-[1.5] text-fg">{r.callout.title}</p>
              <ul className="mt-3 space-y-2.5">
                {r.callout.items.map((c) => (
                  <li key={c} className="flex gap-3 text-small leading-[1.5] text-fg-muted">
                    <Check onCard />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {r.note ? <p className="mt-6 text-small leading-[1.5] text-fg-muted">{r.note}</p> : null}
          {r.link ? (
            <Button href={r.link.href} variant={r.linkStyle === "primary" ? "primary" : "secondary"} arrow className="mt-8">
              {r.link.label}
            </Button>
          ) : null}
        </Reveal>
        <div className={`relative ${at.media}`}>{media(r, right)}</div>
      </div>
      {r.facts ? (
        <ul className="mt-14 grid gap-x-(--gutter) gap-y-8 md:grid-cols-2 lg:grid-12">
          {r.facts.map((f) => (
            <li key={f.title} className="border-t border-line pt-5 lg:col-span-3">
              <p className="text-body font-medium leading-[1.5] text-fg">{f.title}</p>
              <p className="mt-1.5 text-small leading-[1.5] text-fg-muted">{f.text}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

  const sideOf = (i: number) => (i % 2 === 0) === (startSide === "right");

  if (solutions) {
    return (
      <>
        {items.map((r, i) => {
          const right = sideOf(i);
          return (
            <Band key={r.id} id={r.id} tone={i % 2 === 0 ? "tint" : "plaster"} pad="feature" labelledBy={`${r.id}-heading`} className="scroll-mt-24">
              <Container>{row(r, right, solutionCells(right, !!r.wideMedia))}</Container>
            </Band>
          );
        })}
      </>
    );
  }
  return (
    <Band id={id} tone={tone} pad={pad} ariaLabel={label}>
      <Container>
        <div className="flex flex-col gap-24 lg:gap-32">
          {items.map((r, i) => {
            const right = sideOf(i);
            return (
              <section key={r.id} id={r.id} aria-labelledby={`${r.id}-heading`} className="scroll-mt-24">
                {row(r, right, defaultCells(right))}
              </section>
            );
          })}
        </div>
      </Container>
    </Band>
  );
}
