import type { Metadata } from "next";
import { faqFor } from "@/content/faq";
import { solarPage } from "@/content/solar";
import { solarStats } from "@/content/stats";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { CenterHero } from "@/components/blocks/CenterHero";
import { FaqCentered } from "@/components/blocks/FaqCentered";
import { FeatureRows } from "@/components/blocks/FeatureRows";
import { FiguresBlock } from "@/components/blocks/SafetyBlock";
import { WordStrip } from "@/components/blocks/WordStrip";
import { SoftwareWindow } from "@/components/software/SoftwareWindow";
import { CITED_NOTE, pickStats } from "@/components/sections/StatBand";

export const metadata: Metadata = pageMetadata(
  "/solar",
  "Dust and grime cost solar owners real energy. Lienry treats a panel as its own material, sets the pressure to match, and cleans on the interval you choose.",
);

/**
 * /solar: the solutions template. The hero with its two paths, the strip, the feature rows as chapters
 * (the panels on tint, the software window's solar model on white, the rows on tint), the three cited
 * soiling figures on the night panel (with the cited note), the questions, then the closing panel with
 * its lighter step to the fit check.
 */
export default function SolarPage() {
  const { hero, strip, stats, rows, close } = solarPage;
  const items = rows.map((r) => (r.id === "software" ? { ...r, media: <SoftwareWindow model="solar" />, wideMedia: true } : r));
  return (
    <>
      <CenterHero mobileLines={3} leadLines={{ phone: 4, wide: 3 }} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} primary={hero.primary} secondary={hero.secondary} />
      <WordStrip label={strip.label} items={strip.items} />
      <FeatureRows id="features" variant="solutions" items={items} />
      <FiguresBlock id="soiling" headline={stats.headline} aside={stats.intro} items={pickStats(solarStats, ["unsw-soiling", "iea-soiling", "joule-soiling"])} note={CITED_NOTE} />
      <FaqCentered items={faqFor("solar")} spacing="page" />
      <AccentPanel id="closing" headline={close.headline} action={close.action} secondary={close.secondary} band="close" />
    </>
  );
}
