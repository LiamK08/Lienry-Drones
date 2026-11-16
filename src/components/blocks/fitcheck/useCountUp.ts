"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A figure that counts to its new value: from the value on screen to `target` over `ms` (ease-out), a
 * frame at a time. A null target (nothing to show yet) passes straight through, and the first figure
 * after it arrives at once. Under reduced motion every change lands in one frame. The last frame is
 * the exact target, so a count never rests on a rounded step. `whole` keeps the steps to whole numbers.
 */
export function useCountUp(target: number | null, { ms = 450, whole = true }: { ms?: number; whole?: boolean } = {}) {
  const [shown, setShown] = useState(target);
  // The value on screen, so a count that is interrupted carries on from where it stood.
  const from = useRef(target);
  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    const still = target === null || start === null || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const p = still ? 1 : Math.min(1, (now - t0) / ms);
      const at = start === null || target === null ? target : start + (target - start) * (1 - (1 - p) ** 3);
      const value = p === 1 || at === null ? target : whole ? Math.round(at) : at;
      from.current = value;
      setShown(value);
      if (p < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, ms, whole]);
  return shown;
}
