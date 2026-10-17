"use client";

// One decoding video at a time across films and hover clips. claim() pauses any other;
// release() hands the slot back to the most recent film still on screen.
let playing: HTMLVideoElement | null = null;
const onScreen: HTMLVideoElement[] = [];

function claim(el: HTMLVideoElement) {
  if (playing && playing !== el) playing.pause();
  playing = el;
  void el.play().catch(() => {});
}

function release(el: HTMLVideoElement) {
  el.pause();
  if (playing !== el) return;
  playing = null;
  const next = onScreen.at(-1);
  if (next && next !== el) claim(next);
}

/** Plays `el` again if it holds the slot (after its sources were attached late). */
export function refresh(el: HTMLVideoElement) {
  if (playing === el) void el.play().catch(() => {});
}

/**
 * A looping film that plays while `threshold` of it is on screen and yields to any other video.
 * A film the visitor paused is unbound (useFilm), so it never re-enters `onScreen`.
 */
export function bindPlayback(el: HTMLVideoElement, threshold = 0.15): () => void {
  const io = new IntersectionObserver(
    ([e]) => {
      const i = onScreen.indexOf(el);
      if (e.isIntersecting) {
        if (i < 0) onScreen.push(el);
        claim(el);
      } else {
        if (i >= 0) onScreen.splice(i, 1);
        release(el);
      }
    },
    { threshold },
  );
  io.observe(el);
  return () => {
    io.disconnect();
    const i = onScreen.indexOf(el);
    if (i >= 0) onScreen.splice(i, 1);
    release(el);
  };
}

export type HoverMode = "hover" | "focus" | null;

/** Hover or focus on `target` arms (first time) and plays `el`; leaving both releases it. */
export function bindHover(target: HTMLElement, el: HTMLVideoElement, arm: () => void, onMode?: (mode: HoverMode) => void): () => void {
  let hovered = false;
  let focused = false;
  const sync = () => {
    const mode: HoverMode = hovered ? "hover" : focused ? "focus" : null;
    onMode?.(mode);
    if (mode) {
      arm();
      claim(el);
    } else release(el);
  };
  const enter = () => {
    hovered = true;
    sync();
  };
  const leave = () => {
    hovered = false;
    sync();
  };
  const fin = () => {
    focused = true;
    sync();
  };
  const fout = (e: FocusEvent) => {
    if (!target.contains(e.relatedTarget as Node | null)) {
      focused = false;
      sync();
    }
  };
  target.addEventListener("pointerenter", enter);
  target.addEventListener("pointerleave", leave);
  target.addEventListener("focusin", fin);
  target.addEventListener("focusout", fout);
  return () => {
    target.removeEventListener("pointerenter", enter);
    target.removeEventListener("pointerleave", leave);
    target.removeEventListener("focusin", fin);
    target.removeEventListener("focusout", fout);
    release(el);
  };
}
