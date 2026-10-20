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
  /** "wide" (default): the 1392 rail with a 50/50 split. "compact": a 1084 rail, a 525px 7:5 picture
   *  and the heading first on phones, centred at 282px over a 7:8 picture (/fit-check). */
  variant?: "wide" | "compact";
};

/**
 * An inner page's first screen: the eyebrow, the h1 with its accent italic, the lead and two pills on
 * the left, and a rounded picture on the right. Below 1024 the picture comes first, so a heading that
 * rewraps when the web font arrives moves only its own text. The picture is the page's LCP image.
 * The compact variant (/fit-check) puts the heading first on phones, so it relies on `mobileLines`.
 */
export function SplitHero({ eyebrow, headline, emphasis, lead, primary, secondary, image, tone = "paper", mobileLines, variant = "wide" }: SplitHeroProps) {
  const hold = holdLines(mobileLines);
  if (variant === "compact") {
    // The eyebrow and h1 beside the picture from 1024 (eyebrow to h1 22px); below it the h1 leads,
    // centred, with no eyebrow, and the picture follows 34px under it. 100 above and 96 below from 1024.
    return (
      <Band id="hero" as="header" tone={tone} pad="none" labelledBy="hero-heading" className="pt-[9.1875rem] pb-24 lg:pt-[6.25rem]">
        <Container>
          <div className="mx-auto grid max-w-[67.75rem] items-center gap-[34px] lg:grid-cols-2">
            <div className="mx-auto w-full max-w-[282px] text-center md:max-w-[500px] lg:mx-0 lg:max-w-none lg:text-left">
              <p className="eyebrow max-lg:hidden lg:pl-3">{eyebrow}</p>
              <h1 id="hero-heading" className={`em-accent text-h1 mt-0 lg:mt-[1.375rem] lg:max-w-[500px] ${hold.className}`} style={hold.style}>
                <Headline text={headline} emphasis={emphasis} />
              </h1>
              {lead ? <p className="mx-auto mt-4 text-small text-fg-muted lg:mx-0">{lead}</p> : null}
            </div>
            <Picture
              id={image.id}
              alt={image.alt}
              position={image.position}
              aspect="7/5"
              aspectSm="7/8"
              rounded="image"
              priority
              className="mx-auto w-full max-w-[282px] md:max-w-[525px] lg:max-w-none"
              sizes="(min-width: 1024px) 525px, (min-width: 768px) 525px, 282px"
            />
          </div>
        </Container>
      </Band>
    );
  }
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
