"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { how } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";
import { useOnScreen } from "@/lib/hooks";
import { StagePanel, type StagePanelId } from "@/components/home/DemoPanels";

const STEP_MS = 6000;

/**
 * How it works: five tabs over one large picture. Each tab carries a 3px rule that fills while its step
 * is shown, and each finished step's rule stays full until the clean starts again, so the row reads as
 * one progress bar; after six seconds the next step takes over, looping, while the band is on screen.
 * On phones the five tabs share one row, one word each. Picking a
 * tab shows it and restarts the timer from there. Under reduced motion nothing advances on its own.
 * The picture crossfades, with the step's title and line on a scrim at its foot. Beside it (from 1024
 * on the night stage the picture fades into on its right, below it on smaller screens) the step's coded
 * panel plays through in demo data, as the reference plays a short screen recording there: one demo
 * building followed through the five steps on the software's facade map.
 */
export function StepTimer() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  // The step fading out, so its panel keeps its map through the crossfade.
  const [previous, setPrevious] = useState<number | null>(null);
  const [shownStep, setShownStep] = useState(active);
  if (shownStep !== active) {
    setPrevious(shownStep);
    setShownStep(active);
  }
  const reduce = useReducedMotion();
  const [ref, inView] = useOnScreen<HTMLDivElement>();
  const running = inView && !reduce;

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => setActive((i) => (i + 1) % how.steps.length), STEP_MS);
    return () => window.clearTimeout(t);
  }, [running, active, cycle]);

  const pick = (i: number) => {
    setActive(i);
    setCycle((c) => c + 1);
  };

  return (
    <Band id="how" tone="plaster" labelledBy="how-heading">
      <Container>
        <SectionHead id="how-heading" layout="center" eyebrow={how.eyebrow} headline={how.headline} emphasis={how.emphasis} intro={how.intro} />
        <div ref={ref} className="mx-auto mt-(--head-gap) max-w-[75rem]">
          <div role="tablist" aria-label={how.label} className="grid grid-cols-5 gap-1 md:gap-5">
            {how.steps.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  id={`how-tab-${s.id}`}
                  aria-selected={on}
                  aria-controls="how-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => pick(i)}
                  onKeyDown={(e) => {
                    const last = how.steps.length - 1;
                    const next = e.key === "ArrowRight" ? (i + 1) % how.steps.length : e.key === "ArrowLeft" ? (i + last) % how.steps.length : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
                    if (next < 0) return;
                    e.preventDefault();
                    pick(next);
                    document.getElementById(`how-tab-${how.steps[next].id}`)?.focus();
                  }}
                  className="group/tab min-w-0 text-left"
                >
                  <span aria-hidden="true" className="relative block h-[3px] overflow-hidden rounded-pill bg-line">
                    <span
                      key={i < active ? `${s.id}-done` : `${s.id}-${on ? cycle : "off"}-${on ? active : ""}`}
                      className={`absolute inset-y-0 left-0 rounded-pill bg-accent ${i < active ? "w-full" : on ? (running ? "animate-[fill_6s_linear_forwards]" : "w-full") : "w-0"}`}
                    />
                  </span>
                  {/* On phones the five tabs share one row: one word each, the full label kept for screen readers. */}
                  <span className={`mt-2.5 block truncate text-label uppercase tracking-[0.06em] md:hidden ${on ? "text-ink" : "text-muted"}`}>{s.short}</span>
                  <span className="sr-only md:not-sr-only md:mt-4 md:block md:text-label md:uppercase md:tracking-[0.08em] md:text-muted">
                    {s.n} · {s.who}
                  </span>
                  <span className={`sr-only md:not-sr-only md:mt-1.5 md:block md:text-body md:transition-[background-color,border-color,color] md:duration-200 ${on ? "md:text-ink" : "md:text-muted md:group-hover/tab:text-ink"}`}>{s.tab}</span>
                </button>
              );
            })}
          </div>
          <div id="how-panel" role="tabpanel" aria-labelledby={`how-tab-${how.steps[active].id}`} className="relative mt-6 overflow-hidden rounded-card bg-night md:mt-12 lg:h-[30.1875rem]">
            {/* From 1024 the picture fades out to the night stage on its right, where the step's panel stands. */}
            <div className="relative aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto lg:[-webkit-mask-image:linear-gradient(90deg,#000_57%,transparent_94%)] lg:[mask-image:linear-gradient(90deg,#000_57%,transparent_94%)]">
              {how.steps.map((s, i) => (
                <div key={s.id} aria-hidden={i !== active} className={`absolute inset-0 transition-opacity duration-700 ease-instrument motion-reduce:transition-none ${i === active ? "opacity-100" : "opacity-0"}`}>
                  <Picture id={s.image.id} alt={i === active ? s.image.alt : ""} position={s.image.position} fit="fill" rounded="none" sizes="(min-width: 1248px) 1200px, 100vw" className="absolute inset-0" />
                </div>
              ))}
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,17,16,0.75)_0%,transparent_55%)]" />
              <div className="absolute inset-x-6 bottom-6 text-white md:inset-x-8 md:bottom-8 lg:right-auto lg:max-w-[28rem]">
                <p className="font-display text-[1.5rem] leading-tight">{how.steps[active].title}</p>
                <p className="mt-1 text-small text-white/85">{how.steps[active].body}</p>
              </div>
            </div>
            {/* Each step's coded panel (demo data), playing while its step is shown on screen. */}
            <div aria-hidden="true" className="grid grid-cols-[minmax(0,1fr)] justify-items-center p-5 md:p-8 lg:absolute lg:right-[9.5%] lg:top-1/2 lg:w-[21.25rem] lg:-translate-y-1/2 lg:p-0">
              {how.steps.map((s, i) => (
                <div key={s.id} className={`flex w-full max-w-[21.25rem] justify-center transition-opacity duration-500 ease-instrument [grid-area:1/1] motion-reduce:transition-none ${i === active ? "opacity-100" : "opacity-0"}`}>
                  <StagePanel id={s.id as StagePanelId} active={i === active && inView} map={i === active || i === previous} />
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 max-w-none text-caption text-muted">{how.note}</p>
        </div>
      </Container>
    </Band>
  );
}
