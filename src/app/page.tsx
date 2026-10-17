import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Benefits } from "@/components/home/Benefits";
import { Flow } from "@/components/home/Flow";
import { PlacesRow } from "@/components/home/PlacesRow";
import { VisionLetter } from "@/components/home/VisionLetter";
import { ClosingSection } from "@/components/sections/ClosingSection";
import { CostCalculator } from "@/components/sections/CostCalculator";
import { Faq } from "@/components/sections/Faq";
import { Band, Container } from "@/components/ui/Band";
import { SectionHead } from "@/components/ui/SectionHead";
import { closing, cost, faqHead } from "@/content/home";
import { faqFor, faqIntro, homeFaqLink } from "@/content/faq";
import { brand, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata("/", brand.description);

/**
 * Home in eight sections, alternating dark and light: the film, why it is built the way it is, the
 * five steps of a clean in the desktop software, what outsourced cleaning adds up to, where it works,
 * the founder's letter, the first questions and the ask. Then the ink footer.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Benefits />
      <Flow />
      <Band id="cost" tone="plaster" labelledBy="cost-heading">
        <Container>
          <SectionHead id="cost-heading" eyebrow={cost.eyebrow} headline={cost.headline} intro={cost.intro} />
          <div className="mt-(--head-gap)">
            <CostCalculator headingId="cost-heading" noteId="cost-note" />
          </div>
        </Container>
      </Band>
      <PlacesRow />
      <VisionLetter />
      <Faq id="faq" tone="ink" eyebrow={faqHead.eyebrow} headline={faqHead.headline} intro={faqIntro} link={homeFaqLink} items={faqFor("home")} />
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
