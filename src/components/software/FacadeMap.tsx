import { memo } from "react";
import { CELLS, FLOORS, MAP } from "@/components/three/software/dims";
import type { ZoneId } from "@/content/software";

/** Gaps between the three blocks, in cell widths; a cell is CELL_H cell widths tall. */
const GAP = 1.2;
const CELL_H = 1.25;
const UNITS = MAP.north.cols + MAP.east.cols + MAP.roof.cols + GAP * 2;
/** The label row's columns, matching the blocks. */
export const FACADE_MAP_COLUMNS = `${MAP.north.cols}fr ${GAP}fr ${MAP.east.cols}fr ${GAP}fr ${MAP.roof.cols}fr`;

/** The map in user units: a cell is 10 wide; the gap between cells is INSET. */
const CW = 10;
const CH = CW * CELL_H;
const INSET = 1.4;
const WIDTH = UNITS * CW;
const HEIGHT = FLOORS * CH;

const COLOURS = {
  pending: "#e4ded3",
  half: "#7fb0b9",
  washed: "#0f6a7c",
  amber: [224, 161, 58],
  rust: [180, 90, 28],
} as const;

const mix = (a: readonly number[], b: readonly number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

/** Each cell's place: the north block, the east block beside it, the roof glazing's two rows top right. */
const LEFT = { N: 0, E: (MAP.north.cols + GAP) * CW, R: (MAP.north.cols + MAP.east.cols + GAP * 2) * CW };
const PLACES = CELLS.map((c) => ({
  x: LEFT[c.face] + (c.face === "R" ? c.bay % MAP.roof.cols : c.bay) * CW + INSET / 2,
  y: (c.face === "R" ? Math.floor(c.bay / MAP.roof.cols) : FLOORS - 1 - c.floor) * CH + INSET / 2,
}));

/**
 * The plan as an unfolded elevation: the north face and the east face side by side (seen from
 * outside they meet at the north-east corner), floor by floor, and the roof glazing's two rows. Each
 * cell is one planned panel: pending, washed once (one of its two passes) or washed, with the debris
 * build-up still on it shaded amber. A chosen zone keeps its colour and the rest fade back. An SVG,
 * not a canvas: the window's only canvas is the live model. `cells` is read in place, so `version`
 * (the count of washed passes) is what tells the memo it has changed.
 */
export const FacadeMap = memo(function FacadeMap({ cells, wash, debris, selected }: { cells: ArrayLike<number>; version: number; wash: boolean; debris: boolean; selected: ZoneId | null }) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Facade map: the north and east elevations and the roof glazing, one cell per planned panel"
      className="block h-auto w-full"
    >
      {CELLS.map((c, i) => {
        const { x, y } = PLACES[i];
        const done = wash ? cells[i] : 0;
        const residue = debris ? c.debris * (1 - done) : 0;
        const [r, g, b] = residue > 0.12 ? mix(COLOURS.amber, COLOURS.rust, Math.min(1, Math.max(0, (residue - 0.35) / 0.65))) : [0, 0, 0];
        return (
          <g key={i} opacity={selected && c.zone !== selected ? 0.32 : 1}>
            <rect x={x} y={y} width={CW - INSET} height={CH - INSET} fill={done >= 0.999 ? COLOURS.washed : done > 0 ? COLOURS.half : COLOURS.pending} />
            {residue > 0.12 ? <rect x={x} y={y} width={CW - INSET} height={CH - INSET} fill={`rgb(${r} ${g} ${b})`} fillOpacity={Math.min(0.95, 0.25 + residue * 0.8)} /> : null}
          </g>
        );
      })}
    </svg>
  );
});
