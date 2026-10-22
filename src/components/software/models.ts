import type { ComponentType } from "react";
import { project, solarProject, solarZones, zones, type Project, type Zone, type ZoneId } from "@/content/software";
import { CELLS as BUILDING_CELLS, CELL_COUNT as BUILDING_CELL_COUNT, FLOORS, MAP as FACADE } from "@/components/three/software/dims";
import { CELLS as SOLAR_CELLS, CELL_COUNT as SOLAR_CELL_COUNT, COLS, ROWS, UP, cellIndex } from "@/components/three/solar/dims";
import { ArrayMap } from "./ArrayMap";
import { FACADE_MAP_COLUMNS, FacadeMap } from "./FacadeMap";

export type ModelId = "building" | "solar";

/** The leg of the route the drone is on: `floor` is the building's floor, or the array's row. */
export type Activity = { zone: ZoneId; floor: number; pass: number; moving: boolean };

export type MapProps = { cells: ArrayLike<number>; version: number; wash: boolean; debris: boolean; selected: ZoneId | null };

/**
 * Everything the software window shows that belongs to one model rather than to the window: the
 * project, the zones and their cells, the recording's figures, the status lines, the map and its key,
 * and the recordings. No three.js, so the window can render all of it before the WebGL chunk.
 */
export type WindowModel = {
  id: ModelId;
  project: Project;
  zones: Zone[];
  cellCount: number;
  /** Each cell's zone, in map order. */
  cellZones: ZoneId[];
  /** The recording's figures (recording mode shows these, not live ones). */
  demo: { wash: number; completed: number; cells: Float32Array };
  legLines: (a: Activity, complete: boolean) => [string, string];
  routeNote: string;
  /** What a zone is called in the window's own words: "zone" (the building), "row" (the array). */
  zoneNoun: { one: string; many: string };
  /** The figure and hover labels for what the scan found on the glass. */
  debrisFact: string;
  debrisHover: string;
  mapLabel: string;
  Map: ComponentType<MapProps>;
  /** The labels under the map, on the map's own columns; null when the map labels itself. */
  mapAxis: { columns: string; labels: string[] } | null;
  legend: { colour: string; label: string }[];
  /** The recordings' file stem in /video. */
  video: string;
  recordingLabel: string;
};

/**
 * The building's recording figures as a plan: the north face washed top down, then the east face's
 * top floors, to `completed` panels. A floor is done when its second pass has crossed it: west to east
 * on the north face, south to north (right to left, seen from outside) on the east face.
 */
function buildingDemo(completed: number): Float32Array {
  const out = new Float32Array(BUILDING_CELL_COUNT);
  let left = completed;
  for (const block of [FACADE.north, FACADE.east]) {
    const floors = block === FACADE.north ? FLOORS - 1 : FLOORS;
    for (let k = 0; k < floors; k++) {
      const floor = FLOORS - 1 - k;
      for (let k2 = 0; k2 < block.cols && left > 0; k2++, left--) out[block.offset + floor * block.cols + (block === FACADE.east ? block.cols - 1 - k2 : k2)] = 1;
    }
  }
  return out;
}

/**
 * The array's recording figures as a plan: rows A and B washed, then row C's upper line (west to east)
 * and the first of its lower line (east to west), to `completed` panels.
 */
function solarDemo(completed: number): Float32Array {
  const out = new Float32Array(SOLAR_CELL_COUNT);
  let left = completed;
  for (let row = 0; row < ROWS && left > 0; row++)
    for (const level of [1, 0])
      for (let k = 0; k < COLS && left > 0; k++, left--) {
        // The upper line runs west to east, the lower line back east to west.
        const col = level === 1 ? k : COLS - 1 - k;
        out[cellIndex(row, level, col)] = 1;
      }
  return out;
}

const building: WindowModel = {
  id: "building",
  project,
  zones,
  cellCount: BUILDING_CELL_COUNT,
  cellZones: BUILDING_CELLS.map((c) => c.zone),
  demo: { wash: 64, completed: 204, cells: buildingDemo(204) },
  legLines: (a, complete) => {
    if (complete) return ["Clean complete", `${BUILDING_CELL_COUNT} of ${BUILDING_CELL_COUNT} panels washed`];
    const name = zones.find((z) => z.id === a.zone)?.name ?? "";
    const where = a.zone === "roof" ? `Row ${a.pass + 1} of 2` : `Level ${a.floor + 1} · pass ${a.pass + 1} of 2`;
    return [`${a.moving ? "Moving to" : "Washing"} ${name}`, where];
  },
  routeNote: "Two passes per floor, top down.",
  zoneNoun: { one: "zone", many: "zones" },
  debrisFact: "Debris zones found",
  debrisHover: "Debris build-up",
  mapLabel: "Facade map",
  Map: FacadeMap,
  mapAxis: { columns: FACADE_MAP_COLUMNS, labels: ["North", "", "East", "", "Roof"] },
  legend: [
    { colour: "var(--color-glass)", label: "Washed" },
    { colour: "#7fb0b9", label: "One pass" },
    { colour: "#e4ded3", label: "Pending" },
    { colour: "#e0a13a", label: "Debris" },
  ],
  video: "software-view",
  recordingLabel: "Recording of the software view: the model of a 12-storey building being scanned and washed",
};

/** The recording's poster moment (6.5 s of a 10 s clean): rows A and B, row C's upper line and one more panel. */
const SOLAR_COMPLETED = 2 * UP * COLS + COLS + 1;

const solar: WindowModel = {
  id: "solar",
  project: solarProject,
  zones: solarZones,
  cellCount: SOLAR_CELL_COUNT,
  cellZones: SOLAR_CELLS.map((c) => c.zone),
  demo: { wash: 64, completed: SOLAR_COMPLETED, cells: solarDemo(SOLAR_COMPLETED) },
  legLines: (a, complete) => {
    if (complete) return ["Clean complete", `${SOLAR_CELL_COUNT} of ${SOLAR_CELL_COUNT} panels washed`];
    const name = solarZones.find((z) => z.id === a.zone)?.name ?? "";
    return [`${a.moving ? "Moving to" : "Washing"} ${name}`, `${a.pass === 0 ? "Upper" : "Lower"} panels · pass ${a.pass + 1} of 2`];
  },
  routeNote: "Two passes per row, upper panels first.",
  zoneNoun: { one: "row", many: "rows" },
  debrisFact: "Soiled rows found",
  debrisHover: "Soiling",
  mapLabel: "Array map",
  Map: ArrayMap,
  mapAxis: null,
  legend: [
    { colour: "var(--color-glass)", label: "Washed" },
    { colour: "#e4ded3", label: "Pending" },
    { colour: "#e0a13a", label: "Soiling" },
  ],
  video: "solar-view",
  recordingLabel: "Recording of the software view: the model of a four-row solar array being scanned and washed",
};

export const MODELS: Record<ModelId, WindowModel> = { building, solar };
