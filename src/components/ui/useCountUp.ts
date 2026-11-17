"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * A figure that counts to its new value: when `target` changes, the figure on screen runs to it over
 * `ms` (ease-out, on requestAnimationFrame) from where it stands, and its last frame is the target
 * itself, exactly. It never counts from nothing: a first figure (after `null`) is shown at once, and so
 * is every figure under reduced motion. The value is not rounded: the caller formats it.
 *
 * It is for the eye only. Read the target, not this, in anything a screen reader hears.
 */
export function useCountUp(target: number | null, ms = 450): number | null {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState({ to: target, value: target });
  // The figure on screen as the loop last drew it: where the next run starts.
  const drawn = useRef(target);

  // A new target: keep the figure on screen and head for it, or take it at once when there is no
  // figure to count from, none to count to, or motion is reduced.
  if (shown.to !== target) {
    const still = reduce || target === null || shown.value === null;
    setShown({ to: target, value: still ? target : shown.value });
  }

  useEffect(() => {
    const from = drawn.current;
    if (reduce || target === null || from === null || from === target) {
      drawn.current = target;
      return;
    }
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / ms);
      const value = t === 1 ? target : from + (target - from) * (1 - (1 - t) ** 3);
      drawn.current = value;
      setShown({ to: target, value });
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, ms, reduce]);

  return shown.to === target ? shown.value : target;
}
