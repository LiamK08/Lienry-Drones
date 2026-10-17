"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { afterLoadIdle, usePrefersReducedMotion, useSaveData } from "@/lib/hooks";
import { getImage, getVideo, largest, srcSet } from "@/lib/media";
import type { FilmId, PosterId } from "@/lib/types";
import { bindPlayback, refresh } from "@/lib/video";
import { IconButton } from "@/components/ui/IconButton";
import { positionCls, positionVars, stillSources, type FrameAspects } from "@/components/ui/Picture";

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

/**
 * Playback state for one looping film. It plays only while on screen (`threshold` of it visible)
 * and never alongside another video (lib/video). Under reduced motion or Save-Data there is no
 * video at all, only the poster, and so no pause control. The server renders the video; a
 * reduced-motion or Save-Data client drops it right after hydration. A film the visitor paused is
 * unbound, so it never takes the slot back.
 */
export function useFilm({ videoId, threshold }: { videoId: FilmId; threshold: number }): Film {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reduce = usePrefersReducedMotion();
  const saveData = useSaveData();
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
  /** object-position of the poster and the video from 1024 (and below when no smaller one is set). Default: the poster's focus, then "50% 50%". */
  position?: string;
  positionMd?: string;
  positionSm?: string;
  /** The poster's art-directed crop below 768 (manifest `variants`); ignored while the index has none. */
  variant?: string;
  /** The frame's width / height at each breakpoint, for the poster's cover factor (coverSizes). Unset: full-bleed. */
  frame?: FrameAspects;
  /** The poster is the page's LCP image: eager, fetchpriority high. */
  priority?: boolean;
  /** The hero's 1,200ms opacity fade-in once the video can play. */
  fadeIn?: boolean;
  /** The poster's `sizes`. Default "100vw" (full-bleed films). */
  sizes?: string;
  /** Scrims, drawn above the media. Each is its own absolutely positioned element. */
  overlays?: ReactNode;
  /** Attach the film's sources only after the load event and an idle moment, so the film never
   *  competes with the first screen. Default: `priority`. */
  deferSources?: boolean;
  /** The video's preload once its sources are attached. Default "metadata". */
  preload?: "metadata" | "none";
};

/**
 * The media of a film frame: the poster as a responsive `<picture>`, the looping video over it when
 * `film.showVideo`, then the overlays. Decorative (aria-hidden, alt=""): the frame around it carries
 * the name. The `<video>` has no poster attribute: the picture under it is the poster, at the width
 * the screen needs.
 *
 * With `deferSources` the server renders `<video preload="none">` with no `<source>`; after the load
 * event and an idle callback the sources are attached and loaded, and the film plays if it holds the
 * one-video slot.
 *
 * It fills its frame (absolute inset-0) at z-index -10, so the frame must be a stacking context
 * (`isolate`); everything after it in the frame paints above.
 */
export function FilmLayer({
  film,
  videoId,
  posterId,
  position,
  positionMd,
  positionSm,
  variant,
  frame,
  priority = false,
  fadeIn = false,
  sizes = "100vw",
  overlays,
  deferSources,
  preload = "metadata",
}: FilmLayerProps) {
  const { videoRef, showVideo, ready, onCanPlay } = film;
  const defer = deferSources ?? priority;
  const [sourced, setSourced] = useState(!defer);
  const poster = getImage(posterId);
  const video = getVideo(videoId);

  useEffect(() => {
    if (sourced || !showVideo) return;
    return afterLoadIdle(() => setSourced(true));
  }, [sourced, showVideo]);

  // Sources attached late: load them, and play if this film already holds the slot.
  useEffect(() => {
    const el = videoRef.current;
    if (!defer || !sourced || !el) return;
    el.preload = preload;
    el.load();
    refresh(el);
  }, [defer, sourced, preload, videoRef]);

  const style = positionVars(posterId, position, positionMd, positionSm) as CSSProperties;
  const still = poster ? stillSources(posterId, sizes, frame ?? null, variant) : null;
  const fallbackSrc = video ? `/media/${videoId}-poster.webp` : null;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-ink" aria-hidden="true" style={style}>
      {poster && still ? (
        <picture>
          {still.sources}
          <img
            src={largest(posterId, "webp") ?? ""}
            srcSet={srcSet(posterId, "webp")}
            sizes={still.imgSizes}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover ${positionCls}`}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            fetchPriority={priority ? "high" : "auto"}
          />
        </picture>
      ) : fallbackSrc ? (
        <img src={fallbackSrc} alt="" className={`absolute inset-0 h-full w-full object-cover ${positionCls}`} loading={priority ? "eager" : "lazy"} decoding="async" />
      ) : (
        <div className="absolute inset-0 bg-ink-raised" />
      )}
      {showVideo ? (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover ${positionCls} ${fadeIn ? `transition-opacity duration-[1200ms] ${ready ? "opacity-100" : "opacity-0"}` : ""}`}
          muted
          loop
          playsInline
          preload={sourced ? preload : "none"}
          onCanPlay={onCanPlay}
        >
          {sourced ? (
            <>
              <source src={`/media/${videoId}.webm`} type="video/webm" />
              <source src={`/media/${videoId}.mp4`} type="video/mp4" />
            </>
          ) : null}
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
  /** Placement. */
  className?: string;
};

/**
 * The film's 44px pause and play control: a filled IconButton. It renders only while the video
 * does, and it must sit inside an `on-dark on-film` ancestor, where it is an ink fill with a
 * white/75 edge that turns white with an ink glyph on hover.
 */
export function FilmPause({ film, name, className = "" }: FilmPauseProps) {
  if (!film.showVideo) return null;
  return (
    <IconButton filled label={`${film.paused ? "Play" : "Pause"} ${name}`} onClick={film.toggle} className={className}>
      <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="currentColor">
        {film.paused ? <path d="M4 2l9 6-9 6z" /> : <path d="M4 2h3v12H4zM10 2h3v12h-3z" />}
      </svg>
    </IconButton>
  );
}
