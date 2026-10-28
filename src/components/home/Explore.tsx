"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { explore } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";

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

/**
 * Explore, on near-black: the heading left and a pill right, a row of filter buttons, then link cards
 * into the rest of the site. "All" shows six, one of each kind at least: from 1200 a wide lead card
 * (what the page is, its title and its tags on the picture) with two cards beside it, then three across;
 * below 1200 the lead across the top and two cards under it (the three-across row waits for the
 * filters). A filter shows its own cards in an even grid, three across from 1200, two from 768, four at
 * most on a phone. Each card is one link: its picture takes what the caption leaves, then what the page
 * is, its title and two tags under it, as the reference's do. The choice is kept in the address.
 */
export function Explore() {
  const filter = useSyncExternalStore(subscribe, read, () => "all" as FilterId);
  const kind = explore.filters.find((f) => f.id === filter)?.label;
  const all = filter === "all";
  const cards: ExploreCard[] = all
    ? explore.all.map((id) => explore.cards.find((c) => c.id === id)).filter((c): c is ExploreCard => !!c)
    : explore.cards.filter((c) => c.kind === kind).slice(0, 6);
  const [lead, ...rest] = cards;
  return (
    <Band id="explore" tone="night" labelledBy="explore-heading">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="explore-heading" className="text-h2">
              {explore.headline}
            </h2>
          </div>
          <Button href={explore.link.href} arrow className="self-start md:self-auto">
            {explore.link.label}
          </Button>
        </div>
        <div role="group" aria-label="Filter" className="mt-8 flex flex-wrap gap-2">
          {explore.filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => choose(f.id)}
              className={`h-8 rounded-hard px-3 text-[0.8125rem] font-medium focus-visible:outline-accent-on-dark transition-[background-color,border-color,color] duration-200 ${filter === f.id ? "bg-white text-ink" : "bg-white/[0.07] text-white/75 hover:bg-white/[0.12] hover:text-white"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {all ? (
          <>
            <ul className="mt-8 grid gap-4 md:grid-cols-2 min-[75rem]:grid-cols-4 min-[75rem]:gap-5">
              {lead ? <Lead card={lead} /> : null}
              {rest.slice(0, 2).map((c) => (
                <Card key={c.id} card={c} tall />
              ))}
            </ul>
            {/* The three-across row from 1200; below it these cards wait behind the filters. */}
            <ul className="mt-5 hidden grid-cols-3 gap-5 min-[75rem]:grid">
              {rest.slice(2).map((c) => (
                <Card key={c.id} card={c} />
              ))}
            </ul>
          </>
        ) : (
          <ul className="mt-8 grid gap-4 md:grid-cols-2 min-[75rem]:grid-cols-3 min-[75rem]:gap-5 max-md:[&>li:nth-child(n+5)]:hidden">
            {cards.map((c) => (
              <Card key={c.id} card={c} />
            ))}
          </ul>
        )}
      </Container>
    </Band>
  );
}

/** The lead card: its picture under a dark wash, with what the page is, its title and its tags on it. */
function Lead({ card: c }: { card: ExploreCard }) {
  return (
    <li className="md:col-span-2">
      <Link href={c.href} className="group relative flex h-[26.25rem] flex-col justify-end overflow-hidden rounded-card border border-white/10 md:h-[21.25rem] min-[75rem]:h-[26.25rem]">
        <Picture id={c.image.id} alt="" position={c.image.position} fit="fill" rounded="none" zoom sizes="(min-width: 1200px) 50vw, 100vw" className="absolute inset-0" />
        <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,26,34,0.92)_0%,rgba(17,26,34,0.55)_35%,rgba(17,26,34,0.05)_70%)]" />
        <span className="relative p-6 lg:p-8">
          <span className="block text-label uppercase tracking-[0.08em] text-white/75">{c.meta}</span>
          <span className="mt-3 block text-balance font-display text-[1.5625rem] leading-[1.2] text-white group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 md:text-[1.75rem]">{c.title}</span>
          <Tags kind={c.kind} tag={c.tag} className="mt-4" />
        </span>
      </Link>
    </li>
  );
}

/**
 * A link card, 320px tall (340 beside the lead below 1200, 420 from 1200): its picture takes what the
 * caption leaves, then a dark caption with what the page is, its title and two tags.
 */
function Card({ card: c, tall = false }: { card: ExploreCard; tall?: boolean }) {
  return (
    <li>
      <Link href={c.href} className={`group flex h-80 flex-col overflow-hidden rounded-card border border-white/10 bg-ink-raised ${tall ? "md:h-[21.25rem] min-[75rem]:h-[26.25rem]" : ""}`}>
        <span className="relative min-h-0 flex-1">
          <Picture id={c.image.id} alt="" position={c.image.position} fit="fill" rounded="none" zoom sizes="(min-width: 1200px) 33vw, (min-width: 768px) 50vw, 100vw" className="absolute inset-0" />
        </span>
        <span className="flex flex-col p-4 lg:p-5">
          <span className="text-label uppercase tracking-[0.08em] text-white/60">{c.meta}</span>
          <span className="mt-2 font-display text-[1.25rem] leading-[1.2] text-white group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{c.title}</span>
          <Tags kind={c.kind} tag={c.tag} className="mt-3" />
        </span>
      </Link>
    </li>
  );
}

/** The card's two tags under its title, as the reference's chips: its kind in white, its subject in the pale accent. */
function Tags({ kind, tag, className = "" }: { kind: string; tag: string; className?: string }) {
  return (
    <span className={`flex flex-wrap gap-2.5 ${className}`}>
      <span className="rounded-hard bg-white px-2.5 py-1.5 text-[0.8125rem] font-medium leading-none text-ink">{kind}</span>
      <span className="rounded-hard bg-tag px-2.5 py-1.5 text-[0.8125rem] font-medium leading-none text-ink">{tag}</span>
    </span>
  );
}
