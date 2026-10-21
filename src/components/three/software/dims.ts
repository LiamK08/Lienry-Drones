import type { ZoneId } from "@/content/software";

// The building's dimensions and its debris, without three.js, so the window can draw the facade map
// before (or without) the WebGL chunk. layout.ts re-exports all of it for the scene.

// The building in metres. The north face looks along +z (towards the default camera), the east face along +x.
export const FLOORS = 12;
export const FLOOR_H = 3.2;
export const H = FLOORS * FLOOR_H;
export const ROOF_SLAB = 0.3;
export const ROOF_Y = H + ROOF_SLAB;
export const W = 24;
export const D = 16;
export const SLAB_H = 0.55;
export const GLASS_H = FLOOR_H - SLAB_H;
export const BAYS_N = 16;
export const BAYS_E = 10;
export const BAY_N = W / BAYS_N;
export const BAY_E = D / BAYS_E;

export const LANTERN = { w: 9, d: 5, h: 1.25, x: -4.5, z: -1.5, cols: 4, rows: 2 };

export type Face = "N" | "E" | "S" | "W" | "R";

export type Blob = { face: Face; u: number; v: number; ru: number; rv: number; strength: number };

/** Debris build-up as soft blobs in face coordinates (u along the face from its left edge, v height from the ground). */
export const BLOBS: Blob[] = [
  { face: "N", u: 6.2, v: 29.5, ru: 3.6, rv: 3.4, strength: 1 },
  { face: "N", u: 19.5, v: 8.2, ru: 3.2, rv: 2.6, strength: 0.85 },
  { face: "E", u: 6.8, v: 20.4, ru: 3.0, rv: 3.6, strength: 0.9 },
];

export function debrisAt(face: Face, u: number, v: number): number {
  let a = 0;
  for (const b of BLOBS) {
    if (b.face !== face) continue;
    const du = (u - b.u) / b.ru;
    const dv = (v - b.v) / b.rv;
    const d2 = du * du + dv * dv;
    a += b.strength * Math.exp(-d2 * 1.6);
  }
  return Math.min(1, a);
}

/** The zone a planned panel belongs to: the north face above the ground floor, its shopfront, the east face and the roof glazing. */
export function zoneFor(face: Face, floor: number): ZoneId | null {
  if (face === "N") return floor === 0 ? "shopfront" : "north";
  if (face === "E") return "east";
  if (face === "R") return "roof";
  return null;
}

/**
 * The facade map's cells: one per planned panel, the north elevation (floor by floor, west to east),
 * then the east elevation (north to south), then the roof glazing (its two rows of four). Seen from
 * outside, both elevations run left to right and meet at the north-east corner.
 */
export const MAP = {
  north: { cols: BAYS_N, rows: FLOORS, offset: 0 },
  east: { cols: BAYS_E, rows: FLOORS, offset: BAYS_N * FLOORS },
  roof: { cols: LANTERN.cols, rows: LANTERN.rows, offset: (BAYS_N + BAYS_E) * FLOORS },
} as const;
export const CELL_COUNT = (BAYS_N + BAYS_E) * FLOORS + LANTERN.cols * LANTERN.rows;

/** A planned panel's cell. Roof panels count their bay across both rows (col + row * cols). */
export function cellIndex(face: Face, floor: number, bay: number): number {
  if (face === "N") return MAP.north.offset + floor * BAYS_N + bay;
  if (face === "E") return MAP.east.offset + floor * BAYS_E + bay;
  if (face === "R") return MAP.roof.offset + bay;
  return -1;
}

export type Cell = { face: "N" | "E" | "R"; floor: number; bay: number; zone: ZoneId; debris: number };

/** Every cell with its zone and the debris at the panel's centre. */
export const CELLS: Cell[] = (() => {
  const out: Cell[] = [];
  const panel = (face: "N" | "E", floor: number, bay: number, bays: number, length: number): Cell => {
    const u = (bay + 0.5) * (length / bays);
    const v = floor * FLOOR_H + SLAB_H + GLASS_H / 2;
    return { face, floor, bay, zone: zoneFor(face, floor)!, debris: debrisAt(face, u, v) };
  };
  for (let floor = 0; floor < FLOORS; floor++) for (let bay = 0; bay < BAYS_N; bay++) out.push(panel("N", floor, bay, BAYS_N, W));
  for (let floor = 0; floor < FLOORS; floor++) for (let bay = 0; bay < BAYS_E; bay++) out.push(panel("E", floor, bay, BAYS_E, D));
  for (let bay = 0; bay < LANTERN.cols * LANTERN.rows; bay++) out.push({ face: "R", floor: FLOORS, bay, zone: "roof", debris: 0 });
  return out;
})();
