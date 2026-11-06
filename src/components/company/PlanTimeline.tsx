"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { PlanStage } from "@/content/company";
import { ArrowGlyph, IconButton } from "@/components/ui/IconButton";
import { keepWhole } from "@/components/ui/keepWhole";

// The ruler's ticks: a 1px line every 16px, in the ink at 30% up to the "now" stem and the accent at 40%
// after it (the palette's own values; the ruler is a drawing, with no text over it).
const ticks = (rgb: string): CSSProperties => ({ backgroundImage: `repeating-linear-gradient(to right, rgb(${rgb}) 0 1px, transparent 1px 16px)` });
const INK_30 = "20 30 40 / 0.3";
const ACCENT_40 = "31 93 140 / 0.4";
// How long a fine pointer rests on a stem before the stem is chosen (hover intent).
const INTENT_MS = 120;

/**
 * The plan as a ruler (/company's story): a stem per stage on a line of 1px ticks, each stem a tab. A stem
 * is a 2px line 96px tall under a 6px dot and a 12px ordinal, with its stage's name under the ruler; the
 * chosen one is the accent, 128px tall, its 10px dot in a white ring. Before the "now" stage the stems and
 * the ticks are ink; after it, the accent's pale step. An "exploring" last stage stands off the main line:
 * the ticks stop short of it, a dashed line carries on to it, and its stem is dashed.
 *
 * One card (a tabpanel per stage, all in one grid cell, so the band never changes height) shows the
 * chosen stage: its title, its line and its phase as a small tag after the line. From 768 the card
 * stands above the chosen stem, its left edge 40px before it, clamped to the track, and glides there
 * (250ms). Below 768 the ruler scrolls sideways inside the panel (about 120px between stems), the previous
 * and next buttons sit under it, and the card spans the column below them.
 *
 * Input: a click, or a fine pointer resting on a stem for 120ms; the arrow keys, Home and End move
 * between stems (roving tabindex). It opens on the "now" stage. Under reduced motion nothing glides,
 * fades or scrolls smoothly.
 */
