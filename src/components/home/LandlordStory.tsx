"use client";

import { useState } from "react";
import { landlordStory } from "@/content/homes";
import { AppPanel, type AppState } from "@/components/app/AppPanel";
import { Band, Container } from "@/components/ui/Band";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";

const STATES: readonly AppState[] = ["map", "select", "start", "progress", "done"];

function toState(app: string): AppState {
  const state = STATES.find((s) => s === app);
  if (!state) throw new Error(`LandlordStory: "${app}" is not an app panel state.`);
  return state;
}

// One beat per app panel state, in order: a beat's `app` is the state the panel shows with it.
const beats = landlordStory.beats.map((beat) => ({ ...beat, state: toState(beat.app), alt: landlordStory.alts[beat.imageId] ?? beat.title }));

/**
 * The phone app, told as five beats of one clean, on ink (/homes-and-rentals, id `story`).
 *
 * One shared state, the active beat, drives the beat list (a button in each h3 with aria-expanded,
 * aria-controls and aria-disabled on the open one, and a labelled region under it), the app panel's
 * state and the image. A beat button opens its beat; the panel's own button advances to the next
 * beat, and "Start again" returns to the first. The panel's status line announces each change.
 *
 * From 1024 one row holds the beat list (columns 1-5), the panel (6-9) and the active beat's image
 * (10-12), stretched to one height. Below 1024 the image sits inside the open beat, then 32 and the
 * panel.
 */
export function LandlordStory() {
  const [active, setActive] = useState(0);
  const beat = beats[active];
  const advance = () => setActive((i) => (i + 1) % beats.length);

  return (
    <Band id="story" tone="ink" labelledBy="story-heading">
      <Container>
        <SectionHead id="story-heading" eyebrow={landlordStory.eyebrow} headline={landlordStory.headline} emphasis={landlordStory.emphasis} intro={landlordStory.intro} />

        <div className="mt-(--head-gap) grid gap-y-8 lg:grid-12 lg:gap-y-0">
          <div data-col className="lg:col-span-5">
            <ol className="border-t border-rule">
              {beats.map((b, i) => {
                const open = i === active;
                return (
                  <li key={b.app} className="border-b border-rule">
                    <h3 className="text-h3">
                      <button
                        type="button"
                        id={`story-${b.app}`}
                        aria-expanded={open}
                        aria-controls={`story-panel-${b.app}`}
                        aria-disabled={open}
                        onClick={() => setActive(i)}
                        className={`flex min-h-11 w-full items-baseline gap-4 py-4 text-left transition-colors duration-200 ease-instrument motion-reduce:transition-none ${
                          open ? "cursor-default text-fg" : "text-fg-muted hover:text-fg"
                        }`}
                      >
                        <span aria-hidden="true" className="readout w-6 shrink-0 text-caption text-fg-muted">
                          {`0${i + 1}`}
                        </span>
                        <span>{b.title}</span>
                      </button>
                    </h3>
                    <div id={`story-panel-${b.app}`} role="region" aria-labelledby={`story-${b.app}`} hidden={!open} className="pb-6 pl-10">
                      {/* The body shares one cell with invisible copies of every beat's body, so the
                          open beat always takes the longest body's height and switching never moves
                          the rows under it. */}
                      <div className="grid">
                        <p className="col-start-1 row-start-1 text-body text-fg-muted">{b.body}</p>
                        {beats.map((c) => (
                          <p key={c.app} aria-hidden="true" className="invisible col-start-1 row-start-1 text-body">
                            {c.body}
                          </p>
                        ))}
                      </div>
                      <div className="mt-4 lg:hidden">
                        <Picture id={b.imageId} alt={b.alt} aspect="1/1" sizes="(min-width: 768px) 90vw, calc(100vw - 72px)" />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div data-col className="lg:col-span-4">
            <AppPanel mode="control" state={beat.state} onAdvance={advance} />
          </div>

          <div data-col className="hidden lg:col-span-3 lg:block">
            <Picture id={beat.imageId} alt={beat.alt} fit="fill" minHeight="18rem" sizes="(min-width: 1440px) 330px, 23vw" />
          </div>
        </div>
      </Container>
    </Band>
  );
}
