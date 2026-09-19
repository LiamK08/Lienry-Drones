import { visionLetter } from "@/content/home";
import { Container, Section, Rule } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function PhotoPlaceholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`relative flex items-end overflow-hidden rounded-hard border border-dashed border-border-strong/60 bg-raised ${className}`} style={{ aspectRatio: "4/5" }} role="img" aria-label={label}>
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
            <PhotoPlaceholder label="Photo of Liam Kennedy to come" className="max-w-[20rem]" />
            <div className="mt-6 flex items-center gap-4 rounded-hard border border-hairline bg-raised p-4">
              <div className="h-12 w-12 shrink-0 rounded-hard border border-dashed border-border-strong/60" aria-hidden="true" />
              <div>
                <p className="text-small font-medium">{visionLetter.cofounder.name}</p>
                <p className="text-caption text-muted">{visionLetter.cofounder.title}</p>
              </div>
            </div>
          </Reveal>
          <Reveal className="md:col-span-7 md:col-start-6" delay={0.08}>
            <Rule className="mb-5" />
            <h2 id="vision-heading" className="text-h2">
              {visionLetter.headline}
            </h2>
            <div className="mt-8 max-w-prose space-y-5 text-lead">
              {visionLetter.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-10">
              <p className="signature text-h3">{visionLetter.signature.name}</p>
              <p className="mt-2 text-caption text-muted">{visionLetter.signature.title}</p>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
