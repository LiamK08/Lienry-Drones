"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FacadeMap } from "@/components/software/FacadeMap";
import { CELLS } from "@/components/three/software/dims";
import { project, solarZones, zones } from "@/content/software";
import { usePrefersReducedMotion } from "@/lib/hooks";

// Small coded product panels for the home page: the reason cards show one when a card opens, and the
// step stage shows one beside each step, as the reference shows short screen recordings there. They
// are drawn in code from demo data (each says so), never imagery, and under reduced motion they stand
// in their finished state. Nothing in them counts up: bars widen and rows appear, the figures are fixed.

/**
 * The beat a panel has reached: 0 when it is not shown, then one more every `ms` while it is, up to
 * `beats`. Under reduced motion every panel stands finished, shown or not, so nothing in it changes.
 */
function useBeat(beats: number, active: boolean, ms: number) {
  // Read as a store with a false server snapshot, so hydration always renders beat 0 and the finished
  // state follows on the next render.
  const reduce = usePrefersReducedMotion();
  const [beat, setBeat] = useState(0);
  const finished = !!reduce;
  useEffect(() => {
    if (!active || reduce) return;
    let n = 0;
    const t = window.setInterval(() => {
      n += 1;
      setBeat(n);
      if (n >= beats) window.clearInterval(t);
    }, ms);
    return () => {
      window.clearInterval(t);
      setBeat(0);
    };
  }, [active, reduce, beats, ms]);
  return finished ? beats : active ? beat : 0;
}

const appear = "transition-[opacity] duration-500 ease-instrument motion-reduce:transition-none";
const shown = (on: boolean) => (on ? "opacity-100" : "opacity-0");

function Tick({ tone = "accent" }: { tone?: "accent" | "debris" }) {
  return (
    <span aria-hidden="true" className={`flex size-5 shrink-0 items-center justify-center rounded-pill ${tone === "accent" ? "bg-tint text-accent" : "bg-fit-partly-soft text-debris-text"}`}>
      <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {tone === "accent" ? <path d="m4 8.5 2.5 2.5L12 5.5" /> : <path d="M8 4.5v4.5M8 11.5v.01" />}
      </svg>
    </span>
  );
}

