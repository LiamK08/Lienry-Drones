import type { Metadata } from "next";
import { faqFor } from "@/content/faq";
import { homesPage, landlordStory } from "@/content/homes";
import { australiaStats } from "@/content/stats";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { CenterHero } from "@/components/blocks/CenterHero";
import { FaqCentered } from "@/components/blocks/FaqCentered";
import { FeatureRows, type FeatureRowItem } from "@/components/blocks/FeatureRows";
import { FiguresPanel } from "@/components/blocks/FiguresPanel";
import { SafetyBlock } from "@/components/blocks/SafetyBlock";
import { WordStrip } from "@/components/blocks/WordStrip";
import { LandlordAppFrame } from "@/components/home/LandlordStory";
import { CITED_NOTE, pickStats } from "@/components/sections/StatBand";

export const metadata: Metadata = pageMetadata(
  "/homes-and-rentals",
  "A waterproof ground pod, a drone that knows each material, and an app that starts the clean wherever you are. For houses, apartments and rentals.",
);

/**
 * /homes-and-rentals: the solutions template. The hero, the strip, one white run of four feature
 * rows (the pod, the materials, the app as an interactive demo on a wider media column, and two cited
 * figures with the cited note), safety on paper, the questions on white, then the closing panel.
 */
export default function HomesPage() {
  const { hero, strip, rows, stats, safety, close } = homesPage;
  const items: FeatureRowItem[] = [
    ...rows,
    {
      id: "app",
      title: landlordStory.headline,
      paragraphs: [landlordStory.intro],
      checks: landlordStory.steps,
      media: <LandlordAppFrame />,
      wideMedia: true,
    },
    {
      id: "australia",
      title: stats.headline,
      paragraphs: [stats.intro],
      note: CITED_NOTE,
      link: stats.action,
      linkStyle: "primary",
      media: <FiguresPanel items={pickStats(australiaStats, ["abs-renting", "cer-rooftop"])} />,
    },
  ];
  return (
    <>
      <CenterHero mobileLines={3} leadLines={{ phone: 5, wide: 2 }} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} primary={hero.primary} />
      <WordStrip label={strip.label} items={strip.items} />
      <FeatureRows id="features" variant="solutions" items={items} />
      <SafetyBlock {...safety} />
      <FaqCentered items={faqFor("homes")} spacing="page" narrow />
      <AccentPanel id="closing" headline={close.headline} action={close.action} band="close" />
    </>
  );
}
