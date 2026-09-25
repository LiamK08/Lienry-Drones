"use client";

// F2a STUB. The props are final; F2c builds the full band (the step tabs driving the window's
// presets in live mode, docs/REDESIGN-SPEC.md B6) behind them without changing them. The stub lays
// the band out as it renders on the server and on phones: the static step list above the window.

import { Band, Container } from "@/components/ui/Band";
import { FactList } from "@/components/ui/FactList";
import { SectionHead } from "@/components/ui/SectionHead";
import { SoftwareWindow } from "@/components/software/SoftwareWindow";

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

// Stub copy only: F2c reads `softwareSteps` from src/content/software.ts instead.
const STUB_STEPS = [
  { id: "map", tab: "Map", short: "The drone maps the building, and the model is built from the scan." },
  { id: "plan", tab: "Plan", short: "Each zone gets its own surface, preset and pressure." },
  { id: "clean", tab: "Clean", short: "The clean moves down the facade, two passes per floor." },
  { id: "rescan", tab: "Re-scan", short: "The re-scan shades built-up debris where the next clean is needed." },
] as const;

function StepList() {
  return (
    <ol>
      {STUB_STEPS.map((step, i) => (
        <li key={step.id} className="border-t border-hairline py-3">
          <p className="label text-muted">{`0${i + 1} · ${step.tab}`}</p>
          <p className="mt-1 text-small text-ink">{step.short}</p>
        </li>
      ))}
    </ol>
  );
}

/**
 * The working software as a band: the section head, 48, the window at full grid width (which
 * renders its own notes row), then the optional strip 32 below. With `steps` the body sits under
 * the heading and the steps take the aside; without, the body is the aside's intro.
 */
export function SoftwareBand({ id, tone, headline, body, steps = false, strip }: SoftwareBandProps) {
  return (
    <Band id={id} tone={tone} labelledBy={`${id}-heading`}>
      <Container>
        <SectionHead
          id={`${id}-heading`}
          headline={headline}
          below={steps ? <p className="text-body text-muted">{body}</p> : undefined}
          aside={steps ? { action: <StepList /> } : { intro: body }}
        />
        <div className="mt-[var(--gap-head)]">
          <SoftwareWindow tone={tone} preset={steps ? "clean" : undefined} />
        </div>
        {strip ? <FactList items={strip} columns={3} termStyle="strong" className="mt-8" /> : null}
      </Container>
    </Band>
  );
}
