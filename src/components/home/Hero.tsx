"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { hero } from "@/content/home";
import { getImage, getVideo, largest, srcSet } from "@/lib/media";
import { Button, ArrowRight } from "@/components/ui/Button";
import { settle } from "@/lib/motion";

function HeroMedia() {
  const video = getVideo(hero.videoId);
  const poster = getImage(hero.posterId);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const posterSrc = poster ? largest(hero.posterId, "webp") : video ? `/media/${hero.videoId}-poster.webp` : null;
  if (posterSrc) preload(posterSrc, { as: "image", fetchPriority: "high" });
  const saveData = typeof navigator !== "undefined" && (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-ink" aria-hidden="true">
      {posterSrc ? (
        <picture>
          {poster ? <source type="image/avif" srcSet={srcSet(hero.posterId, "avif")} sizes="100vw" /> : null}
          <img src={posterSrc} srcSet={poster ? srcSet(hero.posterId, "webp") : undefined} sizes="100vw" alt="" className="h-full w-full object-cover" fetchPriority="high" decoding="async" />
        </picture>
      ) : (
        <div className="h-full w-full bg-[radial-gradient(120%_90%_at_80%_10%,#a9b7bb_0%,#5f6b6d_35%,#2a2724_70%,#1c1a17_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.06)_35%,transparent_36%,transparent_60%,rgba(255,255,255,0.05)_78%,transparent_79%)]" />
        </div>
      )}
      {video && !reduce && !saveData ? (
        <video
          ref={ref}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ${ready ? "opacity-100" : "opacity-0"}`}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          poster={`/media/${hero.videoId}-poster.jpg`}
          onCanPlay={() => setReady(true)}
        >
          <source src={`/media/${hero.videoId}.webm`} type="video/webm" />
          <source src={`/media/${hero.videoId}.mp4`} type="video/mp4" />
        </video>
      ) : null}
      <div className="grain absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-[linear-gradient(to_top,rgba(28,26,23,0.92)_0%,rgba(28,26,23,0.55)_45%,transparent_100%)]" />
    </div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const words = hero.headline.split(" ");
  return (
    <section className="on-dark relative isolate flex min-h-[100svh] flex-col justify-end text-plaster" aria-labelledby="hero-heading">
      <HeroMedia />
      <div className="page-x mx-auto w-full max-w-grid pb-14 pt-[calc(var(--nav-h)+3rem)] md:pb-20">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8 lg:col-span-7">
            <motion.p
              className="eyebrow"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {hero.eyebrow}
            </motion.p>
            <h1 id="hero-heading" className="mt-5 text-display">
              {words.map((w, i) => (
                <motion.span
                  key={`${w}-${i}`}
                  className="inline-block will-change-transform"
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: settle, delay: 0.35 + i * 0.07 }}
                >
                  {w}
                  {i < words.length - 1 ? " " : ""}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className="mt-6 max-w-[46ch] text-lead text-plaster/85"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: settle, delay: 0.75 }}
            >
              {hero.support}
            </motion.p>
            <motion.div
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: settle, delay: 0.9 }}
            >
              <Button href={hero.primary.href} size="lg" onDark>
                {hero.primary.label}
              </Button>
              <a href={hero.secondary.href} className="inline-flex items-center gap-2 text-[0.9375rem] font-medium text-plaster/85 hover:text-plaster">
                {hero.secondary.label} <ArrowRight />
              </a>
            </motion.div>
          </div>
        </div>
        <div className="mt-12 flex items-end justify-between text-caption text-plaster/60">
          <span className="readout uppercase tracking-[0.08em]">Concept render</span>
          <span className="readout uppercase tracking-[0.08em]">Scroll</span>
        </div>
      </div>
    </section>
  );
}
