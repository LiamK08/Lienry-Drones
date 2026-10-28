import s from "./Intro.module.css";

// The stage is the mark at 128px tall (86.26 wide), its top-left at 0,0; every path below is in its
// pixels, the mark's three blocks scaled from MARK_PATHS (src/components/ui/Wordmark.tsx).
const BLOCKS = {
  // Each outline starts where its drone arrives and runs the way the drone traces it.
  C: "M25.93 14.84 L48.26 0 L63.92 10.92 L63.92 24.3 A145.92 145.92 0 0 1 25.93 97.67 Z",
  R: "M66.04 40.44 L86.26 54.79 L86.26 128 L3.03 128 A100.79 100.79 0 0 0 66.04 40.44 Z",
  L: "M0 60.33 L19.73 47.94 L19.73 104.03 A145.92 145.92 0 0 1 0 119.46 Z",
} as const;
// The approaches, from off screen at 1440 and at 390: from the top right, the right and the bottom left.
const GUIDES = ["M520 -720 C420 -300 25.93 -260 25.93 14.84", "M900 330 C520 330 260 40.44 66.04 40.44", "M-720 520 C-300 560 -160 60.33 0 60.33"];
// The right-hand drone leaves along the flight arc, out to the top right.
const TRAIL = "M66.04 40.44 C69.73 -19.4 160 -120 760 -360";

/** A quadcopter from above: four rotors on crossed arms around the body. */
function Drone({ className }: { className: string }) {
  return (
    <div className={`${s.drone} ${className}`}>
      <svg viewBox="-7 -7 14 14" className={s.glyph}>
        <g fill="none" stroke="currentColor" strokeWidth="1.1">
          <path d="M-4 -4 4 4M-4 4 4 -4" />
          <circle cx="-4" cy="-4" r="2.4" />
          <circle cx="4" cy="-4" r="2.4" />
          <circle cx="-4" cy="4" r="2.4" />
          <circle cx="4" cy="4" r="2.4" />
        </g>
        <rect x="-1.6" y="-1.6" width="3.2" height="3.2" fill="currentColor" />
      </svg>
    </div>
  );
}

/**
 * The first-visit intro, after the owner's brief of 28 October 2026: the warm paper with fine corner
 * ticks, three drones flying in on faint guide curves, each tracing one block of the mark in the accent
 * while the block fills, the right-hand one leaving along the flight arc; the mark turns ink, then white
 * as the paper fades into the hero film. About four seconds, all CSS.
 *
 * It is server-rendered on the home page and hidden until the head script (src/lib/intro.ts) sets
 * `data-intro="play"` on <html>, which it does only when a browser session starts here, motion is
 * allowed and the address has no hash. The page renders underneath as normal. Decorative: aria-hidden,
 * nothing focusable, and any key, press, wheel or touch ends it at once.
 */
export function Intro() {
  return (
    <div className={s.overlay} aria-hidden="true" data-intro-overlay="">
      <span className={`${s.tick} ${s.tl}`} />
      <span className={`${s.tick} ${s.tr}`} />
      <span className={`${s.tick} ${s.bl}`} />
      <span className={`${s.tick} ${s.br}`} />
      <div className={s.stage}>
        <svg className={s.lines} viewBox="0 0 86.26 128" overflow="visible">
          {GUIDES.map((d, i) => (
            <path key={d} d={d} pathLength={1} className={`${s.guide} ${[s.g1, s.g2, s.g3][i]}`} />
          ))}
          <path d={TRAIL} pathLength={1} className={s.trail} />
        </svg>
        <svg className={s.mark} viewBox="0 0 86.26 128">
          {(["C", "R", "L"] as const).map((id) => (
            <g key={id} className={s[`block${id}`]}>
              <path d={BLOCKS[id]} className={s.fill} />
              <path d={BLOCKS[id]} pathLength={1} className={s.outline} />
            </g>
          ))}
        </svg>
        <Drone className={s.droneC} />
        <Drone className={s.droneR} />
        <Drone className={s.droneL} />
      </div>
    </div>
  );
}
