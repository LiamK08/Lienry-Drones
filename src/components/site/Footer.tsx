import type { CSSProperties } from "react";
import Link from "next/link";
import { brand, footer } from "@/lib/site";
import { Picture } from "@/components/ui/Picture";
import { Mark } from "@/components/ui/Wordmark";

// The round pictures that drift across the top of the footer: each one's still, its reference diameter
// (drawn at 80% of it from 768, a quarter of it on phones) and how far it sits below the row's top edge.
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
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-start gap-[5.5rem] pr-[5.5rem] md:gap-14 md:pr-14">
      {CIRCLES.map((c) => (
        <li
          key={c.id}
          style={{ "--d": `${c.d}rem`, "--y": `${c.y}rem` } as CSSProperties}
          className="mt-[calc(var(--y)*0.25)] size-[calc(var(--d)*0.25)] shrink-0 overflow-hidden rounded-pill md:mt-[calc(var(--y)*0.8)] md:size-[calc(var(--d)*0.8)]"
        >
          <Picture id={c.id} alt="" aspect="1/1" rounded="none" sizes="(min-width: 768px) 240px, 75px" />
        </li>
      ))}
    </ul>
  );
}

/**
 * The footer, on near-black: a row of round pictures drifting slowly across the top over a soft
 * teal glow, then the logo set large with the tagline in Inter italic and, over the fourth column, a
 * row of "Ask AI about Lienry" pills, four link columns under small grey headings, a hairline, and the
 * copyright line with the legal links. Under reduced motion the
 * row stands still. Condensed on 23 October at the owner's request: smaller pictures, logo and gaps.
 */
export function Footer() {
  return (
    <footer data-tone="ink" className="on-dark relative isolate overflow-hidden bg-[#0f0d0e] pb-16 text-white md:pb-8">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-12 -z-10 size-[26rem] -translate-x-1/2 rounded-pill bg-accent/25 blur-[110px] md:top-16 md:size-[38rem]" />
      <div aria-hidden="true" className="flex overflow-hidden pt-16 md:pt-[4.5rem]">
        <div className="marquee flex w-max [animation-duration:70s]">
          <Circles />
          <Circles hidden />
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-[75rem] px-5 md:mt-12 xl:px-0">
        <div className="grid gap-y-8 md:grid-cols-4 md:items-end md:gap-x-6">
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 md:gap-4">
              <Mark className="h-11 w-auto md:h-16" />
              <p aria-hidden="true" className="max-w-none font-display text-[3rem] leading-none tracking-[-0.02em] md:text-[4.25rem]">
                {brand.name.split(" ")[0]}
              </p>
            </div>
            <p className="mt-3 max-w-none font-[family-name:var(--font-inter-italic)] text-[1.125rem] italic tracking-[-0.02em] md:text-[1.375rem]">{footer.tagline}</p>
          </div>
          {/* Ask an AI assistant about Lienry: text pills that open each one with the question filled in. */}
          <div>
            <p id="footer-ask-ai" className="text-[0.8125rem] font-medium leading-[1.2] text-[#8a8a8a]">
              {footer.askAi.label}
            </p>
            <ul aria-labelledby="footer-ask-ai" className="mt-3 flex flex-wrap gap-2">
              {footer.askAi.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 items-center rounded-pill border border-white/10 bg-white/[0.05] px-3.5 text-[0.8125rem] text-white/85 transition-[background-color,border-color,color] duration-200 hover:border-white/30 hover:bg-white/[0.1] hover:text-white"
                  >
                    {l.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <nav aria-label="Footer" className="mt-8 grid gap-y-10 md:mt-10 md:grid-cols-4 md:gap-x-6">
          {footer.groups.map((g) => (
            <div key={g.id}>
              <p id={`footer-${g.id}`} className="text-[0.8125rem] font-medium leading-[1.2] text-[#8a8a8a]">
                {g.heading}
              </p>
              <ul aria-labelledby={`footer-${g.id}`} className="mt-[0.6875rem] flex flex-col gap-[0.8125rem]">
                {g.links.map((l) => (
                  <li key={l.href} className="leading-[1.125rem]">
                    <Link href={l.href} className="text-[0.9375rem] leading-[1.125rem] text-white transition-[color] duration-200 hover:text-white/70">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.08] pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-small text-white/55">{footer.legal}</p>
          <ul className="flex flex-col gap-2 md:flex-row md:items-center md:gap-0">
            {footer.legalLinks.map((l, i) => (
              <li key={l.href} className="flex items-center">
                {i ? <span aria-hidden="true" className="mx-[1.125rem] hidden h-5 w-px bg-white/15 md:block" /> : null}
                <Link href={l.href} className="text-small text-white/55 transition-[color] duration-200 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
