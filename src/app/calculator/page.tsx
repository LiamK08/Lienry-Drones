import type { Metadata } from "next";
import { faqFor, faqIntro, homeFaqLink } from "@/content/faq";
import { calculatorPage } from "@/content/tools";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { FaqCentered } from "@/components/blocks/FaqCentered";
import { ToolHero } from "@/components/blocks/ToolHero";
import { CostCalculator } from "@/components/sections/CostCalculator";

export const metadata: Metadata = pageMetadata("/calculator", "Add up what outsourced exterior cleaning costs you over five and ten years, from your own figures. Not a Lienry quote.");

/**
 * /calculator: the fit check's tool template. The tool hero (the centred h1 and its lead on the pale
 * accent tint), then the calculator straight under them as one raised white panel (the building type
 * and the fields beside the summary of the results), so the fields start in the first screen. Then the
 * questions about how it adds up on paper, and the closing panel, on to the fit check.
 */
export default function CalculatorPage() {
  const { hero, head, faq, close } = calculatorPage;
  return (
    <>
      <ToolHero headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} mobileLines={2} leadLines={3}>
        <CostCalculator layout="listing" heading={head.headline} headingId="cost-heading" noteId="cost-note" />
      </ToolHero>
      <FaqCentered tone="paper" headline={faq.headline} items={faqFor("calculator", "/calculator")} intro={faqIntro} link={homeFaqLink} />
      <AccentPanel id="close" headline={close.headline} action={close.action} secondary={close.secondary} />
    </>
  );
}
