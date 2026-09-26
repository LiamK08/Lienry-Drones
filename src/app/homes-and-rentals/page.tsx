import type { Metadata } from "next";
import { faqSets, homesPage, platformFaq } from "@/content/pages";
import { australiaStats } from "@/content/stats";
import { LandlordStory } from "@/components/home/LandlordStory";
import { CtaPanel } from "@/components/sections/CtaPanel";
import { Faq } from "@/components/sections/Faq";
import { PageHeroSplit } from "@/components/sections/PageHeroSplit";
import { SiblingCards } from "@/components/sections/SiblingCards";
import { CITED_NOTE, StatBand, pickStats } from "@/components/sections/StatBand";
import { StepCards } from "@/components/sections/StepCards";

export const metadata: Metadata = {
  title: "Lienry Drones",
  description: "A waterproof ground pod, a drone that knows each material, and an app that starts the clean wherever you are. For houses, apartments, rentals and solar farms.",
  alternates: { canonical: "/homes-and-rentals" },
};

// The page's questions, in the order faqSets gives them.
const questions = faqSets.homes.map((id) => platformFaq.items.find((item) => item.id === id)).filter((item) => item !== undefined);

/**
 * /homes-and-rentals (docs/REDESIGN-SPEC.md C4): the split hero, the four setup steps as cards,
 * the app story, two cited figures, questions, the other product pages and the register panel.
 */
export default function HomesPage() {
  const h = homesPage;
  return (
    <>
      <PageHeroSplit
        id="hero-heading"
        headline={h.headline}
        emphasis={h.emphasis}
        lead={h.lead}
        primary={h.actions.primary}
        secondary={h.actions.secondary}
        media={{ kind: "image", id: h.heroImageId, alt: h.heroAlt, position: h.heroPosition }}
      />
      {/* Starts inside the first screen, so nothing in it waits for a reveal. */}
      <StepCards
        id="how"
        tone="plaster"
        headline={h.steps.headline}
        intro={h.steps.intro}
        numbered
        columns={4}
        aspect="4/5"
        items={h.steps.items}
        track={h.steps.track}
        reveal={false}
      />
      <LandlordStory />
      <StatBand
        kind="cited"
        id="australia"
        headline={h.statsHeadline}
        intro={h.statsIntro}
        items={pickStats(australiaStats, ["abs-renting", "cer-rooftop"])}
        note={CITED_NOTE}
        action={h.statsAction}
      />
      <Faq id="faq" tone="plaster" headline={platformFaq.headline} intro={platformFaq.intro} link={h.actions.primary} items={questions} />
      <SiblingCards current="homes" />
      <CtaPanel id="register" headline={h.close.headline} body={h.close.body} primary={h.close.primary} links={h.close.links} image={h.close.image} />
    </>
  );
}
