import type { Action, ImageRef } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { Headline } from "@/components/ui/SectionHead";

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
};

/**
 * An inner page's first screen: the eyebrow, the h1 with its accent italic, the lead and two pills on
 * the left, and a rounded picture on the right (stacked below 1024, the picture second). The picture
 * is the page's LCP image.
 */
export function SplitHero({ eyebrow, headline, emphasis, lead, primary, secondary, image, tone = "paper" }: SplitHeroProps) {
  return (
    <Band id="hero" as="header" tone={tone} pad="hero" labelledBy="hero-heading">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 id="hero-heading" className="em-accent text-h1">
              <Headline text={headline} emphasis={emphasis} />
            </h1>
            {lead ? <p className="mt-5 max-w-xl text-body text-fg-muted md:text-lead">{lead}</p> : null}
            {primary || secondary ? (
              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
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
          <Picture id={image.id} alt={image.alt} position={image.position} aspect="5/4" aspectSm="4/3" rounded="card" priority sizes="(min-width: 1440px) 684px, (min-width: 1024px) 50vw, 100vw" />
        </div>
      </Container>
    </Band>
  );
}
