"use client";

import { useState, useSyncExternalStore } from "react";
import { flow, type FlowStepId } from "@/content/home";
import { isCapture } from "@/lib/clock";
import { Band, Container } from "@/components/ui/Band";
import { SectionHead } from "@/components/ui/SectionHead";
import { StepTabs } from "@/components/ui/StepTabs";
import { SoftwareWindow } from "@/components/software/SoftwareWindow";

const noop = () => () => {};

/**
 * How a clean works, on ink: the five numbered steps (01 Scan to 05 Report) as tabs over the coded
 * desktop window, which takes each step's preset (layers, camera and the wash). The window keeps its
 * own Demo data and illustrative-model notes. On phones and under reduced motion the window is its
 * recording and the step lines carry the story.
 */
export function Flow() {
  // Under the recorder (?capture=…) the flow opens on Clean, so the recording keeps the wash state it
  // always had; everyone else starts on Scan. The server render is Scan either way.
  const capture = useSyncExternalStore(noop, isCapture, () => false);
  const [chosen, setChosen] = useState<FlowStepId | null>(null);
  const step: FlowStepId = chosen ?? (capture ? "clean" : "scan");
  return (
    <Band id="software" tone="ink" labelledBy="software-heading">
      <Container>
        <SectionHead id="software-heading" eyebrow={flow.eyebrow} headline={flow.headline} intro={flow.intro} />
        <div className="mt-(--head-gap)">
          <StepTabs id="flow" label={flow.label} steps={flow.steps} value={step} onChange={setChosen}>
            <div className="mt-8">
              <SoftwareWindow preset={flow.presets[step]} />
            </div>
          </StepTabs>
        </div>
      </Container>
    </Band>
  );
}
