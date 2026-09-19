import type { ZoneId } from "@/content/software";

export type Layers = { scan: boolean; wash: boolean; debris: boolean; zones: boolean };

export type HoverInfo = {
  zone: string;
  surface: string;
  pressure: string;
  lastWashed: string;
  debris: number;
} | null;

/**
 * The live link between the app window (React state) and the scene (per-frame reads).
 * The window writes; the scene reads every frame, so nothing re-renders while the model runs.
 */
export type SceneControl = {
  /** Wash progress along the planned route, 0 to 1. */
  wash: number;
  layers: Layers;
  selected: ZoneId | null;
  /** A camera move the scene should start; it clears the field once it has begun. */
  flyTo: ZoneId | "overview" | null;
  /** When the scan layer was last switched on (clock ms), so the sweep plays once. */
  scanStartedAt: number | null;
  /** Keep rendering: on screen, tab visible and motion allowed. */
  active: boolean;
  /** Written by the scene each frame so the window can show live counts without re-rendering the model. */
  stats: { completed: number; total: number };
  /** Where the drone is, written by the scene each frame (used by the recorder's close-up check). */
  drone: { x: number; y: number; z: number };
  /** Set by the scene: request one frame when nothing else is animating. */
  requestFrame: () => void;
  onHover: (info: HoverInfo, x: number, y: number) => void;
};

export const DEFAULT_LAYERS: Layers = { scan: false, wash: true, debris: true, zones: false };

export function createControl(): SceneControl {
  return {
    wash: 0,
    layers: { ...DEFAULT_LAYERS },
    selected: null,
    flyTo: null,
    scanStartedAt: null,
    active: false,
    stats: { completed: 0, total: 0 },
    drone: { x: 0, y: 0, z: 0 },
    requestFrame: () => {},
    onHover: () => {},
  };
}
