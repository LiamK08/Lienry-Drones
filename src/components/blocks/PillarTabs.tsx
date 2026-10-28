"use client";

import { useEffect, useRef, useState } from "react";
import type { Action, ImageRef } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";
import { useIndicator } from "@/components/home/useIndicator";

export type Pillar = { id: string; tab: string; title: string; body: string; link?: Action; image: ImageRef };

/**
 * On a phone's scrolling tab row, brings the chosen tab wholly into view inside the row only (never the
 * page): clear of the page margin on the left, and clear of the right-edge fade unless it is the last tab.
 */
function revealTab(row: HTMLElement, tab: HTMLElement, last: boolean) {
  if (row.scrollWidth <= row.clientWidth) return;
  const style = getComputedStyle(row);
  const r = row.getBoundingClientRect();
  const t = tab.getBoundingClientRect();
  const from = r.left + (parseFloat(style.paddingLeft) || 0);
  const to = r.right - (last ? parseFloat(style.paddingRight) || 0 : 64);
  const delta = t.left < from ? t.left - from : t.right > to ? t.right - to : 0;
  if (!delta) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  row.scrollTo({ left: row.scrollLeft + delta, behavior: reduce ? "auto" : "smooth" });
}

/**
 * The parts of the platform as text tabs over one panel: a rounded picture in columns 1-6 and the part's
 * title, a line and a pill in 8-12. A marker glides under the chosen tab (the shared useIndicator) and
 * the panels crossfade (250ms; at once under reduced motion). On phones the tab row scrolls sideways to
 * the screen's edges and fades at the right while more tabs wait there. Each panel's id is its part id,
 * so a link such as /platform#tether selects that tab and scrolls the band into view.
 */
export function PillarTabs({ id, headline, items }: { id: string; eyebrow?: string; headline: string; items: readonly Pillar[] }) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  useIndicator(listRef, active);

  useEffect(() => {
    const sync = () => {
      const i = items.findIndex((p) => `#${p.id}` === window.location.hash);
      if (i < 0) return;
      setActive(i);
      document.getElementById(`${id}-heading`)?.scrollIntoView({ block: "start" });
      const tab = document.getElementById(`${id}-tab-${items[i].id}`);
      if (tab && scrollRef.current) revealTab(scrollRef.current, tab, i === items.length - 1);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [id, items]);

  // The right-edge fade shows only while tabs wait past the edge of a scrolling row.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(check);
    ro?.observe(el);
    return () => {
      el.removeEventListener("scroll", check);
      ro?.disconnect();
    };
  }, []);

  const select = (i: number, focus = false) => {
    setActive(i);
    const tab = document.getElementById(`${id}-tab-${items[i].id}`);
    if (focus) tab?.focus({ preventScroll: true });
    if (tab && scrollRef.current) revealTab(scrollRef.current, tab, i === items.length - 1);
  };

  return (
    <Band id={id} tone="plaster" pad="tabs" labelledBy={`${id}-heading`}>
      <Container>
        <SectionHead id={`${id}-heading`} layout="center" size="h2s" headline={headline} className="scroll-mt-24" />
        <div
          ref={scrollRef}
          className={`no-scrollbar -mx-(--page-margin) mt-10 overflow-x-auto scroll-px-(--page-margin) px-(--page-margin) md:mx-0 md:px-0 ${
            more ? "[mask-image:linear-gradient(to_right,black_calc(100%-4rem),transparent)]" : ""
          }`}
        >
          <div ref={listRef} role="tablist" aria-label={headline} className="group/ind relative flex w-max min-w-full gap-7 border-b border-line md:justify-center">
            {items.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                data-indicator-item=""
                id={`${id}-tab-${p.id}`}
                aria-selected={i === active}
                aria-controls={p.id}
                tabIndex={i === active ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(e) => {
                  const last = items.length - 1;
                  const next = e.key === "ArrowRight" ? (i + 1) % items.length : e.key === "ArrowLeft" ? (i + last) % items.length : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
                  if (next < 0) return;
                  e.preventDefault();
                  select(next, true);
                }}
                className={`-mb-px shrink-0 border-b-2 pt-1 pb-3.5 text-body transition-[color,border-color] duration-200 motion-reduce:transition-none ${
                  i === active ? "border-ink font-medium text-ink group-data-[indicator-ready]/ind:border-transparent" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {p.tab}
              </button>
            ))}
            {/* The marker: hidden until measured (useIndicator), when the chosen tab's own underline
                gives way to it; it glides from then on (250ms; it jumps under reduced motion). */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-px left-0 h-0.5 w-(--iw) translate-x-(--ix) rounded-pill bg-ink opacity-0 group-data-[indicator-ready]/ind:opacity-100 group-data-[indicator-ready]/ind:transition-[translate,width] group-data-[indicator-ready]/ind:duration-[250ms] group-data-[indicator-ready]/ind:ease-instrument motion-reduce:transition-none! forced-colors:bg-[Highlight]"
            />
          </div>
        </div>
        {/* Every panel shares one grid cell, so the band keeps the tallest panel's height and switching
            a tab never moves the page (check 3). Inactive panels fade out and are then invisible: out of
            the tab order and the accessibility tree (visibility: hidden). */}
        <div className="mt-12 grid lg:mt-14">
          {items.map((p, i) => (
            <div
              key={p.id}
              id={p.id}
              role="tabpanel"
              aria-labelledby={`${id}-tab-${p.id}`}
              className={`[grid-area:1/1] transition-[opacity,visibility] duration-[250ms] ease-instrument motion-reduce:transition-none ${i === active ? "visible opacity-100" : "invisible opacity-0"}`}
            >
              <div className="grid items-center gap-y-8 md:grid-cols-2 md:gap-x-(--gutter) lg:grid-12 lg:gap-y-0">
                <Picture
                  id={p.image.id}
                  alt={p.image.alt}
                  position={p.image.position}
                  aspect="4/3"
                  rounded="image"
                  className="lg:col-span-6"
                  sizes="(min-width: 1440px) 684px, (min-width: 1024px) 47vw, (min-width: 768px) calc(50vw - 2.25rem), calc(100vw - 2.5rem)"
                />
                <div className="lg:col-span-5 lg:col-start-8">
                  <h3 className="text-h3">{p.title}</h3>
                  <p className="mt-4 text-body leading-[1.6] text-fg-muted">{p.body}</p>
                  {p.link ? (
                    <Button href={p.link.href} variant="secondary" arrow className="mt-8">
                      {p.link.label}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Band>
  );
}
