import * as THREE from "three";
import type { ZoneId } from "@/content/software";

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
export const MULLION_W = 0.1;
export const RECESS = 0.18;
export const PARAPET_H = 1.1;
export const PARAPET_T = 0.35;
export const STANDOFF = 0.2;
export const DRONE_HALF = 0.55;
export const PAD_H = 1.4;

export const LANTERN = { w: 9, d: 5, h: 1.25, x: -4.5, z: -1.5, cols: 4, rows: 2 };
export const REEL = new THREE.Vector3(W / 2 - 2.6, ROOF_Y + 0.62, D / 2 - 2.2);

export type Face = "N" | "E" | "S" | "W" | "R";

export type Panel = {
  face: Face;
  floor: number;
  bay: number;
  centre: THREE.Vector3;
  width: number;
  height: number;
  /** Rotation about y so the panel faces outward (roof panels lie flat). */
  rotationY: number;
  zone: ZoneId | null;
  /** Route progress (0 to 1) at which each of the two passes crosses this panel; empty when it is not in the plan. */
  washAt: number[];
  debris: number;
  lastWashed: string;
};

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

/** Left edge origin and outward normal for each facade so face coordinates map to world space. */
export function faceFrame(face: Face): { origin: THREE.Vector3; along: THREE.Vector3; normal: THREE.Vector3; length: number; rotationY: number } {
  switch (face) {
    case "N":
      return { origin: new THREE.Vector3(-W / 2, 0, D / 2), along: new THREE.Vector3(1, 0, 0), normal: new THREE.Vector3(0, 0, 1), length: W, rotationY: 0 };
    case "E":
      return { origin: new THREE.Vector3(W / 2, 0, D / 2), along: new THREE.Vector3(0, 0, -1), normal: new THREE.Vector3(1, 0, 0), length: D, rotationY: Math.PI / 2 };
    case "S":
      return { origin: new THREE.Vector3(W / 2, 0, -D / 2), along: new THREE.Vector3(-1, 0, 0), normal: new THREE.Vector3(0, 0, -1), length: W, rotationY: Math.PI };
    case "W":
      return { origin: new THREE.Vector3(-W / 2, 0, -D / 2), along: new THREE.Vector3(0, 0, 1), normal: new THREE.Vector3(-1, 0, 0), length: D, rotationY: -Math.PI / 2 };
    default:
      return { origin: new THREE.Vector3(LANTERN.x - LANTERN.w / 2, ROOF_Y + LANTERN.h, LANTERN.z + LANTERN.d / 2), along: new THREE.Vector3(1, 0, 0), normal: new THREE.Vector3(0, 1, 0), length: LANTERN.w, rotationY: 0 };
  }
}

const LAST_WASHED: Record<string, string> = { north: "14 days ago", east: "14 days ago", roof: "28 days ago", shopfront: "7 days ago" };

function zoneFor(face: Face, floor: number): ZoneId | null {
  if (face === "N") return floor === 0 ? "shopfront" : "north";
  if (face === "E") return "east";
  if (face === "R") return "roof";
  return null;
}

export type Route = { points: THREE.Vector3[]; cumulative: number[]; length: number; passStarts: Set<number> };

function buildPanels(): Panel[] {
  const out: Panel[] = [];
  for (const face of ["N", "E", "S", "W"] as Face[]) {
    const f = faceFrame(face);
    const bays = face === "N" || face === "S" ? BAYS_N : BAYS_E;
    const bay = f.length / bays;
    for (let floor = 0; floor < FLOORS; floor++) {
      for (let b = 0; b < bays; b++) {
        const u = (b + 0.5) * bay;
        const v = floor * FLOOR_H + SLAB_H + GLASS_H / 2;
        const centre = f.origin.clone().addScaledVector(f.along, u).addScaledVector(f.normal, -RECESS);
        centre.y = v;
        const zone = zoneFor(face, floor);
        out.push({
          face,
          floor,
          bay: b,
          centre,
          width: bay - MULLION_W,
          height: GLASS_H,
          rotationY: f.rotationY,
          zone,
          washAt: [],
          debris: zone ? debrisAt(face, u, v) : 0,
          lastWashed: zone ? LAST_WASHED[zone] : "Not in this plan",
        });
      }
    }
  }
  const r = faceFrame("R");
  const cw = LANTERN.w / LANTERN.cols;
  const cd = LANTERN.d / LANTERN.rows;
  for (let row = 0; row < LANTERN.rows; row++) {
    for (let col = 0; col < LANTERN.cols; col++) {
      const centre = new THREE.Vector3(r.origin.x + (col + 0.5) * cw, r.origin.y, r.origin.z - (row + 0.5) * cd);
      out.push({ face: "R", floor: FLOORS, bay: col + row * LANTERN.cols, centre, width: cw - MULLION_W, height: cd - MULLION_W, rotationY: 0, zone: "roof", washAt: [], debris: 0, lastWashed: LAST_WASHED.roof });
    }
  }
  return out;
}

