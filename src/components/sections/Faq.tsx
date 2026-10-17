import type { Action, BandTone, LegacyTone } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { SectionHead } from "@/components/ui/SectionHead";

export type FaqItem = { id: string; q: string; a: string; link?: Action };

export type FaqProps = {
  /** The band's id; the heading is `${id}-heading` and each item `${id}-${item.id}`. */
  id: string;
  tone: BandTone | LegacyTone;
  eyebrow: string;
  /** Never italic. */
  headline: string;
  intro?: string;
  link?: Action;
  /** From src/content/faq.ts: `faqFor(set)`. */
  items: readonly FaqItem[];
};

/**
 * The one FAQ: the head stacked in columns 1-4 and the questions in 6-12 from 1024 (stacked below,
 * 40 apart). Native `details`, so it works without JavaScript, find-in-page reaches closed answers
 * and several rows may be open at once. Each question is a lead-size summary with a plus that turns
 * to a minus; an answer may carry one tertiary link. The head reveals; the list does not.
 */
export function Faq({ id, tone, eyebrow, headline, intro, link, items }: FaqProps) {
  return (
    <Band id={id} tone={tone} labelledBy={`${id}-heading`}>
      <Container>
        <div className="lg:grid-12">
          <SectionHead id={`${id}-heading`} layout="stack" eyebrow={eyebrow} headline={headline} intro={intro} link={link} className="lg:col-span-4" />
          <div data-accordion="" className="mt-(--head-gap) border-t border-rule lg:col-span-7 lg:col-start-6 lg:mt-0">
            {items.map((item) => (
              <details key={item.id} id={`${id}-${item.id}`} className="group border-b border-rule">
                <summary className="group/q flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                  <span className="text-lead text-fg underline decoration-transparent decoration-1 underline-offset-4 transition-[text-decoration-color] duration-200 ease-instrument group-hover/q:decoration-current motion-reduce:transition-none">
                    {item.q}
                  </span>
                  <span aria-hidden="true" className="relative size-5 shrink-0 text-link">
                    <span className="absolute left-0 top-1/2 h-px w-5 -translate-y-1/2 bg-current" />
                    <span className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-current transition-[rotate] duration-200 ease-instrument group-open:rotate-90 motion-reduce:transition-none" />
                  </span>
                </summary>
                <p className={`text-body text-fg-muted ${item.link ? "" : "pb-6"}`}>{item.a}</p>
                {item.link ? (
                  <div className="mt-2 pb-6">
                    <Button href={item.link.href} variant="tertiary" arrow>
                      {item.link.label}
                    </Button>
                  </div>
                ) : null}
              </details>
            ))}
          </div>
        </div>
      </Container>
    </Band>
  );
}
