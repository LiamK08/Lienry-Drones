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
 * hairline edge. Each holds the setting's icon and name, a meta line, the statement in the serif
 * (Lienry's design intent, never a customer's words), the part that does the work in a round icon,
 * then, ruled off at the foot, three figures with short labels, one note and a link that covers the
 * whole card. Commercial and home figures are design intent (commercial.ts designFacts, so check 11
 * can read them); solar's are cited, each with its source link under it, beside the cited note.
 * Every card has the same rows, so the three stand the same height and their figure rows line up.
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
        <ul
          ref={trackRef}
          id="systems-track"
          tabIndex={track ? 0 : undefined}
          aria-label={track ? systems.headline : undefined}
          onKeyDown={(e) => {
            if (track) pagerKeys(e, index, positions, go);
          }}
          className="no-scrollbar mx-auto mt-12 grid max-w-[75rem] gap-4 md:-mx-2 md:-my-2 md:flex md:snap-x md:snap-mandatory md:scroll-px-2 md:overflow-x-auto md:px-2 md:py-2 min-[75rem]:mx-auto min-[75rem]:my-0 min-[75rem]:grid min-[75rem]:grid-cols-3 min-[75rem]:gap-6 min-[75rem]:overflow-visible min-[75rem]:p-0"
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
                className="group relative flex flex-col rounded-card border border-line bg-white p-6 has-[a[data-card-link]:focus-visible]:outline-2 has-[a[data-card-link]:focus-visible]:outline-offset-2 has-[a[data-card-link]:focus-visible]:outline-focus md:w-[calc((100%-1rem)/2)] md:shrink-0 md:snap-start md:p-7 min-[75rem]:w-auto"
              >
                <div className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="text-accent">
                    <Icon name={c.icon} className="size-6" />
                  </span>
                  <p className="text-[1.25rem] font-semibold leading-none tracking-[-0.03em] text-ink">{c.name}</p>
                </div>
                <p className="mt-4 text-small leading-[1.2] text-muted">
                  {c.meta[0]}
                  <span aria-hidden="true" className="mx-1.5 text-muted/60">
                    ·
                  </span>
                  {c.meta[1]}
                </p>
                <p className="mt-8 font-display text-[1.1875rem] leading-[1.35] tracking-[-0.01em] text-ink md:mt-10 md:text-[1.375rem]">{c.statement}</p>
                <div className="mt-auto pt-8 md:pt-10">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-tint text-accent">
                      <Icon name={c.part.icon} className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-small font-semibold leading-[1.4] text-ink">{c.part.name}</span>
                      <span className="block text-small leading-[1.2] text-muted">{c.part.line}</span>
                    </span>
                  </div>
                  <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-5">
                    {figures.map((f) => (
                      <div key={f.label} className="flex flex-col">
                        <dt className="order-2 mt-1 text-label leading-[1.2] tracking-normal text-muted">
                          <span className="block min-[75rem]:min-h-[2.4em]">{f.label}</span>
                          {f.source ? (
                            <a href={f.source.href} target="_blank" rel="noopener noreferrer" title={f.source.title} className="link relative z-10 mt-1 inline-block py-0.5">
                              {f.source.label}
                            </a>
                          ) : (
                            // From 1200 the three cards stand side by side: hold the source line's height so the figure rows align.
                            <span aria-hidden="true" className="invisible mt-1 hidden py-0.5 min-[75rem]:block">
                              &nbsp;
                            </span>
                          )}
                        </dt>
                        <dd className="numeral order-1 font-display text-[1.5625rem] font-normal leading-[1.2] tracking-normal text-ink md:text-[1.75rem]">{f.unit ? `${f.value} ${f.unit}` : f.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 text-label leading-[1.4] tracking-normal text-muted min-[75rem]:min-h-[4.2em]">{c.note}</p>
                  <Link
                    href={c.link.href}
                    data-card-link=""
                    className="mt-3 inline-flex min-h-6 items-center gap-1 text-small font-medium text-accent after:absolute after:inset-0 after:rounded-card after:content-[''] focus-visible:outline-none group-hover:underline group-hover:underline-offset-4"
                  >
                    {c.link.label} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
        {/* From 768 to 1199: previous, the pager and next under the track. */}
        <Pager trackId="systems-track" index={index} positions={positions} go={go} noun="setting" className="mt-6 hidden md:flex min-[75rem]:hidden" />
      </Container>
    </Band>
  );
}
