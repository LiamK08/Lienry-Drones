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
  /** A tinted box under the text: a title and a short list. */
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
  /** The row's pill: a small white one (default) or the accent one with its arrow badge. */
  linkStyle?: "secondary" | "primary";
};

function Check({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 18 18" aria-hidden="true" className="size-[1.125rem] shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="8.375" className="fill-tint" />
        <path d="m5.75 9.25 2.25 2.25 4.25-4.5" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="7" />
      <path d="m5 8 2 2 4-4" />
    </svg>
  );
}

// The two layouts. "default" is /platform's, unchanged. "solutions" is the solution pages' features
// run: a 1328px rail, 40 between the columns and 100 between the rows from 1024, 5:4 pictures with
// the 8px image corners, near-black 14px copy at 1.2, and the picture before the text on phones.
const layouts = {
  default: {
    rail: "",
    rows: "flex flex-col gap-24 lg:gap-32",
    grid: "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
    text: (right: boolean) => (right ? "" : "lg:order-2"),
    media: (right: boolean) => (right ? "" : "lg:order-1"),
    paras: "mt-4 space-y-3",
    para: "max-w-xl text-small text-fg-muted",
    list: "mt-6 space-y-3",
    item: "flex gap-3 text-small text-fg",
    after: "mt-6",
  },
  solutions: {
    rail: "mx-auto w-full max-w-[83rem]",
    rows: "flex flex-col gap-20 lg:gap-[6.25rem]",
    grid: "grid items-center gap-8 lg:grid-cols-2 lg:gap-10",
    // The DOM follows the desktop order (a left picture comes first), so the order classes only move a
    // right-hand picture above its text on phones.
    text: (right: boolean) => (right ? "order-2 lg:order-1" : ""),
    media: (right: boolean) => (right ? "order-1 lg:order-2" : ""),
    paras: "mt-4 space-y-2",
    para: "max-w-none text-small leading-[1.2] text-fg",
    list: "mt-8 space-y-[1.1875rem]",
    item: "flex gap-2.5 text-small leading-[1.2] text-fg",
    after: "mt-8",
  },
} as const;

/**
 * Feature rows: text beside a rounded picture, the side alternating row by row (the first row's
 * picture on the right). Text: the h2, paragraphs, a check list, a tinted callout,
 * a small note and a pill. A row may close with four short facts.
 *
 * variant "default" (/platform): the band's own padding, the 1392px grid, 4:3 or 16:9 pictures, and
 * below 1024 the picture follows the text.
 * variant "solutions" (/commercial, /homes-and-rentals, /solar): 80 above the first row (0 on
 * phones, where the strip's own 80 does it), 120 under the last row (56 on phones), and below 1024 the picture comes first.
 */
export function FeatureRows({
  id,
  tone = "plaster",
  items,
  startSide = "right",
  pad = "section",
  variant = "default",
}: {
  id: string;
  tone?: "plaster" | "paper" | "mist";
  items: readonly FeatureRowItem[];
  startSide?: "left" | "right";
  /** "feature" is the platform's 88px row band. Ignored by the solutions variant. */
  pad?: "section" | "feature";
  variant?: keyof typeof layouts;
  /** @deprecated Ignored: the site has no eyebrows (owner, 21 October 2026). */
  eyebrow?: string;
}) {
  const solutions = variant === "solutions";
  const L = layouts[variant];
  const mediaOf = (r: FeatureRowItem, right: boolean) => (
    <div className={L.media(right)}>
      {r.media ??
        (r.image ? (
          solutions ? (
            <Picture id={r.image.id} alt={r.image.alt} position={r.image.position} aspect="5/4" aspectSm="5/4" rounded="image" sizes="(min-width: 1440px) 644px, (min-width: 1024px) 46vw, 100vw" />
          ) : (
            <Picture id={r.image.id} alt={r.image.alt} position={r.image.position} aspect={r.aspect ?? "4/3"} aspectSm="4/3" rounded="card" sizes="(min-width: 1440px) 684px, (min-width: 1024px) 50vw, 100vw" />
          )
        ) : null)}
    </div>
  );
  const rows = (
    <div className={L.rows}>
      {items.map((r, i) => {
        const right = (i % 2 === 0) === (startSide === "right");
        return (
          <section key={r.id} id={r.id} aria-labelledby={`${r.id}-heading`} className="scroll-mt-24">
            <div className={L.grid}>
              {solutions && !right ? mediaOf(r, right) : null}
              <Reveal className={L.text(right)}>
                <h2 id={`${r.id}-heading`} className="text-h3">
                  {r.title}
                </h2>
                <div className={L.paras}>
                  {r.paragraphs.map((p) => (
                    <p key={p} className={L.para}>
                      {p}
                    </p>
                  ))}
                </div>
                {r.checks ? (
                  <ul className={L.list}>
                    {r.checks.map((c) => (
                      <li key={c} className={L.item}>
                        <Check filled={solutions} />
                        {c}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {r.callout ? (
                  <div className="mt-6 rounded-[0.625rem] border-l-[3px] border-accent bg-tint px-5 py-4">
                    <p className="text-small font-medium text-ink">{r.callout.title}</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-small text-ink/80">
                      {r.callout.items.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {r.note ? <p className={`${L.after} max-w-[37.5rem] text-caption leading-[1.4] text-fg-muted`}>{r.note}</p> : null}
                {r.link ? (
                  r.linkStyle === "primary" ? (
                    <Button href={r.link.href} arrow className={L.after}>
                      {r.link.label}
                    </Button>
                  ) : (
                    <Button href={r.link.href} variant="secondary" size="sm" className={L.after}>
                      {r.link.label}
                    </Button>
                  )
                ) : null}
              </Reveal>
              {solutions && !right ? null : mediaOf(r, right)}
            </div>
            {r.facts ? (
              <ul className="mt-12 grid gap-8 pt-2 md:grid-cols-2 lg:grid-cols-4 lg:gap-0">
                {r.facts.map((f, k) => (
                  <li key={f.title} className={k ? "lg:border-l lg:border-line lg:pl-6" : "lg:pr-6"}>
                    <p className="text-small font-medium text-fg">{f.title}</p>
                    <p className="mt-2 text-small text-fg-muted">{f.text}</p>
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
      <Band id={id} tone={tone} pad="none" ariaLabel="Features" className="pt-0 pb-14 md:pt-20 lg:pb-[7.5rem]">
        <div className={L.rail}>
          {rows}
        </div>
      </Band>
    );
  }
  return (
    <Band id={id} tone={tone} pad={pad} ariaLabel="Features">
      <Container>{rows}</Container>
    </Band>
  );
}
