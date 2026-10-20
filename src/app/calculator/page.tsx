import type { Metadata } from "next";
import { calculatorFeature } from "@/content/calculator";
import { calculatorPage } from "@/content/tools";
import { pageMetadata } from "@/lib/site";
import { TitleHero } from "@/components/blocks/TitleHero";
import { CostCalculator } from "@/components/sections/CostCalculator";
import { Band } from "@/components/ui/Band";

export const metadata: Metadata = pageMetadata("/calculator", "Add up what outsourced exterior cleaning costs you over five and ten years, from your own figures. Not a Lienry quote.");

/**
 * /calculator: the page title on white with a featured row (the dock picture beside a line about the
 * calculator and a pill down to it), then the calculator on a pale teal band as a listing: a 200px
 * sidebar of fields and building-type chips beside the result cards. The band's heading is sr-only;
 * it labels the band and the form.
 */
export default function CalculatorPage() {
  const { hero, head } = calculatorPage;
  return (
    <>
      <TitleHero mobileLines={2} eyebrow={hero.eyebrow} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} feature={{ image: hero.image, ...calculatorFeature }} />
      {/* The tint at the reference's strength (#f5fafa): --color-tint is about 2.5x stronger and stays as it is. */}
      <Band id="cost" tone="plaster" pad="none" labelledBy="cost-heading" className="bg-[#f5fafa]! pt-[1.5625rem] pb-[6.25rem] lg:pt-[3.125rem]">
        <h2 id="cost-heading" className="sr-only">
          {head.headline}
        </h2>
        <div className="mx-auto w-full max-w-[75rem] max-md:px-[1.875rem]">
          <CostCalculator layout="listing" headingId="cost-heading" noteId="cost-note" />
        </div>
      </Band>
    </>
  );
}
