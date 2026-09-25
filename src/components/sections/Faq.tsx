import type { Action, Tone } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { SectionHead } from "@/components/ui/SectionHead";

export type FaqItem = { id: string; q: string; a: string };

export type FaqProps = {
  /** The band's id; the heading is `${id}-heading` and each item `${id}-${item.id}`. */
  id: string;
  tone: Tone;
  /** Never italic. */
  headline: string;
  intro: string;
  link: Action;
  items: readonly FaqItem[];
};

/**
 * Questions and answers on native `details`, left aligned across the full grid: the section head,
 * 48, then the list with a hairline on top and between rows. It works without JavaScript.
 */
export function Faq({ id, tone, headline, intro, link, items }: FaqProps) {
  const dark = tone === "ink";
  const rule = dark ? "border-plaster/20 divide-plaster/20" : "border-hairline divide-hairline";
  return (
    <Band id={id} tone={tone} labelledBy={`${id}-heading`}>
      <Container>
        <SectionHead id={`${id}-heading`} headline={headline} aside={{ intro, link }} tone={dark ? "dark" : "light"} />
        <div className={`mt-[var(--gap-head)] divide-y border-t ${rule}`}>
          {items.map((item) => (
            <details key={item.id} id={`${id}-${item.id}`} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 [&::-webkit-details-marker]:hidden">
                <span className={`text-body font-medium ${dark ? "text-plaster" : "text-ink"}`}>{item.q}</span>
                <span className={`relative h-5 w-5 shrink-0 ${dark ? "text-glass-on-dark" : "text-glass"}`} aria-hidden="true">
                  <span className="absolute left-0 top-1/2 h-px w-5 -translate-y-1/2 bg-current" />
                  <span className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-current transition-transform duration-200 ease-instrument group-open:rotate-90" />
                </span>
              </summary>
              <p className={`pb-5 text-body ${dark ? "text-muted-on-dark" : "text-muted"}`}>{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </Band>
  );
}
