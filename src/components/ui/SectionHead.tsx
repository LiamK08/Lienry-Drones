import type { ReactNode } from "react";
import type { Action } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/** The aside beside a heading. At least one of intro, link and action is required. */
export type SectionAside =
  | { intro: string; label?: string; link?: Action; action?: ReactNode }
  | { intro?: string; label?: string; link: Action; action?: ReactNode }
  | { intro?: string; label?: string; link?: Action; action: ReactNode };

export type SectionHeadProps = {
  /** The heading's id: the band's labelledBy. */
  id: string;
  /** Default "h2". */
  as?: "h1" | "h2";
  /** Type step. Default follows `as`. */
  size?: "h1" | "h2";
  /** The whole heading, as stored in content. */
  headline: string;
  /** The trailing phrase of `headline`, set in the italic. Throws in development if it is not a suffix. */
  emphasis?: string;
  /** From 768, break the line before the italic. */
  breakBefore?: boolean;
  /** Under the heading, in the left column (the software band's body). */
  below?: ReactNode;
  /** Required: no heading sits beside an empty half. */
  aside: SectionAside;
  /** Default "light". "dark" on an ink band. */
  tone?: "light" | "dark";
  /** Default "split": heading in columns 1-7 and aside in 8-12 from 1024. "stack" stacks at every width. */
  layout?: "split" | "stack";
  /** Default true: the head rises in once as it enters the viewport. False in first-screen use. */
  reveal?: boolean;
  className?: string;
};

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
 * Every section head pairs its heading with an aside (an intro, a link or controls), so a heading
 * never sits beside an empty half. Split from 1024: heading in columns 1-7, aside in 8-12, both
 * bottom-aligned. Below 1024 (or layout="stack"): heading, 16, below, 16, aside.
 */
export function SectionHead({
  id,
  as: H = "h2",
  size,
  headline,
  emphasis,
  breakBefore,
  below,
  aside,
  tone = "light",
  layout = "split",
  reveal = true,
  className = "",
}: SectionHeadProps) {
  const dark = tone === "dark";
  const split = layout === "split";
  const step = (size ?? H) === "h1" ? "text-h1" : "text-h2";
  const grid = `grid gap-4 ${split ? "lg:grid-cols-12 lg:items-end lg:gap-x-6 lg:gap-y-0" : ""} ${className}`;

  const content = (
    <>
      <div data-col className={split ? "lg:col-span-7" : undefined}>
        <H id={id} className={step}>
          <Headline text={headline} emphasis={emphasis} breakBefore={breakBefore} />
        </H>
        {below ? <div className="mt-4">{below}</div> : null}
      </div>
      <div data-col className={`flex flex-col items-start ${split ? "lg:col-span-5 lg:col-start-8" : ""}`}>
        {aside.label ? <p className={`label ${dark ? "text-muted-on-dark" : "text-muted"}`}>{aside.label}</p> : null}
        {aside.intro ? <p className={`text-body ${dark ? "text-muted-on-dark" : "text-muted"} ${aside.label ? "mt-2" : ""}`}>{aside.intro}</p> : null}
        {aside.link ? (
          <Button href={aside.link.href} variant="tertiary" onDark={dark} arrow className={aside.label || aside.intro ? "mt-4" : ""}>
            {aside.link.label}
          </Button>
        ) : null}
        {aside.action ? <div className={`w-full ${aside.label || aside.intro || aside.link ? "mt-4" : ""}`}>{aside.action}</div> : null}
      </div>
    </>
  );

  if (!reveal) return <div className={grid}>{content}</div>;
  return <Reveal className={grid}>{content}</Reveal>;
}
