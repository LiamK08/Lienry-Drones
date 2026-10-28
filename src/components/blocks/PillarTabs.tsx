"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Action, ImageRef } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";

export type Pillar = { id: string; tab: string; title: string; body: string; link?: Action; image: ImageRef };

// useLayoutEffect warns during the server render; the indicator is measured only in the browser.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The gliding selection indicator: the active tab's left edge and width inside its list, as --ix and
 * --iw for an aria-hidden bar that eases between tabs (240ms). Null until measured, so the server render
 * and a page without JavaScript keep the active tab's own underline. Re-measured when the list resizes
 * (the web font arriving, a rotation).
 */
function useIndicator(listRef: React.RefObject<HTMLElement | null>, active: number) {
  const [box, setBox] = useState<{ x: number; w: number } | null>(null);
  const measure = useCallback(() => {
    const list = listRef.current;
    const tab = list?.querySelectorAll<HTMLElement>("[role=tab]")[active];
    if (!list || !tab) return;
    setBox({ x: tab.offsetLeft, w: tab.offsetWidth });
  }, [listRef, active]);
  useIsoLayoutEffect(() => {
    measure();
  }, [measure]);
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(list);
    return () => ro.disconnect();
  }, [listRef, measure]);
  return box;
}

/**
 * The parts of the platform as text tabs over one panel: a rounded picture in columns 1-6 and the part's
 * title, a line and a pill in 8-12. A marker glides under the chosen tab and the panels crossfade
 * (240ms; at once under reduced motion). On phones the tab row scrolls sideways to the screen's edges and
 * fades at the right while more tabs wait there. Each panel's id is its part id, so a link such as
 * /platform#tether selects that tab and scrolls the band into view.
 */
export function PillarTabs({ id, headline, items }: { id: string; eyebrow?: string; headline: string; items: readonly Pillar[] }) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  const box = useIndicator(listRef, active);

  useEffect(() => {
    const sync = () => {
      const i = items.findIndex((p) => `#${p.id}` === window.location.hash);
      if (i < 0) return;
      setActive(i);
      document.getElementById(`${id}-heading`)?.scrollIntoView({ block: "start" });
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
    // Bring a tab chosen past the edge of a scrolling row into view, inside the row only.
    const row = scrollRef.current;
    if (tab && row && row.scrollWidth > row.clientWidth) {
      const left = tab.offsetLeft - parseFloat(getComputedStyle(row).paddingLeft || "0");
      const right = tab.offsetLeft + tab.offsetWidth - row.clientWidth + parseFloat(getComputedStyle(row).paddingRight || "0");
      const to = row.scrollLeft > left ? left : row.scrollLeft < right ? right : row.scrollLeft;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      row.scrollTo({ left: to, behavior: reduce ? "auto" : "smooth" });
    }
  };

  const indicator = box ? ({ "--ix": `${box.x}px`, "--iw": `${box.w}px` } as CSSProperties) : undefined;

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
          <div ref={listRef} role="tablist" aria-label={headline} className="relative flex w-max min-w-full gap-7 border-b border-line md:justify-center">
            {items.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
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
                  i === active ? `font-medium text-ink ${box ? "border-transparent" : "border-ink"}` : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {p.tab}
              </button>
            ))}
            {box ? (
              <span
                aria-hidden="true"
                style={indicator}
                className="pointer-events-none absolute -bottom-px left-0 h-0.5 w-(--iw) translate-x-(--ix) rounded-pill bg-ink transition-[translate,width] duration-[240ms] ease-instrument motion-reduce:transition-none forced-colors:bg-[Highlight]"
              />
            ) : null}
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
              className={`[grid-area:1/1] transition-[opacity,visibility] duration-[240ms] ease-instrument motion-reduce:transition-none ${i === active ? "visible opacity-100" : "invisible opacity-0"}`}
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
