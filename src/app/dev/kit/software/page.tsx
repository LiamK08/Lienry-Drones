"use client";

// /dev/kit/software: the real software window on every preset, the home band with its step tabs,
// the /commercial band with its strip, the window on a raised band, and the app panel in both
// modes (docs/REDESIGN-SPEC.md B6, F2c). Temporary: not indexed, excluded from the checks, and
// deleted in F9 with the rest of src/app/dev.
//
// The page is a client component because the app panel's control mode needs a parent's state, and
// the kit may not import the /dev/kit demos. A client page cannot export `metadata`, so it renders
// its robots meta itself; React hoists it into the head.

import { useState } from "react";
import { appPanel, productCards } from "@/content/home";
import { commercialPage } from "@/content/pages";
import { softwareSection, softwareSteps } from "@/content/software";
import { AppPanel, type AppState } from "@/components/app/AppPanel";
import { SoftwareBand } from "@/components/software/SoftwareBand";
import { SoftwareWindow } from "@/components/software/SoftwareWindow";
import { Band, Container } from "@/components/ui/Band";
import { FactList } from "@/components/ui/FactList";
import { MediaCard } from "@/components/ui/MediaCard";
import { SectionHead } from "@/components/ui/SectionHead";

const ORDER: AppState[] = ["map", "select", "start", "progress", "done"];

const phone = productCards.cards[2];
const fragment = "fragment" in phone ? phone.fragment : null;

export default function SoftwareKitPage() {
  const [beat, setBeat] = useState(0);

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />

      <Band id="kit-software" tone="plaster" pad="page" labelledBy="kit-software-heading">
        <Container>
          <SectionHead
            id="kit-software-heading"
            as="h1"
            size="h2"
            reveal={false}
            headline="The coded product, working."
            aside={{
              label: "Software kit",
              intro:
                "The software window on every preset, the home band with its step tabs, the commercial band with its strip, the window on a raised band, and the app panel in both modes. Phones, reduced motion and devices without WebGL get the window's recording mode.",
            }}
          />
        </Container>
      </Band>

      <SoftwareBand id="software" tone="sunken" headline={softwareSection.headline} body={softwareSection.body} steps />

      <Band id="kit-presets" tone="plaster" labelledBy="kit-presets-heading">
        <Container>
          <SectionHead
            id="kit-presets-heading"
            headline="Every preset."
            aside={{
              intro: "Each window starts on one step's preset: Map shows the scan, Plan the zones, Clean the wash and debris, Re-scan the debris. The camera starts on the overview, so none of them flies on its first paint.",
            }}
          />
          {softwareSteps.map((step, i) => (
            <div key={step.id} className={i === 0 ? "mt-[var(--gap-head)]" : "mt-12"}>
              <h3 className="text-h3">{step.tab}</h3>
              <p className="mt-2 text-small text-muted">{step.caption}</p>
              <div className="mt-4">
                <SoftwareWindow preset={step.id} />
              </div>
            </div>
          ))}
        </Container>
      </Band>

      <SoftwareBand
        id="commercial-software"
        tone="sunken"
        headline={commercialPage.software.headline}
        body={softwareSection.body}
        strip={commercialPage.software.tiles.map((t) => ({ term: t.title, text: t.body }))}
      />

      <Band id="kit-raised" tone="raised" labelledBy="kit-raised-heading">
        <Container>
          <SectionHead
            id="kit-raised-heading"
            headline="On a raised band."
            aside={{ intro: "The /platform close holds the window with tone raised, which draws its border as a hairline. It has no step tabs, so it opens on the clean." }}
          />
          <div className="mt-[var(--gap-head)]">
            <SoftwareWindow tone="raised" />
          </div>
        </Container>
      </Band>

      <Band id="kit-app" tone="plaster" labelledBy="kit-app-heading">
        <Container>
          <SectionHead
            id="kit-app-heading"
            headline="The app panel, both modes."
            aside={{ intro: "The fragment sits in the home product card's frame. The control panel advances the story's shared state, at the story's row height; its status line announces each state." }}
          />
          <div className="mt-[var(--gap-head)] grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-x-6">
            <div className="lg:col-span-4">
              {fragment ? (
                <MediaCard
                  media={{
                    kind: "fragment",
                    aspect: "4/3",
                    ariaLabel: fragment.ariaLabel,
                    note: fragment.note,
                    node: (
                      <div className="absolute -right-6 left-8 top-4 lg:top-6">
                        <AppPanel mode="fragment" />
                      </div>
                    ),
                  }}
                  meta={phone.meta}
                  title={phone.title}
                  body={phone.body}
                  link={phone.link}
                />
              ) : null}
            </div>
            <div className="lg:col-span-4 lg:h-[25.25rem]">
              <AppPanel mode="control" state={ORDER[beat]} onAdvance={() => setBeat((i) => (i + 1) % ORDER.length)} />
            </div>
            <div className="lg:col-span-4">
              <FactList items={ORDER.map((state) => ({ term: appPanel.buttons[state], text: appPanel.status[state] }))} />
            </div>
          </div>
        </Container>
      </Band>
    </>
  );
}
