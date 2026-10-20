"use client";

import { useState } from "react";

/**
 * Pause and play for a looping strip of words (WCAG 2.2.2): it marks its nearest `[data-marquee]`
 * ancestor `data-paused`, which stops that strip's `.marquee` (globals.css). Hidden under reduced
 * motion, where the strip does not move.
 */
export function MarqueeToggle({ name, className = "" }: { name: string; className?: string }) {
  const [paused, setPaused] = useState(false);
  return (
    <button
      type="button"
      aria-label={`${paused ? "Play" : "Pause"} ${name}`}
      onClick={(e) => {
        const host = e.currentTarget.closest("[data-marquee]");
        const next = !paused;
        if (next) host?.setAttribute("data-paused", "");
        else host?.removeAttribute("data-paused");
        setPaused(next);
      }}
      className={`inline-flex size-8 items-center justify-center rounded-pill transition-[background-color,border-color,color] duration-200 ease-instrument motion-reduce:hidden ${className}`}
    >
      <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true" fill="currentColor">
        {paused ? <path d="M4 2l9 6-9 6z" /> : <path d="M4 2h3v12H4zM10 2h3v12h-3z" />}
      </svg>
    </button>
  );
}
