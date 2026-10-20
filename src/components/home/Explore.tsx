"use client";

import Link from "next/link";
import { useState } from "react";
import { explore } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";

/**
 * Explore, on near-black: the heading left and a pill right, a row of filter buttons, then link cards
 * into the rest of the site: a wide lead card (its title on the picture) with two cards beside it, then
 * three across. The rest have their picture above a dark caption. Each card is one link with two tags.
 */
export function Explore() {
  const [filter, setFilter] = useState<string>(explore.filters[0]);
  // "All" shows six: the lead and two beside it, then three across. Each filter shows its own set.
  const cards = filter === "All" ? explore.cards.slice(0, 6) : explore.cards.filter((c) => c.kind === filter);
  const [lead, ...rest] = cards;
  const top = rest.slice(0, 2);
  const bottom = rest.slice(2);
  return (
    <Band id="explore" tone="night" labelledBy="explore-heading">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">{explore.eyebrow}</p>
            <h2 id="explore-heading" className="text-h2">
              {explore.headline}
            </h2>
          </div>
          <Button href={explore.link.href} arrow>
            {explore.link.label}
          </Button>
        </div>
        <div role="group" aria-label="Filter" className="mt-8 flex flex-wrap gap-2">
          {explore.filters.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`h-8 rounded-hard border px-3 focus-visible:outline-accent-on-dark text-label uppercase tracking-[0.06em] transition-[background-color,border-color,color] duration-200 ${filter === f ? "border-white bg-white text-ink" : "border-white/20 text-white/80 hover:border-white/60"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {lead ? (
            <li className="md:col-span-2">
              <Link href={lead.href} className="group relative flex h-full min-h-[18rem] flex-col justify-end overflow-hidden rounded-card border border-white/10 lg:min-h-[23rem]">
                <Picture id={lead.image.id} alt="" position={lead.image.position} fit="fill" rounded="none" zoom sizes="(min-width: 1024px) 50vw, 100vw" className="absolute inset-0" />
                <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,17,16,0.9)_0%,rgba(18,17,16,0.1)_60%)]" />
                <Tags kind={lead.kind} tag={lead.tag} className="absolute left-4 top-4" />
                <span className="relative p-6">
                  <span className="block text-label uppercase tracking-[0.04em] text-white/60">{lead.kind}</span>
                  <span className="mt-2 block font-display text-[1.75rem] leading-tight text-white">{lead.title}</span>
                </span>
              </Link>
            </li>
          ) : null}
          {top.map((c) => (
            <Card key={c.href} card={c} />
          ))}
        </ul>
        {bottom.length ? (
          <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bottom.map((c) => (
              <Card key={c.href} card={c} wide />
            ))}
          </ul>
        ) : null}
      </Container>
    </Band>
  );
}

type ExploreCard = (typeof explore.cards)[number];

/** A link card: its picture with two tags over it, then a dark caption with its kind and title. */
function Card({ card: c, wide = false }: { card: ExploreCard; wide?: boolean }) {
  return (
    <li>
      <Link href={c.href} className="group flex h-full flex-col overflow-hidden rounded-card border border-white/10 bg-ink-raised">
        <span className="relative block">
          <Picture id={c.image.id} alt="" position={c.image.position} aspect={wide ? "2/1" : "16/9"} rounded="none" zoom sizes={wide ? "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"} />
          <Tags kind={c.kind} tag={c.tag} className="absolute left-3 top-3" />
        </span>
        <span className="flex flex-1 flex-col p-5">
          <span className="text-label uppercase tracking-[0.04em] text-white/60">{c.kind}</span>
          <span className="mt-2 font-display text-[1.25rem] leading-snug text-white group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{c.title}</span>
        </span>
      </Link>
    </li>
  );
}

function Tags({ kind, tag, className = "" }: { kind: string; tag: string; className?: string }) {
  return (
    <span className={`z-10 flex gap-1 ${className}`}>
      <span className="rounded-hard bg-white px-2 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-ink">{kind}</span>
      {tag !== kind ? <span className="rounded-hard bg-accent px-2 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-white">{tag}</span> : null}
    </span>
  );
}
