"use client";

import Link from "next/link";
import { useState } from "react";
import { explore } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";

/**
 * Explore, on near-black: the heading left and a pill right, a row of filter buttons, then link cards
 * into the rest of the site: a wide lead card (what the page is, its title and its tags on the picture)
 * with two cards beside it, then three across. The rest have their picture above a dark caption with the
 * same three lines. Each card is one link; its two tags sit under the title, as the reference's do.
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
              className={`h-8 rounded-hard px-3 text-[0.8125rem] font-medium focus-visible:outline-accent-on-dark transition-[background-color,border-color,color] duration-200 ${filter === f ? "bg-white text-ink" : "bg-white/[0.07] text-white/75 hover:bg-white/[0.12] hover:text-white"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {lead ? (
            <li className="md:col-span-2">
              <Link href={lead.href} className="group relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-card border border-white/10 lg:min-h-[26.25rem]">
                <Picture id={lead.image.id} alt="" position={lead.image.position} fit="fill" rounded="none" zoom sizes="(min-width: 1024px) 50vw, 100vw" className="absolute inset-0" />
                <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,17,16,0.92)_0%,rgba(18,17,16,0.55)_35%,rgba(18,17,16,0.05)_70%)]" />
                <span className="relative p-6 lg:p-8">
                  <span className="block text-label uppercase tracking-[0.08em] text-white/75">{lead.meta}</span>
                  <span className="mt-3 block max-w-[32rem] font-display text-[1.75rem] leading-[1.2] text-white group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{lead.title}</span>
                  <Tags kind={lead.kind} tag={lead.tag} className="mt-4" />
                </span>
              </Link>
            </li>
          ) : null}
          {top.map((c) => (
            <Card key={c.href} card={c} />
          ))}
        </ul>
        {bottom.length ? (
          <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:mt-5 lg:grid-cols-3 lg:gap-5">
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

/** A link card: its picture, then a dark caption with what the page is, its title and two tags. */
function Card({ card: c, wide = false }: { card: ExploreCard; wide?: boolean }) {
  return (
    <li>
      <Link href={c.href} className="group flex h-full flex-col overflow-hidden rounded-card border border-white/10 bg-ink-raised">
        <Picture id={c.image.id} alt="" position={c.image.position} aspect={wide ? "21/9" : "5/4"} rounded="none" zoom sizes={wide ? "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"} />
        <span className="flex flex-1 flex-col p-4 lg:p-5">
          <span className="text-label uppercase tracking-[0.08em] text-white/60">{c.meta}</span>
          <span className="mt-2 font-display text-[1.25rem] leading-[1.2] text-white group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{c.title}</span>
          <Tags kind={c.kind} tag={c.tag} className="mt-auto pt-4" />
        </span>
      </Link>
    </li>
  );
}

/** The card's two tags under its title, as the reference's chips: its kind in white, its subject in the pale accent. */
function Tags({ kind, tag, className = "" }: { kind: string; tag: string; className?: string }) {
  return (
    <span className={`flex flex-wrap gap-2 ${className}`}>
      <span className="rounded-hard bg-white px-2.5 py-1 text-[0.8125rem] font-medium leading-[1.2] text-ink">{kind}</span>
      {tag !== kind ? <span className="rounded-hard bg-[#d5e7ea] px-2.5 py-1 text-[0.8125rem] font-medium leading-[1.2] text-ink">{tag}</span> : null}
    </span>
  );
}
