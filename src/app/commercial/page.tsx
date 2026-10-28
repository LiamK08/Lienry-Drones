import type { Metadata } from "next";
import { commercialPage } from "@/content/commercial";
import { faqFor } from "@/content/faq";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { CenterHero } from "@/components/blocks/CenterHero";
import { FaqCentered } from "@/components/blocks/FaqCentered";
import { FeatureRows } from "@/components/blocks/FeatureRows";
import { SafetyBlock } from "@/components/blocks/SafetyBlock";
import { WordStrip } from "@/components/blocks/WordStrip";
import { SoftwareWindow } from "@/components/software/SoftwareWindow";

export const metadata: Metadata = pageMetadata(
  "/commercial",
  "A weatherproof roof capsule, a tether fed from above, and desktop software that runs the whole building. Window cleaning that lives on the roof.",
);

/**
 * /commercial: the solutions template. The hero, the strip, one white run of feature rows (the
 * software window in the third), safety on paper, the questions on white, then the closing panel.
 * The cost calculator has its own page; the cost answer links to it.
 */
export default function CommercialPage() {
  const { hero, strip, rows, safety, close } = commercialPage;
  const items = rows.map((r) => (r.id === "software" ? { ...r, media: <SoftwareWindow /> } : r));
  return (
    <>
      <CenterHero mobileLines={3} leadLines={{ phone: 4, wide: 2 }} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} primary={hero.primary} />
      <WordStrip label={strip.label} items={strip.items} />
      <FeatureRows id="features" variant="solutions" items={items} />
      <SafetyBlock {...safety} />
      <FaqCentered items={faqFor("commercial")} spacing="page" narrow />
      <AccentPanel id="closing" headline={close.headline} action={close.action} band="close" />
    </>
  );
}
