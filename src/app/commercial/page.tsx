import type { Metadata } from "next";
import { designFacts } from "@/content/home";
import { commercialPage, faqSets, platformFaq } from "@/content/pages";
import { softwareSection } from "@/content/software";
import { CtaPanel } from "@/components/sections/CtaPanel";
import { Faq } from "@/components/sections/Faq";
import { FeatureRow } from "@/components/sections/FeatureRow";
import { PageHeroSplit } from "@/components/sections/PageHeroSplit";
import { SiblingCards } from "@/components/sections/SiblingCards";
import { StatBand } from "@/components/sections/StatBand";
import { Switcher } from "@/components/sections/Switcher";
import { SoftwareBand } from "@/components/software/SoftwareBand";

export const metadata: Metadata = {
  title: "Lienry Drones",
  description: "A weatherproof roof capsule, a tether fed from above, and desktop software that runs the whole building. Window cleaning that lives on the roof.",
  alternates: { canonical: "/commercial" },
};

// The page's questions, in the order faqSets gives them.
const questions = faqSets.commercial.map((id) => platformFaq.items.find((item) => item.id === id)).filter((item) => item !== undefined);

/**
 * /commercial (docs/REDESIGN-SPEC.md C3): the split hero with the commercial film, the four steps,
 * the working software with its strip, the design figures, the running cost, questions, the other
 * product pages and the pilot panel.
 */
export default function CommercialPage() {
  const c = commercialPage;
  return (
    <>
      <PageHeroSplit
        id="hero-heading"
        headline={c.headline}
        emphasis={c.emphasis}
        lead={c.lead}
        primary={c.actions.primary}
        secondary={c.actions.secondary}
        media={{ kind: "film", videoId: c.heroVideoId, posterId: c.heroImageId, alt: c.heroAlt, name: "commercial film" }}
      />
      <Switcher
        id="how"
        tone="plaster"
        headline={c.steps.headline}
        emphasis={c.steps.emphasis}
        intro={c.steps.intro}
        tabsLabel={c.steps.tabsLabel}
        items={c.steps.items}
      />
      <SoftwareBand
        id="software"
        tone="sunken"
        headline={c.software.headline}
        body={softwareSection.body}
        strip={c.software.tiles.map((tile) => ({ term: tile.title, text: tile.body }))}
      />
      <StatBand
        kind="design"
        id="by-design"
        headline={c.byDesign.headline}
        intro={c.byDesign.intro}
        items={designFacts.items}
        note={designFacts.note}
        action={c.pilot.cta}
      />
      <FeatureRow
        id="cost"
        tone="raised"
        side="right"
        title={c.cost.headline}
        body={c.cost.body}
        facts={c.cost.points.map((text) => ({ text }))}
        image={c.cost.image}
      />
      <Faq id="faq" tone="plaster" headline={platformFaq.headline} intro={platformFaq.intro} link={c.pilot.cta} items={questions} />
      <SiblingCards current="commercial" />
      <CtaPanel id="pilot" headline={c.pilot.headline} body={c.pilot.body} primary={c.pilot.cta} links={c.pilot.links} image={c.pilot.image} />
    </>
  );
}
