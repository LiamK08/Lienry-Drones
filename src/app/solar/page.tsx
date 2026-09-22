import type { Metadata } from "next";
import { solarPage } from "@/content/pages";
import { solarStats, australiaStats } from "@/content/stats";
import { PageHero } from "@/components/blocks/PageHero";
import { CtaBlock, StatsBlock, Tiles } from "@/components/blocks/Blocks";
import { Container, Section } from "@/components/ui/Section";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Lienry Drones",
  description: "Dust and grime cost solar owners real energy. Lienry treats a panel as its own material, sets the pressure to match, and cleans on the interval you choose.",
  alternates: { canonical: "/solar" },
};

export default function SolarPage() {
  const s = solarPage;
  return (
    <>
      <PageHero eyebrow={s.eyebrow} headline={s.headline} lead={s.lead} imageId={s.heroImageId} imageAlt="A solar farm row at first light with the Lienry drone low over the panels">
        <Button href="/register-interest?type=homeowner" size="lg">
          Register interest
        </Button>
      </PageHero>
      <div className="h-[var(--section-y)]" aria-hidden="true" />
      <StatsBlock id="soiling" headline={s.statsHeadline} intro={s.statsIntro} stats={solarStats} />
      <Tiles id="how" eyebrow={s.how.eyebrow} headline={s.how.headline} items={s.how.items} tone="plaster" />
      <Section id="rooftop" aria-label="Rooftop solar in Australia" tone="raised" className="border-y border-hairline">
        <Container>
          <div className="grid items-center gap-10 md:grid-cols-12">
            <Reveal className="md:col-span-5">
              <p className="numeral">{australiaStats[0].value}</p>
              <p className="mt-3 max-w-[30ch] text-lead">{australiaStats[0].label}</p>
              <p className="mt-3 text-caption text-muted">
                {australiaStats[0].source}.{" "}
                <a href={australiaStats[0].sourceUrl} className="water-link" target="_blank" rel="noreferrer noopener">
                  Source
                </a>
              </p>
              <p className="mt-6 max-w-prose text-body text-muted">Rooftop panels are cleaned by the home system from a ground pod, on the interval you set, with pressure matched to the panel.</p>
            </Reveal>
            <Reveal className="md:col-span-6 md:col-start-7" delay={0.08}>
              <Picture id={s.closeImageId} alt="Water beading on a solar panel" aspect="3/2" sizes="(min-width: 768px) 50vw, 100vw" />
            </Reveal>
          </div>
        </Container>
      </Section>
      <CtaBlock id="solar-cta" eyebrow="Register interest" headline="Rooftop or solar farm, tell us about it." body="We are pre-launch. Register interest and we will let you know as the pilot program takes shape." cta={{ label: "Register interest", href: "/register-interest?type=homeowner" }} />
    </>
  );
}
