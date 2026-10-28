"use client";

import Link from "next/link";
import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { systems } from "@/content/home";
import { australiaStats, solarStats } from "@/content/stats";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Pager, pagerKeys, stepTrack, usePager } from "@/components/ui/Pager";
import { SectionHead } from "@/components/ui/SectionHead";
import { Icon } from "@/components/blocks/Icon";
import { useMediaQuery } from "@/lib/hooks";

const stats = [...solarStats, ...australiaStats];
// From 768 to 1199 the cards are a two-up track; on phones they stack, from 1200 they stand three across.
const TRACK = "(min-width: 48rem) and (max-width: 74.99rem)";

/**
 * The three settings on the accent tint, in the shape of the reference's story cards (Lienry has no
 * customers, so nothing here is one): a centred head with one pill, then three even white cards with a
 * hairline edge across the rail. Each holds one icon (the setting's, in a disc) beside its name, a meta
 * line, the statement in the serif (Lienry's design intent, never a customer's words), the part that
 * does the work, then, ruled off, three figures in light Inter with short labels, a link that covers the
 * whole card and, at the foot, the figures' note. Commercial and home figures are design intent
 * (commercial.ts designFacts, so check 11 can read them); solar's are cited, each with its source link
 * under it, beside the cited note. From 1200 the three cards share one subgrid of rows, so their
 * statements, parts, figure rows and links line up without reserved heights; any slack falls at the
 * foot, under the shorter notes. From 768 to 1199 they are a two-up track, the parts pushed to the foot.
 */
export function SystemCards() {
  const trackRef = useRef<HTMLUListElement>(null);
  const track = useMediaQuery(TRACK);
  const reduce = useReducedMotion() ?? false;
  const { index, positions } = usePager(trackRef, systems.cards.length, track);
  const go = (to: number) => stepTrack(trackRef.current, to, reduce);
  return (
    <Band id="systems" tone="tint" labelledBy="systems-heading">
      <Container>
        <SectionHead
          id="systems-heading"
          layout="center"
          headline={systems.headline}
          intro={systems.intro}
          action={
            <Button href={systems.action.href} arrow>
              {systems.action.label}
            </Button>
          }
        />
        {/* The track's own negative margins (room for focus rings) sit inside this gap, never across it. */}
        <div className="mt-(--head-gap)">
          <ul
            ref={trackRef}
            id="systems-track"
            tabIndex={track ? 0 : undefined}
            aria-label={track ? systems.headline : undefined}
            onKeyDown={(e) => {
              if (track) pagerKeys(e, index, positions, go);
            }}
            className="no-scrollbar grid gap-4 md:-mx-2 md:-my-2 md:flex md:snap-x md:snap-mandatory md:scroll-px-2 md:overflow-x-auto md:px-2 md:py-2 min-[75rem]:m-0 min-[75rem]:grid min-[75rem]:grid-cols-3 min-[75rem]:gap-x-6 min-[75rem]:gap-y-0 min-[75rem]:overflow-visible min-[75rem]:p-0"
          >
            {systems.cards.map((c) => {
              const cited = "cited" in c && c.cited ? c.cited.map((x) => ({ ...stats.find((s) => s.id === x.id)!, short: x.label, sourceShort: x.source })) : null;
              const figures = cited
                ? cited.map((s) => ({ value: s.value, unit: "", label: s.short, source: { href: s.sourceUrl, title: s.source, label: s.sourceShort } }))
                : "figures" in c && c.figures
                  ? c.figures.map((f) => ({ value: f.value, unit: "unit" in f ? f.unit : "", label: f.label, source: null }))
                  : [];
              return (
                <li
                  key={c.id}
                  className="group relative flex flex-col rounded-card border border-line bg-white p-6 md:w-[calc((100%-1rem)/2)] md:shrink-0 md:snap-start md:p-8 min-[75rem]:row-span-6 min-[75rem]:grid min-[75rem]:w-auto min-[75rem]:grid-rows-subgrid min-[75rem]:gap-0"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-tint text-accent">
                        <Icon name={c.icon} className="size-5" />
                      </span>
                      <p className="text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink">{c.name}</p>
                    </div>
                    <p className="mt-4 flex flex-wrap gap-x-1.5 text-small leading-[1.5] text-muted">
                      <span className="whitespace-nowrap">{c.meta[0]}</span>
                      <span aria-hidden="true" className="text-border-strong">
                        ·
                      </span>
                      <span className="whitespace-nowrap">{c.meta[1]}</span>
                    </p>
                  </div>
                  <p className="mt-8 font-display text-[1.1875rem] leading-[1.4] tracking-[-0.01em] text-ink md:text-[1.375rem]">{c.statement}</p>
                  <p className="mt-auto pt-8 text-small leading-[1.5] md:pt-10">
                    <span className="block font-semibold text-ink">{c.part.name}</span>
                    <span className="block text-muted">{c.part.line}</span>
                  </p>
                  <dl className="mt-5 grid grid-cols-3 content-start gap-3 border-t border-line pt-5">
                    {figures.map((f) => (
                      <div key={f.label} className="flex flex-col">
                        <dt className="order-2 mt-1.5 text-caption leading-[1.4] text-muted">
                          <span className="block">{f.label}</span>
                          {f.source ? (
                            <a href={f.source.href} target="_blank" rel="noopener noreferrer" title={f.source.title} className="link relative z-10 mt-0.5 inline-flex min-h-6 items-center">
                              {f.source.label}
                            </a>
                          ) : null}
                        </dt>
                        <dd className="numeral order-1 text-[1.625rem] leading-[1.15] text-ink md:text-[1.75rem]">{f.unit ? `${f.value} ${f.unit}` : f.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-5">
                    <Link
                      href={c.link.href}
                      data-card-link=""
                      className="inline-flex min-h-6 items-center gap-1 text-small font-medium text-accent after:absolute after:inset-0 after:rounded-card after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-solid focus-visible:after:outline-focus group-hover:underline group-hover:underline-offset-4"
                    >
                      {c.link.label} <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                  <p className="mt-3 text-caption leading-[1.5] text-muted">{c.note}</p>
                </li>
              );
            })}
          </ul>
        </div>
        {/* From 768 to 1199: previous, the pager and next under the track. */}
        <Pager trackId="systems-track" index={index} positions={positions} count={systems.cards.length} go={go} noun="setting" className="mt-6 hidden md:flex min-[75rem]:hidden" />
      </Container>
    </Band>
  );
}
