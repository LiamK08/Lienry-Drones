import { Hero } from "@/components/home/Hero";
import { PropertyStrip } from "@/components/home/PropertyStrip";
import { ProductCards } from "@/components/home/ProductCards";
import { SoftwareBand } from "@/components/software/SoftwareBand";
import { SystemStage } from "@/components/home/SystemStage";
import { PlacesRow } from "@/components/home/PlacesRow";
import { FilmBand } from "@/components/home/FilmBand";
import { FactRow } from "@/components/home/FactRow";
import { FounderBand } from "@/components/home/FounderBand";
import { Safety } from "@/components/home/Safety";
import { Faq } from "@/components/sections/Faq";
import { ClosingCta } from "@/components/home/ClosingCta";
import { filmBand } from "@/content/home";
import { faqSets, homeFaqLink, platformFaq } from "@/content/pages";
import { softwareSection } from "@/content/software";

type Question = (typeof platformFaq.items)[number];

// The home set of the platform questions, in the order faqSets.home gives them.
const questions = faqSets.home
  .map((id) => platformFaq.items.find((item) => item.id === id))
  .filter((item): item is Question => item !== undefined);

/**
 * Home, in the order a buyer needs it: the film, what it is built for, what you buy, the working
 * software, the six parts, where it works, the film that introduces the design facts, the founder,
 * safety, the first questions and the ask (docs/REDESIGN-SPEC.md C1).
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <PropertyStrip />
      <ProductCards />
      <SoftwareBand id="software" tone="sunken" headline={softwareSection.headline} body={softwareSection.body} steps />
      <SystemStage />
      <PlacesRow />
      <FilmBand {...filmBand} />
      <FactRow />
      <FounderBand />
      <Safety />
      <Faq id="faq" tone="raised" headline={platformFaq.headline} intro={platformFaq.intro} link={homeFaqLink} items={questions} />
      <ClosingCta />
    </>
  );
}
