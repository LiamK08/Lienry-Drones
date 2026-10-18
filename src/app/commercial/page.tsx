import type { Metadata } from "next";
import { commercialPage } from "@/content/commercial";
import { faqFor, faqIntro } from "@/content/faq";
import { pageMetadata } from "@/lib/site";
import { ClosingSection } from "@/components/sections/ClosingSection";
import { CostCalculator } from "@/components/sections/CostCalculator";
import { Faq } from "@/components/sections/Faq";
import { PageHero } from "@/components/sections/PageHero";
import { StepCards } from "@/components/sections/StepCards";
import { SoftwareBand } from "@/components/software/SoftwareBand";
import { Band, Container } from "@/components/ui/Band";
import { SectionHead } from "@/components/ui/SectionHead";

export const metadata: Metadata = pageMetadata(
  "/commercial",
  "A weatherproof roof capsule, a tether fed from above, and desktop software that runs the whole building. Window cleaning that lives on the roof.",
);

/**
 * /commercial: the hero with the commercial film, the four steps continuing it on plaster, the
 * working software on ink, the visitor's own numbers, the questions and the pilot ask.
 */
export default function CommercialPage() {
  const { hero, steps, software, cost, faq, closing } = commercialPage;
  return (
    <>
      <PageHero eyebrow={hero.eyebrow} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} primary={hero.primary} secondary={hero.secondary} media={hero.film} />
      <StepCards
        id="how"
        tone="plaster"
        pad="attached"
        eyebrow={steps.eyebrow}
        headline={steps.headline}
        emphasis={steps.emphasis}
        intro={steps.intro}
        columns={4}
        aspect="4/3"
        items={steps.items}
        track={steps.track}
      />
      <SoftwareBand id="software" tone="ink" eyebrow={software.eyebrow} headline={software.headline} emphasis={software.emphasis} intro={software.intro} />
      <Band id="cost" tone="plaster" labelledBy="cost-heading">
        <Container>
          <SectionHead id="cost-heading" eyebrow={cost.eyebrow} headline={cost.headline} emphasis={cost.emphasis} intro={cost.intro} />
          <div className="mt-(--head-gap)">
            <CostCalculator headingId="cost-heading" noteId="cost-note" defaultType="Commercial building" />
          </div>
        </Container>
      </Band>
      <Faq id="faq" tone="ink" eyebrow={faq.eyebrow} headline={faq.headline} intro={faqIntro} link={faq.link} items={faqFor("commercial")} />
      <ClosingSection
        id="closing"
        eyebrow={closing.eyebrow}
        headline={closing.headline}
        emphasis={closing.emphasis}
        body={closing.body}
        primary={closing.primary}
        links={closing.links}
        media={{ kind: "collage", items: closing.collage }}
      />
    </>
  );
}
