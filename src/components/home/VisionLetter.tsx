import { visionLetter } from "@/content/home";
import { Container, Section, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function PhotoPlaceholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`relative flex items-end overflow-hidden rounded-panel border border-dashed border-border-strong/60 bg-raised ${className}`} style={{ aspectRatio: "4/5" }} role="img" aria-label={label}>
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_30%_20%,#fbf9f4_0%,#e9e3d8_100%)]" />
      <p className="readout relative m-4 text-[0.6875rem] uppercase tracking-[0.08em] text-muted">{label}</p>
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
            <div className="mt-6 flex items-center gap-4 rounded-card border border-hairline bg-raised p-4">
              <div className="h-12 w-12 shrink-0 rounded-full border border-dashed border-border-strong/60" aria-hidden="true" />
              <div>
                <p className="text-small font-medium">{visionLetter.cofounder.name}</p>
                <p className="text-caption text-muted">{visionLetter.cofounder.title}</p>
              </div>
            </div>
          </Reveal>
          <Reveal className="md:col-span-7 md:col-start-6" delay={0.08}>
            <Eyebrow className="mb-4">{visionLetter.eyebrow}</Eyebrow>
            <h2 id="vision-heading" className="text-h2">
              {visionLetter.headline}
            </h2>
            <div className="mt-8 max-w-prose space-y-5 text-lead">
              {visionLetter.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-10">
              <p className="font-display text-[1.75rem] italic leading-none">{visionLetter.signature.name}</p>
              <p className="mt-2 text-caption text-muted">{visionLetter.signature.title}</p>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
