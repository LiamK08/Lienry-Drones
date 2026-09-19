import type { Metadata } from "next";
import { commercialPage } from "@/content/pages";
import { PageHero } from "@/components/blocks/PageHero";
import { CtaBlock, Steps, Tiles } from "@/components/blocks/Blocks";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Commercial system",
  description: "A weatherproof roof capsule, a tether fed from above, and desktop software that runs the whole building. Window cleaning that lives on the roof.",
  alternates: { canonical: "/commercial" },
};

export default function CommercialPage() {
  const c = commercialPage;
  return (
    <>
      <PageHero eyebrow={c.eyebrow} headline={c.headline} lead={c.lead} imageId={c.heroImageId} imageAlt="The Lienry roof capsule on a plant deck at dawn">
        <Button href={c.pilot.cta.href} size="lg">
          {c.pilot.cta.label}
        </Button>
        <Button href="/platform" size="lg" variant="secondary">
          See the platform
        </Button>
      </PageHero>
      <div className="h-[var(--section-y)]" aria-hidden="true" />
      <Steps id="how" eyebrow={c.steps.eyebrow} headline={c.steps.headline} items={c.steps.items} />
      <Tiles id="software" eyebrow={c.software.eyebrow} headline={c.software.headline} items={c.software.tiles} />
      <Section id="cost" ariaLabelledby="cost-heading">
        <Container>
          <div className="grid gap-8 md:grid-cols-12">
            <Reveal className="md:col-span-5">
              <SectionHeading id="cost-heading" eyebrow={c.cost.eyebrow} headline={c.cost.headline} />
            </Reveal>
            <Reveal className="md:col-span-6 md:col-start-7" delay={0.08}>
              <p className="text-lead text-muted">{c.cost.body}</p>
              <ul className="mt-8 divide-y divide-hairline border-y border-hairline text-small">
                {["No crews to book for each visit", "No access equipment to arrange at height", "No waiting for a slot: the re-scan decides when a clean is due", "The building is planned, tracked and reported in one place"].map((line) => (
                  <li key={line} className="flex gap-3 py-3">
                    <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 bg-glass" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </Section>
      <CtaBlock id="pilot" eyebrow={c.pilot.eyebrow} headline={c.pilot.headline} body={c.pilot.body} cta={c.pilot.cta} imageId="m2-capsule-master" />
    </>
  );
}
