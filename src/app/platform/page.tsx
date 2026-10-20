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
 * three feature rows each on its own ground (paper, white, mist), the dark statement band, the
 * questions, and the working software window.
 */
export default function PlatformPage() {
  const { hero, parts, rows, statement, close } = platformPage;
  return (
    <>
      <SplitHero mobileLines={2} eyebrow={hero.eyebrow} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} primary={hero.primary} secondary={hero.secondary} image={hero.image} />
      <PillarTabs id="parts" eyebrow={parts.eyebrow} headline={parts.headline} items={parts.items} />
      <FeatureRows id="features" tone="paper" pad="feature" items={[rows[0]]} startSide="right" />
      <FeatureRows id="systems-row" tone="plaster" pad="feature" items={[rows[1]]} startSide="left" />
      <FeatureRows id="planned-row" tone="mist" pad="feature" items={[rows[2]]} startSide="right" />
      <AccentPanel id="statement" bleed dark headline={statement.headline} action={statement.action} />
      <FaqCentered tight items={faqFor("platform")} />
      <ProductClose id="close" headline={close.headline} body={close.body} action={close.action} />
    </>
  );
}
