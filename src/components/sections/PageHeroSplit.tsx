"use client";

import type { Action, FilmId, PosterId } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { FilmLayer, FilmPause, useFilm } from "@/components/ui/FilmMedia";
import { Picture } from "@/components/ui/Picture";
import { Headline } from "@/components/ui/SectionHead";

export type PageHeroMedia =
  | { kind: "image"; id: string; alt: string; position?: string }
  | { kind: "film"; videoId: FilmId; posterId: PosterId; alt: string; name: string; position?: string };

export type PageHeroSplitProps = {
  /** The h1's id (the band is labelled by it). The band itself has the DOM id "hero". */
  id: string;
  headline: string;
  /** The trailing phrase of `headline`, in the italic. */
  emphasis?: string;
  lead: string;
  primary: Action;
  /** Renders as a tertiary link beside the primary. */
  secondary?: Action;
  media: PageHeroMedia;
};

const mediaSizes = "(min-width: 1440px) 802px, (min-width: 1024px) 56vw, 100vw";

function HeroFilm({ media }: { media: Extract<PageHeroMedia, { kind: "film" }> }) {
  const film = useFilm({ videoId: media.videoId, threshold: 0.2 });
  return (
    <figure>
      <div className="relative">
        <div role="img" aria-label={media.alt} className="relative isolate aspect-video w-full overflow-hidden rounded-hard bg-ink">
          <FilmLayer film={film} videoId={media.videoId} posterId={media.posterId} position={media.position} sizes={mediaSizes} priority />
        </div>
        <FilmPause film={film} name={media.name} className="absolute bottom-3 right-3" />
      </div>
      <figcaption className="concept-caption mt-2 text-caption text-muted">Concept render</figcaption>
    </figure>
  );
}

/**
 * The inner-page hero: a raised band with the text in columns 1-5, vertically centred on the
 * product media in columns 6-12 (802x451 at 16:9 at 1440), so the next heading shows inside the
 * first screen. Below 1024: H1, 16, lead, 24, primary, 16, link, 24, media. Nothing in it reveals.
 * The columns carry no data-col: the text is centred on the media by design, not balanced with it.
 * Film media is a 16:9 `role="img"` frame named by `alt`, with its pause control beside it (never
 * inside the img role) and the caption under the frame.
 */
export function PageHeroSplit({ id, headline, emphasis, lead, primary, secondary, media }: PageHeroSplitProps) {
  return (
    <Band id="hero" as="header" tone="raised" pad="hero" labelledBy={id}>
      <Container>
        <div className="grid gap-y-6 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-5 lg:self-center">
            <h1 id={id} className="text-h1">
              <Headline text={headline} emphasis={emphasis} />
            </h1>
            <p className="mt-4 text-lead text-muted lg:mt-6">{lead}</p>
            <div className="mt-6 flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6 lg:mt-8">
              <Button href={primary.href} size="lg">
                {primary.label}
              </Button>
              {secondary ? (
                <Button href={secondary.href} variant="tertiary" arrow>
                  {secondary.label}
                </Button>
              ) : null}
            </div>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            {media.kind === "film" ? (
              <HeroFilm media={media} />
            ) : (
              <Picture id={media.id} alt={media.alt} position={media.position} aspect="16/9" sizes={mediaSizes} priority />
            )}
          </div>
        </div>
      </Container>
    </Band>
  );
}
