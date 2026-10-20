import type { Metadata } from "next";
import { calculatorPage } from "@/content/tools";
import { pageMetadata } from "@/lib/site";
import { SplitHero } from "@/components/blocks/SplitHero";
import { CostCalculator } from "@/components/sections/CostCalculator";
import { Band, Container } from "@/components/ui/Band";
import { SectionHead } from "@/components/ui/SectionHead";

export const metadata: Metadata = pageMetadata("/calculator", "Add up what outsourced exterior cleaning costs you over five and ten years, from your own figures. Not a Lienry quote.");

/** /calculator: the split hero, then the calculator in a white card. */
export default function CalculatorPage() {
  const { hero, head } = calculatorPage;
  return (
    <>
      <SplitHero eyebrow={hero.eyebrow} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} image={hero.image} />
      <Band id="cost" tone="plaster" labelledBy="cost-heading">
        <Container>
          <SectionHead id="cost-heading" layout="center" eyebrow={head.eyebrow} headline={head.headline} intro={head.intro} />
          <div className="mx-auto mt-(--head-gap) max-w-6xl rounded-panel border border-line bg-white p-6 md:p-10">
            <CostCalculator headingId="cost-heading" noteId="cost-note" />
          </div>
        </Container>
      </Band>
    </>
  );
}
