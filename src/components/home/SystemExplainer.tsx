"use client";

import { useState } from "react";
import { systemExplainer } from "@/content/home";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

const parts = systemExplainer.tabs;

/** Six real disclosure buttons: native scrolling, keyboard access, no forced scroll sequence. */
export function SystemExplainer() {
  const [active, setActive] = useState(0);
  return (
    <section id="system" aria-labelledby="system-heading" className="page-x section-y bg-plaster">
      <div className="mx-auto max-w-grid">
        <Reveal className="grid gap-6 md:grid-cols-2 md:gap-16 md:items-end">
          <h2 id="system-heading" className="max-w-[20ch] text-h2">{systemExplainer.headline}</h2>
          <p className="max-w-[44ch] text-body text-muted">{systemExplainer.intro}</p>
        </Reveal>
        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <div className="border-t border-hairline">
              {parts.map((part, i) => (
                <div key={part.id} className="border-b border-hairline">
                  <h3>
                    <button type="button" id={`part-${part.id}`} aria-expanded={active === i} aria-disabled={active === i} aria-controls={`part-panel-${part.id}`} onClick={() => setActive(i)} className="flex min-h-16 w-full items-center gap-5 py-4 text-left">
                      <span className="readout text-caption text-muted" aria-hidden="true">0{i + 1}</span>
                      <span className="flex-1 font-display text-h3">{part.tab}</span>
                      <span className="font-sans text-body text-muted" aria-hidden="true">{active === i ? "−" : "+"}</span>
                    </button>
                  </h3>
                  <div id={`part-panel-${part.id}`} role="region" aria-labelledby={`part-${part.id}`} hidden={active !== i} className="pb-6 pl-9">
                    <p className="max-w-[40ch] text-body text-muted">{part.body}</p>
                    <div className="mt-5 md:hidden"><Picture id={part.imageId} alt={part.title} aspect="4/3" sizes="90vw" /></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8"><Button href="/platform" variant="tertiary" arrow>Explore the platform</Button></div>
          </div>
          <div className="hidden md:col-span-7 md:block">
            <div className="sticky top-[calc(var(--nav-h)+2rem)]">
              <Picture id={parts[active].imageId} alt={parts[active].title} aspect="4/3" sizes="(min-width: 1440px) 720px, 58vw" />
              <p className="mt-5 text-small text-muted">{parts[active].readout}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
