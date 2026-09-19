import { safety } from "@/content/home";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Picture } from "@/components/ui/Picture";
import { Reveal, RevealItem, RevealList } from "@/components/ui/Reveal";

export function Safety() {
  return (
    <Section id="safety" tone="dark" ariaLabelledby="safety-heading">
      <Container>
        <Reveal>
          <SectionHeading id="safety-heading" eyebrow={safety.eyebrow} headline={safety.headline} />
        </Reveal>
        <RevealList className="mt-12 grid gap-8 sm:grid-cols-2 md:mt-16 md:grid-cols-4 md:gap-6">
          {safety.items.map((item) => (
            <RevealItem key={item.id}>
              <Picture id={item.id} alt={item.title} aspect="1/1" sizes="(min-width: 768px) 22vw, 45vw" placeholderText="Detail render to come" />
              <h3 className="mt-5 font-sans text-h4 font-medium">{item.title}</h3>
              <p className="mt-2 text-small text-muted-on-dark">{item.body}</p>
            </RevealItem>
          ))}
        </RevealList>
        <Reveal className="mt-12 border-t border-plaster/15 pt-6">
          <p className="max-w-[70ch] text-caption text-muted-on-dark">{safety.note}</p>
        </Reveal>
      </Container>
    </Section>
  );
}
