import type { Metadata } from "next";
import { faqFor } from "@/content/faq";
import { solarPage } from "@/content/solar";
import { solarStats } from "@/content/stats";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { CenterHero } from "@/components/blocks/CenterHero";
import { FaqCentered } from "@/components/blocks/FaqCentered";
import { FeatureRows } from "@/components/blocks/FeatureRows";
import { WordStrip } from "@/components/blocks/WordStrip";
import { CITED_NOTE, StatBand, pickStats } from "@/components/sections/StatBand";

export const metadata: Metadata = pageMetadata(
  "/solar",
  "Dust and grime cost solar owners real energy. Lienry treats a panel as its own material, sets the pressure to match, and cleans on the interval you choose.",
);

/** /solar: the solutions template, with three cited soiling figures after the hero. */
export default function SolarPage() {
  const { hero, strip, stats, rows, close } = solarPage;
  return (
    <>
      <CenterHero eyebrow={hero.eyebrow} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} primary={hero.primary} />
      <WordStrip label={strip.label} items={strip.items} />
      <StatBand id="soiling" tone="ink" eyebrow={stats.eyebrow} headline={stats.headline} notePosition="foot" intro={stats.intro} items={pickStats(solarStats, ["unsw-soiling", "iea-soiling", "joule-soiling"])} note={CITED_NOTE} />
      <FeatureRows id="features" items={rows} />
      <FaqCentered tone="paper" items={faqFor("solar")} />
      <AccentPanel id="closing" headline={close.headline} action={close.action} />
    </>
  );
}
