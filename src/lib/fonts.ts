import localFont from "next/font/local";

// Two families, self-hosted from Fontsource (see src/fonts/README.md), both under the SIL Open Font
// License: PT Serif for headings and display lines, Inter for everything else. The regular serif and
// Inter are preloaded (both are above the fold on every page); the italics load on demand.
//
// next/font derives the emitted CSS family name from the export identifier, so these are named for
// the typeface, never `serif` or `sans`: those would shadow the CSS generic keywords in the fallback
// stacks below them.

/** PT Serif: headings and display lines, weight 400. */
export const ptSerif = localFont({
  src: "../fonts/pt-serif-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
  variable: "--font-ptserif",
});

/** PT Serif italic: the italic phrase of a heading (`Headline`'s emphasis). */
export const ptSerifItalic = localFont({
  src: "../fonts/pt-serif-latin-400-italic.woff2",
  weight: "400",
  style: "italic",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
  variable: "--font-ptserif-italic",
});

/** Inter with its optical size axis: body, navigation, buttons and labels. */
export const inter = localFont({
  src: "../fonts/inter-latin-opsz-normal.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
  variable: "--font-inter",
});

/** Inter italic: only the footer's tagline, so it loads on demand rather than ahead of the first screen. */
export const interItalic = localFont({
  src: "../fonts/inter-latin-opsz-italic.woff2",
  weight: "100 900",
  style: "italic",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
  variable: "--font-inter-italic",
});

export const fontClassName = `${ptSerif.variable} ${ptSerifItalic.variable} ${inter.variable} ${interItalic.variable}`;
