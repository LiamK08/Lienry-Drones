/**
 * Copy and demo data for the software view. Everything here is illustrative: the
 * window shows what the desktop software tracks, not a real customer's building.
 */
export const softwareSection = {
  headline: "The software sees the whole building.",
  body: "Every clean starts from the scan. The desktop software renders the building as a model, plans the wash route, tracks progress live and shades the areas where debris has built up.",
  note: "Model is illustrative. The software renders the real building from its scan.",
  filmCaption: "The same kind of facade on a real building.",
  filmId: "h1-hero-film",
};

export type ZoneId = "north" | "east" | "roof" | "shopfront";

export type Zone = {
  id: ZoneId;
  name: string;
  surface: string;
  preset: string;
  pressure: string;
  /** Ordinal in the wash route. */
  order: number;
};

export const zones: Zone[] = [
  { id: "north", name: "North facade", surface: "Curtain wall glass", preset: "Standard", pressure: "70 bar", order: 1 },
  { id: "east", name: "East facade", surface: "Curtain wall glass", preset: "Standard", pressure: "70 bar", order: 2 },
  { id: "roof", name: "Roof glazing", surface: "Laminated skylight", preset: "Gentle", pressure: "45 bar", order: 3 },
  { id: "shopfront", name: "Ground floor shopfront", surface: "Toughened glass", preset: "Low, wide fan", pressure: "35 bar", order: 4 },
];

export const project = {
  name: "Demo building, 12 storeys",
  app: "Lienry Desktop",
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
