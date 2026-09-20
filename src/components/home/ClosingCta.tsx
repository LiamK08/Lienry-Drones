import { closing } from "@/content/home";
import { Container, Section } from "@/components/ui/Section";
import { Picture } from "@/components/ui/Picture";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function ClosingCta() {
  return (
    <Section id="closing" ariaLabelledby="closing-heading">
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-7">
            <h2 id="closing-heading" className="text-h1">
              {closing.headline}
            </h2>
            <p className="mt-5 max-w-prose text-lead text-muted">{closing.body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {closing.buttons.map((b) => (
                <Button key={b.href} href={b.href} variant={b.variant} size="lg">
                  {b.label}
                </Button>
              ))}
            </div>
          </Reveal>
          <Reveal className="md:col-span-4 md:col-start-9" delay={0.1}>
            <Picture id={closing.imageId} alt="The Lienry ground pod beside a house at first light" aspect="4/3" sizes="(min-width: 768px) 30vw, 100vw" />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
