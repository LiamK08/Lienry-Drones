import * as THREE from "three";
import type { SolarZoneId } from "@/content/software";
import { COLS, LOW, PANEL_GAP, PANEL_H, PANEL_W, PITCH, ROWS, ROW_LEN, ROW_ZONES, SLOPE, TILT, UP, rowZ, soilingAt } from "./dims";
import type { CameraPreset, Leg, Route } from "../software/layout";

export * from "./dims";

/** Up the slope and out of the glass, shared by every table. */
export const SLOPE_DIR = new THREE.Vector3(0, Math.sin(TILT), -Math.cos(TILT));
export const NORMAL = new THREE.Vector3(0, Math.cos(TILT), Math.sin(TILT));
/** A panel plane (normal +z) turned about x so its normal is NORMAL and its local y runs up the slope. */
export const PANEL_ROTATION_X = TILT - Math.PI / 2;
/**
 * Where the drone holds while it washes, from the point its spray meets: up the glass's normal and out
 * towards the row's front (north), so it hovers about a metre over the line it is washing, nearly level
 * and facing south, and its spray bar fans down onto the glass.
 */
export const STANDOFF = NORMAL.clone().multiplyScalar(1.0).add(new THREE.Vector3(0, 0, 0.45));
/** The highest point of a table (its upper edge). */
export const TOP_Y = LOW + SLOPE * Math.sin(TILT);
/** The reel on its concrete pad in front of the array (north of row A), towards its east end. */
export const PAD = { x: ROW_LEN / 2 - 1.8, z: rowZ(0) + 4.0, w: 3.2, d: 2.4, h: 0.16 };
export const REEL = new THREE.Vector3(PAD.x, PAD.h + 0.62, PAD.z - 0.35);

/** A point on row `row`'s glass: u along the row from its west end, v up the slope from the lower edge. */
export function onTable(row: number, u: number, v: number, out = new THREE.Vector3()): THREE.Vector3 {
  const zLow = rowZ(row) + (SLOPE / 2) * Math.cos(TILT);
  return out.set(-ROW_LEN / 2 + u, LOW + v * Math.sin(TILT), zLow - v * Math.cos(TILT));
}

export type SolarPanel = {
  row: number;
  /** 0 is the lower panel line, 1 the upper. */
  level: number;
  col: number;
  centre: THREE.Vector3;
  zone: SolarZoneId;
  /** Route progress (0 to 1) at which the wash crosses this panel. */
  washAt: number[];
  debris: number;
  lastWashed: string;
};

const LAST_WASHED = ["31 days ago", "31 days ago", "45 days ago", "45 days ago"];

function buildPanels(): SolarPanel[] {
  const out: SolarPanel[] = [];
  for (let row = 0; row < ROWS; row++)
    for (let level = 0; level < UP; level++)
      for (let col = 0; col < COLS; col++) {
        const u = (col + 0.5) * (PANEL_W + PANEL_GAP);
        const v = (level + 0.5) * (PANEL_H + PANEL_GAP);
        out.push({ row, level, col, centre: onTable(row, u, v), zone: ROW_ZONES[row], washAt: [], debris: soilingAt(row, u, v), lastWashed: LAST_WASHED[row] });
      }
  return out;
}

/**
 * The planned route: row A to row D, front to back. Each row takes two passes, the upper panel line
 * west to east, then the lower line back east to west (water runs down, so the top is washed first),
 * each 0.6m past the row's ends. Between rows the drone climbs over the table it has just washed and
 * comes down in front of the next row's upper line. It holds STANDOFF from the line it is washing.
 */
