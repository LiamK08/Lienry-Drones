"use client";

// One decoding video at a time. Each looping clip plays only while on screen, and
// starting one pauses any other that is still playing.
let playing: HTMLVideoElement | null = null;

export function bindPlayback(el: HTMLVideoElement, threshold = 0.15): () => void {
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (playing && playing !== el) playing.pause();
        playing = el;
        el.play().catch(() => {});
      } else {
        el.pause();
        if (playing === el) playing = null;
      }
    },
    { threshold },
  );
  io.observe(el);
  return () => {
    io.disconnect();
    el.pause();
    if (playing === el) playing = null;
  };
}
