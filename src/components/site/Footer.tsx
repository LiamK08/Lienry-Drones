import type { CSSProperties } from "react";
import Link from "next/link";
import { brand, footer } from "@/lib/site";
import { Picture } from "@/components/ui/Picture";
import { Mark } from "@/components/ui/Wordmark";

// The round pictures that drift across the top of the footer: each one's still, its diameter at 1440
// (a quarter of it on phones) and how far it sits below the row's top edge.
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
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-start gap-[5.5rem] pr-[5.5rem] md:gap-[4.375rem] md:pr-[4.375rem]">
      {CIRCLES.map((c) => (
        <li
          key={c.id}
          style={{ "--d": `${c.d}rem`, "--y": `${c.y}rem` } as CSSProperties}
          className="mt-[calc(var(--y)*0.25)] size-[calc(var(--d)*0.25)] shrink-0 overflow-hidden rounded-pill md:mt-(--y) md:size-(--d)"
        >
          <Picture id={c.id} alt="" aspect="1/1" rounded="none" sizes="(min-width: 768px) 300px, 75px" />
        </li>
      ))}
    </ul>
  );
}

/**
 * The footer, on near-black: a row of round pictures drifting slowly across the top over a soft
 * teal glow, then the logo set large with the tagline in Inter italic, four link columns under small
 * grey headings, a hairline, and the copyright line with the legal links. Under reduced motion the
 * row stands still.
 */
export function Footer() {
  return (
    <footer data-tone="ink" className="on-dark relative isolate overflow-hidden bg-[#0f0d0e] pb-24 text-white md:pb-[2.375rem]">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-16 -z-10 size-[30rem] -translate-x-1/2 rounded-pill bg-accent/25 blur-[110px] md:top-24 md:size-[46rem]" />
      <div aria-hidden="true" className="flex overflow-hidden pt-[6.125rem] md:pt-[6.875rem]">
        <div className="marquee flex w-max [animation-duration:70s]">
          <Circles />
          <Circles hidden />
        </div>
      </div>

      <div className="mx-auto mt-12 w-full max-w-[75rem] px-5 md:mt-[4.75rem] xl:px-0">
        <div className="flex items-center gap-3 md:gap-5">
          <Mark className="h-12 w-auto md:h-[4.875rem]" />
          <p aria-hidden="true" className="max-w-none font-display text-[3.25rem] leading-none tracking-[-0.02em] md:text-[5.25rem]">
            {brand.name.split(" ")[0]}
          </p>
        </div>
        <p className="mt-3 max-w-none font-[family-name:var(--font-inter-italic)] text-[1.125rem] italic tracking-[-0.02em] md:mt-[1.1875rem] md:text-[1.625rem]">{footer.tagline}</p>

        <nav aria-label="Footer" className="mt-[2.125rem] grid gap-y-[3.4375rem] md:mt-14 md:grid-cols-4 md:gap-x-6">
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

        <div className="mt-[3.375rem] flex flex-col gap-3 border-t border-white/[0.08] pt-[2.1875rem] md:flex-row md:items-center md:justify-between">
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
