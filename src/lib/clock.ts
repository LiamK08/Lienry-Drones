"use client";

/**
 * Animation time for the software view. Normally it is the browser clock. In capture
 * mode (`?capture=1`) the recording script steps time by hand so every frame is
 * deterministic no matter how slowly the headless renderer draws.
 */
let manual: number | null = null;
const ticks = new Set<() => void>();

export function isCapture(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("capture");
}

/** Which recording is being made, when the page runs under the recorder. */
export function captureVariant(): "wide" | "tall" | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("capture");
  return v === "tall" ? "tall" : v === null ? null : "wide";
}

export function now(): number {
  return manual ?? performance.now();
}

export function setManualTime(ms: number): void {
  manual = ms;
}

/** In capture mode the page's own animation loops run from here, once per recorded frame. */
export function onTick(fn: () => void): () => void {
  ticks.add(fn);
  return () => {
    ticks.delete(fn);
  };
}

export function runTicks(): void {
  ticks.forEach((fn) => fn());
}
