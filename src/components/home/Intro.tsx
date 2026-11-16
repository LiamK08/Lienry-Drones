import { DroneGlyph } from "@/components/home/DroneGlyph";
import s from "./Intro.module.css";

// The stage is the logo at 340px wide (72.17 tall), its top-left at 0,0; every path below is in its pixels,
// the letters scaled from LOGO_LETTERS (src/components/ui/Wordmark.tsx). Each big letter has its whole
// shape (the fill) and its outer contour (the outline its drone traces, from its top-left corner down).
const BIG = [
  { fill: "M0 0 L0 51.4 L55.64 51.4 L55.64 44.87 L9.52 44.87 L9.52 0 L0 0 Z", outline: "M0 0 L0 51.4 L55.64 51.4 L55.64 44.87 L9.52 44.87 L9.52 0 L0 0 Z" }, // L
  { fill: "M60.01 0 L60.01 51.4 L69.39 51.4 L69.39 0 L60.01 0 Z", outline: "M60.01 0 L60.01 51.4 L69.39 51.4 L69.39 0 L60.01 0 Z" }, // I
  { fill: "M75.36 0 L75.36 51.4 L131.83 51.4 L131.83 44.87 L84.81 44.87 L84.81 28.34 L118.7 28.34 L118.7 21.95 L84.81 21.95 L84.81 6.53 L131.83 6.53 L131.83 0 L75.36 0 Z", outline: "M75.36 0 L75.36 51.4 L131.83 51.4 L131.83 44.87 L84.81 44.87 L84.81 28.34 L118.7 28.34 L118.7 21.95 L84.81 21.95 L84.81 6.53 L131.83 6.53 L131.83 0 L75.36 0 Z" }, // E
  { fill: "M136.56 0 L136.56 51.33 L145.03 51.33 L145.03 9.59 L186.91 50.29 L188.37 51.4 L199.07 51.4 L199.07 0 L190.39 0 L190.39 41.74 L148.85 1.53 L147.46 0.42 L146.7 0 L136.56 0 Z", outline: "M136.56 0 L136.56 51.33 L145.03 51.33 L145.03 9.59 L186.91 50.29 L188.37 51.4 L199.07 51.4 L199.07 0 L190.39 0 L190.39 41.74 L148.85 1.53 L147.46 0.42 L146.7 0 L136.56 0 Z" }, // N
  { fill: "M204.76 0 L204.76 51.4 L214.21 51.4 L214.21 30.01 L231.09 30.01 C247.9 30.01 248.25 30.01 249.63 30.28 L250.75 30.49 C254.43 30.98 255.82 33.48 255.96 39.52 C256.02 43.55 256.72 48.07 257.9 51.4 L267.62 51.4 C266.44 48.07 265.54 43.55 265.4 38.97 C265.33 35.63 264.85 33.06 263.94 31.4 C262.9 29.52 261.58 28.48 258.87 27.23 L257.83 26.81 L260.47 25.56 C265.75 22.57 268.25 17.57 267.21 11.81 C266.37 7.02 262.55 3.13 257.14 1.53 C255.05 0.76 252.83 0 249.84 0 L204.76 0 Z M214.21 6.53 L247.97 6.53 C249.63 6.6 250.47 6.88 251.09 7.08 C259.84 8.54 260.47 20.42 251.86 22.78 C250.4 23.2 249.36 23.55 247.97 23.55 L214.21 23.55 Z", outline: "M204.76 0 L204.76 51.4 L214.21 51.4 L214.21 30.01 L231.09 30.01 C247.9 30.01 248.25 30.01 249.63 30.28 L250.75 30.49 C254.43 30.98 255.82 33.48 255.96 39.52 C256.02 43.55 256.72 48.07 257.9 51.4 L267.62 51.4 C266.44 48.07 265.54 43.55 265.4 38.97 C265.33 35.63 264.85 33.06 263.94 31.4 C262.9 29.52 261.58 28.48 258.87 27.23 L257.83 26.81 L260.47 25.56 C265.75 22.57 268.25 17.57 267.21 11.81 C266.37 7.02 262.55 3.13 257.14 1.53 C255.05 0.76 252.83 0 249.84 0 L204.76 0 Z" }, // R
  { fill: "M264.5 0 L268.87 4.51 L297.63 33.13 L297.63 51.33 L307.08 51.33 L307.08 32.85 L340 0 L328.61 0 L324.37 4.45 L302.56 26.26 L276.24 0 L264.5 0 Z", outline: "M264.5 0 L268.87 4.51 L297.63 33.13 L297.63 51.33 L307.08 51.33 L307.08 32.85 L340 0 L328.61 0 L324.37 4.45 L302.56 26.26 L276.24 0 L264.5 0 Z" }, // Y
] as const;
const SMALL = [
  "M207.26 54.39 C206.92 54.59 206.92 54.32 206.92 62.93 C206.92 71.61 206.92 71.26 207.33 71.47 C207.61 71.54 217.47 71.61 218.38 71.47 C218.66 71.4 219.14 71.33 219.42 71.33 C225.25 70.5 228.87 66.54 228.1 61.68 C227.41 57.72 224.28 55.22 218.93 54.46 C218.03 54.32 207.61 54.32 207.26 54.39 Z M218.24 56.54 C223.45 57.03 226.23 60.64 224.91 64.94 C224.21 67.24 221.71 68.9 218.45 69.32 C217.2 69.53 210.6 69.53 210.25 69.39 C209.83 69.18 209.83 69.32 209.83 62.93 C209.83 56.54 209.83 56.68 210.18 56.47 C210.53 56.33 216.85 56.33 218.24 56.54 Z", // D
  "M230.05 54.39 C229.7 54.59 229.7 54.32 229.7 62.93 C229.7 71.61 229.7 71.26 230.12 71.47 C230.53 71.61 232.13 71.61 232.41 71.4 L232.69 71.2 L232.69 64.32 L238.66 64.32 C244.22 64.39 244.29 64.39 244.63 64.53 C245.74 64.94 246.23 65.71 246.23 67.24 C246.23 68.49 246.51 70.43 246.72 70.99 C246.93 71.47 247.06 71.47 248.18 71.54 L249.84 71.54 L249.56 70.43 C249.36 69.46 249.15 67.79 249.15 66.75 C249.15 65.64 248.59 64.46 247.69 63.76 L247.06 63.21 L247.83 62.65 C251.3 60.29 250.19 55.78 245.81 54.59 L244.84 54.32 L237.55 54.32 C231.51 54.32 230.26 54.32 230.05 54.39 Z M244.49 56.54 C247.76 57.44 247.76 61.19 244.49 62.1 C244.01 62.23 233.52 62.3 233.1 62.17 C232.41 61.96 232.34 56.82 232.96 56.47 C233.31 56.33 243.94 56.4 244.49 56.54 Z", // R
  "M260.68 53.9 C255.61 54.46 251.93 56.89 250.88 60.36 C248.52 68.07 256.51 73.83 266.37 71.61 C276.17 69.39 277.14 58 267.9 54.66 C265.68 53.9 263.04 53.62 260.68 53.9 Z M264.29 55.98 C272.76 57.16 274.01 66.96 265.96 69.46 C261.37 70.85 256.23 69.39 254.36 66.19 C253.87 65.36 253.8 65.22 253.66 64.39 C252.48 59.04 257.55 55.08 264.29 55.98 Z", // O
  "M275.96 54.32 L275.96 71.54 L278.67 71.54 L278.67 57.58 L292.35 71.47 L295.89 71.47 L295.89 54.32 L293.18 54.32 L293.18 68.49 L281.65 56.61 L279.36 54.32 L275.96 54.32 Z", // N
  "M298.12 54.32 L298.12 71.54 L316.11 71.54 L316.11 69.46 L300.96 69.46 L300.96 63.69 L311.94 63.69 L311.94 61.68 L300.96 61.68 L300.96 56.4 L316.11 56.4 L316.11 54.32 L298.12 54.32 Z", // E
  "M323.4 53.9 C318.82 54.53 316.31 56.4 316.31 59.11 C316.25 62.17 318.88 63.42 326.04 63.97 L328.75 64.25 C332.85 64.67 334.44 65.71 333.89 67.58 C333.33 69.46 329.58 70.43 325.07 69.94 C322.29 69.6 320.13 68.14 319.37 66.12 C319.02 65.29 316.18 65.08 316.18 65.85 C316.18 66.75 317.63 68.97 318.88 69.88 C323.33 73.14 333.61 72.79 336.18 69.25 C337.85 66.82 337.15 64.39 334.37 63.14 C333.54 62.72 331.53 62.23 330.07 62.1 L325.14 61.61 C321.18 61.19 319.51 60.5 319.3 59.04 C319.09 57.09 321.59 55.84 325.76 55.84 C329.86 55.84 332.57 57.09 333.89 59.66 C334.17 60.36 334.23 60.36 335.49 60.36 L336.53 60.36 L336.74 60.22 C336.87 59.94 336.87 59.87 336.6 59.04 C335.07 55.36 329.23 53 323.4 53.9 Z", // S
] as const;
// The approaches, from the top right, the right and the bottom left, each starting some 2000px out so it
// begins past the edge of any screen (the drones' own paths in Intro.module.css begin the same way), to
// the top-left corners of E, R and L.
const GUIDES = ["M1112.88 -1601.81 C892.88 -677.81 75.36 -589.81 75.36 0", "M1900.75 677.47 C1064.75 677.47 480 -120 204.76 0", "M-1584 1071.6 C-660 1159.6 -352 0 0 0"];
// The right-hand drone leaves along the flight arc from the top of the Y, out past the top right of any screen.
const TRAIL = "M264.5 0 C274 -150 520 -420 2080 -1040";

