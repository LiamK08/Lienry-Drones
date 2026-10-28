import type { Metadata } from "next";
import { calculatorPage } from "@/content/tools";
import { pageMetadata } from "@/lib/site";
import { TitleHero } from "@/components/blocks/TitleHero";
import { CostCalculator } from "@/components/sections/CostCalculator";
import { Band, Container } from "@/components/ui/Band";

export const metadata: Metadata = pageMetadata("/calculator", "Add up what outsourced exterior cleaning costs you over five and ten years, from your own figures. Not a Lienry quote.");

/**
 * /calculator: the page title on white, then the calculator straight under it on the same white
 * (an attached band), as one panel on the rail: the fields beside the summary of the results.
 */
export default function CalculatorPage() {
  const { hero, head } = calculatorPage;
  return (
    <>
      <TitleHero mobileLines={2} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} />
      <Band id="cost" tone="plaster" pad="attached" labelledBy="cost-heading">
        <Container>
          <CostCalculator layout="listing" heading={head.headline} headingId="cost-heading" noteId="cost-note" />
        </Container>
      </Band>
    </>
  );
}
