"use client";

import { hero } from "@/content/home";
import { FilmLayer, FilmPause, useFilm } from "@/components/ui/FilmMedia";
import { Headline } from "@/components/ui/SectionHead";

// A veil over the whole film, the header scrim, and a deeper scrim behind the centred head.
const scrims = (
  <>
    <div className="absolute inset-0 bg-ink/30" />
    <div className="absolute inset-x-0 top-0 h-[220px] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0px,rgba(0,0,0,0.5)_56px,rgba(0,0,0,0.26)_140px,rgba(0,0,0,0)_220px)]" />
    <div className="absolute inset-x-0 bottom-0 h-[70%] bg-[linear-gradient(to_top,rgba(18,17,16,0.85)_0%,rgba(18,17,16,0.45)_50%,transparent_100%)]" />
  </>
);

/**
 * The home hero: the film full screen, the centred headline low in the frame with its italic turn,
 * then the support line. Nothing else sits on the film: its pause control stays out of sight until a
 * keyboard reaches it (WCAG 2.2.2), then shows bottom right. Under reduced motion or Save-Data the
 * poster stands alone.
 */
export function Hero() {
  const film = useFilm({ videoId: hero.videoId, threshold: 0.1 });
  return (
    <section aria-labelledby="hero-heading" data-band="hero" data-tone="film" className="on-dark on-film relative isolate flex min-h-[100svh] flex-col justify-end text-white md:h-[45rem] md:min-h-0">
      <FilmLayer film={film} videoId={hero.videoId} posterId={hero.posterId} priority fadeIn overlays={scrims} />
      <div className="page-x mx-auto flex w-full max-w-grid flex-col items-center pb-20 pt-[calc(var(--nav-h)+9rem)] text-center md:pb-16">
        <h1 id="hero-heading" className="max-w-none text-balance text-[2.0625rem] leading-[1.2] tracking-[-0.06em] md:text-[2.5rem]">
          <Headline text={hero.headline} emphasis={hero.emphasis} />
        </h1>
        <p className="mt-5 max-w-[34rem] text-balance text-body text-white/90 md:max-w-[46rem] md:text-lead">{hero.support}</p>
      </div>
      <div className="page-x pointer-events-none absolute inset-x-0 bottom-6 flex justify-end opacity-0 focus-within:pointer-events-auto focus-within:opacity-100">
        <FilmPause film={film} name="hero film" />
      </div>
    </section>
  );
}
