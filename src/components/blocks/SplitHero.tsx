import type { Action, ImageRef } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { Headline } from "@/components/ui/SectionHead";
import { holdLines } from "@/components/blocks/holdLines";

export type SplitHeroProps = {
  /** @deprecated Ignored: the site has no eyebrows (owner, 21 October 2026). */
  eyebrow?: string;
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
 * An inner page's first screen on the 12-column grid: the h1 with its accent italic, the lead (18/1.55)
 * and the pills in columns 1-5, and a rounded picture in 7-12. Below 1024 the picture comes first, so a
 * heading that rewraps when the web font arrives moves only its own text; on phones the pills stack at
 * the column's full width, so they read as one block rather than two ragged ones. The picture is the
 * page's LCP image.
 */
export function SplitHero({ headline, emphasis, lead, primary, secondary, image, tone = "paper", mobileLines }: SplitHeroProps) {
  const hold = holdLines(mobileLines);
  return (
    <Band id="hero" as="header" tone={tone} pad="split" labelledBy="hero-heading">
      <Container>
        <div className="grid items-center gap-y-10 lg:grid-12 lg:gap-y-0">
          <div className="lg:col-span-5 lg:row-start-1">
            <h1 id="hero-heading" className={`em-accent text-h1 ${hold.className}`} style={hold.style}>
              <Headline text={headline} emphasis={emphasis} />
            </h1>
            {lead ? <p className="mt-5 text-lead leading-[1.55] text-fg-muted">{lead}</p> : null}
            {primary || secondary ? (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {primary ? (
                  <Button href={primary.href} arrow className="max-sm:w-full">
                    {primary.label}
                  </Button>
                ) : null}
                {secondary ? (
                  <Button href={secondary.href} variant="secondary" arrow className="max-sm:w-full">
                    {secondary.label}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
          <Picture
            id={image.id}
            alt={image.alt}
            position={image.position}
            aspect="7/6"
            aspectMd="16/9"
            aspectSm="4/3"
            rounded="image"
            priority
            className="-order-1 lg:order-none lg:col-span-6 lg:col-start-7 lg:row-start-1"
            sizes="(min-width: 1440px) 684px, (min-width: 1024px) 47vw, (min-width: 768px) calc(100vw - 3rem), calc(100vw - 2.5rem)"
          />
        </div>
      </Container>
    </Band>
  );
}