export function PlanTimeline({ id, label, stages }: { id: string; label: string; stages: readonly PlanStage[] }) {
  const n = stages.length;
  const now = Math.max(0, stages.findIndex((s) => s.phase === "now"));
  const [active, setActive] = useState(now);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const touched = useRef(false);

  const at = (i: number) => ((i + 0.5) / n) * 100;
  const nowAt = at(now);
  const offLine = stages[n - 1]?.phase === "exploring";
  const lineEnd = offLine ? (at(n - 2) + at(n - 1)) / 2 : 100;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // On a phone's scrolling ruler, bring the chosen stem to the ruler's middle (the ruler scrolls, never
  // the page). Not on the first render: the "now" stem is in view as it is.
  useEffect(() => {
    if (!touched.current) return;
    const el = scrollRef.current;
    const stem = document.getElementById(`${id}-tab-${stages[active].id}`);
    if (!el || !stem || el.scrollWidth <= el.clientWidth) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: stem.offsetLeft + stem.offsetWidth / 2 - el.clientWidth / 2, behavior: reduce ? "auto" : "smooth" });
  }, [active, id, stages]);

  const select = (i: number, focus = false) => {
    touched.current = true;
    window.clearTimeout(timer.current);
    setActive(i);
    if (focus) document.getElementById(`${id}-tab-${stages[i].id}`)?.focus({ preventScroll: true });
  };

  return (
    <div data-sweep="tab" className="flex flex-col">
      {/* The ruler: a sideways track on phones (600px, so about 120px between stems), the column's width
          from 768. */}
      <div ref={scrollRef} className="no-scrollbar -mx-6 overflow-x-auto px-6 py-1 md:order-2 md:mx-0 md:mt-8 md:overflow-visible md:px-0 md:py-0">
        <div role="tablist" aria-label={label} className="relative h-[13.5rem] w-[37.5rem] md:w-full">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-10 h-7">
            <div className="absolute inset-y-0 left-0" style={{ width: `${nowAt}%`, ...ticks(INK_30) }} />
            <div className="absolute inset-y-0" style={{ left: `${nowAt}%`, width: `${lineEnd - nowAt}%`, ...ticks(ACCENT_40) }} />
            {offLine ? <div className="absolute bottom-3.5 right-0 border-t border-dashed border-accent/50" style={{ left: `${lineEnd}%` }} /> : null}
          </div>
          {stages.map((s, i) => {
            const on = i === active;
            const tone = i > now ? "bg-accent/50" : "bg-ink/60";
            const dashed = s.phase === "exploring";
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                id={`${id}-tab-${s.id}`}
                aria-selected={on}
                aria-controls={`${id}-panel-${s.id}`}
                aria-label={`${s.title}, ${s.tag.toLowerCase()}`}
                tabIndex={on ? 0 : -1}
                onClick={() => select(i)}
                onPointerEnter={(e) => {
                  if (e.pointerType !== "mouse" || on) return;
                  window.clearTimeout(timer.current);
                  timer.current = window.setTimeout(() => select(i), INTENT_MS);
                }}
                onPointerLeave={() => window.clearTimeout(timer.current)}
                onKeyDown={(e) => {
                  const last = n - 1;
                  const next = e.key === "ArrowRight" ? Math.min(i + 1, last) : e.key === "ArrowLeft" ? Math.max(i - 1, 0) : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
                  if (next < 0) return;
                  e.preventDefault();
                  select(next, true);
                }}
                style={{ left: `${at(i)}%` }}
                className="group/stem absolute inset-y-0 w-28 -translate-x-1/2 cursor-pointer rounded-card"
              >
                {/* The stem stands on the ruler's foot, 40px up (over the stage's name); a dashed one
                    stands on the dashed line instead. */}
                <span aria-hidden="true" className={`absolute left-1/2 flex -translate-x-1/2 flex-col items-center ${dashed ? "bottom-[3.375rem]" : "bottom-10"}`}>
                  <span className={`text-[0.75rem] leading-none tabular-nums transition-colors duration-200 motion-reduce:transition-none ${on ? "font-medium text-accent" : "text-fg-muted group-hover/stem:text-ink"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`mt-2 rounded-pill transition-[width,height,background-color] duration-[250ms] ease-instrument motion-reduce:transition-none ${
                      on ? "size-2.5 bg-accent ring-2 ring-white" : `size-1.5 ${tone} group-hover/stem:bg-ink`
                    }`}
                  />
                  <span
                    className={`transition-[height,background-color,border-color] duration-[250ms] ease-instrument motion-reduce:transition-none ${on ? (dashed ? "h-[7.125rem]" : "h-32") : dashed ? "h-[5.125rem]" : "h-24"} ${
                      dashed
                        ? `w-0 border-l-2 border-dashed ${on ? "border-accent" : "border-accent/50 group-hover/stem:border-ink"}`
                        : `w-0.5 ${on ? "bg-accent" : `${tone} group-hover/stem:bg-ink`}`
                    }`}
                  />
                </span>
                <span
                  className={`absolute inset-x-0 bottom-0 flex h-8 items-center justify-center text-center text-caption leading-[1.25] transition-colors duration-200 motion-reduce:transition-none ${
                    on ? "font-medium text-ink" : "text-fg-muted group-hover/stem:text-ink"
                  }`}
                >
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Phones: step along the ruler. */}
      <div className="mt-4 flex justify-end gap-2 md:hidden">
        <IconButton label="Previous stage" unavailable={active === 0} onClick={() => select(active - 1)}>
          <ArrowGlyph back />
        </IconButton>
        <IconButton label="Next stage" unavailable={active === n - 1} onClick={() => select(active + 1)}>
          <ArrowGlyph />
        </IconButton>
      </div>

      {/* The card: the column's width under the buttons on phones; from 768 above the stems, its left edge
          40px before the chosen stem, clamped to the track. */}
      <div className="mt-6 md:order-1 md:mt-0">
        <div
          style={{ "--x": `${at(active)}%` } as CSSProperties}
          className="relative w-full md:left-[clamp(0px,calc(var(--x)-2.5rem),calc(100%-20rem))] md:w-80 md:motion-safe:transition-[left] md:motion-safe:duration-[250ms] md:motion-safe:ease-instrument"
        >
          <div className="grid">
            {stages.map((s, i) => (
              <div
                key={s.id}
                id={`${id}-panel-${s.id}`}
                role="tabpanel"
                aria-labelledby={`${id}-tab-${s.id}`}
                tabIndex={i === active ? 0 : -1}
                className={`rounded-card bg-white p-5 shadow-[0_24px_48px_-28px_rgb(17_26_34/0.3)] [grid-area:1/1] transition-[opacity,visibility] duration-[250ms] ease-instrument motion-reduce:transition-none ${
                  i === active ? "visible opacity-100" : "invisible opacity-0"
                }`}
              >
                <h3 className="text-h3">{keepWhole(s.title)}</h3>
                <p className="mt-2 text-body leading-[1.6] text-fg-muted">{s.line}</p>
                <p className="mt-3">
                  <span className="inline-block rounded-hard bg-tint px-1.5 py-0.5 text-caption font-medium text-accent">{s.tag}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
