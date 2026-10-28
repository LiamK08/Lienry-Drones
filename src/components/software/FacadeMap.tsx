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
/** The map's size and a cell's, in the map's own units (its viewBox), for a control that reads points off it. */
export const FACADE_MAP_SIZE = { width: WIDTH, height: HEIGHT, cell: CW } as const;

/**
 * The cells' fills, all tokens (globals.css). Pending is map-pending, as the window's legend shows it;
 * a `strong` map (the home stage's panels, white cards on their own) takes it a quarter of the way to
 * border-strong, so an unwashed panel reads at 1.6:1 on white. One pass is map-half; washed is the
 * glass. Debris is the debris tone over the cell, deeper as it builds up.
 */
export const FACADE_PENDING_STRONG = "color-mix(in srgb, var(--color-map-pending), var(--color-border-strong) 25%)";
const FILL = {
  pending: "fill-map-pending",
  strong: "fill-[color-mix(in_srgb,var(--color-map-pending),var(--color-border-strong)_25%)]",
  outline: "fill-transparent stroke-[color:color-mix(in_srgb,var(--color-map-pending),var(--color-border-strong)_45%)]",
  half: "fill-map-half",
  washed: "fill-glass",
  lit: "fill-water",
  debris: "fill-debris",
} as const;

/** Debris shading starts at this build-up; a cell above it needs both passes. */
export const DEBRIS_SHOWN = 0.12;

/** Each cell's place: the north block, the east block beside it, the roof glazing's two rows top right. */
const LEFT = { N: 0, E: (MAP.north.cols + GAP) * CW, R: (MAP.north.cols + MAP.east.cols + GAP * 2) * CW };
const PLACES = CELLS.map((c) => ({
  x: LEFT[c.face] + (c.face === "R" ? c.bay % MAP.roof.cols : c.bay) * CW + INSET / 2,
  y: (c.face === "R" ? Math.floor(c.bay / MAP.roof.cols) : FLOORS - 1 - c.floor) * CH + INSET / 2,
}));
/** Each cell's row counted from the top of the map (the roof glazing's two rows sit level with the top two floors). */
const ROW_FROM_TOP = PLACES.map((p) => Math.round((p.y - INSET / 2) / CH));

/** One block's floor (a row of the north or east elevation, or a row of the roof glazing): its cells and box. */
export type FacadeRow = { id: string; cells: number[]; x: number; y: number; width: number; height: number };
const ROW_OF: string[] = CELLS.map((c, i) => `${c.face}${ROW_FROM_TOP[i]}`);
export const FACADE_ROWS: Map<string, FacadeRow> = (() => {
  const rows = new Map<string, FacadeRow>();
  CELLS.forEach((_, i) => {
    const id = ROW_OF[i];
    const { x, y } = PLACES[i];
    const row = rows.get(id);
    if (!row) rows.set(id, { id, cells: [i], x, y, width: CW - INSET, height: CH - INSET });
    else {
      row.cells.push(i);
      row.width = Math.max(row.width, x + CW - INSET - row.x);
      row.x = Math.min(row.x, x);
    }
  });
  return rows;
})();
/** The row (one block's floor) a cell belongs to. */
export const facadeRowOf = (i: number) => FACADE_ROWS.get(ROW_OF[i])!;

/** The cell under a point of the map, in the map's own units, or -1 in a gap or outside it. */
export function facadeCellAt(x: number, y: number): number {
  if (y < 0 || y >= HEIGHT || x < 0 || x >= WIDTH) return -1;
  const row = Math.floor(y / CH);
  const block = (["N", "E", "R"] as const).find((f) => x >= LEFT[f] && x < LEFT[f] + MAP[f === "N" ? "north" : f === "E" ? "east" : "roof"].cols * CW);
  if (!block) return -1;
  const col = Math.floor((x - LEFT[block]) / CW);
  if (block === "R") return row < MAP.roof.rows ? MAP.roof.offset + row * MAP.roof.cols + col : -1;
  const floor = FLOORS - 1 - row;
  return block === "N" ? MAP.north.offset + floor * MAP.north.cols + col : MAP.east.offset + floor * MAP.east.cols + col;
}

type FacadeMapProps = {
  cells: ArrayLike<number>;
  version: number;
  wash: boolean;
  debris: boolean;
  selected: ZoneId | null;
  /** The scan's reach, from the top (0 to 1): the rows below it are drawn as outlines, not yet mapped. */
  reach?: number;
  /** A zone lit on the plan: its cells in the accent's lighter step, the rest kept in full. */
  lit?: ZoneId | null;
  /** Cells ease between states (a hands-on map); otherwise they change at once, as the window draws them. */
  ease?: boolean;
  /** Inside a control that names it: the map itself is then hidden from assistive technology. */
  decorative?: boolean;
  /** Pending cells a step darker, for a map on a white card of its own (at least 1.5:1 on white). */
  strong?: boolean;
};

/**
 * The plan as an unfolded elevation: the north face and the east face side by side (seen from
 * outside they meet at the north-east corner), floor by floor, and the roof glazing's two rows. Each
 * cell is one planned panel: pending, washed once (one of its two passes) or washed, with the debris
 * build-up still on it shaded. A chosen zone keeps its colour and the rest fade back. An SVG, not a
 * canvas: the window's only canvas is the live model. `cells` is read in place, so `version` (the
 * count of washed passes) is what tells the memo it has changed.
 */
export const FacadeMap = memo(function FacadeMap({ cells, wash, debris, selected, reach, lit = null, ease = false, decorative = false, strong = false }: FacadeMapProps) {
  const edge = reach === undefined ? FLOORS : reach * FLOORS;
  const motion = ease ? "transition-[fill,fill-opacity,stroke] duration-300 ease-instrument motion-reduce:transition-none" : "";
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": "Facade map: the north and east elevations and the roof glazing, one cell per planned panel" })}
      className="block h-auto w-full"
    >
      {CELLS.map((c, i) => {
        const { x, y } = PLACES[i];
        const done = wash ? cells[i] : 0;
        const mapped = ROW_FROM_TOP[i] < edge - 0.001;
        const residue = debris && mapped ? c.debris * (1 - done) : 0;
        const tone = !mapped ? FILL.outline : lit && c.zone === lit && done === 0 ? FILL.lit : done >= 0.999 ? FILL.washed : done > 0 ? FILL.half : strong ? FILL.strong : FILL.pending;
        const stroked = !mapped;
        return (
          <g key={i} opacity={selected && c.zone !== selected ? 0.32 : 1}>
            <rect
              x={stroked ? x + 0.5 : x}
              y={stroked ? y + 0.5 : y}
              width={stroked ? CW - INSET - 1 : CW - INSET}
              height={stroked ? CH - INSET - 1 : CH - INSET}
              strokeWidth={stroked ? 1 : undefined}
              className={`${tone} ${motion}`}
            />
            {residue > DEBRIS_SHOWN || ease ? (
              <rect x={x} y={y} width={CW - INSET} height={CH - INSET} fillOpacity={residue > DEBRIS_SHOWN ? Math.min(0.95, 0.25 + residue * 0.8) : 0} className={`${FILL.debris} ${motion}`} />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
});
