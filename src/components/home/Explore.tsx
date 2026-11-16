"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { explore } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { LinkCard } from "@/components/ui/LinkCard";
import { RevealItem, RevealList } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { useIndicator } from "@/components/home/useIndicator";

type ExploreCard = (typeof explore.cards)[number];
type FilterId = (typeof explore.filters)[number]["id"];

// The chosen filter lives in the address (?explore=tools), so a view can be shared, reloaded and gone
// back to. Read as an external store: the server and the first paint show "All", and a pushState from
// a filter button or the browser's Back tells the subscribers.
const CHANGE = "explore-filter";
const subscribe = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  window.addEventListener(CHANGE, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener(CHANGE, cb);
  };
};
const read = (): FilterId => {
  const id = new URLSearchParams(window.location.search).get("explore");
  return explore.filters.find((f) => f.id === id)?.id ?? "all";
};
const choose = (id: FilterId) => {
  const url = new URL(window.location.href);
  if (id === "all") url.searchParams.delete("explore");
  else url.searchParams.set("explore", id);
  window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
  window.dispatchEvent(new Event(CHANGE));
};

// The cards' even grid, its columns chosen from its count so no card is left alone on a row: one on a
// phone, two from 768 (an odd last card spans both), and from 1200 three across for three or six (All),
// four for four and two for two. A pair's pictures stand taller from 1200.
const filteredGrid = (n: number) =>
  `${n % 3 === 0 ? "min-[75rem]:grid-cols-3" : n % 4 === 0 ? "min-[75rem]:grid-cols-4" : "min-[75rem]:grid-cols-2"} md:[&>li:last-child:nth-child(odd)]:col-span-2 ${n % 3 === 0 ? "min-[75rem]:[&>li:last-child:nth-child(odd)]:col-span-1" : ""}`;

// The pictures' sizes for a row of two, three or four cards.
const sizes = (across: 2 | 3 | 4) =>
  across === 2
    ? "(min-width: 1248px) 588px, (min-width: 768px) 50vw, 100vw"
    : across === 4
      ? "(min-width: 1248px) 282px, (min-width: 1200px) calc(25vw - 30px), (min-width: 768px) 50vw, 100vw"
      : "(min-width: 1248px) 384px, (min-width: 1200px) calc(33.3vw - 32px), (min-width: 768px) 50vw, 100vw";

/**
 * Explore, on near-black: a centred head with its pill under it, a row of filter pills (a sideways
 * scrolling row on a phone, never wrapping; resting pills filled, the chosen one under a white marker
 * that glides to it), then six matching light link cards into the rest of the site. "All" shows six,
 * one of each kind at least; a filter shows its own. Either way the cards stand in one even grid with no
 * card alone on a row (filteredGrid), four at most on a phone, and they fade in as the choice changes.
 * Each card is one link: its picture, its title, then the action its kind leads to and its subject
 * (LinkCard). The cards rise in once, one after another, when the grid first scrolls into view (a grid
 * already on screen, and one swapped in by a filter, simply shows). The choice is kept in the address.
 */
export function Explore() {
  const filter = useSyncExternalStore(subscribe, read, () => "all" as FilterId);
  // Set by a filter press, so the cards fade in on a change but never on the page's first paint.
  const [changed, setChanged] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const active = explore.filters.findIndex((f) => f.id === filter);
  useIndicator(rowRef, active);
  const kind = explore.filters.find((f) => f.id === filter)?.label;
  const all = filter === "all";
  const cards: ExploreCard[] = all
    ? explore.all.map((id) => explore.cards.find((c) => c.id === id)).filter((c): c is ExploreCard => !!c)
    : explore.cards.filter((c) => c.kind === kind).slice(0, 6);
  const fade = changed ? "transition-opacity duration-300 ease-instrument starting:opacity-0 motion-reduce:transition-none" : "";
  const pair = !all && cards.length === 2;
  return (
    <Band id="explore" tone="night" labelledBy="explore-heading">
      <Container>
        <SectionHead
          id="explore-heading"
          layout="center"
          headline={explore.headline}
          action={
            <Button href={explore.link.href} arrow>
              {explore.link.label}
            </Button>
          }
        />
        {/* A phone scrolls the row sideways from the page's edge, the far edge fading over the page margin
            so a pill cut there reads as more to come; from 768 it is centred under the head. The 4px above
            and below the pills (taken back from the margins) hold their focus ring, which the scroller clips. */}
        <div className="no-scrollbar -mx-(--page-margin) mt-9 -mb-1 scroll-px-(--page-margin) overflow-x-auto px-(--page-margin) py-1 [mask-image:linear-gradient(to_right,black_calc(100%-var(--page-margin)),transparent)] md:mx-0 md:overflow-visible md:px-0 md:[mask-image:none]">
          <div ref={rowRef} role="group" aria-label="Filter" className="group/ind relative isolate mx-auto flex w-max gap-2">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 h-(--ih) w-(--iw) translate-x-(--ix) translate-y-(--iy) rounded-pill bg-white opacity-0 group-data-[indicator-ready]/ind:opacity-100 group-data-[indicator-ready]/ind:transition-[translate,width] group-data-[indicator-ready]/ind:duration-[250ms] group-data-[indicator-ready]/ind:ease-instrument motion-reduce:transition-none! forced-colors:bg-[Highlight]"
            />
            {explore.filters.map((f) => {
              const on = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  data-indicator-item=""
                  aria-pressed={on}
                  onClick={(e) => {
                    setChanged(true);
                    choose(f.id);
                    // On a phone's scrolling row, bring the chosen pill wholly into view, clear of the fade.
                    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                    e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
                  }}
                  className={`relative flex h-9 shrink-0 items-center rounded-pill border px-4 text-small font-medium transition-[border-color,color,background-color] duration-200 motion-reduce:transition-none focus-visible:outline-accent-on-dark forced-colors:focus-visible:outline-[Highlight] ${
                    on
                      ? // In forced colours the chosen label is HighlightText on the Highlight indicator (or its own
                        // Highlight fill until that has measured), kept from the browser's Canvas backplate.
                        "border-transparent bg-white text-ink group-data-[indicator-ready]/ind:bg-transparent forced-colors:forced-color-adjust-none forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]"
                      : "border-transparent text-white/75 before:absolute before:inset-0 before:-z-10 before:rounded-pill before:bg-ink-raised before:transition-[background-color] before:duration-200 before:content-[''] hover:text-white hover:before:bg-ink-hover motion-reduce:before:transition-none"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
        <RevealList animate key={filter} className={`mt-10 grid gap-4 md:grid-cols-2 min-[75rem]:gap-6 max-md:[&>li:nth-child(n+5)]:hidden ${filteredGrid(cards.length)} ${fade}`}>
          {cards.map((c) => (
            <RevealItem key={c.id} className="flex">
              <LinkCard
                href={c.href}
                title={c.title}
                action={("action" in c ? c.action : undefined) ?? explore.actions[c.kind]}
                // The subject on the right: Lienry's honest stand-in for a date.
                meta={c.tag}
                picture={{ id: c.image.id, position: c.image.position, sizes: sizes(pair ? 2 : !all && cards.length % 3 !== 0 && cards.length % 4 === 0 ? 4 : 3) }}
                tall={pair}
              />
            </RevealItem>
          ))}
        </RevealList>
      </Container>
    </Band>
  );
}
