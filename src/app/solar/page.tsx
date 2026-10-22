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
 * /solar: the solutions template. The hero, the strip, one white run of feature rows (the software
 * window's solar model in the second), the three cited soiling figures on paper (with the cited
 * note), the questions on white, then the closing panel.
 */
export default function SolarPage() {
  const { hero, strip, stats, rows, close } = solarPage;
  const items = rows.map((r) => (r.id === "software" ? { ...r, media: <SoftwareWindow model="solar" /> } : r));
  return (
    <>
      <CenterHero mobileLines={3} leadLines={{ phone: 4, wide: 2 }} eyebrow={hero.eyebrow} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} primary={hero.primary} />
      <WordStrip label={strip.label} items={strip.items} />
      <FeatureRows id="features" variant="solutions" eyebrow="Features" items={items} />
      <FiguresBlock
        id="soiling"
        eyebrow={stats.eyebrow}
        headline={stats.headline}
        emphasis={stats.emphasis}
        aside={stats.intro}
        image={stats.image}
        items={pickStats(solarStats, ["unsw-soiling", "iea-soiling", "joule-soiling"])}
        note={CITED_NOTE}
      />
      <FaqCentered items={faqFor("solar")} spacing="page" narrow />
      <AccentPanel id="closing" headline={close.headline} action={close.action} band="close" />
    </>
  );
}
