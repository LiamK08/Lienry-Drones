import type { Metadata } from "next";
import { faqFor, faqIntro } from "@/content/faq";
import { solarPage } from "@/content/solar";
import { solarStats } from "@/content/stats";
import { pageMetadata } from "@/lib/site";
import { CardGrid } from "@/components/sections/CardGrid";
import { ClosingSection } from "@/components/sections/ClosingSection";
import { Faq } from "@/components/sections/Faq";
import { PageHero } from "@/components/sections/PageHero";
import { CITED_NOTE, StatBand, pickStats } from "@/components/sections/StatBand";

export const metadata: Metadata = pageMetadata(
  "/solar",
  "Dust and grime cost solar owners real energy. Lienry treats a panel as its own material, sets the pressure to match, and cleans on the interval you choose.",
);

/**
 * /solar in five bands, alternating light and dark: the hero, what soiling costs (cited), how panels
 * are cleaned, the questions and the ask. Then the ink footer.
 */
export default function SolarPage() {
  const { hero, stats, how, faq, closing } = solarPage;
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
      <StatBand
        id="soiling"
        tone="ink"
        eyebrow={stats.eyebrow}
        headline={stats.headline}
        notePosition="foot"
        intro={stats.intro}
        items={pickStats(solarStats, ["unsw-soiling", "iea-soiling", "joule-soiling"])}
        note={CITED_NOTE}
      />
      <CardGrid id="how" tone="plaster" eyebrow={how.eyebrow} headline={how.headline} emphasis={how.emphasis} intro={how.intro} columns={3} aspect="3/4" items={how.items} />
      <Faq id="faq" tone="ink" eyebrow={faq.eyebrow} headline={faq.headline} intro={faqIntro} link={faq.link} items={faqFor("solar")} />
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
