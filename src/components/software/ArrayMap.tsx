import { memo } from "react";
import { CELLS, MAP } from "@/components/three/solar/dims";
import type { ZoneId } from "@/content/software";

/** The map in user units: a panel is 10 by 5 (landscape), INSET between panels, ROW_GAP between rows. */
const CW = 10;
const CH = 5;
const INSET = 1.2;
const ROW_GAP = 4.5;
const LABEL_W = 9;
const WIDTH = LABEL_W + MAP.cols * CW;
const HEIGHT = MAP.rows * MAP.up * CH + (MAP.rows - 1) * ROW_GAP;
const LETTERS = ["A", "B", "C", "D"];

const COLOURS = {
  pending: "var(--color-map-pending)",
  washed: "var(--color-glass)",
  debris: "var(--color-debris)",
} as const;

/**
 * The map is drawn as the model is seen from the front (from the north, as the default camera looks):
 * row A, the front row, at the bottom and row D at the top, each row's upper panel line over its lower.
 */
const rowTop = (row: number) => (MAP.rows - 1 - row) * (MAP.up * CH + ROW_GAP);
const PLACES = CELLS.map((c) => ({
  x: LABEL_W + c.col * CW + INSET / 2,
  y: rowTop(c.row) + (MAP.up - 1 - c.level) * CH + INSET / 2,
}));

/**
 * The solar plan as a map of the array: its four rows (row A at the bottom, as in the model), each two
 * panel lines of ten, with the row's letter beside it. Each cell is one panel: pending or washed, with
 * the soiling still on it shaded in the debris tone, deeper as it builds up, as the facade map shades
 * debris. A chosen row keeps its colour and the rest fade back. The same props as the facade map, so
 * the window swaps one for the other.
 */
export const ArrayMap = memo(function ArrayMap({ cells, wash, debris, selected }: { cells: ArrayLike<number>; version: number; wash: boolean; debris: boolean; selected: ZoneId | null }) {
  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Array map: rows A to D, two lines of ${MAP.cols} panels each, one cell per panel`} className="block h-auto w-full">
      {LETTERS.map((l, row) => (
        <text key={l} x={0} y={rowTop(row) + CH + 2} fontSize={5.6} fill="#52606e" fontWeight={600}>
          {l}
        </text>
      ))}
      {CELLS.map((c, i) => {
        const { x, y } = PLACES[i];
        const done = wash ? cells[i] : 0;
        const residue = debris ? c.debris * (1 - done) : 0;
        return (
          <g key={i} opacity={selected && c.zone !== selected ? 0.32 : 1}>
            <rect x={x} y={y} width={CW - INSET} height={CH - INSET} fill={done >= 0.999 ? COLOURS.washed : COLOURS.pending} />
            {residue > 0.12 ? <rect x={x} y={y} width={CW - INSET} height={CH - INSET} fill={COLOURS.debris} fillOpacity={Math.min(0.95, 0.25 + residue * 0.8)} /> : null}
          </g>
        );
      })}
    </svg>
  );
});
