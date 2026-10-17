"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useMediaQuery } from "@/lib/hooks";
import { ArrowGlyph, IconButton } from "@/components/ui/IconButton";
import { revealListVariants } from "@/components/ui/Reveal";

export type SnapTrackProps = {
  /** The list's DOM id. Required with controls="external" (SnapTrackControls finds the track by it). */
  id?: string;
  /** The track's accessible name, e.g. "Property types. Use left and right arrow keys to browse." */
  label: string;
  /** e.g. "Previous property". */
  prevLabel: string;
  /** e.g. "Next property". */
  nextLabel: string;
  /** Grid columns from `from` up. */
  columns: 2 | 3 | 4 | 5;
  /** Where the track becomes a static grid. Default "lg" (1024); "none" keeps a track at every width. */
  from?: "lg" | "xl" | "none";
  /** With from="none": items visible at once from 1024. Default 4. */
  visible?: 2 | 3 | 4;
  /** "inline" (default): the previous and next buttons above the track, at the right. "external": none
   *  here; render SnapTrackControls with this track's id where the design wants them (a section head). */
  controls?: "inline" | "external";
  /** `<li>` items, or `RevealItem`s (ui/Reveal) for the 60ms staggered reveal as the track enters. */
  children: ReactNode;
};

// Each variant string is written out whole so Tailwind can see it. The 8px focus room (negative
// margin, matching padding and scroll padding) keeps the cards' focus rings clear of the scroller.
const layout = {
  lg: {
    query: "(max-width: 1023.98px)",
    // Below 1024: a track. Items 82% wide below 768 and 46% to 1023.
    track:
      "max-lg:flex max-lg:overflow-x-auto max-lg:snap-x max-lg:snap-mandatory max-lg:gap-4 md:max-lg:gap-6 max-lg:-ml-2 max-lg:pl-2 max-lg:scroll-pl-2 max-lg:-my-2 max-lg:py-2 max-lg:-mr-(--bleed) max-lg:pr-(--bleed) max-lg:[&>li]:shrink-0 max-lg:[&>li]:snap-start max-md:[&>li]:w-[82%] md:max-lg:[&>li]:w-[46%]",
    grid: { 2: "lg:grid lg:grid-cols-2 lg:gap-6", 3: "lg:grid lg:grid-cols-3 lg:gap-6", 4: "lg:grid lg:grid-cols-4 lg:gap-6", 5: "lg:grid lg:grid-cols-5 lg:gap-6" },
    buttons: "max-lg:flex lg:hidden",
  },
  xl: {
    query: "(max-width: 1279.98px)",
    // Below 1280: a track. Items 82% below 768, 46% to 1023, 31% to 1279.
    track:
      "max-xl:flex max-xl:overflow-x-auto max-xl:snap-x max-xl:snap-mandatory max-xl:gap-4 md:max-xl:gap-6 max-xl:-ml-2 max-xl:pl-2 max-xl:scroll-pl-2 max-xl:-my-2 max-xl:py-2 max-xl:-mr-(--bleed) max-xl:pr-(--bleed) max-xl:[&>li]:shrink-0 max-xl:[&>li]:snap-start max-md:[&>li]:w-[82%] md:max-lg:[&>li]:w-[46%] lg:max-xl:[&>li]:w-[31%]",
    grid: { 2: "xl:grid xl:grid-cols-2 xl:gap-6", 3: "xl:grid xl:grid-cols-3 xl:gap-6", 4: "xl:grid xl:grid-cols-4 xl:gap-6", 5: "xl:grid xl:grid-cols-5 xl:gap-6" },
    buttons: "max-xl:flex xl:hidden",
  },
} as const;

// A track at every width. It bleeds to the right screen edge: past 1440 the grid centres, so the
// bleed (--bleed) is whichever is wider, the page margin or the space beside the 87rem grid. The
// padding matches the bleed, so percentage widths still measure against the grid.
const always =
  "flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 -ml-2 pl-2 scroll-pl-2 -my-2 py-2 -mr-(--bleed) pr-(--bleed) [&>li]:shrink-0 [&>li]:snap-start max-md:[&>li]:w-[82%] md:max-lg:[&>li]:w-[46%]";
const alwaysVisible = {
  2: "lg:[&>li]:w-[calc((100%_-_1.5rem)/2)]",
  3: "lg:[&>li]:w-[calc((100%_-_3rem)/3)]",
  4: "lg:[&>li]:w-[calc((100%_-_4.5rem)/4)]",
} as const;

/** One item along: the first item's width plus the gap. Instant under reduced motion. */
function moveTrack(t: HTMLElement, direction: -1 | 1, reduce: boolean) {
  const first = t.firstElementChild as HTMLElement | null;
  if (!first) return;
  const gap = parseFloat(getComputedStyle(t).columnGap) || 0;
  t.scrollBy({ left: direction * (first.offsetWidth + gap), behavior: reduce ? "instant" : "smooth" });
}