/** A quadcopter from above (the glyph the step stage's wash puck uses too), moved along its path in CSS. */
function Drone({ className }: { className: string }) {
  return (
    <div className={`${s.drone} ${className}`}>
      <DroneGlyph className={s.glyph} />
    </div>
  );
}

/**
 * The first-visit intro, after the owner's brief of 28 October 2026, drawn in the owner's logo (16 November
 * 2026): the paper with fine corner ticks, three drones flying in on faint guide curves, each tracing two
 * letters of LIENRY in the accent while each letter fills behind it (E and N, R and Y, L and I), DRONES
 * drawing in under them, the right-hand drone leaving along the flight arc; the logo turns ink and fades as
 * the paper fades into the hero film, which starts again from its first frame. About four seconds, all CSS.
 *
 * It is server-rendered on the home page and hidden until the head script (src/lib/intro.ts) sets
 * `data-intro="play"` on <html>, which it does only when a browser session starts here from outside the
 * site, motion is allowed and the address has no hash. The page renders underneath as normal.
 * Decorative: aria-hidden, nothing focusable, and any key, press, wheel, touch or scroll ends it at once.
 */
export function Intro() {
  return (
    <div className={s.overlay} aria-hidden="true" data-intro-overlay="">
      <span className={`${s.tick} ${s.tl}`} />
      <span className={`${s.tick} ${s.tr}`} />
      <span className={`${s.tick} ${s.bl}`} />
      <span className={`${s.tick} ${s.br}`} />
      <div className={s.stage}>
        <svg className={s.lines} viewBox="0 0 340 72.17" overflow="visible">
          {GUIDES.map((d, i) => (
            <path key={d} d={d} pathLength={1} className={`${s.guide} ${[s.g1, s.g2, s.g3][i]}`} />
          ))}
          <path d={TRAIL} pathLength={1} className={s.trail} />
        </svg>
        <svg className={s.mark} viewBox="0 0 340 72.17">
          {BIG.map((l, i) => (
            <g key={i} className={s[`big${i}`]}>
              <path d={l.fill} className={s.fill} />
              <path d={l.outline} pathLength={1} className={s.outline} />
            </g>
          ))}
          {SMALL.map((d, i) => (
            <g key={i} className={`${s.small} ${s[`small${i}`]}`}>
              <path d={d} className={s.fill} />
              <path d={d} pathLength={1} className={s.outline} />
            </g>
          ))}
        </svg>
        <Drone className={s.droneE} />
        <Drone className={s.droneR} />
        <Drone className={s.droneL} />
      </div>
    </div>
  );
}
