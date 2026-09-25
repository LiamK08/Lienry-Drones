"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { softwareDefaultStep, softwareSteps, softwareStepsLabel, type StepId } from "@/content/software";
import { Band, Container } from "@/components/ui/Band";
import { FactList } from "@/components/ui/FactList";
import { SectionHead } from "@/components/ui/SectionHead";
import { SoftwareWindow, useSoftwareLive } from "@/components/software/SoftwareWindow";

export type SoftwareBandProps = {
  /** The band's id; the heading is `${id}-heading`. */
  id: string;
  tone: "sunken" | "raised";
  headline: string;
  body: string;
  /** Home: step tabs (Map, Plan, Clean, Re-scan) driving the window's presets. */
  steps?: boolean;
  /** /commercial: a three-column fact list under the window. */
  strip?: readonly { term: string; text: string }[];
};

/**
 * The four steps as a static list on hairline rows, for when the window is a recording (phones,
 * reduced motion, no WebGL) and for the server render, where the window is not live yet.
 */
function StepList() {
  return (
    <ol>
      {softwareSteps.map((step, i) => (
        <li key={step.id} className="border-t border-hairline py-3">
          <p className="label text-muted">{`${String(i + 1).padStart(2, "0")} · ${step.tab}`}</p>
          <p className="mt-1 text-small text-ink">{step.short}</p>
        </li>
      ))}
    </ol>
  );
}

/**
 * The step tabs (WAI-ARIA tabs: roving tabindex, arrow keys, Home and End, automatic activation)
 * over one tabpanel labelled by the active tab. The panel's one-cell grid holds all four captions,
 * the inactive ones invisible and aria-hidden, so it keeps the tallest step's height and the tab
 * row never moves under the pointer; the captions crossfade in 200ms.
 */
function StepTabs({ id, active, onSelect }: { id: string; active: StepId; onSelect: (step: StepId) => void }) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelId = `${id}-step`;
  const tabId = (step: StepId) => `${id}-tab-${step}`;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = softwareSteps.length;
    const next = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    onSelect(softwareSteps[next].id);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={softwareStepsLabel} className="flex gap-8 border-b border-hairline">
        {softwareSteps.map((step, i) => {
          const on = step.id === active;
          return (
            <button
              key={step.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={tabId(step.id)}
              aria-selected={on}
              aria-controls={panelId}
              tabIndex={on ? 0 : -1}
              onClick={() => onSelect(step.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`relative min-h-11 py-2 text-body transition-colors duration-200 ease-instrument ${
                on ? "text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-current" : "text-muted hover:text-ink"
              }`}
            >
              {step.tab}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={panelId} aria-labelledby={tabId(active)} tabIndex={0} className="mt-3 grid">
        {softwareSteps.map((step) => {
          const on = step.id === active;
          return (
            <div
              key={step.id}
              aria-hidden={on ? undefined : true}
              className={`col-start-1 row-start-1 transition-[opacity,visibility] duration-200 ease-instrument ${on ? "visible opacity-100" : "invisible opacity-0"}`}
            >
              <p className="text-body text-ink">{step.caption}</p>
              {step.hint ? <p className="mt-1 text-small text-muted">{step.hint}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The working software as a band: the section head, 48, the window at full grid width (which
 * renders its own notes row), then the optional strip 32 below.
 *
 * With `steps` the body sits under the heading and the aside holds the step tabs, which apply each
 * step's preset to the window (Clean first). When the window is a recording, and in the server
 * render, the aside holds the static list of the four steps instead. Without `steps` the body is
 * the aside's intro.
 */
export function SoftwareBand({ id, tone, headline, body, steps = false, strip }: SoftwareBandProps) {
  const live = useSoftwareLive();
  const [active, setActive] = useState<StepId>(softwareDefaultStep);

  return (
    <Band id={id} tone={tone} labelledBy={`${id}-heading`}>
      <Container>
        <SectionHead
          id={`${id}-heading`}
          headline={headline}
          below={steps ? <p className="text-body text-muted">{body}</p> : undefined}
          aside={steps ? { action: live ? <StepTabs id={id} active={active} onSelect={setActive} /> : <StepList /> } : { intro: body }}
        />
        <div className="mt-[var(--gap-head)]">
          <SoftwareWindow tone={tone} preset={steps ? active : undefined} />
        </div>
        {strip ? <FactList items={strip} columns={3} termStyle="strong" className="mt-8" /> : null}
      </Container>
    </Band>
  );
}
