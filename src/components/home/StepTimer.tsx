"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { how } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";
import { useOnScreen } from "@/lib/hooks";

const STEP_MS = 5000;

/**
 * How it works: five tabs over one large picture. Each tab carries a 3px rule that fills while its step
 * is shown; after five seconds the next step takes over, looping, while the band is on screen. Picking a
 * tab shows it and restarts the timer from there. Under reduced motion nothing advances on its own.
 * The picture crossfades, with the step's title and line on a scrim at its foot.
 */
export function StepTimer() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
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
          <div role="tablist" aria-label={how.label} className="no-scrollbar -mx-(--page-margin) flex gap-5 overflow-x-auto px-(--page-margin) md:mx-0 md:grid md:grid-cols-5 md:px-0">
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
                  className="group/tab min-w-40 shrink-0 text-left"
                >
                  <span aria-hidden="true" className="relative block h-[3px] overflow-hidden rounded-pill bg-line">
                    <span
                      key={`${s.id}-${on ? cycle : "off"}-${on ? active : ""}`}
                      className={`absolute inset-y-0 left-0 rounded-pill bg-accent ${on ? (running ? "animate-[fill_5s_linear_forwards]" : "w-full") : "w-0"}`}
                    />
                  </span>
                  <span className="mt-3 block text-label uppercase tracking-[0.08em] text-muted">
                    {s.n} · {s.who}
                  </span>
                  <span className={`mt-1 block text-small transition-[background-color,border-color,color] duration-200 ${on ? "text-ink" : "text-muted group-hover/tab:text-ink"}`}>{s.tab}</span>
                </button>
              );
            })}
          </div>
          <div id="how-panel" role="tabpanel" aria-labelledby={`how-tab-${how.steps[active].id}`} className="relative mt-8 aspect-[4/3] overflow-hidden rounded-card bg-media md:aspect-[1200/483]">
            {how.steps.map((s, i) => (
              <div key={s.id} aria-hidden={i !== active} className={`absolute inset-0 transition-opacity duration-700 ease-instrument motion-reduce:transition-none ${i === active ? "opacity-100" : "opacity-0"}`}>
                <Picture id={s.image.id} alt={i === active ? s.image.alt : ""} position={s.image.position} fit="fill" rounded="none" sizes="(min-width: 1248px) 1200px, 100vw" className="absolute inset-0" />
              </div>
            ))}
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,17,16,0.75)_0%,transparent_55%)]" />
            <div className="absolute inset-x-6 bottom-6 text-white md:inset-x-8 md:bottom-8">
              <p className="font-display text-[1.75rem] leading-tight">{how.steps[active].title}</p>
              <p className="mt-1 text-small text-white/85">{how.steps[active].body}</p>
            </div>
          </div>
        </div>
      </Container>
    </Band>
  );
}
