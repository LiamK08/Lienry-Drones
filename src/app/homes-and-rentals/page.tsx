import type { Metadata } from "next";
import { faqFor } from "@/content/faq";
import { homesPage } from "@/content/homes";
import { australiaStats } from "@/content/stats";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { CenterHero } from "@/components/blocks/CenterHero";
import { FaqCentered } from "@/components/blocks/FaqCentered";
import { FeatureRows } from "@/components/blocks/FeatureRows";
import { SafetyBlock } from "@/components/blocks/SafetyBlock";
import { WordStrip } from "@/components/blocks/WordStrip";
import { LandlordStory } from "@/components/home/LandlordStory";
import { CITED_NOTE, StatBand, pickStats } from "@/components/sections/StatBand";

export const metadata: Metadata = pageMetadata(
  "/homes-and-rentals",
  "A waterproof ground pod, a drone that knows each material, and an app that starts the clean wherever you are. For houses, apartments and rentals.",
);

/** /homes-and-rentals: the solutions template, with the app story and two cited figures. */
export default function HomesPage() {
  const { hero, strip, rows, stats, safety, close } = homesPage;
  return (
    <>
      <CenterHero eyebrow={hero.eyebrow} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} primary={hero.primary} />
      <WordStrip label={strip.label} items={strip.items} />
      <FeatureRows id="features" items={rows} />
      <LandlordStory />
      <SafetyBlock {...safety} />
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
      <FaqCentered tone="paper" items={faqFor("homes")} />
      <AccentPanel id="closing" headline={close.headline} action={close.action} />
    </>
  );
}
