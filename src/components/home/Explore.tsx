"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { explore } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
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

// A filter's even grid, its columns chosen from its count so no card is left alone on a row: two from
// 768 (an odd last card spans both), and from 1200 four across for four, three for three or six, and
// two for two. Its cards stand taller when only two share the row.
const filteredGrid = (n: number) =>
  `${n % 3 === 0 ? "min-[75rem]:grid-cols-3" : n % 4 === 0 ? "min-[75rem]:grid-cols-4" : "min-[75rem]:grid-cols-2"} md:[&>li:last-child:nth-child(odd)]:col-span-2 ${n % 3 === 0 ? "min-[75rem]:[&>li:last-child:nth-child(odd)]:col-span-1" : ""}`;

/**
 * Explore, on near-black: a centred head with its pill under it, a row of filter pills (a sideways
 * scrolling row on a phone, never wrapping) whose white marker glides to the chosen one, then link cards
 * into the rest of the site. "All" shows six, one of each kind at least: from 1200 a wide lead card (its
 * title and its chip on the picture) with two cards beside it, then three across; below 1200 the lead
 * across the top and two cards under it (the three-across row waits for the filters). A filter shows its
 * own cards in an even grid with no card alone on a row (filteredGrid), four at most on a phone, and the
 * cards fade in as the choice changes. Each card is one link: its picture, then its title and one chip,
 * its subject. The choice is kept in the address.
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
  const [lead, ...rest] = cards;
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
          <div ref={rowRef} role="group" aria-label="Filter" className="group/ind relative mx-auto flex w-max gap-2">
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
                      : "border-white/15 text-white/75 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
        {all ? (
          <div key="all" className={fade}>
            <ul className="mt-10 grid gap-4 md:grid-cols-2 min-[75rem]:grid-cols-4 min-[75rem]:gap-6">
              {lead ? <Lead card={lead} /> : null}
              {rest.slice(0, 2).map((c) => (
                <Card key={c.id} card={c} tall />
              ))}
            </ul>
            {/* The three-across row from 1200; below it these cards wait behind the filters. */}
            <ul className="mt-6 hidden grid-cols-3 gap-6 min-[75rem]:grid">
              {rest.slice(2).map((c) => (
                <Card key={c.id} card={c} />
              ))}
            </ul>
          </div>
        ) : (
          <ul key={filter} className={`mt-10 grid gap-4 md:grid-cols-2 min-[75rem]:gap-6 max-md:[&>li:nth-child(n+5)]:hidden ${filteredGrid(cards.length)} ${fade}`}>
            {cards.map((c) => (
              <Card key={c.id} card={c} tall={pair} />
            ))}
          </ul>
        )}
      </Container>
    </Band>
  );
}

/** The lead card: its picture under a dark wash, with its title and its chip on it. */
function Lead({ card: c }: { card: ExploreCard }) {
  return (
    <li className="md:col-span-2">
      <Link href={c.href} className="group relative flex h-[26.25rem] flex-col justify-end overflow-hidden rounded-card border border-edge md:h-[21.25rem] min-[75rem]:h-[26.25rem]">
        <Picture id={c.image.id} alt="" position={c.image.position} fit="fill" rounded="none" zoom sizes="(min-width: 1200px) 50vw, 100vw" className="absolute inset-0" />
        <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--color-night)_92%,transparent)_0%,color-mix(in_srgb,var(--color-night)_55%,transparent)_35%,color-mix(in_srgb,var(--color-night)_5%,transparent)_70%)]" />
        <span className="relative p-6 lg:p-8">
          <span className="block text-balance font-display text-[1.5625rem] leading-[1.2] text-white group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 md:text-[1.75rem]">{c.title}</span>
          <Chip label={c.tag} className="mt-4" />
        </span>
      </Link>
    </li>
  );
}

/**
 * A link card, 320px tall (340 beside the lead below 1200, 420 from 1200, and 352 / 420 when two share
 * a filter's row): its picture takes what the caption leaves, then a dark caption with its title and chip.
 */
function Card({ card: c, tall = false }: { card: ExploreCard; tall?: boolean }) {
  return (
    <li>
      <Link href={c.href} className={`group flex h-80 flex-col overflow-hidden rounded-card border border-edge bg-ink-raised ${tall ? "md:h-[21.25rem] min-[75rem]:h-[26.25rem]" : ""}`}>
        <span className="relative min-h-0 flex-1">
          <Picture id={c.image.id} alt="" position={c.image.position} fit="fill" rounded="none" zoom sizes="(min-width: 1200px) 33vw, (min-width: 768px) 50vw, 100vw" className="absolute inset-0" />
        </span>
        <span className="flex flex-col items-start p-5 lg:p-6">
          <span className="font-display text-[1.25rem] leading-[1.25] text-white group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{c.title}</span>
          <Chip label={c.tag} className="mt-3" />
        </span>
      </Link>
    </li>
  );
}

/** The card's one chip: its subject, outlined on the dark ground. */
function Chip({ label, className = "" }: { label: string; className?: string }) {
  return <span className={`inline-flex rounded-hard border border-white/20 px-2 py-1 text-caption font-medium leading-none text-white/85 ${className}`}>{label}</span>;
}
