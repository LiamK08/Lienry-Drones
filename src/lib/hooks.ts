"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

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

/**
 * Which of `count` elements currently sits in the band around the viewport centre.
 * One IntersectionObserver, no per-frame scroll maths. Register elements with `setRef(i)`.
 */
export function useActiveStep(count: number, band = "-40% 0px -40% 0px"): [number, (i: number) => (el: HTMLElement | null) => void] {
  const [active, setActive] = useState(0);
  const els = useRef<(HTMLElement | null)[]>([]);
  const setRef = useCallback(
    (i: number) => (el: HTMLElement | null) => {
      els.current[i] = el;
    },
    [],
  );
  useEffect(() => {
    const nodes = els.current.slice(0, count).filter((el): el is HTMLElement => !!el);
    if (nodes.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!hit) return;
        const i = nodes.indexOf(hit.target as HTMLElement);
        if (i >= 0) setActive(i);
      },
      { rootMargin: band, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    nodes.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [count, band]);
  return [active, setRef];
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
  const capable = useSyncExternalStore(noop, compute3d, () => false);
  return wide && !reduce && capable;
}
