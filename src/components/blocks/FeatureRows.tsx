import type { ReactNode } from "react";
import type { Action, ImageRef } from "@/lib/types";
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
   *  solutions variant, whose pictures are all 5:4. */
  aspect?: "4/3" | "16/9";
  /** The row's pill: the white one (default) or the accent one, both with the arrow badge. */
  linkStyle?: "secondary" | "primary";
  /** Solutions variant only: the media takes 8 of the 12 columns from 1024 and 7 from 1280, the text 4
   *  (the /homes-and-rentals app demo). Default rows give the text 5 columns and the media 6. */
  wideMedia?: boolean;
};

function Check() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" className="mt-[3px] size-[1.125rem] shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="8.375" className="fill-tint" />
      <path d="m5.75 9.25 2.25 2.25 4.25-4.5" strokeWidth="1.5" />
    </svg>
  );
}

// Every row sits on the page's 12-column grid from 1024, inside the one rail (Container): the text in 5
// columns and the media in 6, one column apart, the side alternating; a wide-media row gives the text 4
// and the media 8 (7 from 1280). Both cells share row 1, so the DOM order (text first) stays the reading
// and phone order whichever side the media takes.
const cells = (right: boolean, wide: boolean) => {
  if (wide) {
    return right
      ? { text: "lg:col-span-4 lg:row-start-1", media: "lg:col-span-8 lg:col-start-5 lg:row-start-1 xl:col-span-7 xl:col-start-6" }
      : { text: "lg:col-span-4 lg:col-start-9 lg:row-start-1", media: "lg:col-span-8 lg:col-start-1 lg:row-start-1 xl:col-span-7" };
  }
  return right
    ? { text: "lg:col-span-5 lg:row-start-1", media: "lg:col-span-6 lg:col-start-7 lg:row-start-1" }
    : { text: "lg:col-span-5 lg:col-start-8 lg:row-start-1", media: "lg:col-span-6 lg:col-start-1 lg:row-start-1" };
};

// The two layouts differ only in their band and their pictures: "default" (/platform, /fit-check) takes
// the band's own pad and 4:3 or 16:9 pictures; "solutions" (/commercial, /homes-and-rentals, /solar) runs
// on from the word strip above it and frames every picture 5:4. The type is the site's reading set:
// the row title at the card step, body 16/1.6 in the muted ink, checks 16/1.5, notes 14/1.5.
const layouts = {
  default: { rows: "flex flex-col gap-24 lg:gap-32" },
  solutions: { rows: "flex flex-col gap-16 lg:gap-24" },
} as const;

const sizes = {
  half: "(min-width: 1440px) 684px, (min-width: 1024px) 47vw, (min-width: 768px) calc(100vw - 3rem), calc(100vw - 2.5rem)",
  wide: "(min-width: 1440px) 802px, (min-width: 1280px) 56vw, (min-width: 1024px) 63vw, (min-width: 768px) calc(100vw - 3rem), calc(100vw - 2.5rem)",
};

/**
 * Feature rows: text beside a rounded picture, the side alternating row by row (the first row's
 * picture on the right). Text: the row title, paragraphs, a check list, a white callout card, a small
 * note and a pill with its arrow badge. A row may close with four short facts, each over a hairline.
 *
 * variant "default": the band's own pad; below 1024 the picture follows the text.
 * variant "solutions": 80 above the first row from 768 (0 on phones, where the strip's own 80 does it),
 * 96 under the last row (56 on phones), and below 1024 the text comes first, then its picture, so on a
 * phone the first picture stays under the fold and the hero text remains the LCP element.
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
  tone?: "plaster" | "paper" | "mist";
  items: readonly FeatureRowItem[];
  startSide?: "left" | "right";
  /** "feature" is the platform's 88px row band. Ignored by the solutions variant. */
  pad?: "section" | "feature";
  variant?: keyof typeof layouts;
  /** The band's accessible name. Default "Features". */
  label?: string;
  /** @deprecated Ignored: the site has no eyebrows (owner, 21 October 2026). */
  eyebrow?: string;
}) {
  const solutions = variant === "solutions";
  const wide = (r: FeatureRowItem) => solutions && !!r.wideMedia;
  const picture = (r: FeatureRowItem, image: ImageRef) => (
    <Picture
      id={image.id}
      alt={image.alt}
      position={image.position}
      aspect={solutions ? "5/4" : (r.aspect ?? "4/3")}
      aspectSm={solutions ? "5/4" : "4/3"}
      rounded="image"
      sizes={wide(r) ? sizes.wide : sizes.half}
    />
  );
  const rows = (
    <div className={layouts[variant].rows}>
      {items.map((r, i) => {
        const right = (i % 2 === 0) === (startSide === "right");
        const at = cells(right, wide(r));
        return (
          <section key={r.id} id={r.id} aria-labelledby={`${r.id}-heading`} className="scroll-mt-24">
            <div className="grid items-center gap-y-10 lg:grid-12 lg:gap-y-0">
              <Reveal className={at.text}>
                <h2 id={`${r.id}-heading`} className="text-h3">
                  {r.title}
                </h2>
                <div className="mt-5 space-y-4">
                  {r.paragraphs.map((p) => (
                    <p key={p} className="text-body leading-[1.6] text-fg-muted">
                      {p}
                    </p>
                  ))}
                </div>
                {r.checks ? (
                  <ul className="mt-7 space-y-3">
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
                    <ul className="mt-3 space-y-2">
                      {r.callout.items.map((c) => (
                        <li key={c} className="flex gap-3 text-small leading-[1.5] text-fg-muted">
                          <Check />
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
              <div className={at.media}>{r.media ?? (r.image ? picture(r, r.image) : null)}</div>
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
          </section>
        );
      })}
    </div>
  );

  if (solutions) {
    return (
      <Band id={id} tone={tone} pad="none" ariaLabel={label} className="pt-0 pb-14 md:pt-20 lg:pb-24">
        <Container>{rows}</Container>
      </Band>
    );
  }
  return (
    <Band id={id} tone={tone} pad={pad} ariaLabel={label}>
      <Container>{rows}</Container>
    </Band>
  );
}