function buildRoute(panels: SolarPanel[]): Route {
  const pts: THREE.Vector3[] = [];
  const passes: { row: number; level: number; pass: number; from: THREE.Vector3; to: THREE.Vector3; startIndex: number }[] = [];
  const at = (row: number, u: number, level: number) => onTable(row, u, (level + 0.5) * (PANEL_H + PANEL_GAP)).add(STANDOFF);
  for (let row = 0; row < ROWS; row++) {
    if (row > 0) {
      // Up over the last row's top edge at its west end, then down to this row's upper line.
      const lift = onTable(row - 1, -0.6, SLOPE);
      lift.y = TOP_Y + 1.7;
      pts.push(lift);
    }
    for (const [pass, level] of [1, 0].entries()) {
      const westToEast = pass === 0;
      const a = at(row, westToEast ? -0.6 : ROW_LEN + 0.6, level);
      const b = at(row, westToEast ? ROW_LEN + 0.6 : -0.6, level);
      passes.push({ row, level, pass, from: a, to: b, startIndex: pts.length });
      pts.push(a, b);
    }
  }

  const cumulative: number[] = [0];
  for (let i = 1; i < pts.length; i++) cumulative.push(cumulative[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const length = cumulative[cumulative.length - 1];

  for (const pass of passes) {
    const s0 = cumulative[pass.startIndex];
    const len = pass.to.distanceTo(pass.from);
    for (const p of panels) {
      if (p.row !== pass.row || p.level !== pass.level) continue;
      const t = (p.centre.x - pass.from.x) / (pass.to.x - pass.from.x);
      p.washAt.push((s0 + t * len) / length);
    }
  }

  const legs: Leg[] = [];
  let washed: (typeof passes)[number] | null = null;
  for (let i = 0; i < pts.length - 1; i++) {
    const own = passes.find((pass) => pass.startIndex === i);
    const next = own ?? passes.find((pass) => pass.startIndex > i) ?? passes[passes.length - 1];
    legs.push({ zone: ROW_ZONES[next.row], floor: next.row, pass: next.pass, moving: !own && !!washed && washed.row !== next.row });
    if (own) washed = own;
  }
  const spans: Partial<Record<SolarZoneId, [number, number]>> = {};
  for (const p of panels) {
    const span = (spans[p.zone] ??= [1, 0]);
    span[0] = Math.min(span[0], p.washAt[0]);
    span[1] = Math.max(span[1], p.washAt[p.washAt.length - 1]);
  }
  return { points: pts, cumulative, length, passStarts: new Set(passes.map((pass) => pass.startIndex)), legs, spans };
}

export const PANELS = buildPanels();
export const ROUTE = buildRoute(PANELS);

const deg = (d: number) => (d * Math.PI) / 180;

/**
 * The overview looks across the array from the north-east, over the front row, with the reel's pad on
 * the right; the row views look square on to each row's glass. The overview sways between SWAY's
 * azimuths rather than circling, so the glass, not the steel behind it, is always in view.
 */
export const CAMERA: Record<"overview" | SolarZoneId, CameraPreset> = {
  overview: { target: [1, 0.6, 1], distance: 51, polar: deg(50), azimuth: deg(38) },
  "row-a": { target: [0, LOW + 0.5, rowZ(0)], distance: 26, polar: deg(56), azimuth: deg(16) },
  "row-b": { target: [0, LOW + 0.5, rowZ(1)], distance: 26, polar: deg(56), azimuth: deg(16) },
  "row-c": { target: [0, LOW + 0.5, rowZ(2)], distance: 26, polar: deg(56), azimuth: deg(16) },
  "row-d": { target: [0, LOW + 0.5, rowZ(3)], distance: 26, polar: deg(56), azimuth: deg(16) },
};

/** The automatic sway's azimuths, and how far a drag may turn the view (never round to the panels' backs). */
export const SWAY = { from: deg(22), to: deg(54), drag: [deg(-70), deg(80)] as [number, number] };

/** A row's glass as a closed outline, a little proud of it, for the zones layer. */
export function zoneOutline(zone: string): THREE.Vector3[] {
  const row = ROW_ZONES.indexOf(zone as SolarZoneId);
  const lift = (p: THREE.Vector3) => p.addScaledVector(NORMAL, 0.07);
  const c = [onTable(row, -0.06, -0.05), onTable(row, ROW_LEN + 0.06, -0.05), onTable(row, ROW_LEN + 0.06, SLOPE + 0.05), onTable(row, -0.06, SLOPE + 0.05)].map(lift);
  return [...c, c[0].clone()];
}

/**
 * What each preset keeps in frame: for the overview, the glass of all four rows and the reel's pad
 * (the ground and the steel's feet may run off the edges, so the array fills the view); for a row, its
 * glass with a margin.
 */
export function presetBounds(id: string): THREE.Vector3[] {
  if (id === "overview") {
    const last = ROWS - 1;
    const front = PAD.z + PAD.d / 2;
    return [onTable(0, 0, 0), onTable(0, ROW_LEN, 0), onTable(0, 0, SLOPE), onTable(last, 0, SLOPE), onTable(last, ROW_LEN, SLOPE), onTable(last, ROW_LEN, 0), REEL, new THREE.Vector3(PAD.x - PAD.w / 2, 0, front), new THREE.Vector3(PAD.x + PAD.w / 2, 0, front)];
  }
  return zoneOutline(id).map((p) => p.clone().add(new THREE.Vector3(0, 0.6, 0)));
}

/** Row spacing, for the aisles the tether lies in. */
export { PITCH };
