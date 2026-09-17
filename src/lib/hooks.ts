"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Media query as an external store: correct on the server, no setState in effects. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  window.addEventListener("resize", cb);
  return () => {
    window.removeEventListener("scroll", cb);
    window.removeEventListener("resize", cb);
  };
}

/** 0..3 bitmask: bit 1 = scrolled past 24px, bit 2 = still within the first viewport. */
export function useScrollBits(): number {
  return useSyncExternalStore(subscribeScroll, () => (window.scrollY > 24 ? 1 : 0) + (window.scrollY < window.innerHeight * 0.8 ? 2 : 0), () => 2);
}

let capability: boolean | null = null;
function compute3d() {
  if (capability !== null) return capability;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  const wide = window.matchMedia("(min-width: 768px)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const saveData = nav.connection?.saveData === true;
  const memory = nav.deviceMemory ?? 8;
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  capability = wide && !reduce && cores >= 4 && !saveData && memory >= 4 && webgl;
  return capability;
}

/** Whether this device should get the WebGL building instead of the fallback. */
export function useCanRender3d(): boolean {
  return useSyncExternalStore(noop, compute3d, () => false);
}
