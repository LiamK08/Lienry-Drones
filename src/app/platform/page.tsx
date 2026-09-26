import type { Metadata } from "next";
import { systemExplainer, twoSystems } from "@/content/home";
import { faqSets, platformFaq, platformPage } from "@/content/pages";
import { CtaWithProduct } from "@/components/platform/CtaWithProduct";
import { SpecBand } from "@/components/platform/SpecBand";
import { Faq } from "@/components/sections/Faq";
import { FeatureRow } from "@/components/sections/FeatureRow";
import { PageHeroSplit } from "@/components/sections/PageHeroSplit";
import { Switcher, type SwitcherItem } from "@/components/sections/Switcher";
import { SoftwareWindow } from "@/components/software/SoftwareWindow";

export const metadata: Metadata = {
  title: "Lienry Drones",
  description: "One drone platform, two systems, six parts: dock, tether, drone, scan, software and automation. Built for buildings under 70 metres.",
  alternates: { canonical: "/platform" },
};

// The platform hub (docs/REDESIGN-SPEC.md C2): split hero, the six-part switcher, the two system
// rows, the ink specification sheet, the questions, and the ask with the working window under it.
// Tones run raised, plaster, raised, sunken, ink, plaster, raised, then the sunken footer.
// Each part's panel id is its part id (dock ... automation), so the footer's /platform#part links
// open it; no other element on this page may take one of those ids.

const parts: SwitcherItem[] = systemExplainer.tabs.map((part, i) => {
  const { facts, link } = platformPage.partFacts[part.id];
  return {
    id: part.id,
    tab: part.tab,
    label: `${String(i + 1).padStart(2, "0")} · ${part.tab}`,
    title: part.title,
    body: part.body,
    image: { id: part.imageId, alt: part.alt, position: part.position },
    facts,
    link,
  };
});

const [commercialSystem, homeSystem] = twoSystems.systems;

const questions = faqSets.platform.flatMap((id) => platformFaq.items.filter((item) => item.id === id));

export default function PlatformPage() {
  const { actions, partsSection, rows, specs, close } = platformPage;
  return (
    <>
      <PageHeroSplit
        id="hero-heading"
        headline={platformPage.headline}
        emphasis={platformPage.emphasis}
        lead={platformPage.lead}
        primary={actions.primary}
        secondary={actions.secondary}
        media={{ kind: "image", id: platformPage.heroImageId, alt: platformPage.heroAlt }}
      />
      <Switcher
        id="parts"
        reveal={false}
        tone="plaster"
        headline={partsSection.headline}
        emphasis={partsSection.emphasis}
        intro={systemExplainer.intro}
        tabsLabel={partsSection.tabsLabel}
        items={parts}
        hashSync
      />
      <FeatureRow
        id="commercial-system"
        tone="raised"
        side="left"
        title={rows.commercial.title}
        body={rows.commercial.body}
        link={rows.commercial.link}
        facts={commercialSystem.points.map((text) => ({ text }))}
        image={rows.commercial.image}
      />
      <FeatureRow
        id="home-system"
        tone="sunken"
        side="right"
        title={rows.home.title}
        body={rows.home.body}
        link={rows.home.link}
        facts={homeSystem.points.map((text) => ({ text }))}
        image={rows.home.image}
      />
      <SpecBand id="specs" headline={specs.headline} intro={specs.intro} rows={specs.rows} />
      <Faq id="faq" tone="plaster" headline={platformFaq.headline} intro={platformFaq.intro} link={platformFaq.link} items={questions} />
      <CtaWithProduct id="demo" tone="raised" headline={close.headline} body={close.body} primary={close.primary} secondary={close.secondary}>
        <SoftwareWindow tone="raised" />
      </CtaWithProduct>
    </>
  );
}
