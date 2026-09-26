import type { Metadata } from "next";
import { faqSets, platformFaq, solarPage } from "@/content/pages";
import { solarStats } from "@/content/stats";
import { CtaPanel } from "@/components/sections/CtaPanel";
import { Faq } from "@/components/sections/Faq";
import { PageHeroSplit } from "@/components/sections/PageHeroSplit";
import { SiblingCards } from "@/components/sections/SiblingCards";
import { CITED_NOTE, StatBand, pickStats } from "@/components/sections/StatBand";
import { Switcher } from "@/components/sections/Switcher";

export const metadata: Metadata = {
  title: "Lienry Drones",
  description: "Dust and grime cost solar owners real energy. Lienry treats a panel as its own material, sets the pressure to match, and cleans on the interval you choose.",
  alternates: { canonical: "/solar" },
};

// The page's questions, in the order faqSets gives them.
const questions = faqSets.solar.map((id) => platformFaq.items.find((item) => item.id === id)).filter((item) => item !== undefined);

/**
 * /solar (docs/REDESIGN-SPEC.md C5): the split hero, what soiling costs (cited), how the home
 * system cleans panels, questions, the other product pages and the register panel.
 */
export default function SolarPage() {
  const s = solarPage;
  return (
    <>
      <PageHeroSplit
        id="hero-heading"
        headline={s.headline}
        emphasis={s.emphasis}
        lead={s.lead}
        primary={s.actions.primary}
        secondary={s.actions.secondary}
        media={{ kind: "image", id: s.heroImageId, alt: s.heroAlt }}
      />
      {/* Starts inside the first screen, so nothing in it waits for a reveal. */}
      <StatBand
        kind="cited"
        id="soiling"
        headline={s.statsHeadline}
        intro={s.statsIntro}
        items={pickStats(solarStats, ["unsw-soiling", "iea-soiling", "joule-soiling"])}
        note={CITED_NOTE}
        reveal={false}
      />
      <Switcher id="how" tone="plaster" headline={s.how.headline} emphasis={s.how.emphasis} intro={s.how.intro} tabsLabel={s.how.tabsLabel} items={s.how.items} />
      <Faq id="faq" tone="raised" headline={platformFaq.headline} intro={platformFaq.intro} link={s.actions.primary} items={questions} />
      <SiblingCards current="solar" />
      <CtaPanel id="register" headline={s.close.headline} body={s.close.body} primary={s.close.primary} links={s.close.links} image={s.close.image} />
    </>
  );
}
