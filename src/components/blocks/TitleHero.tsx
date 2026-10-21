import type { Action, ImageRef } from "@/lib/types";
import { Band } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { Headline } from "@/components/ui/SectionHead";
import { holdLines } from "@/components/blocks/holdLines";

export type TitleHeroFeature = {
  /** The page's LCP image, in a 450x250 frame from 1024 (250px tall below it). */
  image: ImageRef;
  /** The row's heading, set at the h3 step. */
  title: string;
  /** A muted line under the title. */
  note: string;
  /** A short line under the note. */
  meta?: string;
  /** A 40px pill with the arrow badge. */
  action: Action;
};

export type TitleHeroProps = {
  /** @deprecated Ignored: the site has no eyebrows (owner, 21 October 2026). */
  eyebrow?: string;
  headline: string;
  /** The trailing phrase of `headline`, set in the accent italic. */
  emphasis?: string;
  lead?: string;
  /** Lines the h1 holds on phones (its fallback-font wrap). */
  mobileLines?: number;
  /** The featured row under the page title: a picture beside a title, a note and one pill. */
  feature?: TitleHeroFeature;
};

/**
 * An inner page's title on white, with two soft glows (Lienry's sand and teal) behind it: the h1
 * with its accent italic and a short lead, left-aligned on a 1120px rail; then an optional
 * featured row (a 450x250 picture beside its text, on a 1100px rail). The h1's top sits about 117px
 * from the top of the page at every width, clear of the 56px bar. Below 1024 the row stacks, picture
 * first, under the title text, so an h1 that rewraps when the web font arrives moves only its own text.
 */
export function TitleHero({ headline, emphasis, lead, mobileLines, feature }: TitleHeroProps) {
  const hold = holdLines(mobileLines);
  return (
    <Band id="hero" as="header" tone="plaster" pad="none" labelledBy="hero-heading" className="overflow-hidden pt-[7.3125rem] pb-20 lg:pb-[4.6875rem]">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-10 size-[31rem] rounded-pill bg-[#d9c7a8]/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-24 size-[37rem] rounded-pill bg-accent/10 blur-3xl" />
      <div className="relative mx-auto w-full max-w-[70rem] max-lg:pl-10">
        <h1 id="hero-heading" className={`em-accent text-h1 ${hold.className}`} style={hold.style}>
          <Headline text={headline} emphasis={emphasis} />
        </h1>
        {lead ? <p className="mt-[1.125rem] max-w-[36rem] text-[0.875rem] leading-[1.2] text-fg-muted">{lead}</p> : null}
      </div>
      {feature ? (
        <div className="relative mx-auto mt-20 w-full max-w-[68.75rem] max-lg:px-5 md:grid md:grid-cols-[2fr_3fr] md:items-center md:gap-8 lg:mt-[4.4375rem] lg:grid-cols-[450px_1fr] lg:gap-[50px]">
          <div className="h-[250px]">
            <Picture
              id={feature.image.id}
              alt={feature.image.alt}
              position={feature.image.position}
              positionMd={feature.image.positionMd}
              positionSm={feature.image.positionSm}
              fit="fill"
              frameAspect={1.8}
              rounded="image"
              priority
              sizes="(min-width: 1024px) 450px, (min-width: 768px) 40vw, calc(100vw - 80px)"
            />
          </div>
          <div className="mt-4 md:mt-0">
            <h2 className="text-h3">{feature.title}</h2>
            <p className="mt-4 max-w-none text-[0.875rem] leading-[1.2] text-fg-muted">{feature.note}</p>
            {feature.meta ? <p className="mt-1.5 max-w-none text-[0.875rem] leading-[1.2] text-fg">{feature.meta}</p> : null}
            {/* The reference's 40px pill: the md pill at 40px with an 11px gap after the badge. */}
            <div className="mt-6 lg:mt-[2.375rem] [&>a]:h-10 [&>a]:gap-[0.6875rem]">
              <Button href={feature.action.href} arrow>
                {feature.action.label}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Band>
  );
}
