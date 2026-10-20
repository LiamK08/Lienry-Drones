import type { Metadata } from "next";
import { faqFor } from "@/content/faq";
import { platformPage } from "@/content/platform";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { FaqCentered } from "@/components/blocks/FaqCentered";
import { FeatureRows } from "@/components/blocks/FeatureRows";
import { PillarTabs } from "@/components/blocks/PillarTabs";
import { ProductClose } from "@/components/blocks/ProductClose";
import { SplitHero } from "@/components/blocks/SplitHero";

export const metadata: Metadata = pageMetadata(
  "/platform",
  "One drone platform, two systems, six parts: dock, tether, drone, scan, software and automation. Built for buildings under 70 metres.",
);

/**
 * /platform: the split hero, the six parts as tabs (each panel is the anchor the footer links to),
 * three feature rows, the accent statement, the questions, and the working software window.
 */
export default function PlatformPage() {
  const { hero, parts, rows, statement, close } = platformPage;
  return (
    <>
      <SplitHero mobileLines={3} eyebrow={hero.eyebrow} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} primary={hero.primary} secondary={hero.secondary} image={hero.image} />
      <PillarTabs id="parts" eyebrow={parts.eyebrow} headline={parts.headline} items={parts.items} />
      <FeatureRows id="features" tone="paper" items={rows} />
      <AccentPanel id="statement" bleed headline={statement.headline} action={statement.action} />
      <FaqCentered items={faqFor("platform")} />
      <ProductClose id="close" headline={close.headline} body={close.body} action={close.action} />
    </>
  );
}
