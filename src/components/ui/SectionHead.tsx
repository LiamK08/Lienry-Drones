import type { ReactNode } from "react";
import type { Action } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/** The aside beside (split) or under (stack) the heading. A split head needs at least one of the three. */
type Aside =
  | { intro: string; link?: Action; action?: ReactNode }
  | { intro?: string; link: Action; action?: ReactNode }
  | { intro?: string; link?: Action; action: ReactNode };

type HeadBase = {
  /** The heading's id: the band's labelledBy. */
  id: string;
  /** Default "h2". */
  as?: "h1" | "h2";
  /** Type step. Default follows `as`; "h2s" is the inner-page section size. */
  size?: "h1" | "h2" | "h2s";
  /** @deprecated Ignored: the site has no eyebrows (owner, 21 October 2026). */
  eyebrow?: string;
  /** The whole heading, as stored in content: 7 words at most (throws in development otherwise). */
  headline: string;
  /** The trailing phrase of `headline`, set in the italic: the section's one italic. */
  emphasis?: string;
  /** From 768, break the line before the italic. */
  breakBefore?: boolean;
  /** Under the heading, in the heading column (24 below it), e.g. the privacy note. */
  below?: ReactNode;
  /** Default true: the head rises in once as it enters the viewport. Pass false in a first screen. */
  reveal?: boolean;
  className?: string;
};

export type SectionHeadProps = HeadBase &
  (({ layout?: "split" } & Aside) | ({ layout: "stack" | "center" } & Partial<{ intro: string; link: Action; action: ReactNode }>));

/**
 * A heading with its italic payoff: `emphasis` must be the trailing phrase of `text`, so content
 * strings stay whole. Renders `{prefix} <em>{emphasis}</em>`; the italic takes the heading's colour.
 */
export function Headline({ text, emphasis, breakBefore = false }: { text: string; emphasis?: string; breakBefore?: boolean }) {
  if (!emphasis) return <>{text}</>;
  if (!text.endsWith(emphasis)) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(`Headline: the emphasis "${emphasis}" is not the trailing phrase of "${text}".`);
    }
    return <>{text}</>;
  }
  const prefix = text.slice(0, text.length - emphasis.length);
  return (
    <>
      {prefix}
      {breakBefore ? <br className="hidden md:inline" /> : null}
      <em>{emphasis}</em>
    </>
  );
}

/**
 * A section's head: the heading (h2, or the page's h1), then its aside: the intro
 * (text-lead under an h1, text-body otherwise, muted), a tertiary link and an action, in that order.
 *
 * - split (default): from 1024 the heading takes columns 1-7 and the aside 8-12, bottom-aligned on
 *   the 12-column grid; below 1024 the aside follows the heading 24 below.
 * - stack: heading, 24, aside, filling its parent (no inner grid), for a head in a narrow column.
 *
 * Colours come from the surface (role tokens), so the same head reads on plaster and on ink. The heading
 * has no margin.
 */
export function SectionHead(props: SectionHeadProps) {
  const { id, as: H = "h2", size, headline, emphasis, breakBefore, below, reveal = true, className = "" } = props;
  const { intro, link, action } = props as { intro?: string; link?: Action; action?: ReactNode };
  // A section's h2 at the page-title step keeps the 36px section size on phones, as the reference does.
  const step = (size ?? H) === "h1" ? (H === "h1" ? "text-h1" : "text-h1 max-md:text-h2s") : size === "h2s" ? "text-h2s" : "text-h2";

  const heading = (
    <>
      <H id={id} className={step}>
        <Headline text={headline} emphasis={emphasis} breakBefore={breakBefore} />
      </H>
      {below ? <div className="mt-6">{below}</div> : null}
    </>
  );

  const aside = (
    <>
      {intro ? <p className={H === "h1" ? "text-lead text-fg-muted" : "text-body text-fg-muted"}>{intro}</p> : null}
      {link ? (
        <Button href={link.href} variant="tertiary" arrow className={intro ? "mt-4" : ""}>
          {link.label}
        </Button>
      ) : null}
      {action ? <div className={`w-full ${intro || link ? "mt-6" : ""}`}>{action}</div> : null}
    </>
  );
  const hasAside = Boolean(intro || link || action);

  if (props.layout === "center") {
    const cls = `mx-auto flex max-w-3xl flex-col items-center text-center ${className}`;
    const content = (
      <>
        {heading}
        {intro ? <p className="mx-auto mt-4 max-w-xl text-body text-fg-muted">{intro}</p> : null}
        {link ? (
          <Button href={link.href} arrow className="mt-6">
            {link.label}
          </Button>
        ) : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </>
    );
    return reveal ? (
      <Reveal className={cls} data-section-head="">
        {content}
      </Reveal>
    ) : (
      <div data-section-head="" className={cls}>
        {content}
      </div>
    );
  }

  if (props.layout === "stack") {
    const cls = `flex flex-col gap-6 ${className}`;
    const content = (
      <>
        <div>{heading}</div>
        {hasAside ? <div className="flex flex-col items-start">{aside}</div> : null}
      </>
    );
    return reveal ? (
      <Reveal className={cls} data-section-head="">
        {content}
      </Reveal>
    ) : (
      <div data-section-head="" className={cls}>
        {content}
      </div>
    );
  }

  const cls = `grid gap-y-6 lg:grid-12 lg:items-end lg:gap-y-0 ${className}`;
  const content = (
    <>
      <div data-col className="lg:col-span-7">
        {heading}
      </div>
      <div data-col className="flex flex-col items-start lg:col-span-5 lg:col-start-8">
        {aside}
      </div>
    </>
  );
  return reveal ? (
    <Reveal className={cls} data-section-head="">
      {content}
    </Reveal>
  ) : (
    <div data-section-head="" className={cls}>
      {content}
    </div>
  );
}
