"use client";

import { useCallback, useEffect, useState, type KeyboardEvent, type RefObject } from "react";
import { ArrowGlyph, IconButton } from "@/components/ui/IconButton";

/**
 * A scroll-snap track's place: which position it rests nearest (one item along each) and how many
 * there are (the items less the ones in view, plus one). Measured on scroll (passive) and on resize,
 * only while `active` (where the items form a track).
 */
export function usePager(trackRef: RefObject<HTMLElement | null>, count: number, active: boolean) {
  const [state, setState] = useState({ index: 0, positions: count });
  const measure = useCallback(() => {
    const t = trackRef.current;
    const first = t?.firstElementChild as HTMLElement | null;
    if (!t || !first) return;
    const gap = parseFloat(getComputedStyle(t).columnGap) || 0;
    const each = first.offsetWidth + gap;
    const visible = Math.max(1, Math.round((t.clientWidth + gap) / each));
    const positions = Math.max(1, count - visible + 1);
    const index = Math.max(0, Math.min(positions - 1, Math.round(t.scrollLeft / each)));
    setState((s) => (s.index === index && s.positions === positions ? s : { index, positions }));
  }, [trackRef, count]);
  useEffect(() => {
    const t = trackRef.current;
    if (!t || !active) return;
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    t.addEventListener("scroll", measure, { passive: true });
    return () => {
      ro.disconnect();
      t.removeEventListener("scroll", measure);
    };
  }, [trackRef, active, measure]);
  return state;
}

/** Scrolls a track to position `to` (one item along each), instantly under reduced motion. */
export function stepTrack(t: HTMLElement | null, to: number, reduce: boolean) {
  const first = t?.firstElementChild as HTMLElement | null;
  if (!t || !first) return;
  const gap = parseFloat(getComputedStyle(t).columnGap) || 0;
  t.scrollTo({ left: to * (first.offsetWidth + gap), behavior: reduce ? "instant" : "smooth" });
}

/** The track's own keys, on the focused list: the arrows move one position, Home and End to the ends. */
export function pagerKeys(e: KeyboardEvent<HTMLElement>, index: number, positions: number, go: (to: number) => void) {
  if (e.target !== e.currentTarget) return;
  const keys: Record<string, number> = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: positions - 1 };
  if (!(e.key in keys)) return;
  e.preventDefault();
  go(Math.max(0, Math.min(positions - 1, keys[e.key])));
}

/**
 * Under a track, centred: round previous and next buttons around a pager of dots, one per position,
 * each in a 24px target, the current one a wider accent pill. At the ends a button is unavailable.
 */
export function Pager({ trackId, index, positions, count, go, noun, className = "" }: { trackId: string; index: number; positions: number; count: number; go: (to: number) => void; noun: string; className?: string }) {
  // Each dot names the items it brings into view: "Show reason 2 of 5", or two up, "Show reasons 3 and 4 of 5".
  const inView = Math.max(1, count - positions + 1);
  const name = (p: number) => (inView === 1 ? `Show ${noun} ${p + 1} of ${count}` : inView === 2 ? `Show ${noun}s ${p + 1} and ${p + 2} of ${count}` : `Show ${noun}s ${p + 1} to ${p + inView} of ${count}`);
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <IconButton round label={`Previous ${noun}`} aria-controls={trackId} unavailable={index <= 0} onClick={() => go(index - 1)}>
        <ArrowGlyph back />
      </IconButton>
      <ul className="flex items-center">
        {Array.from({ length: positions }, (_, p) => (
          <li key={p}>
            <button
              type="button"
              aria-label={name(p)}
              aria-current={p === index || undefined}
              aria-controls={trackId}
              onClick={() => go(p)}
              className="flex size-6 items-center justify-center"
            >
              <span aria-hidden="true" className={`block h-2 rounded-pill transition-[width,background-color] duration-200 motion-reduce:transition-none ${p === index ? "w-5 bg-accent" : "w-2 bg-control"}`} />
            </button>
          </li>
        ))}
      </ul>
      <IconButton round label={`Next ${noun}`} aria-controls={trackId} unavailable={index >= positions - 1} onClick={() => go(index + 1)}>
        <ArrowGlyph />
      </IconButton>
    </div>
  );
}
