import type { Metadata } from "next";
import { calculatorPage } from "@/content/tools";
import { pageMetadata } from "@/lib/site";
import { TitleHero } from "@/components/blocks/TitleHero";
import { CostCalculator } from "@/components/sections/CostCalculator";

export const metadata: Metadata = pageMetadata("/calculator", "Add up what outsourced exterior cleaning costs you over five and ten years, from your own figures. Not a Lienry quote.");

/**
 * /calculator: one band on the page's rail: the page title and its lead, then the calculator straight
 * under them as one panel (the building type and the fields beside the summary of the results), so
 * the fields start in the first screen.
 */
export default function CalculatorPage() {
  const { hero, head } = calculatorPage;
  return (
    <TitleHero mobileLines={2} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead}>
      <CostCalculator layout="listing" heading={head.headline} headingId="cost-heading" noteId="cost-note" />
    </TitleHero>
  );
}
