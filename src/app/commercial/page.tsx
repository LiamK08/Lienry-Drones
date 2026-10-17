import type { Metadata } from "next";
import { commercialPage } from "@/content/commercial";
import { faqSets, platformFaq } from "@/content/faq";
import { softwareSection } from "@/content/software";
import { pageMetadata } from "@/lib/site";
import { CtaPanel } from "@/components/sections/CtaPanel";
import { Faq } from "@/components/sections/Faq";
import { FeatureRow } from "@/components/sections/FeatureRow";
import { PageHeroSplit } from "@/components/sections/PageHeroSplit";
import { SiblingCards } from "@/components/sections/SiblingCards";
import { Switcher } from "@/components/sections/Switcher";
import { SoftwareBand } from "@/components/software/SoftwareBand";

export const metadata: Metadata = pageMetadata(
  "/commercial",
  "A weatherproof roof capsule, a tether fed from above, and desktop software that runs the whole building. Window cleaning that lives on the roof.",
);

// The page's questions, in the order faqSets gives them.
const questions = faqSets.commercial.map((id) => platformFaq.items.find((item) => item.id === id)).filter((item) => item !== undefined);

/**
 * /commercial (docs/REDESIGN-SPEC.md C3): the split hero with the commercial film, the four steps,
 * the working software, the running cost, questions, the other product pages and the pilot panel.
 * (The design-figures band went with StatBand's design kind in the design-pass foundation.)
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
        reveal={false}
        tone="plaster"
        eyebrow="four steps"
        headline={c.steps.headline}
        emphasis={c.steps.emphasis}
        intro={c.steps.intro}
        tabsLabel={c.steps.tabsLabel}
        items={c.steps.items}
      />
      <SoftwareBand id="software" tone="sunken" eyebrow="desktop software" headline={c.software.headline} intro={softwareSection.body} />
      <FeatureRow
        id="cost"
        tone="raised"
        side="right"
        eyebrow="running cost"
        headline={c.cost.headline}
        intro={c.cost.body}
        facts={c.cost.points.map((text) => ({ text }))}
        image={c.cost.image}
      />
      <Faq id="faq" tone="plaster" eyebrow="questions" headline={platformFaq.headline} intro={platformFaq.intro} link={c.pilot.cta} items={questions} />
      <SiblingCards current="commercial" />
      <CtaPanel id="pilot" eyebrow="pilot program" headline={c.pilot.headline} body={c.pilot.body} primary={c.pilot.cta} links={c.pilot.links} image={c.pilot.image} />
    </>
  );
}
