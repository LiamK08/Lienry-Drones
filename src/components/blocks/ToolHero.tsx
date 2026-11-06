import type { CSSProperties, ReactNode } from "react";
import { Band, Container } from "@/components/ui/Band";
import { Headline } from "@/components/ui/SectionHead";
import { holdLines } from "@/components/blocks/holdLines";

export type ToolHeroProps = {
  headline: string;
  /** The headline's trailing phrase, set in the accent italic. */
  emphasis?: string;
  lead: string;
  /** Lines the lead holds below 768 (its fallback-font wrap), so the tool under it never moves. */
  leadLines: number;
  /** Lines the h1 holds below 768 (its fallback-font wrap). */
  mobileLines: number;
  /** The tool itself, a white card on the tint. */
  children: ReactNode;
};

/**
 * A tool page's first screen (/fit-check, /calculator): on the pale accent tint, the centred h1 with its
 * accent italic (544px at most) and the muted lead in a 700px column, then the tool 40px under them (48
 * from 1024), so it starts in the first screen. The tool takes the rail's full width below 1280 and the
 * middle 10 of the 12 columns from 1280. The h1 and the lead hold their fallback-font line counts on
 * phones, so the web fonts arriving never move the tool.
 */
export function ToolHero({ headline, emphasis, lead, leadLines, mobileLines, children }: ToolHeroProps) {
  const hold = holdLines(mobileLines);
  return (
    <Band id="hero" as="header" tone="tint" pad="hero" labelledBy="hero-heading">
      <Container>
        <div className="mx-auto flex max-w-[43.75rem] flex-col items-center text-center">
          {/* Held to 34rem, so the web font and its fallback break a two-line headline alike at every width. */}
          <h1 id="hero-heading" className={`em-accent max-w-[34rem] text-h1 ${hold.className}`} style={hold.style}>
            <Headline text={headline} emphasis={emphasis} />
          </h1>
          <p className="mt-5 text-lead leading-[1.55] text-fg-muted max-md:min-h-[calc(var(--lead)*1lh)]" style={{ "--lead": leadLines } as CSSProperties}>
            {lead}
          </p>
        </div>
        <div className="mt-10 lg:mt-12 xl:grid-12">
          <div className="xl:col-span-10 xl:col-start-2">{children}</div>
        </div>
      </Container>
    </Band>
  );
}
