import { Band, Container } from "@/components/ui/Band";
import { Headline } from "@/components/ui/SectionHead";
import { holdLines } from "@/components/blocks/holdLines";

export type TitleHeroProps = {
  /** @deprecated Ignored: the site has no eyebrows (owner, 21 October 2026). */
  eyebrow?: string;
  headline: string;
  /** The trailing phrase of `headline`, set in the accent italic. */
  emphasis?: string;
  lead?: string;
  /** Lines the h1 holds on phones (its fallback-font wrap). */
  mobileLines?: number;
};

/**
 * An inner page's title on white, with two soft accent glows behind it: the h1 with its accent italic
 * and a short muted lead, left-aligned on the page's rail. The band takes the hero pad, so the h1 sits
 * the same distance under the bar as every other inner page's.
 */
export function TitleHero({ headline, emphasis, lead, mobileLines }: TitleHeroProps) {
  const hold = holdLines(mobileLines);
  return (
    <Band id="hero" as="header" tone="plaster" pad="hero" labelledBy="hero-heading" className="overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-10 size-[31rem] rounded-pill bg-accent-on-dark/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-24 size-[37rem] rounded-pill bg-accent/10 blur-3xl" />
      <Container className="relative">
        <h1 id="hero-heading" className={`em-accent text-h1 ${hold.className}`} style={hold.style}>
          <Headline text={headline} emphasis={emphasis} />
        </h1>
        {lead ? <p className="mt-4 max-w-[36rem] text-lead leading-[1.55] text-fg-muted">{lead}</p> : null}
      </Container>
    </Band>
  );
}
