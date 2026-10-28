"use client";

import { useLayoutEffect, type RefObject } from "react";

/**
 * A gliding selection indicator: measures the active item of a row and writes its box onto the row as
 * CSS variables (--ix, --iy, --iw, --ih), so an aria-hidden indicator span inside the row can sit under
 * it and glide to the next choice. Nothing re-renders: the variables are written to the DOM directly.
 *
 * The row must be the indicator's containing block (position: relative); its items carry `data-indicator-item`.
 * `data-indicator-ready` is set on the row one frame after the first measure, so the indicator shows (and
 * its transition starts) only once it is in place; until then the active item paints its own fallback.
 * The row and its items are watched for size changes (a web font arriving, a resize) and re-measured.
 */
export function useIndicator(rowRef: RefObject<HTMLElement | null>, active: number) {
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const items = () => Array.from(row.querySelectorAll<HTMLElement>("[data-indicator-item]"));
    const measure = () => {
      const el = items()[active];
      if (!el) {
        row.removeAttribute("data-indicator-ready");
        return;
      }
      // Read from the boxes (not offset*, which round to whole pixels), relative to the row's padding box.
      const r = row.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      row.style.setProperty("--ix", `${b.left - r.left - row.clientLeft}px`);
      row.style.setProperty("--iy", `${b.top - r.top - row.clientTop}px`);
      row.style.setProperty("--iw", `${b.width}px`);
      row.style.setProperty("--ih", `${b.height}px`);
    };
    measure();
    const frame = requestAnimationFrame(() => {
      if (items()[active]) row.setAttribute("data-indicator-ready", "");
    });
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    for (const el of items()) ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [rowRef, active]);
}
