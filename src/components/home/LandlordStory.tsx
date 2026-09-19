"use client";

import { landlordStory } from "@/content/home";
import { useActiveStep } from "@/lib/hooks";
import { Picture } from "@/components/ui/Picture";
import { Rule } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const beats = landlordStory.beats;
const states = Array.from(new Set(beats.map((b) => b.app)));
const images = Array.from(new Set(beats.map((b) => b.imageId)));

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
        {/* Fixed at 18px: this is UI inside a fixed-width device frame, so it must not flow with the
            viewport the way the page's own type does. */}
        <span className="font-display text-[1.125rem] leading-none tracking-[-0.02em]">Lienry</span>
        <span className="label text-muted">Rental, Sydney</span>
      </div>
      <div className="mx-5 mt-4 rounded-hard border border-hairline bg-sunken p-3">
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className={`h-4 ${[2, 3, 8, 9].includes(i) ? (state === "done" ? "bg-glass/35" : state === "map" ? "bg-hairline" : "bg-glass/70") : [13, 14, 15, 16].includes(i) ? (state === "done" ? "bg-glass/35" : state === "map" ? "bg-hairline" : "bg-debris/60") : "bg-hairline"}`}
            />
          ))}
        </div>
        <p className="label mt-2 text-muted">Property map</p>
      </div>
      <ul className="mt-4 flex-1 space-y-1 px-5">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center gap-3 rounded-hard border border-hairline bg-raised px-3 py-2.5">
            <span className={`flex h-4 w-4 items-center justify-center rounded-hard border ${r.checked ? "border-ink bg-ink" : "border-border-strong"}`} aria-hidden="true">
              {r.checked ? (
                <svg viewBox="0 0 12 12" className="h-3 w-3 text-plaster" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M2.5 6.5 5 9l4.5-5.5" />
                </svg>
              ) : null}
            </span>
            <span className="text-small font-medium">{r.name}</span>
            {r.pct > 0 ? (
              <span className="ml-auto flex items-center gap-2">
                <span className="h-1 w-14 overflow-hidden bg-hairline">
                  <span className="block h-full w-full origin-left bg-water transition-transform duration-700 ease-instrument" style={{ transform: `scaleX(${r.pct / 100})` }} />
                </span>
                <span className="readout text-label tracking-normal text-muted">{r.pct}%</span>
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="p-5">
        <div className={`flex h-11 items-center justify-center rounded-hard text-small font-medium ${state === "done" ? "bg-water text-plaster" : state === "progress" ? "border border-hairline bg-sunken text-muted" : "bg-ink text-plaster"}`}>
          {state === "map" ? "Choose surfaces" : state === "select" ? "Start clean" : state === "start" ? "Starting…" : state === "progress" ? "Cleaning in progress" : "Clean complete"}
        </div>
      </div>
    </div>
  );
}

/** Phone mock. Every app state is rendered once and crossfaded, so switching is opacity only. */
function Phone({ state }: { state: string }) {
  return (
    <div className="relative w-[15.5rem] shrink-0 rounded-hard border border-border-strong/60 bg-ink p-2 md:w-[17rem]" aria-hidden="true">
      <div className="relative h-[33rem] overflow-hidden rounded-hard md:h-[34rem]">
        {states.map((s) => (
          <div key={s} className={`absolute inset-0 transition-opacity duration-300 ease-instrument ${s === state ? "opacity-100" : "opacity-0"}`}>
            <AppScreen state={s} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The landlord story as a scroll-through list. Below lg each beat carries its own still;
 * from lg the phone and the still sit in a sticky column and follow the beat nearest the
 * viewport centre. No pinning, no scroll maths, opacity only.
 */
export function LandlordStory() {
  const [active, setRef] = useActiveStep(beats.length);
  const beat = beats[active];
  return (
    <section id="story" aria-labelledby="story-heading" className="page-x section-y bg-plaster">
      <div className="mx-auto max-w-grid">
        <Reveal className="max-w-statement">
          <Rule className="mb-5" />
          <h2 id="story-heading" className="text-h2">
            {landlordStory.headline}
          </h2>
          <p className="mt-4 max-w-prose text-lead text-muted">{landlordStory.intro}</p>
        </Reveal>
        <div className="mt-10 lg:hidden">
          <Phone state="select" />
        </div>
        <div className="mt-12 grid gap-10 md:mt-16 lg:grid-cols-12 lg:gap-8">
          <ol className="lg:col-span-5">
            {beats.map((b, i) => (
              <li key={b.title} ref={setRef(i)} className="border-t border-hairline py-8 lg:py-10" aria-current={i === active ? "step" : undefined}>
                <p className="label text-glass">0{i + 1}</p>
                <h3 className={`mt-3 font-sans text-h4 font-medium transition-colors duration-300 ${i === active ? "text-ink" : "text-ink lg:text-muted"}`}>{b.title}</h3>
                <p className="mt-2 max-w-prose text-small text-muted">{b.body}</p>
                {i === 0 || b.imageId !== beats[i - 1].imageId ? (
                  <div className="mt-5 lg:hidden">
                    <Picture id={b.imageId} alt={b.title} aspect="16/9" sizes="(min-width: 768px) 60vw, 100vw" />
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
          <div className="hidden lg:col-span-7 lg:block">
            <div className="sticky top-[calc(var(--nav-h)+1.5rem)] flex items-start gap-8">
              <Phone state={beat.app} />
              <div className="min-w-0 flex-1">
                <div className="relative" style={{ aspectRatio: "4/5" }}>
                  {images.map((id) => (
                    <div key={id} className={`absolute inset-0 transition-opacity duration-500 ease-instrument ${id === beat.imageId ? "opacity-100" : "opacity-0"}`} aria-hidden={id !== beat.imageId}>
                      <Picture id={id} alt={beats.find((b) => b.imageId === id)?.title ?? ""} aspect="4/5" sizes="30vw" label={false} />
                    </div>
                  ))}
                </div>
                <p className="label mt-2 text-muted">Concept render</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
