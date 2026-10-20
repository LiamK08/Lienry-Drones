"use client";

import { useState } from "react";
import { landlordStory } from "@/content/homes";
import { AppPanel, type AppState } from "@/components/app/AppPanel";
import { Picture } from "@/components/ui/Picture";

const STATES: readonly AppState[] = ["map", "select", "start", "progress", "done"];

function toState(app: string): AppState {
  const state = STATES.find((s) => s === app);
  if (!state) throw new Error(`LandlordStory: "${app}" is not an app panel state.`);
  return state;
}

// One beat per app panel state, in order: a beat's `app` is the state the panel shows with it.
const beats = landlordStory.beats.map((beat) => ({ ...beat, state: toState(beat.app), alt: landlordStory.alts[beat.imageId] ?? beat.title }));

// Each picture once (two beats share the first), stacked in the one cell.
const pictures = [...new Map(beats.map((b) => [b.imageId, b.alt])).entries()];

/**
 * The app row's media on /homes-and-rentals (the beat titles are the row's check list beside it).
 *
 * From 768 a 5:4 frame of two rounded cells, 8 apart: the illustrative phone app in control mode,
 * centred on the pale tint, and the picture of the beat it is on. Below 768 the tinted cell alone.
 * The active beat is the one piece of state: the panel's own button advances it (its status line
 * announces each change), "Start again" returns to the first, and the picture follows with a 500ms
 * cross-fade (none under reduced motion). The pictures are stacked, so each is loaded before its beat.
 */
export function LandlordAppFrame() {
  const [active, setActive] = useState(0);
  const beat = beats[active];
  const advance = () => setActive((i) => (i + 1) % beats.length);

  return (
    <div className="grid gap-2 md:aspect-[5/4] md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="flex items-center justify-center rounded-[0.75rem] bg-tint p-6 md:p-4 lg:rounded-[0.5rem] xl:p-8">
        <div className="w-full max-w-[20rem]">
          <AppPanel mode="control" state={beat.state} onAdvance={advance} />
        </div>
      </div>
      <div className="relative hidden md:block">
        {pictures.map(([id, alt]) => {
          const on = id === beat.imageId;
          return (
            <div key={id} aria-hidden={!on || undefined} className={`absolute inset-0 transition-opacity duration-500 ease-settle motion-reduce:transition-none ${on ? "opacity-100" : "opacity-0"}`}>
              <Picture id={id} alt={alt} fit="fill" frameAspect={270 / 515} rounded="image" sizes="(min-width: 1440px) 270px, (min-width: 1024px) 19vw, 40vw" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
