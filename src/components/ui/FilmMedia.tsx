"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { useMediaQuery } from "@/lib/hooks";
import { getImage, getVideo, largest, srcSet } from "@/lib/media";
import type { FilmId, PosterId } from "@/lib/types";
import { bindPlayback } from "@/lib/video";

export type Film = {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** The asset is present, motion is allowed and Save-Data is off. */
  showVideo: boolean;
  paused: boolean;
  toggle: () => void;
  /** The video can play (drives the hero's fade-in). */
  ready: boolean;
  onCanPlay: () => void;
};

const noop = () => () => {};
const saveDataOn = () => (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/**
 * Playback state for one looping film. It plays only while on screen (`threshold` of it visible)
 * and never alongside another film (lib/video's bindPlayback). Under reduced motion or Save-Data
 * there is no video at all, only the poster, and so no pause control. The server renders the
 * video; a reduced-motion or Save-Data client drops it right after hydration.
 */
export function useFilm({ videoId, threshold }: { videoId: FilmId; threshold: number }): Film {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const saveData = useSyncExternalStore(noop, saveDataOn, () => false);
  const showVideo = getVideo(videoId) !== null && !reduce && !saveData;
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const toggle = useCallback(() => setPaused((p) => !p), []);
  const onCanPlay = useCallback(() => setReady(true), []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !showVideo || paused) {
      el?.pause();
      return;
    }
    // A video that could already play before hydration attached onCanPlay would otherwise stay
    // at opacity 0 behind a fadeIn.
    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) queueMicrotask(onCanPlay);
    return bindPlayback(el, threshold);
  }, [showVideo, paused, threshold, onCanPlay]);

  return { videoRef, showVideo, paused, toggle, ready, onCanPlay };
}

export type FilmLayerProps = {
  film: Film;
  videoId: FilmId;
  posterId: PosterId;
  /** object-position for the poster and the video. Default "50% 50%". */
  position?: string;
  /** The poster loads eagerly at high priority (first-screen films). */
  priority?: boolean;
  /** The hero's 1,200ms opacity fade-in once the video can play. */
  fadeIn?: boolean;
  /** The poster's `sizes`. Default "100vw" (full-bleed films). */
  sizes?: string;
  /** Scrims, drawn above the media. Each is its own absolutely positioned element. */
  overlays?: ReactNode;
};

/**
 * The media of a film frame: the poster always, the looping video over it when `film.showVideo`,
 * then the overlays. Decorative (aria-hidden, alt=""): the frame around it carries the name.
 *
 * It fills its frame (absolute inset-0) at z-index -10, so the frame must be a stacking context
 * (`isolate`, as the hero and the film band are); everything after it in the frame paints above.
 */
export function FilmLayer({ film, videoId, posterId, position = "50% 50%", priority = false, fadeIn = false, sizes = "100vw", overlays }: FilmLayerProps) {
  const { videoRef, showVideo, ready, onCanPlay } = film;
  const poster = getImage(posterId);
  const video = getVideo(videoId);
  const posterSrc = poster ? largest(posterId, "webp") : video ? `/media/${videoId}-poster.webp` : null;
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-ink" aria-hidden="true">
      {posterSrc ? (
        <picture>
          {poster ? <source type="image/avif" srcSet={srcSet(posterId, "avif")} sizes={sizes} /> : null}
          <img
            src={posterSrc}
            srcSet={poster ? srcSet(posterId, "webp") : undefined}
            sizes={sizes}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: position }}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
          />
        </picture>
      ) : (
        <div className="absolute inset-0 bg-ink-raised" />
      )}
      {showVideo ? (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover ${fadeIn ? `transition-opacity duration-[1200ms] ${ready ? "opacity-100" : "opacity-0"}` : ""}`}
          style={{ objectPosition: position }}
          muted
          loop
          playsInline
          preload="metadata"
          poster={`/media/${videoId}-poster.jpg`}
          onCanPlay={onCanPlay}
        >
          <source src={`/media/${videoId}.webm`} type="video/webm" />
          <source src={`/media/${videoId}.mp4`} type="video/mp4" />
        </video>
      ) : null}
      {overlays}
    </div>
  );
}

export type FilmPauseProps = {
  film: Film;
  /** Completes the label: "Pause {name}" / "Play {name}", e.g. "hero film". */
  name: string;
  /** Placement, e.g. "absolute bottom-3 right-3". */
  className?: string;
};

/** The 44px pause and play control of a film. It renders only while the video does. */
export function FilmPause({ film, name, className = "" }: FilmPauseProps) {
  if (!film.showVideo) return null;
  return (
    <button
      type="button"
      onClick={film.toggle}
      aria-label={`${film.paused ? "Play" : "Pause"} ${name}`}
      className={`flex h-11 w-11 items-center justify-center rounded-hard border border-white/75 bg-ink text-white hover:bg-ink-raised ${className}`}
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true" fill="currentColor">
        {film.paused ? <path d="M4 2l9 6-9 6z" /> : <path d="M4 2h3v12H4zM10 2h3v12h-3z" />}
      </svg>
    </button>
  );
}
