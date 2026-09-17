"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { landlordStory } from "@/content/home";
import { useMediaQuery } from "@/lib/hooks";
import { Picture } from "@/components/ui/Picture";
import { Eyebrow } from "@/components/ui/Section";
import { instrument } from "@/lib/motion";

const beats = landlordStory.beats;

function AppScreen({ state }: { state: string }) {
  const rows = [
    { name: "Solar panels", checked: state !== "map", pct: state === "progress" ? 64 : state === "done" ? 100 : 0 },
    { name: "Driveway", checked: state !== "map", pct: state === "progress" ? 31 : state === "done" ? 100 : 0 },
    { name: "Windows", checked: false, pct: 0 },
    { name: "Walls", checked: false, pct: 0 },
    { name: "Roofing", checked: false, pct: 0 },
  ];
  return (
    <div className="flex h-full flex-col bg-plaster text-ink">
      <div className="flex items-center justify-between px-5 pt-5">
        <span className="font-display text-[1.125rem]">Lienry</span>
        <span className="readout text-[0.625rem] uppercase tracking-[0.08em] text-muted">Rental, Sydney</span>
      </div>
      <div className="mx-5 mt-4 rounded-card bg-sunken p-3">
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className={`h-4 rounded-[2px] ${[2, 3, 8, 9].includes(i) ? (state === "done" ? "bg-glass-tint" : state === "map" ? "bg-hairline" : "bg-glass/70") : [13, 14, 15, 16].includes(i) ? (state === "done" ? "bg-glass-tint" : state === "map" ? "bg-hairline" : "bg-debris/60") : "bg-hairline"}`} />
          ))}
        </div>
        <p className="mt-2 readout text-[0.625rem] uppercase tracking-[0.08em] text-muted">Property map</p>
      </div>
      <ul className="mt-4 flex-1 space-y-1 px-5">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center gap-3 rounded-card bg-raised px-3 py-2.5">
            <span className={`flex h-4 w-4 items-center justify-center rounded-[3px] border ${r.checked ? "border-glass bg-glass" : "border-border-strong"}`} aria-hidden="true">
              {r.checked ? <svg viewBox="0 0 12 12" className="h-3 w-3 text-plaster" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2.5 6.5 5 9l4.5-5.5" /></svg> : null}
            </span>
            <span className="text-[0.8125rem] font-medium">{r.name}</span>
            {r.pct > 0 ? (
              <span className="ml-auto flex items-center gap-2">
                <span className="h-1 w-14 overflow-hidden rounded-full bg-hairline"><span className="block h-full rounded-full bg-water transition-[width] duration-700" style={{ width: `${r.pct}%` }} /></span>
                <span className="readout text-[0.625rem] text-muted">{r.pct}%</span>
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="p-5">
        <div className={`flex h-11 items-center justify-center rounded-button text-[0.875rem] font-medium ${state === "done" ? "bg-water text-plaster" : state === "progress" ? "bg-sunken text-muted" : "bg-glass text-plaster"}`}>
          {state === "map" ? "Choose surfaces" : state === "select" ? "Start clean" : state === "start" ? "Starting…" : state === "progress" ? "Cleaning in progress" : "Clean complete"}
        </div>
      </div>
    </div>
  );
}

function Phone({ state }: { state: string }) {
  return (
    <div className="relative mx-auto w-[15.5rem] rounded-device border border-border-strong/60 bg-ink p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] md:w-[17rem]" aria-hidden="true">
      <div className="h-[31rem] overflow-hidden rounded-[18px] md:h-[34rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={state} className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28, ease: instrument }}>
            <AppScreen state={state} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function LandlordStory() {
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const pinned = desktop && !reduce;
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!pinned) return;
    const i = Math.min(beats.length - 1, Math.max(0, Math.floor(v * beats.length)));
    setActive((p) => (p === i ? p : i));
  });

  if (!pinned) {
    return (
      <section id="story" aria-labelledby="story-heading" className="page-x section-y bg-plaster">
        <div className="mx-auto max-w-grid">
          <Eyebrow className="mb-4">{landlordStory.eyebrow}</Eyebrow>
          <h2 id="story-heading" className="max-w-statement text-h2">{landlordStory.headline}</h2>
          <p className="mt-4 max-w-prose text-lead text-muted">{landlordStory.intro}</p>
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:items-start">
            <div className="md:sticky md:top-24">
              <Phone state="select" />
            </div>
            <ol className="space-y-8">
              {beats.map((b, i) => (
                <li key={b.title} className="grid gap-4">
                  <div className="flex gap-4">
                    <span className="readout mt-1 text-[0.75rem] text-glass">0{i + 1}</span>
                    <div>
                      <h3 className="font-sans text-h4 font-medium">{b.title}</h3>
                      <p className="mt-2 text-small text-muted">{b.body}</p>
                    </div>
                  </div>
                  {i % 2 === 1 ? <Picture id={b.imageId} alt={b.title} aspect="4/3" sizes="(min-width: 768px) 50vw, 100vw" /> : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    );
  }

  const beat = beats[active];
  return (
    <section id="story" aria-labelledby="story-heading" className="bg-plaster">
      <div ref={ref} className="relative" style={{ height: `calc(100svh + ${beats.length} * 72svh)` }}>
        <div className="page-x sticky top-0 mx-auto flex h-[100svh] max-w-grid items-center overflow-hidden pb-6 pt-[calc(var(--nav-h)+1rem)]">
          <div className="grid w-full grid-cols-12 items-center gap-8">
            <div className="col-span-4">
              <Eyebrow className="mb-4">{landlordStory.eyebrow}</Eyebrow>
              <h2 id="story-heading" className="text-h2">{landlordStory.headline}</h2>
              <p className="mt-4 text-body text-muted">{landlordStory.intro}</p>
              <ol className="mt-8 space-y-4 border-l border-hairline pl-5">
                {beats.map((b, i) => (
                  <li key={b.title} className={`transition-colors duration-300 ${i === active ? "text-ink" : "text-muted"}`} aria-current={i === active ? "step" : undefined}>
                    <h3 className="font-sans text-[1.0625rem] font-medium">{b.title}</h3>
                    {i === active ? <p className="mt-1 text-small text-muted">{b.body}</p> : null}
                  </li>
                ))}
              </ol>
            </div>
            <div className="col-span-3">
              <Phone state={beat.app} />
            </div>
            <div className="col-span-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={beat.imageId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: instrument }}>
                  <Picture id={beat.imageId} alt={beat.title} aspect="4/5" sizes="40vw" className="max-h-[72svh] w-full" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
