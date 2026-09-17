import { twoSystems } from "@/content/home";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Picture } from "@/components/ui/Picture";
import { Button, ArrowRight } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function TwoSystems() {
  return (
    <Section id="systems" ariaLabelledby="systems-heading">
      <Container>
        <Reveal>
          <SectionHeading id="systems-heading" eyebrow={twoSystems.eyebrow} headline={twoSystems.headline} />
        </Reveal>
        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-2 md:gap-8">
          {twoSystems.systems.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.08} as="article" className="flex flex-col overflow-hidden rounded-panel border border-hairline bg-raised">
              <Picture id={s.imageId} alt={`${s.name}: ${s.subtitle}`} aspect="4/3" rounded="rounded-none" sizes="(min-width: 768px) 50vw, 100vw" />
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <p className="eyebrow">{s.subtitle}</p>
                <h3 className="mt-3 text-h3">{s.name}</h3>
                <ul className="mt-5 space-y-2.5 text-small text-muted">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-3">
                      <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-glass" aria-hidden="true" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-2">
                  <Button href={s.href} variant="secondary">
                    {s.cta} <ArrowRight />
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
