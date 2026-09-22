import { visionLetter } from "@/content/home";
import { Container, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function PhotoPlaceholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`relative flex items-end overflow-hidden rounded-hard border border-hairline bg-plaster ${className}`} style={{ aspectRatio: "4/5" }} role="img" aria-label={label}>
      <p className="caption relative m-4">{label}</p>
    </div>
  );
}

export function VisionLetter() {
  return (
    <Section id="vision" tone="sunken" ariaLabelledby="vision-heading">
      <Container>
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-4">
            <PhotoPlaceholder label="Photo of Liam Kennedy to come" className="max-w-[16rem]" />
            <div className="mt-6 border-t border-border-strong/40 pt-4">
              <div>
                <p className="text-small font-medium">{visionLetter.cofounder.name}</p>
                <p className="text-caption text-muted">{visionLetter.cofounder.title}</p>
              </div>
            </div>
          </Reveal>
          <Reveal className="md:col-span-7 md:col-start-6" delay={0.08}>
            <h2 id="vision-heading" className="text-h2">
              {visionLetter.headline}
            </h2>
            <div className="mt-8 max-w-prose space-y-5 text-body">
              {visionLetter.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-10">
              <p className="text-small font-medium">{visionLetter.signature.name}</p>
              <p className="mt-2 text-caption text-muted">{visionLetter.signature.title}</p>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
