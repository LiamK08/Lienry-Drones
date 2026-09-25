"use client";

import { hero } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { FilmLayer, FilmPause, useFilm } from "@/components/ui/FilmMedia";
import { Headline } from "@/components/ui/SectionHead";

// The hero's three scrims, unchanged since PR 9. scripts/contrast-hero.mjs models the veil and the
// header scrim to prove the bar stays legible, so any edit here needs a fresh `npm run contrast`.
const scrims = (
  <>
    {/* A quarter-strength ink veil over the whole film keeps every frame below the text. */}
    <div className="absolute inset-0 bg-ink/25" />
    {/* Header scrim: 50% black held through the 72px bar, gone by 220px. Measured against the brightest
        frame of the hero film (see docs/DESIGN-RESEARCH.md), white links stay above 4.5:1 and the
        button's hairline and the mark above 3:1 on every pixel behind them. */}
    <div className="absolute inset-x-0 top-0 h-[220px] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0px,rgba(0,0,0,0.5)_72px,rgba(0,0,0,0.26)_140px,rgba(0,0,0,0)_220px)]" />
    {/* Headline scrim. */}
    <div className="absolute inset-x-0 bottom-0 h-[70%] bg-[linear-gradient(to_top,rgba(28,26,23,0.92)_0%,rgba(28,26,23,0.55)_45%,transparent_100%)]" />
  </>
);

/**
 * The home hero: the film full screen, one short centred line low in the frame with its italic turn,
 * then the support line and the one primary action on a single row. The bottom rail carries the
 * Concept render caption at the left margin, the link down to the system, and the film's pause
 * control at the right margin (only while the film plays; under reduced motion or Save-Data the
 * poster stands alone). Nothing here reveals on scroll: it is the first screen.
 */
export function Hero() {
  const film = useFilm({ videoId: hero.videoId, threshold: 0.1 });
  return (
    <section
      aria-labelledby="hero-heading"
      data-band="hero"
      data-tone="film"
      className="on-dark relative isolate flex min-h-[100svh] flex-col justify-end text-white"
    >
      <FilmLayer film={film} videoId={hero.videoId} posterId={hero.posterId} priority fadeIn overlays={scrims} />
      <div className="page-x mx-auto flex w-full max-w-grid flex-col items-center pb-24 pt-[calc(var(--nav-h)+8rem)] text-center md:pb-28">
        <h1 id="hero-heading" className="text-h1">
          <Headline text={hero.headline} emphasis={hero.emphasis} />
        </h1>
        <div className="mt-7 flex flex-col items-center gap-6 md:flex-row md:gap-8">
          <p className="max-w-[32ch] text-balance text-body text-white md:max-w-[48ch]">{hero.support}</p>
          <Button href={hero.primary.href} onDark arrow>
            {hero.primary.label}
          </Button>
        </div>
      </div>
      <div className="page-x absolute inset-x-0 bottom-6 flex items-center justify-between gap-4 text-caption text-white">
        <span>Concept render</span>
        <div className="flex items-center gap-3">
          <a href={hero.secondary.href} className="flex min-h-11 items-center gap-2 underline-offset-4 hover:underline focus-visible:underline">
            {hero.secondary.label}
            <span aria-hidden="true">↓</span>
          </a>
          <FilmPause film={film} name="hero film" />
        </div>
      </div>
    </section>
  );
}
