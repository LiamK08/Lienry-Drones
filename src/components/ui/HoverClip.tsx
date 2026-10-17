"use client";

import { useEffect, useRef, useState } from "react";
import { useHoverCapable, usePrefersReducedMotion, useSaveData } from "@/lib/hooks";
import { getVideo } from "@/lib/media";
import type { ClipRef } from "@/lib/types";
import { bindHover, type HoverMode } from "@/lib/video";

/** WCAG 2.2.2: a clip started by keyboard focus never runs past 5 s. */
const FOCUS_CAP_S = 5;

export type HoverClipProps = {
  clip: ClipRef;
  /** object-position, matching the still under it. Default "50% 50%". */
  position?: string;
};

/**
 * A film over a still, played while its card is hovered (looping) or focused (once, up to 5 s), and
 * paused on leave. It renders only for a fine pointer that can hover, with motion allowed and
 * Save-Data off, so the server render, touch screens, reduced motion and Save-Data get the still
 * alone. The sources load on the first hover or focus (preload none), and one video decodes at a
 * time site-wide (lib/video).
 *
 * Put it in a Picture's `overlay`, inside an ancestor marked `data-hover-target` (the card) and
 * `data-hover-clip`. It is absolutely positioned over the still, so the card never changes height.
 */
export function HoverClip({ clip, position = "50% 50%" }: HoverClipProps) {
  const hover = useHoverCapable();
  const reduce = usePrefersReducedMotion();
  const saveData = useSaveData();
  const enabled = hover && !reduce && !saveData && getVideo(clip.videoId) !== null;
  const ref = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const target = el?.closest<HTMLElement>("[data-hover-target]");
    if (!enabled || !el || !target) return;
    const start = clip.start ?? 0;
    const end = typeof clip.end === "number" ? clip.end : undefined;
    if (process.env.NODE_ENV !== "production" && end !== undefined && end <= start) throw new Error(`HoverClip ${clip.videoId}: end must be after start`);
    let armed = false;
    let mode: HoverMode = null;
    let reset = 0;
    let rvfc = 0;
    const arm = () => {
      if (armed) return;
      armed = true;
      const ext = el.canPlayType('video/webm; codecs="vp9"') ? "webm" : "mp4";
      el.src = `/media/${clip.videoId}${clip.rendition ? `--${clip.rendition}` : ""}.${ext}`;
      if (start > 0) el.addEventListener("loadedmetadata", () => (el.currentTime = start), { once: true });
      el.load();
    };
    // Hover loops the segment; focus plays it once and stops at the cap.
    const stopAt = () => (mode === "focus" ? Math.min(start + FOCUS_CAP_S, end ?? Infinity) : end);
    const check = (t: number) => {
      const stop = stopAt();
      if (stop === undefined || t < stop - 0.04) return;
      if (mode === "focus") el.pause();
      else el.currentTime = start;
    };
    const tick = (_: number, m: VideoFrameCallbackMetadata) => {
      check(m.mediaTime);
      rvfc = el.requestVideoFrameCallback(tick);
    };
    const onTimeUpdate = () => check(el.currentTime);
    // Firefox before 132 has no requestVideoFrameCallback: timeupdate is coarser but enough.
    const frames = typeof el.requestVideoFrameCallback === "function";
    if (frames) rvfc = el.requestVideoFrameCallback(tick);
    else el.addEventListener("timeupdate", onTimeUpdate);
    const onMode = (m: HoverMode) => {
      mode = m;
      el.loop = m === "hover" && end === undefined;
    };
    const onPlaying = () => {
      clearTimeout(reset);
      setOn(true);
    };
    // Fade out, then rewind under the still, so the next hover starts from the first frame.
    const onPause = () => {
      setOn(false);
      reset = window.setTimeout(() => (el.currentTime = start), 220);
    };
    el.addEventListener("playing", onPlaying);
    el.addEventListener("pause", onPause);
    const unbind = bindHover(target, el, arm, onMode);
    return () => {
      unbind();
      clearTimeout(reset);
      if (rvfc && frames) el.cancelVideoFrameCallback(rvfc);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("pause", onPause);
    };
  }, [enabled, clip.videoId, clip.start, clip.end, clip.rendition]);

  if (!enabled) return null;
  return (
    <video
      ref={ref}
      aria-hidden="true"
      tabIndex={-1}
      muted
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-instrument motion-reduce:transition-none ${on ? "opacity-100" : "opacity-0"}`}
      style={{ objectPosition: position }}
    />
  );
}
