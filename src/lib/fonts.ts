import localFont from "next/font/local";

// Two families, self-hosted from Fontsource (see src/fonts/README.md). Each font below is exactly
// one file, and all three are preloaded because all three are used above the fold: the regular
// serif for headlines, its italic for the payoff phrase that closes the home hero headline and
// every inner-page H1, and Inter for everything else.
//
// next/font derives the emitted CSS family name from the export identifier, so these are named for
// the typeface, never `serif` or `sans` — those would shadow the CSS generic keywords in the
// fallback stacks below them.

/** Instrument Serif: headlines and display lines. Sentence case, weight 400 only. */
export const instrumentSerif = localFont({
  src: "../fonts/instrument-serif-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
  variable: "--font-instrument",
});

/** Instrument Serif italic: only the trailing payoff phrase of a heading (`Headline`'s emphasis). */
export const instrumentSerifItalic = localFont({
  src: "../fonts/instrument-serif-latin-400-italic.woff2",
  weight: "400",
  style: "italic",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
  variable: "--font-instrument-italic",
});

/** Inter with its optical size axis: body, navigation, buttons, labels and numerals. */
export const inter = localFont({
  src: "../fonts/inter-latin-opsz-normal.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
  variable: "--font-inter",
});

export const fontClassName = `${instrumentSerif.variable} ${instrumentSerifItalic.variable} ${inter.variable}`;
