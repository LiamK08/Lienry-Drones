"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

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
  return () => window.removeEventListener("scroll", cb);
}

/** True once the page has scrolled past `px`. Reads scrollY only when the browser fires a scroll event. */
export function useScrolledPast(px: number): boolean {
  return useSyncExternalStore(subscribeScroll, () => window.scrollY > px, () => false);
}

/** Whether an element is on screen, with an optional margin. IntersectionObserver only. */
export function useOnScreen<T extends HTMLElement>(margin = "0px"): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOn(entry.isIntersecting), { rootMargin: margin, threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, on];
}

let capability: boolean | null = null;
function compute3d() {
  if (capability !== null) return capability;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
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
  capability = cores >= 4 && !saveData && memory >= 4 && webgl;
  return capability;
}

/** Whether this device should get the WebGL building instead of the fallback. */
export function useCanRender3d(): boolean {
  const wide = useMediaQuery("(min-width: 768px)");
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  // The probe creates a WebGL context, so it only runs where the answer can matter: from 768 with
  // motion allowed. On phones and under reduced motion no context is ever created.
  const capable = useSyncExternalStore(noop, wide && !reduce ? compute3d : never, never);
  return wide && !reduce && capable;
}

const never = () => false;

/** A fine pointer that can hover: where hover clips may play. */
export const useHoverCapable = () => useMediaQuery("(hover: hover) and (pointer: fine)");

export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

const saveDataOn = () => (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/** The visitor asked for less data (Save-Data). */
export const useSaveData = () => useSyncExternalStore(noop, saveDataOn, () => false);

type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };

/**
 * Runs `cb` once the page has loaded (the load event) and the main thread is next idle, so work
 * that is not part of the first screen never competes with it. Returns a cancel function.
 */
export function afterLoadIdle(cb: () => void, timeout = 2000): () => void {
  const w = window as IdleWindow;
  let idle = 0;
  let timer = 0;
  let done = false;
  const run = () => {
    if (done) return;
    if (w.requestIdleCallback) idle = w.requestIdleCallback(() => !done && cb(), { timeout });
    else timer = window.setTimeout(() => !done && cb(), 1);
  };
  const onLoad = () => run();
  if (document.readyState === "complete") run();
  else window.addEventListener("load", onLoad, { once: true });
  return () => {
    done = true;
    window.removeEventListener("load", onLoad);
    if (idle) w.cancelIdleCallback?.(idle);
    window.clearTimeout(timer);
  };
}
