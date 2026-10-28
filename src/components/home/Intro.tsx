import { DroneGlyph } from "@/components/home/DroneGlyph";
import s from "./Intro.module.css";

// The stage is the mark at 128px tall (86.26 wide), its top-left at 0,0; every path below is in its
// pixels, the mark's three blocks scaled from MARK_PATHS (src/components/ui/Wordmark.tsx).
const BLOCKS = {
  // Each outline starts where its drone arrives and runs the way the drone traces it.
  C: "M25.93 14.84 L48.26 0 L63.92 10.92 L63.92 24.3 A145.92 145.92 0 0 1 25.93 97.67 Z",
  R: "M66.04 40.44 L86.26 54.79 L86.26 128 L3.03 128 A100.79 100.79 0 0 0 66.04 40.44 Z",
  L: "M0 60.33 L19.73 47.94 L19.73 104.03 A145.92 145.92 0 0 1 0 119.46 Z",
} as const;
// The approaches, from the top right, the right and the bottom left, each starting some 2000px out so
// it begins past the edge of any screen (the drones' own paths in Intro.module.css begin the same way).
const GUIDES = ["M1112.88 -1601.81 C892.88 -677.81 25.93 -589.81 25.93 14.84", "M1900.75 677.47 C1064.75 677.47 492.75 40.44 66.04 40.44", "M-1584 1071.6 C-660 1159.6 -352 60.33 0 60.33"];
// The right-hand drone leaves along the flight arc, out past the top right of any screen.
const TRAIL = "M66.04 40.44 C75.63 -115.14 310.34 -376.7 1870.34 -1000.7";

/** A quadcopter from above (the glyph the step stage's wash puck uses too), moved along its path in CSS. */
function Drone({ className }: { className: string }) {
  return (
    <div className={`${s.drone} ${className}`}>
      <DroneGlyph className={s.glyph} />
    </div>
  );
}

/**
 * The first-visit intro, after the owner's brief of 28 October 2026: the paper with fine corner
 * ticks, three drones flying in on faint guide curves, each tracing one block of the mark in the accent
 * while the block fills, the right-hand one leaving along the flight arc; the mark turns ink and fades as
 * the paper fades into the hero film, which starts again from its first frame. About four seconds, all
 * CSS.
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
