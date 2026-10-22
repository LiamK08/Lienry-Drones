import type { SolarZoneId } from "@/content/software";

// The demo solar array's dimensions, cells and soiling, without three.js, so the window can draw the
// array map before (or without) the WebGL chunk. layout.ts re-exports all of it for the scene.

// The array in metres: four ground-mounted rows (tables), each two landscape panels up the slope and
// ten along it, tilted 20° to face north (+z, towards the default camera) as an Australian array
// does. Row A is the northernmost (front) row, row D the southernmost.
export const ROWS = 4;
export const COLS = 10;
export const UP = 2;
export const PANEL_W = 2.0;
export const PANEL_H = 1.0;
export const PANEL_GAP = 0.025;
export const TILT = (20 * Math.PI) / 180;
/** Height of each table's lower edge above the ground. */
export const LOW = 0.75;
/** Row spacing, front to back. */
export const PITCH = 5.0;
export const ROW_LEN = COLS * (PANEL_W + PANEL_GAP) - PANEL_GAP;
export const SLOPE = UP * (PANEL_H + PANEL_GAP) - PANEL_GAP;

export const ROW_ZONES: readonly SolarZoneId[] = ["row-a", "row-b", "row-c", "row-d"];

/** The centre line (z) of each row's table, row A at the front. */
export function rowZ(row: number): number {
  return ((ROWS - 1) / 2 - row) * PITCH;
}

/** A soiling patch on one table: u along the row from its west end, v up the slope from the lower edge. */
export type Patch = { row: number; u: number; v: number; ru: number; rv: number; strength: number };

/** Dust and droppings, as soft patches: heaviest on the two outer rows, where the wind leaves most. */
export const PATCHES: Patch[] = [
  { row: 0, u: 5.4, v: 1.45, ru: 2.4, rv: 0.6, strength: 0.95 },
  { row: 1, u: 15.4, v: 0.55, ru: 3.2, rv: 0.55, strength: 0.8 },
  { row: 2, u: 8.6, v: 1.3, ru: 1.6, rv: 0.5, strength: 0.7 },
  { row: 3, u: 12.6, v: 0.7, ru: 3.6, rv: 0.7, strength: 1 },
];

/**
 * Soiling at a point of a table: a band of dust that settles along the lower frame of every row (the
 * rain carries it down and the frame holds it), plus the patches. 0 to 1.
 */
export function soilingAt(row: number, u: number, v: number): number {
  let a = 0.42 * Math.exp(-v / 0.32);
  for (const p of PATCHES) {
    if (p.row !== row) continue;
    const du = (u - p.u) / p.ru;
    const dv = (v - p.v) / p.rv;
    a += p.strength * Math.exp(-(du * du + dv * dv) * 1.6);
  }
  return Math.min(1, a);
}

/**
 * The array map's cells: one per panel, row A first, then B, C and D; within a row the lower line
 * (west to east), then the upper line.
 */
export const MAP = { rows: ROWS, up: UP, cols: COLS } as const;
export const CELL_COUNT = ROWS * UP * COLS;

/** `level` 0 is the lower panel line, 1 the upper. */
export function cellIndex(row: number, level: number, col: number): number {
  return row * UP * COLS + level * COLS + col;
}

export type SolarCell = { row: number; level: number; col: number; zone: SolarZoneId; debris: number };

export const CELLS: SolarCell[] = (() => {
  const out: SolarCell[] = [];
  for (let row = 0; row < ROWS; row++)
    for (let level = 0; level < UP; level++)
      for (let col = 0; col < COLS; col++) {
        const u = (col + 0.5) * (PANEL_W + PANEL_GAP);
        const v = (level + 0.5) * (PANEL_H + PANEL_GAP);
        out.push({ row, level, col, zone: ROW_ZONES[row], debris: soilingAt(row, u, v) });
      }
  return out;
})();
