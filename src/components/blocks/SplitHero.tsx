import type { Action, ImageRef } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { Headline } from "@/components/ui/SectionHead";
import { holdLines } from "@/components/blocks/holdLines";

export type SplitHeroProps = {
  eyebrow: string;
  headline: string;
  /** The trailing phrase of `headline`, set in the accent italic. */
  emphasis?: string;
  lead?: string;
  primary?: Action;
  secondary?: Action;
  image: ImageRef;
  /** The band's ground. Default "paper". */
  tone?: "paper" | "plaster" | "tint";
  /** Lines the h1 holds on phones (its fallback-font wrap). */
  mobileLines?: number;
};

/**
 * An inner page's first screen: the eyebrow, the h1 with its accent italic, the lead and two pills on
 * the left, and a rounded picture on the right. Below 1024 the picture comes first, so a heading that
 * rewraps when the web font arrives moves only its own text. The picture is the page's LCP image.
 */
export function SplitHero({ eyebrow, headline, emphasis, lead, primary, secondary, image, tone = "paper", mobileLines }: SplitHeroProps) {
  const hold = holdLines(mobileLines);
  return (
    <Band id="hero" as="header" tone={tone} pad="split" labelledBy="hero-heading">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 id="hero-heading" className={`em-accent text-h1 ${hold.className}`} style={hold.style}>
              <Headline text={headline} emphasis={emphasis} />
            </h1>
            {lead ? <p className="mt-4 max-w-xl text-small text-fg-muted">{lead}</p> : null}
            {primary || secondary ? (
              <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row">
                {primary ? (
                  <Button href={primary.href} arrow>
                    {primary.label}
                  </Button>
                ) : null}
                {secondary ? (
                  <Button href={secondary.href} variant="secondary" arrow>
                    {secondary.label}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
          <Picture id={image.id} alt={image.alt} position={image.position} aspect="7/6" aspectMd="16/9" aspectSm="4/3" rounded="card" priority className="-order-1 lg:order-none" sizes="(min-width: 1440px) 684px, (min-width: 1024px) 50vw, 100vw" />
        </div>
      </Container>
    </Band>
  );
}
