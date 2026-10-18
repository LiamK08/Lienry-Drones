import type { ReactNode } from "react";
import type { Action } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";
import { HeroFilmFrame, type HeroFilmMedia } from "@/components/sections/HeroFilmFrame";

export { HeroFilmFrame };

/** The hero frame's widths: the grid at 1440, the page less its margins below. Defined here, in a
 *  server module: a value imported from a "use client" module is only a reference on the server. */
export const HERO_SIZES = "(min-width: 1440px) 1392px, (min-width: 768px) calc(100vw - 48px), calc(100vw - 32px)";

export type PageHeroMedia = (
  | { kind: "image"; id: string; alt: string }
  | Omit<HeroFilmMedia, "position" | "positionMd" | "positionSm" | "variant">
) & { position: string; positionMd?: string; positionSm?: string; variant?: string };

export type PageHeroProps = {
  /** The h1's id. Default "hero-heading". The band is always id "hero". */
  id?: string;
  eyebrow: string;
  headline: string;
  /** The trailing phrase of `headline`, in the italic. */
  emphasis?: string;
  /** From 768, break the line before the italic. */
  breakBefore?: boolean;
  lead: string;
  primary?: Action;
  /** A tertiary link beside the primary. */
  secondary?: Action;
  /** Replaces primary and secondary (/download's DownloadActions). */
  actions?: ReactNode;
  /** The full-grid image or film under the head. */
  media?: PageHeroMedia;
  /** Anything else under the head at the same gap (/download's software window). */
  after?: ReactNode;
};

/**
 * Every inner page's hero, and the 404's. A plaster `<header>` band (id "hero", pad "hero") with the
 * section head as the page's h1: from 1024 the eyebrow and h1 in columns 1-7 and the lead and actions
 * in 8-12, bottom-aligned; below 1024 stacked (eyebrow, 16, h1, 24, lead, 24, actions). Then
 * `--head-gap` and the media across the full grid: 21:9 from 1024, 16:9 from 768, 4:3 below, as the
 * page's LCP image (priority). Nothing in it reveals: it is the first screen.
 */
export function PageHero({ id = "hero-heading", eyebrow, headline, emphasis, breakBefore, lead, primary, secondary, actions, media, after }: PageHeroProps) {
  const action =
    actions ??
    (primary || secondary ? (
      <div data-actions="" className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
        {primary ? (
          <Button href={primary.href} size="lg">
            {primary.label}
          </Button>
        ) : null}
        {secondary ? (
          <Button href={secondary.href} variant="tertiary" arrow>
            {secondary.label}
          </Button>
        ) : null}
      </div>
    ) : undefined);
  return (
    <Band id="hero" as="header" tone="plaster" pad="hero" labelledBy={id}>
      <Container>
        <SectionHead id={id} as="h1" size="h1" eyebrow={eyebrow} headline={headline} emphasis={emphasis} breakBefore={breakBefore} reveal={false} intro={lead} action={action} />
        {media ? (
          <div className="mt-(--head-gap)">
            {media.kind === "image" ? (
              <Picture
                id={media.id}
                alt={media.alt}
                aspect="21/9"
                aspectMd="16/9"
                aspectSm="4/3"
                position={media.position}
                positionMd={media.positionMd}
                positionSm={media.positionSm}
                variant={media.variant}
                priority
                sizes={HERO_SIZES}
              />
            ) : (
              <HeroFilmFrame media={media} sizes={HERO_SIZES} />
            )}
          </div>
        ) : null}
        {after ? <div className="mt-(--head-gap)">{after}</div> : null}
      </Container>
    </Band>
  );
}
