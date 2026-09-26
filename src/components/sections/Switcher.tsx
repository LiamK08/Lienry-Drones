"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Action, ImageRef, Tone } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { FactList } from "@/components/ui/FactList";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";

export type SwitcherItem = {
  /** The hash key and the panel's DOM id. Unique on the page. */
  id: string;
  tab: string;
  /** The .label above the panel title, e.g. "01 · Dock". */
  label: string;
  title: string;
  body: string;
  image: ImageRef;
  facts: readonly { term: string; text: string }[];
  link?: Action;
};

export type SwitcherProps = {
  /** The band's id; the heading is `${id}-heading` and each tab `${id}-tab-${item.id}`. */
  id: string;
  tone: Tone;
  headline: string;
  emphasis?: string;
  intro: string;
  /** The tablist's aria-label. */
  tabsLabel: string;
  items: readonly SwitcherItem[];
  /** Select an item from the URL hash: on load, on hashchange, and on clicks of same-page links to it. */
  hashSync?: boolean;
  /** Reveal the section head on scroll (default). Pass false when the band sits in the first screen. */
  reveal?: boolean;
};

/**
 * One image-and-text panel per item, chosen from a row of text tabs (WAI-ARIA tabs: roving
 * tabindex, arrow keys, Home and End, automatic activation).
 *
 * From 1024 every panel sits in one grid cell, the inactive ones invisible, inert and aria-hidden,
 * so the cell holds the tallest panel and switching never moves the page; the panels crossfade in
 * 200ms. Each panel: the image in columns 1-6 (a fill frame, 385 to 684px), the text in 8-12.
 * Below 1024 the tabs become a grid of underline tabs (two columns for four, three otherwise) and
 * only the active panel is displayed, stacked: image at 4:3, label, title, body, facts, link.
 *
 * Panel ids equal item ids, so `/platform#dock` also works as a plain anchor.
 */
export function Switcher({ id, tone, headline, emphasis, intro, tabsLabel, items, hashSync = false, reveal = true }: SwitcherProps) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const ids = items.map((item) => item.id).join(" ");

  useEffect(() => {
    if (!hashSync) return;
    const list = ids.split(" ");
    const indexOf = (hash: string) => {
      try {
        return list.indexOf(decodeURIComponent(hash.replace(/^#/, "")));
      } catch {
        return -1;
      }
    };
    const fromHash = () => {
      const i = indexOf(window.location.hash);
      if (i < 0) return;
      setActive(i);
      document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
    };
    // next/link moves between same-page anchors with history.pushState, which fires no hashchange:
    // select the item as the click happens, before the router scrolls to its panel.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!a) return;
      const url = new URL(a.getAttribute("href") ?? "", window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      const i = indexOf(url.hash);
      if (i >= 0) setActive(i);
    };
    // After the first frame, so the scroll lands after the browser's (or the router's) own jump.
    const frame = requestAnimationFrame(fromHash);
    window.addEventListener("hashchange", fromHash);
    document.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", fromHash);
      document.removeEventListener("click", onClick, true);
    };
  }, [hashSync, ids, id]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = items.length;
    const next = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  const dark = tone === "ink";
  const rule = dark ? "border-plaster/20" : "border-hairline";
  const tabCols = items.length === 2 || items.length === 4 ? "grid-cols-2" : "grid-cols-3";

  return (
    <Band id={id} tone={tone} labelledBy={`${id}-heading`}>
      <Container>
        <SectionHead id={`${id}-heading`} headline={headline} emphasis={emphasis} aside={{ intro }} tone={dark ? "dark" : "light"} reveal={reveal} />

        <div role="tablist" aria-label={tabsLabel} className={`mt-[var(--gap-head)] grid ${tabCols} lg:flex lg:gap-8 lg:border-b ${rule}`}>
          {items.map((item, i) => {
            const on = i === active;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${item.id}`}
                aria-selected={on}
                aria-controls={item.id}
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={`relative min-h-11 border-b py-2 pr-3 text-body transition-colors duration-200 ease-instrument lg:border-b-0 lg:pr-0 ${rule} ${
                  on
                    ? `${dark ? "text-plaster" : "text-ink"} after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-current`
                    : dark
                      ? "text-muted-on-dark hover:text-plaster"
                      : "text-muted hover:text-ink"
                }`}
              >
                {item.tab}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid">
          {items.map((item, i) => {
            const on = i === active;
            return (
              <div
                key={item.id}
                id={item.id}
                role="tabpanel"
                aria-labelledby={`${id}-tab-${item.id}`}
                aria-hidden={on ? undefined : true}
                inert={!on}
                tabIndex={on ? 0 : -1}
                className={`col-start-1 row-start-1 transition-[opacity,visibility] duration-200 ease-instrument max-lg:starting:opacity-0 motion-reduce:transition-none ${
                  on ? "visible opacity-100" : "invisible opacity-0 max-lg:hidden"
                }`}
              >
                {/* The panel stretches to the cell (the tallest panel), and so does this grid, so a shorter panel's
                    image grows to fill it rather than leaving an empty run below it. */}
                <div className="grid gap-y-4 lg:h-full lg:grid-cols-12 lg:gap-x-6">
                  {/* An inactive panel's image leaves the layout once its fade-out ends, so only the
                      active image is rendered; the cell's height is unchanged, because every image
                      has the same floor and the text columns stay in place. */}
                  <div data-col className={`transition-[display] duration-200 transition-discrete motion-reduce:transition-none lg:col-span-6 ${on ? "" : "lg:hidden"}`}>
                    <Picture
                      id={item.image.id}
                      alt={item.image.alt}
                      position={item.image.position}
                      fit="fill"
                      fillFrom="lg"
                      aspect="4/3"
                      minHeight="385px"
                      maxHeight="684px"
                      sizes="(min-width: 1440px) 684px, (min-width: 1024px) 48vw, 100vw"
                    />
                  </div>
                  {/* The text is anchored at both ends like FeatureRow: label, title and body at the top, the facts
                      and link on the image's bottom edge, so the column never ends far above its image. */}
                  <div data-col className="lg:col-span-5 lg:col-start-8 lg:flex lg:flex-col">
                    <p className={`label ${dark ? "text-muted-on-dark" : "text-muted"}`}>{item.label}</p>
                    <h3 className="mt-2 text-h3">{item.title}</h3>
                    <p className={`mt-3 text-body ${dark ? "text-muted-on-dark" : "text-muted"}`}>{item.body}</p>
                    <div className="mt-6 lg:mt-auto lg:pt-6">
                      <FactList items={item.facts} tone={dark ? "dark" : "light"} />
                      {item.link ? (
                        <div className="mt-4 flex">
                          <Button href={item.link.href} variant="tertiary" onDark={dark} arrow>
                            {item.link.label}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Band>
  );
}
