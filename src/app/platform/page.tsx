import type { Metadata } from "next";
import { faqFor } from "@/content/faq";
import { platformPage } from "@/content/platform";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { FaqCentered } from "@/components/blocks/FaqCentered";
import { FeatureRows } from "@/components/blocks/FeatureRows";
import { PanelPair } from "@/components/blocks/PanelPair";
import { PillarTabs } from "@/components/blocks/PillarTabs";
import { ProductHero } from "@/components/blocks/ProductHero";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = pageMetadata(
  "/platform",
  "One drone platform, two systems, six parts: dock, tether, drone, scan, software and automation. Built for buildings under 70 metres.",
);

/**
 * /platform: the product first (the centred head and its two pills over the working software window),
 * the six parts as tabs (each panel is the anchor the menus and the footer link to), three feature rows
 * on alternating grounds (paper, white, paper), what the building provides beside how it keeps people
 * off ropes, the questions on paper, and the closing panel with its two steps.
 */
export default function PlatformPage() {
  const { hero, parts, rows, pair, close } = platformPage;
  return (
    <>
      {/* Measured from 360 to 412 in both fonts: the h1 holds two lines; the lead five below 384, four
          to 767 and three from 768. */}
      <ProductHero
        mobileLines={2}
        leadLines={{ narrow: 5, phone: 4, wide: 3 }}
        headline={hero.headline}
        emphasis={hero.emphasis}
        lead={hero.lead}
        actions={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
            <Button href={hero.primary.href} arrow className="max-sm:w-full">
              {hero.primary.label}
            </Button>
            <Button href={hero.secondary.href} variant="secondary" arrow className="max-sm:w-full">
              {hero.secondary.label}
            </Button>
          </div>
        }
      />
      <PillarTabs id="parts" headline={parts.headline} items={parts.items} />
      <FeatureRows id="features" tone="paper" pad="feature" items={[rows[0]]} startSide="right" />
      <FeatureRows id="systems-row" tone="plaster" pad="feature" items={[rows[1]]} startSide="left" />
      <FeatureRows id="planned-row" tone="paper" pad="feature" items={[rows[2]]} startSide="right" />
      <PanelPair id="on-site" label={pair.label} light={pair.provides} dark={pair.safety} />
      <FaqCentered tone="paper" items={faqFor("platform")} />
      <AccentPanel id="closing" headline={close.headline} action={close.action} secondary={close.secondary} />
    </>
  );
}
