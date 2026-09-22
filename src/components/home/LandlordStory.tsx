"use client";

import { useState } from "react";
import { landlordStory } from "@/content/home";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";

const beats = landlordStory.beats;

/** An illustrative interface, deliberately a flat app panel rather than a decorative phone. */
function AppPreview({ state }: { state: string }) {
  const selected = state !== "map";
  const complete = state === "done";
  const progressing = state === "progress";
  return (
    <div className="rounded-hard border border-hairline bg-raised p-5 md:p-6" aria-label="Illustrative mobile app, demo data">
      <div className="flex items-center justify-between gap-4 border-b border-hairline pb-5">
        <span className="text-small font-medium">Your property</span><span className="label text-muted">Demo data</span>
      </div>
      <p className="mt-5 font-display text-h3">Rental, Sydney</p>
      <p className="mt-1 text-caption text-muted">Choose the areas for this clean</p>
      <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
        {["Driveway", "Solar panels", "Windows"].map((name, i) => (
          <li key={name} className="flex items-center gap-3 py-4 text-small">
            <span aria-hidden="true" className={`flex h-4 w-4 items-center justify-center rounded-hard border ${selected && i < 2 ? "bg-ink border-ink text-white" : "border-border-strong"}`}>{selected && i < 2 ? "✓" : ""}</span>
            <span>{name}</span>
            {selected && i < 2 ? <span className="ml-auto text-caption text-muted">{complete ? "Complete" : progressing ? (i === 0 ? "31%" : "64%") : "Selected"}</span> : null}
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-hard bg-ink px-4 py-3 text-center text-small text-white">{complete ? "Clean complete" : progressing ? "Cleaning in progress" : state === "start" ? "Starting clean…" : selected ? "Start clean" : "Choose surfaces"}</div>
      <p className="mt-4 text-caption text-muted">Illustrative app interface.</p>
    </div>
  );
}

export function LandlordStory() {
  const [active, setActive] = useState(0);
  const beat = beats[active];
  return (
    <section id="story" aria-labelledby="story-heading" className="page-x section-y bg-plaster">
      <div className="mx-auto max-w-grid">
        <Reveal className="grid gap-6 md:grid-cols-2 md:gap-16 md:items-end">
          <h2 id="story-heading" className="max-w-[18ch] text-h2">{landlordStory.headline}</h2>
          <p className="text-body text-muted">{landlordStory.intro}</p>
        </Reveal>
        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <ol className="border-t border-hairline lg:col-span-4">
            {beats.map((b, i) => (
              <li key={b.app} className="border-b border-hairline">
                <h3><button type="button" id={`story-${b.app}`} onClick={() => setActive(i)} aria-expanded={i === active} aria-disabled={i === active} aria-controls={`story-panel-${b.app}`} className="flex min-h-16 w-full items-start gap-4 py-5 text-left">
                  <span className="readout pt-1 text-caption text-muted" aria-hidden="true">0{i + 1}</span>
                  <span className="font-display text-h3">{b.title}</span>
                </button></h3>
                <div hidden={active !== i} id={`story-panel-${b.app}`} role="region" aria-labelledby={`story-${b.app}`} className="pb-6 pl-8">
                  <p className="text-small text-muted">{b.body}</p>
                  <div className="mt-5 lg:hidden"><Picture id={b.imageId} alt={b.title} aspect="4/3" sizes="90vw" /></div>
                </div>
              </li>
            ))}
          </ol>
          <div className="lg:col-span-8">
            <div className="grid gap-6 lg:grid-cols-2 lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
              <AppPreview state={beat.app} />
              <div className="hidden lg:block"><Picture id={beat.imageId} alt={beat.title} aspect="3/4" sizes="30vw" /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
