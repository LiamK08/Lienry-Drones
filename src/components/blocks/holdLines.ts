import type { CSSProperties } from "react";

/**
 * Below 768 a hero h1 holds `lines` lines of height: the number it wraps to in the fallback font at a
 * phone width. The web font usually wraps tighter, so without this the text under the h1 jumps up when
 * the font arrives (a layout shift).
 */
export const holdLines = (lines?: number): { className: string; style?: CSSProperties } =>
  lines ? { className: "max-md:min-h-[calc(var(--lines)*1lh)]", style: { "--lines": lines } as CSSProperties } : { className: "" };