/**
 * The planned wash route: two overlapping horizontal passes per floor, top down, north face then
 * east face, the roof glazing, then the shopfront. Each pass overshoots the edges by half a metre.
 */
function buildRoute(panels: Panel[]): Route {
  const pts: THREE.Vector3[] = [];
  const passes: { face: Face; floor: number; y: number; from: THREE.Vector3; to: THREE.Vector3; startIndex: number }[] = [];
  const passY = (floor: number) => [floor * FLOOR_H + SLAB_H + GLASS_H - PAD_H / 2 + 0.05, floor * FLOOR_H + SLAB_H + PAD_H / 2 - 0.05];
  const offsetOut = RECESS + STANDOFF + DRONE_HALF;

  const facePasses = (face: Face, floors: number[], startAtEnd: boolean) => {
    const f = faceFrame(face);
    let atEnd = startAtEnd;
    for (const floor of floors) {
      for (const y of passY(floor)) {
        const a = f.origin.clone().addScaledVector(f.along, atEnd ? f.length + 0.5 : -0.5).addScaledVector(f.normal, offsetOut - RECESS);
        const b = f.origin.clone().addScaledVector(f.along, atEnd ? -0.5 : f.length + 0.5).addScaledVector(f.normal, offsetOut - RECESS);
        a.y = y;
        b.y = y;
        passes.push({ face, floor, y, from: a, to: b, startIndex: pts.length });
        pts.push(a, b);
        atEnd = !atEnd;
      }
    }
  };

  const upper = Array.from({ length: FLOORS - 1 }, (_, i) => FLOORS - 1 - i);
  // North: start at the east end so the last pass finishes by the north-east corner.
  facePasses("N", upper, true);
  // Corner: a short arc around the north-east edge at the height of the last pass.
  const last = pts[pts.length - 1];
  pts.push(new THREE.Vector3(W / 2 + 1.3, last.y, D / 2 + 1.3));
  facePasses("E", Array.from({ length: FLOORS }, (_, i) => FLOORS - 1 - i), false);
  // Climb over the parapet to the roof glazing.
  const eEnd = pts[pts.length - 1];
  pts.push(new THREE.Vector3(W / 2 + 1.5, ROOF_Y + PARAPET_H + 2.2, eEnd.z), new THREE.Vector3(LANTERN.x + LANTERN.w / 2 + 1.5, ROOF_Y + LANTERN.h + 2.0, LANTERN.z + 1.25));
  const rf = faceFrame("R");
  const rowZ = [LANTERN.z + LANTERN.d / 4, LANTERN.z - LANTERN.d / 4];
  let fromRight = true;
  rowZ.forEach((z, i) => {
    const a = new THREE.Vector3(fromRight ? rf.origin.x + LANTERN.w + 0.5 : rf.origin.x - 0.5, ROOF_Y + LANTERN.h + 1.0, z);
    const b = new THREE.Vector3(fromRight ? rf.origin.x - 0.5 : rf.origin.x + LANTERN.w + 0.5, ROOF_Y + LANTERN.h + 1.0, z);
    passes.push({ face: "R", floor: FLOORS, y: i, from: a, to: b, startIndex: pts.length });
    pts.push(a, b);
    fromRight = !fromRight;
  });
  // Down the outside of the north face to the shopfront.
  const rEnd = pts[pts.length - 1];
  pts.push(new THREE.Vector3(rEnd.x, ROOF_Y + PARAPET_H + 2.4, D / 2 + 2.6), new THREE.Vector3(-W / 2 - 0.5, FLOOR_H + 1.2, D / 2 + offsetOut - RECESS));
  facePasses("N", [0], false);

  const cumulative: number[] = [0];
  for (let i = 1; i < pts.length; i++) cumulative.push(cumulative[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const length = cumulative[cumulative.length - 1];

  // When does each pass cross each panel it covers?
  for (const pass of passes) {
    const s0 = cumulative[pass.startIndex];
    const len = pass.to.distanceTo(pass.from);
    for (const p of panels) {
      if (!p.zone) continue;
      if (pass.face === "R") {
        if (p.face !== "R") continue;
        const row = Math.floor(p.bay / LANTERN.cols);
        if (row !== pass.y) continue;
        const t = Math.abs(p.centre.x - pass.from.x) / Math.abs(pass.to.x - pass.from.x);
        p.washAt.push((s0 + t * len) / length);
        continue;
      }
      if (p.face !== pass.face || p.floor !== pass.floor) continue;
      const f = faceFrame(pass.face);
      const u = p.centre.clone().sub(f.origin).dot(f.along);
      const uFrom = pass.from.clone().sub(f.origin).dot(f.along);
      const uTo = pass.to.clone().sub(f.origin).dot(f.along);
      const t = (u - uFrom) / (uTo - uFrom);
      p.washAt.push((s0 + t * len) / length);
    }
  }
  for (const p of panels) p.washAt.sort((a, b) => a - b);
  return { points: pts, cumulative, length, passStarts: new Set(passes.map((pass) => pass.startIndex)) };
}

/** Position along the route at progress p (0 to 1) and the direction of travel. Returns the segment index. */
export function routeAt(route: Route, p: number, out: THREE.Vector3, dir: THREE.Vector3): number {
  const s = THREE.MathUtils.clamp(p, 0, 1) * route.length;
  const c = route.cumulative;
  let i = 1;
  while (i < c.length - 1 && c[i] < s) i++;
  const a = route.points[i - 1];
  const b = route.points[i];
  const seg = c[i] - c[i - 1];
  const t = seg > 0 ? (s - c[i - 1]) / seg : 0;
  out.copy(a).lerp(b, THREE.MathUtils.clamp(t, 0, 1));
  dir.copy(b).sub(a).normalize();
  return i - 1;
}

export const PANELS = buildPanels();
export const ROUTE = buildRoute(PANELS);
export const PLANNED = PANELS.filter((p) => p.zone !== null);

export type CameraPreset = { target: [number, number, number]; distance: number; polar: number; azimuth: number };

const deg = (d: number) => (d * Math.PI) / 180;

export const CAMERA: Record<"overview" | ZoneId, CameraPreset> = {
  overview: { target: [0, 19, 0], distance: 70, polar: deg(70), azimuth: deg(40) },
  north: { target: [0, 19, 8], distance: 56, polar: deg(68), azimuth: deg(14) },
  east: { target: [12, 19, 0], distance: 56, polar: deg(68), azimuth: deg(76) },
  roof: { target: [-2, ROOF_Y, 0], distance: 44, polar: deg(40), azimuth: deg(38) },
  shopfront: { target: [0, 3.5, 8], distance: 36, polar: deg(70), azimuth: deg(22) },
};

export function presetPosition(preset: CameraPreset, out: THREE.Vector3, distance = preset.distance): THREE.Vector3 {
  const [tx, ty, tz] = preset.target;
  return out.set(tx + distance * Math.sin(preset.polar) * Math.sin(preset.azimuth), ty + distance * Math.cos(preset.polar), tz + distance * Math.sin(preset.polar) * Math.cos(preset.azimuth));
}

/** What each preset has to keep in frame: the whole block with its roof kit, or one zone with a margin. */
export function presetBounds(id: "overview" | ZoneId): THREE.Vector3[] {
  if (id === "overview") {
    const top = ROOF_Y + PARAPET_H + 2.2;
    const pts: THREE.Vector3[] = [];
    for (const x of [-W / 2 - 0.8, W / 2 + 0.8]) for (const z of [-D / 2 - 0.8, D / 2 + 0.8]) pts.push(new THREE.Vector3(x, -0.3, z), new THREE.Vector3(x, top, z));
    return pts;
  }
  const outline = zoneOutline(id);
  if (id === "roof") {
    // The roof view keeps the capsule dock and its reel in frame as well as the glazing.
    outline.push(new THREE.Vector3(REEL.x + 2.4, ROOF_Y + 1.2, REEL.z + 0.8), new THREE.Vector3(REEL.x + 2.4, ROOF_Y, REEL.z - 2.6));
  }
  const f = faceFrame(PANELS.find((p) => p.zone === id)!.face);
  return outline.map((p) => {
    const q = p.clone();
    if (f.normal.y > 0.5) q.y += 1.5;
    else {
      q.y += q.y > H / 2 ? 2 : -1.5;
      q.addScaledVector(f.normal, 1.5);
    }
    return q;
  });
}

const fitCamera = new THREE.PerspectiveCamera();
const fitPoint = new THREE.Vector3();

/**
 * The camera distance at which every bound sits inside the frame with a little headroom, for this
 * aspect ratio. Walked once per preset and again when the window is resized.
 */
export function fitDistance(preset: CameraPreset, bounds: THREE.Vector3[], aspect: number, fov: number): number {
  fitCamera.fov = fov;
  fitCamera.aspect = aspect;
  fitCamera.near = 1;
  fitCamera.far = 1000;
  fitCamera.updateProjectionMatrix();
  const target = new THREE.Vector3(...preset.target);
  for (let d = 20; d < 400; d += 1) {
    presetPosition(preset, fitCamera.position, d);
    fitCamera.lookAt(target);
    fitCamera.updateMatrixWorld();
    let ok = true;
    for (const b of bounds) {
      fitPoint.copy(b).project(fitCamera);
      if (fitPoint.x < -0.95 || fitPoint.x > 0.95 || fitPoint.y < -0.95 || fitPoint.y > 0.9 || fitPoint.z > 1) {
        ok = false;
        break;
      }
    }
    if (ok) return d;
  }
  return preset.distance;
}

/** A bounding rectangle for each zone, pushed a little proud of its face for the outline layer. */
export function zoneOutline(zone: ZoneId): THREE.Vector3[] {
  const ps = PANELS.filter((p) => p.zone === zone);
  const face = ps[0].face;
  const f = faceFrame(face);
  if (face === "R") {
    const y = ROOF_Y + LANTERN.h + 0.06;
    const x0 = LANTERN.x - LANTERN.w / 2;
    const x1 = LANTERN.x + LANTERN.w / 2;
    const z0 = LANTERN.z + LANTERN.d / 2;
    const z1 = LANTERN.z - LANTERN.d / 2;
    return [new THREE.Vector3(x0, y, z0), new THREE.Vector3(x1, y, z0), new THREE.Vector3(x1, y, z1), new THREE.Vector3(x0, y, z1), new THREE.Vector3(x0, y, z0)];
  }
  let u0 = Infinity;
  let u1 = -Infinity;
  let v0 = Infinity;
  let v1 = -Infinity;
  for (const p of ps) {
    const u = p.centre.clone().sub(f.origin).dot(f.along);
    u0 = Math.min(u0, u - p.width / 2 - MULLION_W / 2);
    u1 = Math.max(u1, u + p.width / 2 + MULLION_W / 2);
    v0 = Math.min(v0, p.centre.y - p.height / 2 - 0.05);
    v1 = Math.max(v1, p.centre.y + p.height / 2 + 0.05);
  }
  const at = (u: number, v: number) => {
    const o = f.origin.clone().addScaledVector(f.along, u).addScaledVector(f.normal, 0.08);
    o.y = v;
    return o;
  };
  return [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1), at(u0, v0)];
}
