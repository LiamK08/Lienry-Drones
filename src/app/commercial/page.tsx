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
  "A weatherproof roof dock, a tether fed from above, and desktop software that runs the whole building. Window cleaning that lives on the roof.",
);

/**
 * /commercial: the solutions template. The hero with its two paths, the strip, the feature rows as
 * chapters (the dock on tint, the scan on white, the software window on tint), safety as the night
 * panel, the questions, then the closing panel with its lighter step to the fit check. The cost
 * calculator has its own page; the cost answer links to it.
 */
export default function CommercialPage() {
  const { hero, strip, rows, safety, close } = commercialPage;
  const items = rows.map((r) => (r.id === "software" ? { ...r, media: <SoftwareWindow />, wideMedia: true } : r));
  return (
    <>
      <CenterHero mobileLines={3} leadLines={{ phone: 5, wide: 3 }} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} primary={hero.primary} secondary={hero.secondary} />
      <WordStrip label={strip.label} items={strip.items} />
      <FeatureRows id="features" variant="solutions" items={items} />
      <SafetyBlock {...safety} />
      <FaqCentered items={faqFor("commercial")} spacing="page" />
      <AccentPanel id="closing" headline={close.headline} emphasis={close.emphasis} action={close.action} secondary={close.secondary} band="close" />
    </>
  );
}