/** The panel's shell: a white card with a title, a muted line and the Demo data tag, then its body. */
function Shell({ label, title, sub, size, children }: { label: string; title: string; sub?: string; size: "card" | "stage"; children: ReactNode }) {
  return (
    <div
      data-ui=""
      role="img"
      aria-label={`${label} Demo data.`}
      className={`flex flex-col overflow-hidden rounded-card bg-white text-ink shadow-[0_24px_48px_-24px_rgb(0_0_0/0.45)] ${size === "stage" ? "aspect-square w-full max-w-[21.25rem] p-5" : "h-[13.5rem] w-full max-w-[17.5rem] p-4 lg:h-[15rem]"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className={`block font-semibold leading-tight tracking-[-0.02em] ${size === "stage" ? "text-body" : "text-small"}`}>{title}</span>
          {sub ? <span className="mt-0.5 block text-caption leading-tight text-muted">{sub}</span> : null}
        </span>
        <span className="shrink-0 rounded-hard border border-line px-1.5 py-0.5 text-[0.6875rem] leading-none text-muted">Demo data</span>
      </div>
      <div className="mt-4 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

function Bar({ to, tone = "accent" }: { to: number; tone?: "accent" | "debris" }) {
  return (
    <span className="block h-1.5 overflow-hidden rounded-pill bg-[#f1eee8]">
      <span className={`block h-full rounded-pill transition-[width] duration-700 ease-instrument motion-reduce:transition-none ${tone === "accent" ? "bg-accent" : "bg-debris"}`} style={{ width: `${to}%` }} />
    </span>
  );
}

function Rows({ items, beat, from = 1 }: { items: { text: string; note?: string; tone?: "accent" | "debris" }[]; beat: number; from?: number }) {
  return (
    <ul className="flex flex-col">
      {items.map((r, i) => (
        <li key={r.text} className={`flex items-center gap-2.5 border-b border-line py-2 text-caption leading-tight last:border-b-0 ${appear} ${shown(beat >= from + i)}`}>
          <Tick tone={r.tone} />
          <span className="min-w-0 flex-1">{r.text}</span>
          {r.note ? <span className="shrink-0 text-muted">{r.note}</span> : null}
        </li>
      ))}
    </ul>
  );
}

// The reason cards' panels, by the card's icon.

function NobodyAtHeight({ beat }: { beat: number }) {
  return (
    <Shell size="card" label="A clean in progress on the north facade with nobody at height." title="Clean in progress" sub="North facade · Level 9">
      <Rows beat={beat} items={[{ text: "Drone on its tether" }, { text: "Water fed from the dock" }, { text: "Nobody at height" }]} />
      <span className="mt-auto">
        <Bar to={beat >= 4 ? 64 : beat >= 1 ? 30 : 6} />
      </span>
    </Shell>
  );
}

function MoreOften({ beat }: { beat: number }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <Shell size="card" label="A week of re-scans every two days, one finding debris." title="Re-scan schedule" sub="Every two days">
      <span className="grid grid-cols-7 gap-1 text-center">
        {days.map((d, i) => {
          const scan = i % 2 === 0;
          const lit = scan && beat >= i / 2 + 1;
          const dirty = i === 4;
          return (
            <span key={d} className="flex flex-col items-center gap-1.5">
              <span className="text-[0.6875rem] leading-none text-muted">{d.slice(0, 1)}</span>
              <span className={`flex size-6 items-center justify-center rounded-pill border transition-[background-color,border-color] duration-500 motion-reduce:transition-none ${lit ? (dirty ? "border-debris bg-fit-partly-soft" : "border-accent bg-tint") : "border-line"}`}>
                {scan ? <span className={`size-1.5 rounded-pill ${lit ? (dirty ? "bg-debris" : "bg-accent") : "bg-line"}`} /> : null}
              </span>
            </span>
          );
        })}
      </span>
      <span className="mt-auto">
        <Rows beat={beat} from={4} items={[{ text: "Debris found on the last scan", tone: "debris" }, { text: "Next clean", note: project.nextClean }]} />
      </span>
    </Shell>
  );
}

function RightPressure({ beat }: { beat: number }) {
  // The software's own presets (src/content/software.ts): each surface's bar against the strongest.
  const rows = [...zones.filter((z) => z.id !== "east"), solarZones[0]].map((z) => ({ name: z.surface, preset: z.preset, bar: parseInt(z.pressure, 10) }));
  const top = Math.max(...rows.map((r) => r.bar));
  return (
    <Shell size="card" label="Water pressure set for each surface by its preset, gentlest on solar glass." title="Pressure by surface" sub="Presets in the software">
      <ul className="flex flex-1 flex-col justify-between">
        {rows.map((r, i) => (
          <li key={r.name} className="grid grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-x-2 text-caption leading-tight">
            <span className="truncate">{r.name}</span>
            <span className={`text-right text-muted ${appear} ${shown(beat >= i + 1)}`}>{r.preset.split(",")[0]}</span>
            <span className="col-span-2 mt-1">
              <Bar to={beat >= i + 1 ? (r.bar / top) * 100 : 0} />
            </span>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

function FromAnywhere({ beat }: { beat: number }) {
  const areas = ["Driveway", "Solar panels", "Windows"];
  const started = beat >= 4;
  return (
    <Shell size="card" label="The phone app with three areas ticked and a clean started." title="Choose what to clean" sub="Home system app">
      <ul className="flex flex-col gap-1.5">
        {areas.map((a, i) => {
          const on = beat >= i + 1;
          return (
            <li key={a} className={`flex items-center gap-2.5 rounded-[0.5rem] border px-2.5 py-1.5 text-caption transition-[border-color,background-color] duration-300 motion-reduce:transition-none ${on ? "border-accent/40 bg-tint" : "border-line"}`}>
              <span className={`flex size-4 items-center justify-center rounded-hard border transition-[background-color,border-color] duration-300 motion-reduce:transition-none ${on ? "border-accent bg-accent text-white" : "border-border-strong"}`}>
                {on ? (
                  <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m4 8.5 2.5 2.5L12 5.5" />
                  </svg>
                ) : null}
              </span>
              {a}
            </li>
          );
        })}
      </ul>
      <span className={`mt-auto flex h-9 items-center justify-center rounded-pill text-caption font-medium transition-[background-color,color] duration-300 motion-reduce:transition-none ${started ? "bg-tint text-accent" : "bg-accent text-white"}`}>
        {started ? "Cleaning the driveway" : "Start clean"}
      </span>
    </Shell>
  );
}

function OnRecord({ beat }: { beat: number }) {
  return (
    <Shell size="card" label="The clean history: three zones washed and the next clean due." title="Clean history" sub="Desktop software">
      <Rows
        beat={beat}
        items={[
          { text: "North facade", note: "Washed" },
          { text: "East facade", note: "Washed" },
          { text: "Roof glazing", note: "Washed" },
        ]}
      />
      <span className={`mt-auto flex items-center justify-between rounded-[0.5rem] bg-paper px-2.5 py-2 text-caption ${appear} ${shown(beat >= 4)}`}>
        <span className="text-muted">Next clean</span>
        <span className="font-medium">{project.nextClean}</span>
      </span>
    </Shell>
  );
}

const CARD_PANELS = { shield: NobodyAtHeight, repeat: MoreOften, sliders: RightPressure, phone: FromAnywhere, record: OnRecord } as const;
export type CardPanelId = keyof typeof CARD_PANELS;

/** A reason card's panel, playing while `active` (its card is open, or on screen on a phone). */
export function CardPanel({ id, active }: { id: CardPanelId; active: boolean }) {
  const beat = useBeat(5, active, 650);
  const Panel = CARD_PANELS[id];
  return <Panel beat={beat} />;
}

// The step stage's panels: one record, the software's demo building (src/content/software.ts), followed
// through the five steps on the window's own facade map, each step opening where the last one ended.

/** The wash route, in the order the window's clean runs it: each zone top down, then the next zone. */
const ROUTE = (() => {
  const order = new Map(zones.map((z) => [z.id, z.order]));
  return CELLS.map((c, i) => ({ i, zone: order.get(c.zone) ?? 9, floor: c.floor, bay: c.bay }))
    .sort((a, b) => a.zone - b.zone || b.floor - a.floor || a.bay - b.bay)
    .map((c) => c.i);
})();

/** The map's cells after `share` of the route has been washed: done in full behind the front, half at it. */
function washed(share: number) {
  const cells = new Float32Array(CELLS.length);
  const front = Math.round(share * ROUTE.length);
  const band = Math.round(ROUTE.length * 0.06);
  ROUTE.forEach((cell, k) => {
    cells[cell] = k < front - band ? 1 : k < front ? 0.5 : 0;
  });
  return cells;
}
/** The zone at the washing front once `share` of the route is done. */
const zoneAt = (share: number) => {
  const cell = CELLS[ROUTE[Math.min(ROUTE.length - 1, Math.max(0, Math.round(share * ROUTE.length) - 1))]];
  return zones.find((z) => z.id === cell.zone) ?? zones[0];
};
const NONE = washed(0);
const ALL = washed(1.2);

/** The stage's shell: the step's title and the Demo data tag, the demo building and its status, then the map and the step's rows. */
function Stage({ label, title, status, map, children }: { label: string; title: string; status: string; map: ReactNode; children: ReactNode }) {
  return (
    <Shell size="stage" label={label} title={title} sub={project.name}>
      <span className="-mt-2 mb-3 inline-flex self-start rounded-pill bg-tint px-2 py-0.5 text-[0.6875rem] font-medium leading-tight text-accent">{status}</span>
      <span className="block">{map}</span>
      <span className="mt-auto block pt-3">{children}</span>
    </Shell>
  );
}

function Scan({ beat, map }: { beat: number; map: boolean }) {
  // The scan maps the building floor by floor from the top: the floors not reached yet are clipped away.
  const reached = Math.min(1, beat / 4);
  return (
    <Stage
      label="The scan mapping the demo building floor by floor into a model."
      title="Scanning the building"
      status={beat >= 5 ? "Model ready" : "Scanning"}
      map={
        map ? (
          <span className="block transition-[clip-path] duration-700 ease-instrument motion-reduce:transition-none" style={{ clipPath: `inset(0 0 ${Math.round((1 - reached) * 100)}% 0)` }}>
            <FacadeMap cells={NONE} version={0} wash={false} debris={false} selected={null} />
          </span>
        ) : null
      }
    >
      <Rows beat={beat} from={4} items={[{ text: "Structure and dimensions mapped" }, { text: "Model built from the scan" }]} />
    </Stage>
  );
}

function Plan({ beat, map }: { beat: number; map: boolean }) {
  // Each beat lights the next zone of the route on the map and names its surface, preset and pressure.
  const z = zones[Math.min(zones.length - 1, Math.max(0, beat - 1))];
  return (
    <Stage
      label="The wash plan: each zone of the demo building lit in turn with its surface, preset and pressure."
      title="Wash plan"
      status="Planned"
      map={map ? <FacadeMap cells={NONE} version={0} wash={false} debris={false} selected={beat ? z.id : null} /> : null}
    >
      <span className={`flex items-center justify-between gap-3 rounded-[0.5rem] bg-paper px-3 py-2 text-caption leading-tight ${appear} ${shown(beat >= 1)}`}>
        <span className="min-w-0">
          <span className="block font-medium">{z.name}</span>
          <span className="block text-muted">{z.surface}</span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block">{z.preset}</span>
          <span className="block text-muted">{z.pressure}</span>
        </span>
      </span>
      <span className="mt-2 block text-right text-[0.6875rem] text-muted">Zone {z.order} of {zones.length}</span>
    </Stage>
  );
}

function Clean({ beat, map }: { beat: number; map: boolean }) {
  const share = beat / 5;
  return (
    <Stage
      label="The clean moving down the demo building zone by zone, two passes per floor, top down."
      title="Washing the building"
      status="Washing"
      map={map ? <FacadeMap cells={washed(share)} version={beat} wash debris={false} selected={null} /> : null}
    >
      <span className="flex items-center justify-between gap-3 text-caption">
        <span className="text-muted">Now washing</span>
        <span className="truncate">{zoneAt(share).name}</span>
      </span>
      <span className="mt-2 block">
        <Bar to={Math.min(100, share * 100)} />
      </span>
    </Stage>
  );
}

function Check({ beat, map }: { beat: number; map: boolean }) {
  return (
    <Stage
      label="The re-scan shading the zones of the demo building where debris has built up."
      title="Re-scan"
      status={`Last scan ${project.scanAge} ago`}
      map={map ? <FacadeMap cells={NONE} version={0} wash={false} debris={beat >= 2} selected={null} /> : null}
    >
      <Rows beat={beat} from={3} items={[{ text: `Debris on ${project.debrisZones} areas`, tone: "debris" }, { text: "Added to the next clean" }]} />
    </Stage>
  );
}

function Report({ beat, map }: { beat: number; map: boolean }) {
  return (
    <Stage
      label="The clean report: every zone of the demo building washed, the debris the re-scan found queued, and the next clean due."
      title="Clean report"
      status="On record"
      map={map ? <FacadeMap cells={ALL} version={1} wash debris={false} selected={null} /> : null}
    >
      <Rows beat={beat} items={[{ text: `Washed: ${zones.length} zones` }, { text: `Debris on ${project.debrisZones} areas, queued`, tone: "debris" }, { text: "Next clean", note: project.nextClean }]} />
    </Stage>
  );
}

const STAGE_PANELS = { scan: Scan, plan: Plan, clean: Clean, check: Check, report: Report } as const;
export type StagePanelId = keyof typeof STAGE_PANELS;

/**
 * A step's panel on the stage, playing while its step is shown. `map` mounts the facade map (the shown
 * step and the one fading out), so the page does not keep five maps of 320 cells alive.
 */
export function StagePanel({ id, active, map }: { id: StagePanelId; active: boolean; map: boolean }) {
  const beat = useBeat(5, active, 900);
  const Panel = STAGE_PANELS[id];
  return <Panel beat={beat} map={map} />;
}
