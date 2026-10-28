import type { Metadata } from "next";
import type { Action } from "@/lib/types";
import { faqFor } from "@/content/faq";
import { platformPage } from "@/content/platform";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { FaqCentered } from "@/components/blocks/FaqCentered";
import { FeatureRows } from "@/components/blocks/FeatureRows";
import { PillarTabs } from "@/components/blocks/PillarTabs";
import { SplitHero } from "@/components/blocks/SplitHero";
import { SoftwareWindow } from "@/components/software/SoftwareWindow";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { SectionHead } from "@/components/ui/SectionHead";

export const metadata: Metadata = pageMetadata(
  "/platform",
  "One drone platform, two systems, six parts: dock, tether, drone, scan, software and automation. Built for buildings under 70 metres.",
);

/**
 * The page's close: the centred head at the inner section step (36, under the 40px h1), its line and
 * one pill, then the working software window in a white frame (the card corners and a hairline edge, no
 * shadow), on the 12-column grid's middle ten columns from 1024.
 */
function SoftwareClose({ id, headline, body, action }: { id: string; headline: string; body: string; action: Action }) {
  return (
    <Band id={id} tone="plaster" labelledBy={`${id}-heading`}>
      <Container>
        <SectionHead
          id={`${id}-heading`}
          layout="center"
          size="h2s"
          headline={headline}
          below={<p className="mx-auto max-w-[38rem] text-body text-balance text-fg-muted">{body}</p>}
          action={
            <Button href={action.href} arrow>
              {action.label}
            </Button>
          }
        />
        <div className="mt-(--head-gap) lg:grid-12">
          <div className="rounded-card border border-line bg-white p-2 lg:col-span-10 lg:col-start-2">
            <SoftwareWindow frame="inset" />
          </div>
        </div>
      </Container>
    </Band>
  );
}

/**
 * /platform: the split hero, the six parts as tabs (each panel is the anchor the footer links to),
 * three feature rows on alternating grounds (paper, white, paper), the night statement band, the
 * questions on paper, and the working software window.
 */
export default function PlatformPage() {
  const { hero, parts, rows, statement, close } = platformPage;
  return (
    <>
      <SplitHero mobileLines={2} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} primary={hero.primary} secondary={hero.secondary} image={hero.image} />
      <PillarTabs id="parts" headline={parts.headline} items={parts.items} />
      <FeatureRows id="features" tone="paper" pad="feature" items={[rows[0]]} startSide="right" />
      <FeatureRows id="systems-row" tone="plaster" pad="feature" items={[rows[1]]} startSide="left" />
      <FeatureRows id="planned-row" tone="paper" pad="feature" items={[rows[2]]} startSide="right" />
      <AccentPanel id="statement" bleed dark headline={statement.headline} action={statement.action} />
      <FaqCentered tone="paper" items={faqFor("platform")} />
      <SoftwareClose id="close" headline={close.headline} body={close.body} action={close.action} />
    </>
  );
}
