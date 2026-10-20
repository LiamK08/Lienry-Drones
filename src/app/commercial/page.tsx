import type { Metadata } from "next";
import { commercialPage } from "@/content/commercial";
import { faqFor } from "@/content/faq";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { CenterHero } from "@/components/blocks/CenterHero";
import { FaqCentered } from "@/components/blocks/FaqCentered";
import { FeatureRows } from "@/components/blocks/FeatureRows";
import { SafetyBlock } from "@/components/blocks/SafetyBlock";
import { WordStrip } from "@/components/blocks/WordStrip";
import { CostCalculator } from "@/components/sections/CostCalculator";
import { SoftwareWindow } from "@/components/software/SoftwareWindow";
import { Band, Container } from "@/components/ui/Band";
import { SectionHead } from "@/components/ui/SectionHead";

export const metadata: Metadata = pageMetadata(
  "/commercial",
  "A weatherproof roof capsule, a tether fed from above, and desktop software that runs the whole building. Window cleaning that lives on the roof.",
);

/** /commercial: the solutions template, with the software window in the third row and the calculator. */
export default function CommercialPage() {
  const { hero, strip, rows, safety, cost, close } = commercialPage;
  const items = rows.map((r) => (r.id === "software" ? { ...r, media: <SoftwareWindow /> } : r));
  return (
    <>
      <CenterHero eyebrow={hero.eyebrow} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} primary={hero.primary} />
      <WordStrip label={strip.label} items={strip.items} />
      <FeatureRows id="features" items={items} />
      <SafetyBlock {...safety} />
      <Band id="cost" tone="plaster" labelledBy="cost-heading">
        <Container>
          <SectionHead id="cost-heading" layout="center" eyebrow={cost.eyebrow} headline={cost.headline} intro={cost.intro} />
          <div className="mx-auto mt-(--head-gap) max-w-6xl rounded-panel border border-line bg-white p-6 md:p-10">
            <CostCalculator headingId="cost-heading" noteId="cost-note" defaultType="Commercial building" />
          </div>
        </Container>
      </Band>
      <FaqCentered tone="paper" items={faqFor("commercial")} />
      <AccentPanel id="closing" headline={close.headline} action={close.action} />
    </>
  );
}
