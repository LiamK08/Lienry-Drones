import type { Metadata } from "next";
import { faqFor, faqIntro } from "@/content/faq";
import { homesPage } from "@/content/homes";
import { australiaStats } from "@/content/stats";
import { pageMetadata } from "@/lib/site";
import { LandlordStory } from "@/components/home/LandlordStory";
import { ClosingSection } from "@/components/sections/ClosingSection";
import { Faq } from "@/components/sections/Faq";
import { PageHero } from "@/components/sections/PageHero";
import { CITED_NOTE, StatBand, pickStats } from "@/components/sections/StatBand";

export const metadata: Metadata = pageMetadata(
  "/homes-and-rentals",
  "A waterproof ground pod, a drone that knows each material, and an app that starts the clean wherever you are. For houses, apartments and rentals.",
);

/**
 * /homes-and-rentals in five bands, alternating light and dark: the hero, the app told as one clean,
 * two cited figures, the questions and the ask. Then the ink footer.
 */
export default function HomesPage() {
  const { hero, stats, faq, closing } = homesPage;
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        emphasis={hero.emphasis}
        lead={hero.lead}
        primary={hero.primary}
        secondary={hero.secondary}
        media={{ kind: "image", ...hero.image }}
      />
      <LandlordStory />
      <StatBand
        id="australia"
        tone="plaster"
        eyebrow={stats.eyebrow}
        headline={stats.headline}
        notePosition="foot"
        intro={stats.intro}
        items={pickStats(australiaStats, ["abs-renting", "cer-rooftop"])}
        note={CITED_NOTE}
        action={stats.action}
      />
      <Faq id="faq" tone="ink" eyebrow={faq.eyebrow} headline={faq.headline} intro={faqIntro} link={faq.link} items={faqFor("homes")} />
      <ClosingSection
        id="closing"
        eyebrow={closing.eyebrow}
        headline={closing.headline}
        emphasis={closing.emphasis}
        body={closing.body}
        primary={closing.primary}
        links={closing.links}
        media={{ kind: "image", image: closing.image }}
      />
    </>
  );
}
