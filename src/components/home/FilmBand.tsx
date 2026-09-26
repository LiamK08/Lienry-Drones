"use client";

import type { Action, FilmId, PosterId } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { FilmLayer, FilmPause, useFilm } from "@/components/ui/FilmMedia";
import { Reveal } from "@/components/ui/Reveal";

export type FilmBandProps = {
  videoId: FilmId;
  /** The film's poster. */
  stillId: PosterId;
  /** Kept for the callers; nothing is rendered above the headline. */
  eyebrow?: string;
  headline: string;
  body: string;
  cta: Action;
};

// The copy scrim, unchanged: 86% ink at the left edge where the text sits, easing to 25% on the right.
const scrim = (
  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(28,26,23,0.86)_0%,rgba(28,26,23,0.55)_45%,rgba(28,26,23,0.25)_100%)]" />
);

/**
 * Full-bleed film band: a muted looping clip over its poster, with the heading, a short body and one
 * link at the bottom left inside 544px, and a rail 16px from the bottom carrying the Concept render
 * caption and the film's pause control. The clip plays only while on screen and never alongside
 * another film (useFilm); under reduced motion or Save-Data only the poster shows, with no control.
 */
export function FilmBand({ videoId, stillId, headline, body, cta }: FilmBandProps) {
  const film = useFilm({ videoId, threshold: 0.2 });
  return (
    <section
      aria-labelledby="film-heading"
      data-band="film"
      data-tone="film"
      className="on-dark relative isolate flex min-h-[70svh] flex-col justify-end overflow-hidden bg-ink text-plaster md:min-h-[85svh]"
    >
      <FilmLayer film={film} videoId={videoId} posterId={stillId} overlays={scrim} />
      {/* 80px at the foot at every width, so the copy clears the rail (16px up, 44px tall) with 20 to spare. */}
      <div className="page-x pb-20 pt-24">
        <div className="mx-auto w-full max-w-grid">
          <Reveal className="max-w-[34rem]">
            <h2 id="film-heading" className="text-h2">
              {headline}
            </h2>
            <p className="mt-5 text-body text-plaster">{body}</p>
            <div className="mt-8">
              <Button href={cta.href} variant="tertiary" onDark arrow>
                {cta.label}
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
      <div className="page-x absolute inset-x-0 bottom-4 flex items-center justify-between gap-4 text-caption text-white">
        <span>Concept render</span>
        <FilmPause film={film} name="product film" />
      </div>
    </section>
  );
}
