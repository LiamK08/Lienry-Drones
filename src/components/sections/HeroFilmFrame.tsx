"use client";

import type { FilmId, PosterId } from "@/lib/types";
import { FilmLayer, FilmPause, useFilm } from "@/components/ui/FilmMedia";

export type HeroFilmMedia = {
  kind: "film";
  videoId: FilmId;
  posterId: PosterId;
  /** The frame's name (role="img"). */
  alt: string;
  /** Completes the pause control's label, e.g. "commercial film". */
  name: string;
  position: string;
  positionMd?: string;
  positionSm?: string;
  variant?: string;
};

/** The PageHero frame's widths: the grid at 1440, the page less its margins below. */
export const HERO_SIZES = "(min-width: 1440px) 1392px, (min-width: 768px) calc(100vw - 48px), calc(100vw - 32px)";

/**
 * PageHero's film frame: a `role="img"` frame named by `alt` (4:3 below 768, 16:9 to 1023, 21:9 from
 * 1024) holding the poster and the looping film, with the pause control beside it (never inside the
 * img role), bottom right, on `on-dark on-film`. The film plays while 20% of it is visible, one video
 * at a time, and its sources are deferred until the page has loaded (the poster is the LCP image).
 * Reduced motion and Save-Data show the poster only.
 */
export function HeroFilmFrame({ media }: { media: HeroFilmMedia }) {
  const film = useFilm({ videoId: media.videoId, threshold: 0.2 });
  return (
    <div className="relative">
      <div role="img" aria-label={media.alt} className="relative isolate aspect-[4/3] w-full overflow-hidden rounded-hard bg-media md:aspect-video lg:aspect-[21/9]">
        <FilmLayer
          film={film}
          videoId={media.videoId}
          posterId={media.posterId}
          position={media.position}
          positionMd={media.positionMd}
          positionSm={media.positionSm}
          variant={media.variant}
          frame={{ sm: 4 / 3, md: 16 / 9, lg: 21 / 9 }}
          priority
          sizes={HERO_SIZES}
        />
      </div>
      <div className="on-dark on-film absolute bottom-4 right-4">
        <FilmPause film={film} name={media.name} />
      </div>
    </div>
  );
}
