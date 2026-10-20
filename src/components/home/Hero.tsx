"use client";

import { hero } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { FilmLayer, FilmPause, useFilm } from "@/components/ui/FilmMedia";
import { Headline } from "@/components/ui/SectionHead";

// A veil over the whole film, the header scrim, and a deeper scrim behind the centred head.
const scrims = (
  <>
    <div className="absolute inset-0 bg-ink/30" />
    <div className="absolute inset-x-0 top-0 h-[220px] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0px,rgba(0,0,0,0.5)_72px,rgba(0,0,0,0.26)_140px,rgba(0,0,0,0)_220px)]" />
    <div className="absolute inset-x-0 bottom-0 h-[70%] bg-[linear-gradient(to_top,rgba(18,17,16,0.85)_0%,rgba(18,17,16,0.45)_50%,transparent_100%)]" />
  </>
);

/**
 * The home hero: the film full screen, the centred headline low in the frame with its italic turn,
 * the support line, then two pills (the white one to the fit check, the accent one to how it works).
 * The film's pause control sits bottom right. Under reduced motion or Save-Data the poster stands alone.
 */
export function Hero() {
  const film = useFilm({ videoId: hero.videoId, threshold: 0.1 });
  return (
    <section aria-labelledby="hero-heading" data-band="hero" data-tone="film" className="on-dark on-film relative isolate flex min-h-[88svh] flex-col justify-end text-white md:min-h-[100svh]">
      <FilmLayer film={film} videoId={hero.videoId} posterId={hero.posterId} priority fadeIn overlays={scrims} />
      <div className="page-x mx-auto flex w-full max-w-grid flex-col items-center pb-20 pt-[calc(var(--nav-h)+8rem)] text-center md:pb-24">
        <h1 id="hero-heading" className="max-w-none text-balance text-[2.75rem] leading-[1.05] md:text-[3.5rem] lg:text-[4rem]">
          <Headline text={hero.headline} emphasis={hero.emphasis} />
        </h1>
        <p className="mt-5 max-w-[34rem] text-balance text-body text-white/90 md:text-lead">{hero.support}</p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button href={hero.secondary.href} variant="secondary" arrow>
            {hero.secondary.label}
          </Button>
          <Button href={hero.primary.href} arrow>
            {hero.primary.label}
          </Button>
        </div>
      </div>
      <div className="page-x absolute inset-x-0 bottom-6 flex justify-end">
        <FilmPause film={film} name="hero film" />
      </div>
    </section>
  );
}
