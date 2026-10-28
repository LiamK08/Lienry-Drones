import type { ReactNode } from "react";
import type { BandTone, LegacyTone } from "@/lib/types";

export type BandPad = "section" | "hero" | "split" | "attached" | "compact" | "feature" | "tabs" | "none";

export type BandProps = {
  /** Required: the DOM id and the band's `data-band` name. */
  id: string;
  /** plaster, paper, tint or mist (light), ink or night (dark). raised and sunken are retired (check 4 fails them). */
  tone: BandTone | LegacyTone;
  /** Default "section". */
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

// The band sets the surface: ink adds .on-dark, so every role token inside resolves for ink.
const tones = {
  plaster: "bg-plaster text-ink",
  paper: "bg-paper text-ink",
  tint: "bg-tint text-ink",
  mist: "bg-mist text-ink",
  ink: "on-dark bg-ink text-plaster",
  night: "on-dark bg-night text-plaster",
  raised: "bg-raised text-ink", // legacy, deleted at integration
  sunken: "bg-sunken text-ink", // legacy, deleted at integration
} as const;

// Top and bottom padding (globals.css): --section-y is 96 from 1024, 80 from 768, 64 below;
// --hero-top is the 56px bar plus --hero-gap (80, 64, 56). check:layout 30 holds each named pad to
// these values; a band that sets its own measured padding declares "none".
//   section   S / S          every page section
//   hero      56 + H / S     the band holding an inner page's h1
//   split     56 + H / S     the split hero; 80 / 56 from 1024
//   attached  0 / S          a strip that continues the band above it in the same tone
//   compact   64 / 64        70 / 70 from 1024
//   feature   64 / 64        88 / 88 from 1024
//   tabs      56 / 56        61 / 61 from 1024
const pads = {
  section: "py-(--section-y)",
  hero: "pt-(--hero-top) pb-(--section-y)",
  split: "pt-(--hero-top) pb-(--section-y) lg:pt-[calc(var(--nav-h)+1.5rem)] lg:pb-14",
  attached: "pt-0 pb-(--section-y)",
  compact: "py-16 lg:py-[4.375rem]",
  feature: "py-16 lg:py-[5.5rem]",
  tabs: "py-14 lg:py-[3.8125rem]",
  none: "",
} as const;

/**
 * One full-bleed band of the page: its surface, the page margins and its vertical rhythm.
 * Content goes in a `Container`. `data-tone`, `data-pad` and `data-band` drive the acceptance
 * scripts; `data-attached` marks a band allowed to share the tone of the band above it.
 */
export function Band({ id, tone, pad = "section", as: Tag = "section", labelledBy, ariaLabel, className = "", children }: BandProps) {
  return (
    <Tag
      id={id}
      data-band={id}
      data-tone={tone}
      data-pad={pad}
      data-attached={pad === "attached" ? "" : undefined}
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
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
