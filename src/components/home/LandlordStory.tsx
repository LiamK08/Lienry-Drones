"use client";

import { useState } from "react";
import { landlordStory } from "@/content/homes";
import { AppPanel, useCleanDemo, type CleanDemo } from "@/components/app/AppPanel";
import { Picture } from "@/components/ui/Picture";

type Shot = keyof typeof landlordStory.pictures;

// Each picture once, stacked in the one cell, so every one has loaded before the demo needs it.
const shots = Object.entries(landlordStory.pictures) as [Shot, (typeof landlordStory.pictures)[Shot]][];

/** What the picture shows: before a clean, the area being washed, then after. */
function shotOf(demo: CleanDemo): Shot {
  if (demo.phase === "choose") return "before";
  if (demo.phase === "done") return "after";
  return demo.chosen[demo.active] ?? "after";
}

function Chip({ shot, text, live }: { shot: Shot; text: string; live: boolean }) {
  return (
    <span aria-hidden="true" className="absolute left-3 top-3 flex items-center gap-1.5 rounded-hard bg-white px-2 py-1 text-caption font-medium text-ink">
      {shot === "after" ? (
        <svg viewBox="0 0 16 16" className="size-3.5 text-accent" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
        </svg>
      ) : shot === "before" ? null : (
        <span className={`size-1.5 rounded-pill bg-accent ${live ? "animate-pulse motion-reduce:animate-none" : ""}`} />
      )}
      {text}
    </span>
  );
}

/**
 * The app row's media on /homes-and-rentals (the story's steps are the row's check list beside it).
 *
 * An interactive demo: the visitor chooses the areas in the illustrative app and starts the clean,
 * and the picture beside it follows what they pressed: the house before the clean, each chosen area
 * while the drone washes it (driveway, solar panels, windows), then the house after. A small chip on
 * the picture says what it shows. The pictures are stacked in one cell, so each is loaded before it is
 * needed; the new one fades in over the last for 500ms (none under reduced motion), and only the one
 * on show is exposed to assistive tech (the panel's live region tells the story).
 *
 * From 768 a 5:4 frame of two rounded cells, 8 apart: the app centred on the pale tint, and the
 * picture, the wider of the two (4 : 5, the app's cell at least 296px from 1024). Below 768 the picture
 * sits under the app at 5:4, so a phone shows the button and the picture together.
 */
export function LandlordAppFrame() {
  const demo = useCleanDemo();
  const shot = shotOf(demo);
  // The picture under the incoming one stays opaque until the next change, so the fade never shows
  // the empty cell through two half-faded pictures.
  const [shown, setShown] = useState(shot);
  const [under, setUnder] = useState<Shot | null>(null);
  if (shot !== shown) {
    setUnder(shown);
    setShown(shot);
  }

  return (
    <div className="grid gap-2 md:aspect-[5/4] md:grid-cols-[minmax(0,4fr)_minmax(0,5fr)] lg:grid-cols-[minmax(18.5rem,4fr)_minmax(0,5fr)]">
      <div className="flex items-center justify-center rounded-[0.75rem] bg-tint p-4 lg:rounded-[0.5rem] lg:p-3 xl:p-4">
        <div className="w-full max-w-[20rem]">
          <AppPanel demo={demo} />
        </div>
      </div>
      <div className="relative aspect-[5/4] md:aspect-auto">
        {shots.map(([key, pic]) => {
          const on = key === shown;
          const below = key === under;
          return (
            <div
              key={key}
              aria-hidden={!on || undefined}
              className={`absolute inset-0 transition-opacity duration-500 ease-settle motion-reduce:transition-none ${on ? "z-10 opacity-100" : below ? "opacity-100" : "opacity-0"}`}
            >
              <Picture
                id={pic.id}
                alt={pic.alt}
                fit="fill"
                frameAspect={0.66}
                rounded="image"
                sizes="(min-width: 1440px) 413px, (min-width: 1280px) 30vw, (min-width: 1024px) 34vw, (min-width: 768px) 52vw, calc(100vw - 2.5rem)"
              />
              <Chip shot={key} text={pic.chip} live={on} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
