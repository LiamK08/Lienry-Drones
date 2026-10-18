import type { Metadata } from "next";
import { faqFor, faqIntro } from "@/content/faq";
import { platformPage } from "@/content/platform";
import { pageMetadata } from "@/lib/site";
import { CardGrid } from "@/components/sections/CardGrid";
import { ClosingSection } from "@/components/sections/ClosingSection";
import { Faq } from "@/components/sections/Faq";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = pageMetadata(
  "/platform",
  "One drone platform, two systems, six parts: dock, tether, drone, scan, software and automation. Built for buildings under 70 metres.",
);

/**
 * The platform in five bands, alternating light and dark: the hero, the six parts (each card is the
 * anchor the footer links to), the two systems, the questions and the ask. Then the ink footer.
 */
export default function PlatformPage() {
  const { hero, parts, systems, faq, closing } = platformPage;
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        emphasis={hero.emphasis}
        lead={hero.lead}
        primary={hero.primary}
        secondary={hero.secondary}
        media={{ kind: "image", ...hero.image }}
      />
      <CardGrid id="parts" tone="ink" eyebrow={parts.eyebrow} headline={parts.headline} emphasis={parts.emphasis} intro={parts.intro} columns={3} aspect="4/3" items={parts.items} />
      <CardGrid id="systems" tone="plaster" eyebrow={systems.eyebrow} headline={systems.headline} emphasis={systems.emphasis} intro={systems.intro} columns={2} aspect="3/2" items={systems.items} />
      <Faq id="faq" tone="ink" eyebrow={faq.eyebrow} headline={faq.headline} intro={faqIntro} link={faq.link} items={faqFor("platform")} />
      <ClosingSection
        id="closing"
        eyebrow={closing.eyebrow}
        headline={closing.headline}
        emphasis={closing.emphasis}
        body={closing.body}
        primary={closing.primary}
        links={closing.links}
        media={{ kind: "image", image: closing.image }}
      />
    </>
  );
}
