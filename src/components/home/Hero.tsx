"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { hero } from "@/content/home";
import { getImage, getVideo, largest, srcSet } from "@/lib/media";
import { bindPlayback } from "@/lib/video";
import { Button } from "@/components/ui/Button";

function HeroMedia() {
  const video = getVideo(hero.videoId);
  const poster = getImage(hero.posterId);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || paused) { el?.pause(); return; }
    return bindPlayback(el, 0.1);
  }, [reduce, paused]);

  const posterSrc = poster ? largest(hero.posterId, "webp") : video ? `/media/${hero.videoId}-poster.webp` : null;
  const saveData = typeof navigator !== "undefined" && (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

  return (
    <>
    <div className="absolute inset-0 -z-10 overflow-hidden bg-ink" aria-hidden="true">
      {posterSrc ? (
        <picture>
          {poster ? <source type="image/avif" srcSet={srcSet(hero.posterId, "avif")} sizes="100vw" /> : null}
          <img src={posterSrc} srcSet={poster ? srcSet(hero.posterId, "webp") : undefined} sizes="100vw" alt="" className="h-full w-full object-cover" fetchPriority="high" decoding="async" />
        </picture>
      ) : (
        <div className="h-full w-full bg-ink-raised" />
      )}
      {video && !reduce && !saveData ? (
        <video
          ref={ref}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ${ready ? "opacity-100" : "opacity-0"}`}
          muted
          loop
          playsInline
          preload="metadata"
          poster={`/media/${hero.videoId}-poster.jpg`}
          onCanPlay={() => setReady(true)}
        >
          <source src={`/media/${hero.videoId}.webm`} type="video/webm" />
          <source src={`/media/${hero.videoId}.mp4`} type="video/mp4" />
        </video>
      ) : null}
      {/* A quarter-strength ink veil over the whole film keeps every frame below the text. */}
      <div className="absolute inset-0 bg-ink/25" />
      {/* Header scrim: 50% black held through the 72px bar, gone by 220px. Measured against the brightest
          frame of the hero film (see docs/DESIGN-RESEARCH.md), white links stay above 4.5:1 and the
          button's hairline and the mark above 3:1 on every pixel behind them. */}
      <div className="absolute inset-x-0 top-0 h-[220px] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0px,rgba(0,0,0,0.5)_72px,rgba(0,0,0,0.26)_140px,rgba(0,0,0,0)_220px)]" />
      {/* Headline scrim. */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-[linear-gradient(to_top,rgba(28,26,23,0.92)_0%,rgba(28,26,23,0.55)_45%,transparent_100%)]" />
    </div>
    {video && !reduce && !saveData ? (
      <button type="button" onClick={() => setPaused(p => !p)} aria-label={paused ? "Play hero film" : "Pause hero film"} className="absolute right-[var(--page-margin)] bottom-6 z-10 flex h-11 w-11 items-center justify-center rounded-hard border border-white/75 bg-ink text-white">
        <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true" fill="currentColor">{paused ? <path d="M4 2l9 6-9 6z" /> : <path d="M4 2h3v12H4zM10 2h3v12h-3z" />}</svg>
      </button>
    ) : null}
    </>
  );
}

/** Film first, then a concise proposition and a single primary action. */
export function Hero() {
  return (
    <section className="on-dark relative isolate flex min-h-[100svh] flex-col justify-end text-white" aria-labelledby="hero-heading">
      <HeroMedia />
      <div className="page-x mx-auto flex w-full max-w-grid flex-col items-center pb-24 pt-[calc(var(--nav-h)+8rem)] text-center md:pb-28">
        <h1 id="hero-heading" className="max-w-[18ch] text-display md:max-w-none">{hero.headline}</h1>
        <div className="mt-7 flex flex-col items-center gap-6 md:flex-row md:gap-8">
          <p className="max-w-[32ch] text-body text-white md:max-w-[48ch]">{hero.support}</p>
          <Button href={hero.primary.href} onDark arrow>{hero.primary.label}</Button>
        </div>
      </div>
      <div className="page-x absolute inset-x-0 bottom-6 flex items-center justify-between text-caption text-white">
        <span>Concept render</span>
        <a href={hero.secondary.href} className="flex min-h-11 items-center gap-3 hover:underline underline-offset-4 mr-14">Explore the system <span aria-hidden="true">↓</span></a>
      </div>
    </section>
  );
}
