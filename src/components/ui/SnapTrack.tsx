"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useMediaQuery } from "@/lib/hooks";

export type SnapTrackProps = {
  /** The track's accessible name, e.g. "Property types. Use left and right arrow keys to browse." */
  label: string;
  /** e.g. "Previous property". */
  prevLabel: string;
  /** e.g. "Next property". */
  nextLabel: string;
  /** Grid columns from `from` up. */
  columns: 3 | 4 | 5;
  /** Where the track becomes a static grid. Default "lg" (1024); "none" keeps a track at every width. */
  from?: "lg" | "xl" | "none";
  /** With from="none": items visible at once from 1024. Default 4. */
  visible?: 3 | 4;
  tone?: "light" | "dark";
  /** `<li>` items, or `RevealItem`s (ui/Reveal) for the 60ms staggered reveal as the track enters. */
  children: ReactNode;
};

// Each variant string is written out whole so Tailwind can see it.
const layout = {
  lg: {
    query: "(max-width: 1023.98px)",
    // Below 1024: a track. Items 82% wide below 768 and 46% to 1023.
    track:
      "max-lg:flex max-lg:overflow-x-auto max-lg:snap-x max-lg:snap-mandatory max-lg:gap-4 md:max-lg:gap-6 max-lg:-ml-1 max-lg:pl-1 max-lg:scroll-pl-1 max-lg:-my-1 max-lg:py-1 max-lg:-mr-[var(--page-margin)] max-lg:pr-[var(--page-margin)] max-lg:[&>li]:shrink-0 max-lg:[&>li]:snap-start max-md:[&>li]:w-[82%] md:max-lg:[&>li]:w-[46%]",
    grid: { 3: "lg:grid lg:grid-cols-3 lg:gap-6", 4: "lg:grid lg:grid-cols-4 lg:gap-6", 5: "lg:grid lg:grid-cols-5 lg:gap-6" },
    buttons: "max-lg:flex lg:hidden",
  },
  xl: {
    query: "(max-width: 1279.98px)",
    // Below 1280: a track. Items 82% below 768, 46% to 1023, 31% to 1279.
    track:
      "max-xl:flex max-xl:overflow-x-auto max-xl:snap-x max-xl:snap-mandatory max-xl:gap-4 md:max-xl:gap-6 max-xl:-ml-1 max-xl:pl-1 max-xl:scroll-pl-1 max-xl:-my-1 max-xl:py-1 max-xl:-mr-[var(--page-margin)] max-xl:pr-[var(--page-margin)] max-xl:[&>li]:shrink-0 max-xl:[&>li]:snap-start max-md:[&>li]:w-[82%] md:max-lg:[&>li]:w-[46%] lg:max-xl:[&>li]:w-[31%]",
    grid: { 3: "xl:grid xl:grid-cols-3 xl:gap-6", 4: "xl:grid xl:grid-cols-4 xl:gap-6", 5: "xl:grid xl:grid-cols-5 xl:gap-6" },
    buttons: "max-xl:flex xl:hidden",
  },
} as const;

// A track at every width. It bleeds to the right screen edge: past 1440 the grid centres, so the
// bleed is whichever is wider, the page margin or the space beside the 87rem grid. The padding
// matches the bleed, so percentage widths still measure against the grid.
const always =
  "flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 -ml-1 pl-1 scroll-pl-1 -my-1 py-1 -mr-[max(var(--page-margin),calc((100vw_-_87rem)/2))] pr-[max(var(--page-margin),calc((100vw_-_87rem)/2))] [&>li]:shrink-0 [&>li]:snap-start max-md:[&>li]:w-[82%] md:max-lg:[&>li]:w-[46%]";
const alwaysVisible = {
  3: "lg:[&>li]:w-[calc((100%_-_3rem)/3)]",
  4: "lg:[&>li]:w-[calc((100%_-_4.5rem)/4)]",
} as const;

function ArrowGlyph({ back }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`h-4 w-4 ${back ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
    </svg>
  );
}

/**
 * A row of items that is a native scroll-snap track below `from` and a plain grid from `from` up.
 *
 * As a track it is a focusable, labelled list moved by ArrowLeft and ArrowRight, with 44px
 * previous and next buttons above it at the right. At either end the button is aria-disabled and
 * ignores clicks rather than being disabled, so focus never drops. Snaps are instant under reduced
 * motion. As a grid it has no tab stop, no label and no buttons.
 *
 * Put it at the full width of a grid `Container`: the track bleeds to the right screen edge.
 */
export function SnapTrack({ label, prevLabel, nextLabel, columns, from = "lg", visible = 4, tone = "light", children }: SnapTrackProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const [ends, setEnds] = useState({ start: true, end: false });
  const scrolls = useMediaQuery(from === "none" ? "all" : layout[from].query);

  const measure = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    const start = t.scrollLeft < 2;
    const end = t.scrollLeft + t.clientWidth >= t.scrollWidth - 2;
    setEnds((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    // Fires once on observe, then on every resize (a rotation, a change of breakpoint).
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    return () => ro.disconnect();
  }, [measure]);

  const move = (direction: -1 | 1) => {
    const t = trackRef.current;
    const first = t?.firstElementChild as HTMLElement | null | undefined;
    if (!t || !first) return;
    const gap = parseFloat(getComputedStyle(t).columnGap) || 0;
    t.scrollBy({ left: direction * (first.offsetWidth + gap), behavior: reduce ? "instant" : "smooth" });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (!scrolls || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    e.preventDefault();
    move(e.key === "ArrowLeft" ? -1 : 1);
  };

  const dark = tone === "dark";
  const button = `flex h-11 w-11 items-center justify-center rounded-hard border aria-disabled:cursor-default aria-disabled:opacity-40 ${
    dark ? "border-muted-on-dark text-plaster hover:bg-ink-raised aria-disabled:hover:bg-transparent" : "border-border-strong text-ink hover:bg-sunken aria-disabled:hover:bg-transparent"
  }`;
  const listCls = from === "none" ? `no-scrollbar ${always} ${alwaysVisible[visible]}` : `no-scrollbar ${layout[from].track} ${layout[from].grid[columns]}`;
  const buttonsCls = from === "none" ? "flex" : layout[from].buttons;

  return (
    <div>
      <div className={`${buttonsCls} mb-4 justify-end gap-2`}>
        <button type="button" aria-label={prevLabel} aria-disabled={ends.start || undefined} onClick={() => !ends.start && move(-1)} className={button}>
          <ArrowGlyph back />
        </button>
        <button type="button" aria-label={nextLabel} aria-disabled={ends.end || undefined} onClick={() => !ends.end && move(1)} className={button}>
          <ArrowGlyph />
        </button>
      </div>
      <motion.ul
        ref={trackRef}
        tabIndex={scrolls ? 0 : undefined}
        aria-label={scrolls ? label : undefined}
        onKeyDown={onKeyDown}
        onScroll={measure}
        className={listCls}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}
      >
        {children}
      </motion.ul>
    </div>
  );
}
