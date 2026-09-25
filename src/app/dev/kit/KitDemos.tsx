"use client";

// Client-side demos for /dev/kit (temporary; deleted with the kit in F9).

import { useState } from "react";
import { AppPanel, type AppState } from "@/components/app/AppPanel";
import { FilmLayer, FilmPause, useFilm } from "@/components/ui/FilmMedia";

const ORDER: AppState[] = ["map", "select", "start", "progress", "done"];

/** AppPanel in control mode, advancing a local state the way the story's shared state will. */
export function KitAppPanel() {
  const [i, setI] = useState(0);
  return <AppPanel mode="control" state={ORDER[i]} onAdvance={() => setI((n) => (n + 1) % ORDER.length)} />;
}

/** A full-bleed film frame built from the film primitives, the way the home film band uses them. */
export function KitFilmBand() {
  const film = useFilm({ videoId: "h1-hero-film", threshold: 0.2 });
  return (
    <section data-band="kit-film" data-tone="film" aria-label="Film primitives" className="on-dark relative isolate flex min-h-[28rem] flex-col justify-end overflow-hidden bg-ink text-white">
      <FilmLayer
        film={film}
        videoId="h1-hero-film"
        posterId="h0-hero-still"
        fadeIn
        overlays={<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(28,26,23,0.86)_0%,rgba(28,26,23,0.55)_45%,rgba(28,26,23,0.25)_100%)]" />}
      />
      <div className="page-x flex items-center justify-between pb-4 text-caption text-white">
        <span>Concept render</span>
        <FilmPause film={film} name="demo film" />
      </div>
    </section>
  );
}
