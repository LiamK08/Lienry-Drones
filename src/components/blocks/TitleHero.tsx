import type { ReactNode } from "react";
import { Band, Container } from "@/components/ui/Band";
import { Headline } from "@/components/ui/SectionHead";
import { holdLines } from "@/components/blocks/holdLines";

export type TitleHeroProps = {
  /** @deprecated Ignored: the site has no eyebrows (owner, 21 October 2026). */
  eyebrow?: string;
  headline: string;
  /** The headline's trailing phrase, set in the accent italic. */
  emphasis?: string;
  lead?: string;
  /** Lines the h1 holds on phones (its fallback-font wrap). */
  mobileLines?: number;
  /** The page's working part (the calculator), set under the title in the same band, 48 below the lead (40 on phones). */
  children?: ReactNode;
};

/**
 * An inner page's title on white: the h1 with its accent italic and a short muted lead, left-aligned on
 * the page's rail, then the page's working part under it in the same band, so the tool starts in the
 * first screen with no seam between the title and it. The band takes the hero pad, so the h1 sits the
 * same distance under the bar as every other inner page's. One soft sky glow sits behind the title,
 * held inside the band's top so the band never cuts it off. With a working part the band is a section
 * (a header holds only the title).
 */
export function TitleHero({ headline, emphasis, lead, mobileLines, children }: TitleHeroProps) {
  const hold = holdLines(mobileLines);
  return (
    <Band id="hero" as={children ? "section" : "header"} tone="plaster" pad="hero" labelledBy="hero-heading" className="overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-56 size-[30rem] rounded-pill bg-accent-on-dark/30 blur-3xl" />
      <Container className="relative">
        <h1 id="hero-heading" className={`em-accent text-h1 ${hold.className}`} style={hold.style}>
          <Headline text={headline} emphasis={emphasis} />
        </h1>
        {lead ? <p className="mt-4 max-w-[36rem] text-pretty text-lead leading-[1.55] text-fg-muted">{lead}</p> : null}
        {children ? <div className="mt-10 lg:mt-12">{children}</div> : null}
      </Container>
    </Band>
  );
}
