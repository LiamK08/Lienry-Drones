import { counters } from "@/content/home";
import { Container, Section } from "@/components/ui/Section";
import { Counter } from "@/components/ui/Counter";
import { RevealItem, RevealList } from "@/components/ui/Reveal";

export function Counters() {
  return (
    <Section id="facts" tone="raised" ariaLabelledby="facts-heading" className="border-y border-hairline">
      <Container>
        <h2 id="facts-heading" className="sr-only">
          {counters.eyebrow}
        </h2>
        <RevealList className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-5 md:gap-x-8">
          {counters.items.map((c) => (
            <RevealItem key={c.label} className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <Counter value={c.value} />
                <span className="readout text-small text-glass">{c.unit}</span>
              </div>
              <p className="mt-3 max-w-[22ch] text-caption text-muted">{c.label}</p>
            </RevealItem>
          ))}
        </RevealList>
      </Container>
    </Section>
  );
}
