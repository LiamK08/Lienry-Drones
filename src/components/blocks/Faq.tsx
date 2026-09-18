import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export type FaqItem = { q: string; a: string };

/** Accessible accordion built on details/summary: keyboard and screen-reader friendly without JavaScript. */
export function Faq({ id, eyebrow, headline, items, tone = "plaster" }: { id: string; eyebrow: string; headline: string; items: FaqItem[]; tone?: "plaster" | "raised" | "sunken" }) {
  return (
    <Section id={id} ariaLabelledby={`${id}-heading`} tone={tone}>
      <Container>
        <div className="grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <SectionHeading id={`${id}-heading`} eyebrow={eyebrow} headline={headline} />
          </Reveal>
          <Reveal className="md:col-span-7 md:col-start-6" delay={0.08}>
            <dl className="divide-y divide-hairline border-y border-hairline">
              {items.map((item) => (
                <details key={item.q} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-left font-sans text-h4 font-medium [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <span className="relative h-5 w-5 shrink-0 text-glass" aria-hidden="true">
                      <span className="absolute left-0 top-1/2 h-px w-5 -translate-y-1/2 bg-current" />
                      <span className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-current transition-transform duration-200 group-open:rotate-90" />
                    </span>
                  </summary>
                  <p className="max-w-prose pb-5 text-body text-muted">{item.a}</p>
                </details>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
