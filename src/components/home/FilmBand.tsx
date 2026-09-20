"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { getImage, getVideo, largest, srcSet } from "@/lib/media";
import { bindPlayback } from "@/lib/video";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Full-bleed film band: a muted looping clip with a poster, one line of copy and one link.
 * The clip plays only while on screen and never alongside another clip. Falls back to the
 * still, then to flat ink, when the clip is not available.
 */
export function FilmBand({
  videoId,
  stillId,
  headline,
  body,
  cta,
}: {
  videoId: string;
  stillId: string;
  /** Kept for the callers; nothing is rendered above the headline. */
  eyebrow?: string;
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
    return bindPlayback(el, 0.2);
  }, [reduce]);

  const posterSrc = still
    ? largest(stillId, "webp")
    : video
      ? `/media/${videoId}-poster.webp`
      : null;

  return (
    <section
      className="on-dark relative isolate min-h-[70svh] overflow-hidden bg-ink text-plaster md:min-h-[85svh]"
      aria-labelledby="film-heading"
    >
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {posterSrc ? (
          <picture>
            {still ? (
              <source
                type="image/avif"
                srcSet={srcSet(stillId, "avif")}
                sizes="100vw"
              />
            ) : null}
            <img
              src={posterSrc}
              srcSet={still ? srcSet(stillId, "webp") : undefined}
              sizes="100vw"
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </picture>
        ) : (
          <div className="h-full w-full bg-ink-raised" />
        )}
        {video && !reduce ? (
          <video
            ref={ref}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            poster={`/media/${videoId}-poster.jpg`}
          >
            <source src={`/media/${videoId}.webm`} type="video/webm" />
            <source src={`/media/${videoId}.mp4`} type="video/mp4" />
          </video>
        ) : null}
        {/* Copy scrim, strongest on the left where the text sits. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(28,26,23,0.86)_0%,rgba(28,26,23,0.55)_45%,rgba(28,26,23,0.25)_100%)]" />
      </div>
      <div className="page-x flex min-h-[70svh] flex-col justify-end pb-14 pt-24 md:min-h-[85svh] md:pb-20">
        <div className="mx-auto w-full max-w-grid">
          <Reveal className="max-w-[34rem]">
            <h2 id="film-heading" className="text-h1">
              {headline}
            </h2>
            <p className="mt-5 text-lead text-plaster">{body}</p>
            <div className="mt-8">
              <Button href={cta.href} onDark size="lg">
                {cta.label}
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
