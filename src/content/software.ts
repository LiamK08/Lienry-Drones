/**
 * Copy and demo data for the software view. Everything here is illustrative: the
 * window shows what the desktop software tracks, not a real customer's building.
 */
export const softwareSection = {
  headline: "The software sees the whole building.",
  body: "Every clean starts from the scan. The desktop software renders the building as a model, plans the wash route, tracks progress live and shades the areas where debris has built up.",
};

/**
 * The home software band's four steps, in Lienry's own process words. Each tab applies a preset to the
 * window; none of them shares a name with a layer toggle (Scan, Wash, Debris, Zones). `short` is the line
 * in the static list shown when the window is a recording (phones, reduced motion, no WebGL).
 */
/** "report" is the home flow's last step: the clean finished, paused at 100% with debris shaded. */
export type StepId = "map" | "plan" | "clean" | "rescan" | "report";

export const softwareSteps: { id: StepId; tab: string; caption: string; hint?: string; short: string }[] = [
  {
    id: "map",
    tab: "Map",
    caption: "The drone maps the structure and dimensions of the building, and the software builds its model from that scan.",
    short: "The drone maps the building, and the model is built from the scan.",
  },
  {
    id: "plan",
    tab: "Plan",
    caption: "Each zone has its own surface, preset and pressure.",
    hint: "Select a zone in the window to fly to it.",
    short: "Each zone gets its own surface, preset and pressure.",
  },
  {
    id: "clean",
    tab: "Clean",
    caption: "The clean moves down the facade, two passes per floor, top down.",
    hint: "Drag the timeline to scrub it.",
    short: "The clean moves down the facade, two passes per floor.",
  },
  {
    id: "rescan",
    tab: "Re-scan",
    caption: "On its interval the drone re-scans the building, and built-up debris is shaded where the next clean is needed.",
    short: "The re-scan shades built-up debris where the next clean is needed.",
  },
];

export const softwareDefaultStep: StepId = "clean";

export const softwareStepsLabel = "Software steps";

export type BuildingZoneId = "north" | "east" | "roof" | "shopfront";
export type SolarZoneId = "row-a" | "row-b" | "row-c" | "row-d";
/** A zone of either model the window can show: the building's four, or the solar array's four rows. */
export type ZoneId = BuildingZoneId | SolarZoneId;

export type Zone<Id extends ZoneId = ZoneId> = {
  id: Id;
  name: string;
  surface: string;
  preset: string;
  pressure: string;
  /** Ordinal in the wash route. */
  order: number;
};

export const zones: Zone<BuildingZoneId>[] = [
  { id: "north", name: "North facade", surface: "Curtain wall glass", preset: "Standard", pressure: "70 bar", order: 1 },
  { id: "east", name: "East facade", surface: "Curtain wall glass", preset: "Standard", pressure: "70 bar", order: 2 },
  { id: "roof", name: "Roof glazing", surface: "Laminated skylight", preset: "Gentle", pressure: "45 bar", order: 3 },
  { id: "shopfront", name: "Ground floor shopfront", surface: "Toughened glass", preset: "Low, wide fan", pressure: "35 bar", order: 4 },
];

export type Project = { name: string; app: string; view: string; scanAge: string; nextClean: string; debrisZones: number };

export const project: Project = {
  name: "Demo building, 12 storeys",
  app: "Lienry Desktop",
  view: "Wash plan",
  scanAge: "2 days",
  nextClean: "Thu 07:00",
  debrisZones: 3,
};

export const layers = [
  { id: "scan", label: "Scan" },
  { id: "wash", label: "Wash" },
  { id: "debris", label: "Debris" },
  { id: "zones", label: "Zones" },
] as const;

export type LayerId = (typeof layers)[number]["id"];

/**
 * The solar array model: a demo ground-mounted array of four rows. Like the building, everything here
 * is illustrative demo data. No copy names which Lienry system serves a solar farm (still open).
 */
export const solarZones: Zone<SolarZoneId>[] = [
  { id: "row-a", name: "Row A", surface: "Solar glass", preset: "Solar", pressure: "30 bar", order: 1 },
  { id: "row-b", name: "Row B", surface: "Solar glass", preset: "Solar", pressure: "30 bar", order: 2 },
  { id: "row-c", name: "Row C", surface: "Solar glass", preset: "Solar", pressure: "30 bar", order: 3 },
  { id: "row-d", name: "Row D", surface: "Solar glass", preset: "Solar", pressure: "30 bar", order: 4 },
];

export const solarProject: Project = {
  name: "Demo array, 4 rows",
  app: "Lienry Desktop",
  view: "Wash plan",
  scanAge: "1 day",
  nextClean: "Sat 06:30",
  debrisZones: 4,
};
