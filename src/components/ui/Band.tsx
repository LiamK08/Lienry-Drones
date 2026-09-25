import type { ReactNode } from "react";
import type { Tone } from "@/lib/types";

export type BandPad = "band" | "plate" | "hero" | "page" | "attached" | "none";

export type BandProps = {
  /** DOM id; also the band's `data-band` name (defaults to "band"). */
  id?: string;
  tone: Tone;
  /** Default "band". Values in docs/REDESIGN-SPEC.md B3. */
  pad?: BandPad;
  /** Default "section". */
  as?: "section" | "header" | "div";
  /** aria-labelledby: the id of the band's heading. */
  labelledBy?: string;
  /** aria-label, for a band without a visible heading. */
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
};

export type ContainerProps = {
  /** Default "grid" (1,392px, centred). "prose" (45ch) and "form" (40rem) sit on the grid's left edge. */
  width?: "grid" | "prose" | "form";
  className?: string;
  children: ReactNode;
};

const tones: Record<Tone, string> = {
  plaster: "bg-plaster text-ink",
  raised: "bg-raised text-ink",
  sunken: "bg-sunken text-ink",
  ink: "on-dark bg-ink text-plaster",
};

// Top and bottom padding at 1440 / 390:
//   band      96 / 56                        --band-y
//   plate     40 / 32                        --plate-y
//   hero      nav + 32, 48 / nav + 24, 32    the split hero (the second value is --gap-head)
//   page      nav + 48, 96 / nav + 32, 56    statement, register and privacy
//   attached  32, 96 / 32, 56                the findings row under the film band
const pads: Record<BandPad, string> = {
  band: "py-[var(--band-y)]",
  plate: "py-[var(--plate-y)]",
  hero: "pt-[calc(var(--nav-h)_+_1.5rem)] pb-[var(--gap-head)] lg:pt-[calc(var(--nav-h)_+_2rem)]",
  page: "pt-[calc(var(--nav-h)_+_var(--gap-head))] pb-[var(--band-y)]",
  attached: "pt-8 pb-[var(--band-y)]",
  none: "",
};

/**
 * One full-bleed band of the page: its surface, the page margins and its vertical rhythm.
 * Content goes in a `Container`. `data-tone` drives the hairline where two light bands meet
 * (globals.css) and, with `data-band`, the acceptance scripts.
 */
export function Band({ id, tone, pad = "band", as: Tag = "section", labelledBy, ariaLabel, className = "", children }: BandProps) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      data-band={id ?? "band"}
      data-tone={tone}
      className={`page-x relative ${tones[tone]} ${pads[pad]} ${className}`}
    >
      {children}
    </Tag>
  );
}

const widths = {
  grid: "max-w-grid",
  prose: "max-w-prose",
  form: "max-w-form",
} as const;

/**
 * The content rail inside a band. The grid centres; a text column (prose, form) is held against
 * the grid's left edge, so it lines up with every block above and below instead of floating.
 */
export function Container({ width = "grid", className = "", children }: ContainerProps) {
  if (width === "grid") return <div className={`mx-auto w-full max-w-grid ${className}`}>{children}</div>;
  return (
    <div className="mx-auto w-full max-w-grid">
      <div className={`w-full ${widths[width]} ${className}`}>{children}</div>
    </div>
  );
}