/** Home and End: the first or the last item. */
function jumpTrack(t: HTMLElement, to: "start" | "end", reduce: boolean) {
  t.scrollTo({ left: to === "start" ? 0 : t.scrollWidth, behavior: reduce ? "instant" : "smooth" });
}

/** Whether the track sits at its start or its end, measured on scroll (passive) and on resize. */
function useEnds(getTrack: () => HTMLElement | null) {
  const [ends, setEnds] = useState({ start: true, end: false });
  const measure = useCallback(() => {
    const t = getTrack();
    if (!t) return;
    const start = t.scrollLeft < 2;
    const end = t.scrollLeft + t.clientWidth >= t.scrollWidth - 2;
    setEnds((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, [getTrack]);
  useEffect(() => {
    const t = getTrack();
    if (!t) return;
    // Fires once on observe, then on every resize (a rotation, a change of breakpoint).
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    t.addEventListener("scroll", measure, { passive: true });
    return () => {
      ro.disconnect();
      t.removeEventListener("scroll", measure);
    };
  }, [getTrack, measure]);
  return ends;
}

function Controls({ trackId, prevLabel, nextLabel, ends, move, className }: { trackId?: string; prevLabel: string; nextLabel: string; ends: { start: boolean; end: boolean }; move: (d: -1 | 1) => void; className: string }) {
  return (
    <div className={`${className} gap-2`}>
      <IconButton label={prevLabel} aria-controls={trackId} unavailable={ends.start} onClick={() => move(-1)}>
        <ArrowGlyph back />
      </IconButton>
      <IconButton label={nextLabel} aria-controls={trackId} unavailable={ends.end} onClick={() => move(1)}>
        <ArrowGlyph />
      </IconButton>
    </div>
  );
}

/**
 * The previous and next buttons of a track rendered elsewhere (controls="external"), found by the
 * track's id. They share the track's movement and go unavailable at its ends. `from` hides them where
 * the track is a grid (default "none": always shown).
 */
export function SnapTrackControls({ trackId, prevLabel, nextLabel, from = "none" }: { trackId: string; prevLabel: string; nextLabel: string; from?: "lg" | "xl" | "none" }) {
  const reduce = useReducedMotion() ?? false;
  const getTrack = useCallback(() => document.getElementById(trackId), [trackId]);
  const ends = useEnds(getTrack);
  const move = (d: -1 | 1) => {
    const t = getTrack();
    if (t) moveTrack(t, d, reduce);
  };
  return <Controls trackId={trackId} prevLabel={prevLabel} nextLabel={nextLabel} ends={ends} move={move} className={from === "none" ? "flex" : layout[from].buttons} />;
}

/**
 * A row of items that is a native scroll-snap track below `from` and a plain grid from `from` up.
 *
 * As a track it is a focusable, labelled list moved by ArrowLeft and ArrowRight (one item) and Home
 * and End, with 44px previous and next IconButtons (inline above it at the right, or external). At
 * either end a button is unavailable: aria-disabled, ignoring clicks, so focus never drops. Moves are
 * instant under reduced motion. As a grid it has no tab stop, no label and no buttons.
 *
 * Put it at the full width of a grid `Container`: the track bleeds to the right screen edge.
 */
export function SnapTrack({ id, label, prevLabel, nextLabel, columns, from = "lg", visible = 4, controls = "inline", children }: SnapTrackProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion() ?? false;
  const scrolls = useMediaQuery(from === "none" ? "all" : layout[from].query);
  const getTrack = useCallback(() => trackRef.current, []);
  const ends = useEnds(getTrack);
  const move = (d: -1 | 1) => {
    if (trackRef.current) moveTrack(trackRef.current, d, reduce);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const t = trackRef.current;
    if (!scrolls || !t) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") move(e.key === "ArrowLeft" ? -1 : 1);
    // Home and End only on the list itself, so they never take over a focused card link's keys.
    else if ((e.key === "Home" || e.key === "End") && e.target === e.currentTarget) jumpTrack(t, e.key === "Home" ? "start" : "end", reduce);
    else return;
    e.preventDefault();
  };

  const listCls =
    from === "none"
      ? `no-scrollbar focus-visible:-outline-offset-2 ${always} ${alwaysVisible[visible]}`
      : `no-scrollbar focus-visible:-outline-offset-2 ${layout[from].track} ${layout[from].grid[columns]}`;
  const buttonsCls = from === "none" ? "flex" : layout[from].buttons;

  return (
    <div>
      {controls === "inline" ? <Controls trackId={id} prevLabel={prevLabel} nextLabel={nextLabel} ends={ends} move={move} className={`${buttonsCls} mb-4 justify-end`} /> : null}
      <motion.ul
        ref={trackRef}
        id={id}
        tabIndex={scrolls ? 0 : undefined}
        aria-label={scrolls ? label : undefined}
        onKeyDown={onKeyDown}
        className={listCls}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        variants={revealListVariants(reduce ? 0 : 0.06)}
      >
        {children}
      </motion.ul>
    </div>
  );
}
