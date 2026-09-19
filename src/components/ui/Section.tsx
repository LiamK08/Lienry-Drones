import type { ReactNode } from "react";

type Tone = "plaster" | "raised" | "sunken" | "dark";

const tones: Record<Tone, string> = {
  plaster: "bg-plaster text-ink",
  raised: "bg-raised text-ink",
  sunken: "bg-sunken text-ink",
  dark: "bg-ink text-plaster on-dark",
};

export function Section({
  id,
  tone = "plaster",
  className = "",
  children,
  padded = true,
  as: Tag = "section",
  ariaLabelledby,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
  padded?: boolean;
  as?: "section" | "div" | "header" | "footer";
  ariaLabelledby?: string;
}) {
  return (
    <Tag id={id} aria-labelledby={ariaLabelledby} className={`relative ${tones[tone]} ${padded ? "section-y" : ""} page-x ${className}`}>
      {children}
    </Tag>
  );
}

const widths = {
  grid: "max-w-grid",
  rows: "max-w-rows",
  statement: "max-w-statement",
  prose: "max-w-prose",
  form: "max-w-form",
} as const;

/** Text columns. Centring these floats a paragraph in the middle of the page, so they are held
 *  against the left edge of the grid rail instead and line up with every block above and below. */
const textColumn = new Set(["statement", "prose", "form"]);

export function Container({ width = "grid", className = "", children }: { width?: keyof typeof widths; className?: string; children: ReactNode }) {
  const inner = `w-full ${widths[width]} ${className}`;
  if (!textColumn.has(width)) return <div className={`mx-auto ${inner}`}>{children}</div>;
  return (
    <div className="mx-auto w-full max-w-grid">
      <div className={inner}>{children}</div>
    </div>
  );
}

/** A short rule above a heading. It replaces the old uppercase label everywhere. */
export function Rule({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block h-px w-10 bg-ink [.on-dark_&]:bg-plaster/60 ${className}`} />;
}

/** Every heading on the site is left aligned; only the home hero centres. */
export function SectionHeading({
  eyebrow,
  headline,
  intro,
  id,
  className = "",
  level = 2,
}: {
  /** Kept for the content files; when present the heading gets a short rule above it, never a label. */
  eyebrow?: string;
  headline: string;
  intro?: string;
  id?: string;
  className?: string;
  level?: 1 | 2;
}) {
  const H = level === 1 ? "h1" : "h2";
  return (
    <div className={`max-w-statement ${className}`}>
      {eyebrow ? <Rule className="mb-5" /> : null}
      <H id={id} className={level === 1 ? "text-h1" : "text-h2"}>
        {headline}
      </H>
      {intro ? <p className="mt-5 max-w-prose text-lead text-muted">{intro}</p> : null}
    </div>
  );
}
