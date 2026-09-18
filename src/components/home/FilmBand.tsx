"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { getImage, getVideo, largest, srcSet } from "@/lib/media";
import { Button, ArrowRight } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Full-bleed film band: a muted looping clip with a poster, one line of copy and one link.
 * Falls back to the still, then to a quiet gradient, when the clip is not available.
 */
export function FilmBand({
  videoId,
  stillId,
  eyebrow,
  headline,
  body,
  cta,
}: {
  videoId: string;
  stillId: string;
  eyebrow: string;
  headline: string;
  body: string;
  cta: { label: string; href: string };
}) {
  const video = getVideo(videoId);
  const still = getImage(stillId);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const posterSrc = still ? largest(stillId, "webp") : video ? `/media/${videoId}-poster.webp` : null;

  return (
    <section className="on-dark relative isolate min-h-[70svh] overflow-hidden bg-ink text-plaster md:min-h-[85svh]" aria-labelledby="film-heading">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {posterSrc ? (
          <picture>
            {still ? <source type="image/avif" srcSet={srcSet(stillId, "avif")} sizes="100vw" /> : null}
            <img src={posterSrc} srcSet={still ? srcSet(stillId, "webp") : undefined} sizes="100vw" alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
          </picture>
        ) : (
          <div className="h-full w-full bg-[radial-gradient(110%_80%_at_20%_100%,#5f6b6d_0%,#2a2724_55%,#1c1a17_100%)]" />
        )}
        {video && !reduce ? (
          <video ref={ref} className="absolute inset-0 h-full w-full object-cover" muted loop playsInline preload="none" poster={`/media/${videoId}-poster.jpg`}>
            <source src={`/media/${videoId}.webm`} type="video/webm" />
            <source src={`/media/${videoId}.mp4`} type="video/mp4" />
          </video>
        ) : null}
        <div className="grain absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(28,26,23,0.82)_0%,rgba(28,26,23,0.45)_45%,rgba(28,26,23,0.15)_100%)]" />
      </div>
      <div className="page-x mx-auto flex min-h-[70svh] w-full max-w-grid flex-col justify-end pb-14 pt-24 md:min-h-[85svh] md:pb-20">
        <Reveal className="max-w-[34rem]">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="film-heading" className="mt-4 text-h1">
            {headline}
          </h2>
          <p className="mt-5 text-lead text-plaster/85">{body}</p>
          <div className="mt-8">
            <Button href={cta.href} onDark size="lg">
              {cta.label} <ArrowRight />
            </Button>
          </div>
        </Reveal>
        <div className="mt-10 flex justify-between text-caption text-plaster/60">
          <span className="readout uppercase tracking-[0.08em]">Concept render</span>
        </div>
      </div>
    </section>
  );
}
