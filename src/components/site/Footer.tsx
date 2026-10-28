import type { CSSProperties } from "react";
import Link from "next/link";
import { brand, footer } from "@/lib/site";
import { Picture } from "@/components/ui/Picture";
import { Mark } from "@/components/ui/Wordmark";

// The round pictures that drift across the top of the footer: each one's still, its reference diameter
// (drawn at 80% of it from 768, and at 80% of the reference's half-size phone circles, so 40%, below)
// and how far it sits below the row's top edge.
const CIRCLES = [
  { id: "p1-tower", d: 18.75, y: 0 },
  { id: "s1-dock", d: 15.625, y: 2.5 },
  { id: "p3-house", d: 17.5, y: 0.625 },
  { id: "so2-solar-closeup", d: 14.375, y: 4.375 },
  { id: "m2-capsule-master", d: 12.5, y: 6.25 },
  { id: "f2-camera", d: 16.25, y: 1.875 },
  { id: "y5-story-done", d: 15, y: 3.75 },
  { id: "c1-commercial-hero", d: 13.75, y: 1.25 },
] as const;

function Circles({ hidden }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-start gap-[1.625rem] pr-[1.625rem] md:gap-14 md:pr-14">
      {CIRCLES.map((c) => (
        <li
          key={c.id}
          style={{ "--d": `${c.d}rem`, "--y": `${c.y}rem` } as CSSProperties}
          className="mt-[calc(var(--y)*0.4)] size-[calc(var(--d)*0.4)] shrink-0 overflow-hidden rounded-pill md:mt-[calc(var(--y)*0.8)] md:size-[calc(var(--d)*0.8)]"
        >
          <Picture id={c.id} alt="" aspect="1/1" rounded="none" sizes="(min-width: 768px) 240px, 120px" />
        </li>
      ))}
    </ul>
  );
}

// Small grey heads over the link groups and the Ask AI row.
const head = "text-caption font-medium leading-[1.2] text-muted-on-dark";

/**
 * The footer, on near-black: a row of round pictures drifting slowly across the top over a faint
 * accent glow, then, on the page's rail, the logo (the link home, whose mark builds on hover or focus as
 * in the intro) with the tagline in Inter italic and, at the right, one row of "Ask AI about Lienry"
 * pills, four link columns under small grey headings (two by two on phones), a hairline, and the
 * copyright line with the legal links. Under reduced motion the row stands still. Condensed on 23
 * October at the owner's request: smaller pictures, logo and gaps.
 */
export function Footer() {
  return (
    <footer data-tone="ink" className="on-dark relative isolate overflow-hidden bg-night pb-16 text-white md:pb-8">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-12 -z-10 size-[26rem] -translate-x-1/2 rounded-pill bg-accent/[0.12] blur-[110px] md:top-16 md:size-[38rem]" />
      <div aria-hidden="true" className="flex overflow-hidden pt-16 md:pt-[4.5rem]">
        <div className="marquee flex w-max [animation-duration:30s] md:[animation-duration:60s]">
          <Circles />
          <Circles hidden />
        </div>
      </div>

      {/* The rail: the Container's 87rem inside the page margin, the left edge of every band above. */}
      <div className="page-x mt-10 md:mt-12">
        <div className="mx-auto w-full max-w-grid">
          <div className="grid gap-y-8 lg:grid-cols-4 lg:items-end lg:gap-x-6">
            <div className="lg:col-span-2">
              <Link href="/" aria-label="Lienry Drones home" data-mark-host="" className="flex w-fit items-center gap-3 rounded-hard">
                {/* The trace in the mark's own units: about 1.4px at 36px tall, 1.6px at 44. */}
                <Mark className="h-9 w-auto [--mark-stroke:30px] md:h-11" build />
                <span aria-hidden="true" className="font-display text-[2.5rem] leading-none tracking-[-0.02em] md:text-[3rem]">
                  {brand.name.split(" ")[0]}
                </span>
              </Link>
              <p className="mt-3 max-w-none font-[family-name:var(--font-inter-italic)] text-[1.0625rem] italic tracking-[-0.01em] md:text-[1.125rem]">{footer.tagline}</p>
            </div>
            {/* Ask an AI assistant about Lienry: text pills, on one row at the right, each opening its assistant with the question filled in. */}
            <div className="lg:col-span-2 lg:justify-self-end">
              <p id="footer-ask-ai" className={head}>
                {footer.askAi.label}
              </p>
              <ul aria-labelledby="footer-ask-ai" className="mt-3 flex flex-wrap gap-2">
                {footer.askAi.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ask ${l.label} about Lienry (opens in a new tab)`}
                      className="flex h-8 items-center rounded-pill border border-white/10 bg-white/[0.05] px-3 text-[0.75rem] text-white/85 transition-[background-color,border-color,color] duration-200 hover:border-white/30 hover:bg-white/[0.1] hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <nav aria-label="Footer" className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {footer.groups.map((g) => (
              <div key={g.id}>
                <p id={`footer-${g.id}`} className={head}>
                  {g.heading}
                </p>
                <ul aria-labelledby={`footer-${g.id}`} className="mt-3 flex flex-col gap-3">
                  {g.links.map((l) => (
                    <li key={l.href} className="leading-[1.3]">
                      <Link href={l.href} className="text-[0.9375rem] leading-[1.3] text-white transition-[color] duration-200 hover:text-white/70">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.08] pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-small text-muted-on-dark">{footer.legal}</p>
            <ul className="flex flex-col gap-2 md:flex-row md:items-center md:gap-0">
              {footer.legalLinks.map((l, i) => (
                <li key={l.href} className="flex items-center">
                  {i ? <span aria-hidden="true" className="mx-[1.125rem] hidden h-5 w-px bg-white/15 md:block" /> : null}
                  <Link href={l.href} className="text-small text-muted-on-dark transition-[color] duration-200 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
