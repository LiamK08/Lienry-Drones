"use client";

import { useEffect, useId, useRef, useState, type Ref } from "react";
import { appPanel } from "@/content/homes";
import { Button } from "@/components/ui/Button";

export type AreaId = (typeof appPanel.areas)[number]["id"];
export type CleanPhase = "choose" | "running" | "done";

/** The demo's state and its actions, shared by the panel and the picture beside it. */
export type CleanDemo = {
  /** The areas the visitor ticked, in row order. */
  chosen: readonly AreaId[];
  phase: CleanPhase;
  /** Running: the index in `chosen` of the area being washed (the ones before it are complete). */
  active: number;
  /** Running: the active area's progress, 0 to 100. */
  progress: number;
  /** The last thing the live region said (empty until the visitor acts). */
  message: string;
  toggle: (id: AreaId) => void;
  /** Starts the clean for the chosen areas (also "Clean again"). Does nothing while running or with none chosen. */
  start: () => void;
  /** Back to choosing, the ticks kept. */
  chooseAgain: () => void;
};

/** Each area's wash in the demo, one after another. Illustrative pacing, not a cleaning time. */
const AREA_MS = 2500;
/** A gentle ease in and out (sine), so each bar starts and settles softly. */
const ease = (t: number) => (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, t)))) / 2;

const ORDER: readonly AreaId[] = appPanel.areas.map((a) => a.id);
const AREA = Object.fromEntries(appPanel.areas.map((a) => [a.id, a])) as Record<AreaId, (typeof appPanel.areas)[number]>;

/** "the driveway", "the driveway and the windows", "the driveway, the solar panels and the windows". */
function areaList(ids: readonly AreaId[]): string {
  const words = ids.map((id) => AREA[id].phrase);
  return words.length < 2 ? (words[0] ?? "") : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}
const fill = (text: string, vars: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
const chosenLine = (ids: readonly AreaId[]) => (ids.length ? fill(appPanel.line.chosen, { areas: areaList(ids) }) : appPanel.line.none);
const doneLine = (ids: readonly AreaId[]) => fill(appPanel.line.done, { areas: areaList(ids) });
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The demo clean. Nothing is chosen at first. Start washes the chosen areas one after another, each
 * over AREA_MS on a gentle ease, driven by requestAnimationFrame from the start time (a hidden tab
 * catches up when it returns). Under reduced motion it jumps straight to complete. The live message
 * names the chosen areas, the start, each area as it completes and the end.
 */
export function useCleanDemo(): CleanDemo {
  const [chosen, setChosen] = useState<readonly AreaId[]>([]);
  const [phase, setPhase] = useState<CleanPhase>("choose");
  const [run, setRun] = useState({ active: 0, progress: 0 });
  const [message, setMessage] = useState("");
  // What the visitor's own presses say: cleared, then set on the next frame, so the live region speaks
  // even when the words repeat (Clean again under reduced motion ends exactly where it started).
  const sayFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(sayFrame.current), []);
  const say = (text: string) => {
    cancelAnimationFrame(sayFrame.current);
    setMessage("");
    sayFrame.current = requestAnimationFrame(() => setMessage(text));
  };

  useEffect(() => {
    if (phase !== "running") return;
    const n = chosen.length;
    let frame = 0;
    let t0 = -1;
    let shown = { active: 0, progress: 0 };
    const tick = (now: number) => {
      if (t0 < 0) t0 = now;
      const elapsed = now - t0;
      const active = Math.min(n, Math.floor(elapsed / AREA_MS));
      if (active > shown.active) {
        const finished = fill(appPanel.live.areaDone, { area: AREA[chosen[active - 1]].name });
        if (active === n) {
          setRun({ active: n, progress: 100 });
          setPhase("done");
          setMessage(`${finished} ${doneLine(chosen)}`);
          return;
        }
        setMessage(finished);
      }
      const progress = Math.floor(ease((elapsed - active * AREA_MS) / AREA_MS) * 100);
      if (active !== shown.active || progress !== shown.progress) {
        shown = { active, progress };
        setRun(shown);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, chosen]);

  const toggle = (id: AreaId) => {
    if (phase === "running") return;
    const next = ORDER.filter((a) => (a === id) !== chosen.includes(a));
    setChosen(next);
    setPhase("choose");
    setRun({ active: 0, progress: 0 });
    say(chosenLine(next));
  };

  const start = () => {
    if (phase === "running" || !chosen.length) return;
    const started = fill(appPanel.live.started, { areas: areaList(chosen) });
    if (reducedMotion()) {
      setRun({ active: chosen.length, progress: 100 });
      setPhase("done");
      say(`${started} ${doneLine(chosen)}`);
      return;
    }
    setRun({ active: 0, progress: 0 });
    setPhase("running");
    say(started);
  };

  const chooseAgain = () => {
    setPhase("choose");
    setRun({ active: 0, progress: 0 });
    say(chosenLine(chosen));
  };

  return { chosen, phase, active: run.active, progress: run.progress, message, toggle, start, chooseAgain };
}

/** The line above the button: the hint, the choice, where the clean is, or the summary. */
function statusLine(demo: CleanDemo): string {
  if (demo.phase === "done") return doneLine(demo.chosen);
  if (demo.phase === "running") {
    const id = demo.chosen[demo.active] ?? demo.chosen[demo.chosen.length - 1];
    return fill(appPanel.line.running, { area: AREA[id].phrase, i: Math.min(demo.active + 1, demo.chosen.length), n: demo.chosen.length });
  }
  return chosenLine(demo.chosen);
}

type RowState = { kind: "none" } | { kind: "skipped" } | { kind: "progress"; value: number } | { kind: "complete" };

function rowState(demo: CleanDemo, id: AreaId): RowState {
  if (demo.phase === "choose") return { kind: "none" };
  const i = demo.chosen.indexOf(id);
  if (i < 0) return { kind: "skipped" };
  if (demo.phase === "done" || i < demo.active) return { kind: "complete" };
  return { kind: "progress", value: i === demo.active ? demo.progress : 0 };
}

const tickPath = "M3.5 8.5 6.5 11.5 12.5 4.5";

/** What a row says on its right: nothing while choosing, then its progress, "Complete" or "Not in this clean". */
function RowStatus({ state, id }: { state: RowState; id: string }) {
  if (state.kind === "none") return null;
  if (state.kind === "skipped") {
    return (
      <span id={id} className="ml-auto shrink-0 text-caption text-muted">
        {appPanel.rowState.skipped}
      </span>
    );
  }
  if (state.kind === "complete") {
    return (
      <span id={id} className="ml-auto flex shrink-0 items-center gap-1 text-caption font-medium text-accent">
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={tickPath} />
        </svg>
        {appPanel.rowState.complete}
      </span>
    );
  }
  return (
    <span className="ml-auto flex shrink-0 items-center gap-2">
      <span aria-hidden="true" className="h-1 w-12 overflow-hidden rounded-pill bg-hairline">
        <span className="block h-full rounded-pill bg-accent" style={{ width: `${state.value}%` }} />
      </span>
      <span id={id} className="w-[2.125rem] text-right text-caption tabular-nums text-ink">
        {state.value}%
      </span>
    </span>
  );
}

/**
 * One area: a native checkbox drawn as the panel's 16px tick, inside a 44px label row (the whole row
 * is the target and carries the focus ring). Its name is the checkbox's name; its state on the right
 * is the description, so the name never changes as the clean runs.
 */
function Row({ area, demo, uid, inputRef }: { area: (typeof appPanel.areas)[number]; demo: CleanDemo; uid: string; inputRef?: Ref<HTMLInputElement> }) {
  const state = rowState(demo, area.id);
  const on = demo.chosen.includes(area.id);
  const nameId = `${uid}-${area.id}-name`;
  const stateId = `${uid}-${area.id}-state`;
  const dim = state.kind === "skipped";
  return (
    <li className="border-b border-hairline">
      <label className="-mx-2 flex h-11 items-center gap-3 rounded-hard px-2 transition-[background-color,border-color,color] duration-200 ease-instrument has-[input:enabled]:cursor-pointer has-[input:enabled]:hover:bg-ink/[0.04] has-[input:focus-visible]:outline-2 has-[input:focus-visible]:-outline-offset-2 has-[input:focus-visible]:outline-focus motion-reduce:transition-none">
        <span className="relative flex size-4 shrink-0">
          <input
            ref={inputRef}
            type="checkbox"
            checked={on}
            onChange={() => demo.toggle(area.id)}
            aria-labelledby={nameId}
            aria-describedby={state.kind === "none" ? undefined : stateId}
            className="peer size-4 appearance-none rounded-hard border border-border-strong bg-white transition-[background-color,border-color,color] duration-200 ease-instrument checked:border-ink checked:bg-ink focus-visible:outline-none enabled:cursor-pointer disabled:border-hairline disabled:checked:border-ink motion-reduce:transition-none"
          />
          <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute inset-0.5 size-3 text-white opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={tickPath} />
          </svg>
        </span>
        <span id={nameId} className={`text-small ${dim ? "text-muted" : ""} ${state.kind === "progress" && state.value > 0 ? "font-medium" : ""}`}>
          {area.name}
        </span>
        <RowStatus state={state} id={stateId} />
      </label>
    </li>
  );
}

function Header({ pad }: { pad: string }) {
  return (
    <div className={`flex items-center justify-between gap-4 border-b border-hairline ${pad}`}>
      <span className="text-small font-medium">Your property</span>
      <span className="label text-muted">Demo data</span>
    </div>
  );
}

/**
 * The illustrative phone app, drawn flat: a raised panel with a hairline border, 4px corners and 20px
 * padding (16 below 1280). The visitor chooses the areas (native checkboxes, nothing ticked at first),
 * then starts the clean; Start stays aria-disabled, described by the hint above it, until one area is
 * chosen. While it runs the checkboxes are locked (the fieldset is disabled) and each chosen area shows
 * its bar and percentage; the others say "Not in this clean". At the end every chosen area says
 * "Complete", the line above the button sums it up, and the visitor can clean again or choose again
 * (which returns focus to the first area). Every height is fixed (44px rows, a two-line status line, a
 * 44px action row), so the panel never changes size between states. A polite live region, empty on the
 * first render, announces each step.
 */
export function AppPanel({ demo }: { demo: CleanDemo }) {
  const uid = useId();
  const firstBox = useRef<HTMLInputElement>(null);
  const lineId = `${uid}-line`;
  const running = demo.phase === "running";
  const unavailable = running || (demo.phase === "choose" && demo.chosen.length === 0);
  const label = running ? appPanel.buttons.running : demo.phase === "done" ? appPanel.buttons.again : appPanel.buttons.start;

  const chooseAgain = () => {
    demo.chooseAgain();
    // The areas are enabled in the done state, so focus can move before the button goes.
    firstBox.current?.focus();
  };

  return (
    <div role="group" aria-label="Illustrative mobile app, demo data" data-ui="" className="on-light relative flex flex-col rounded-hard border border-hairline bg-raised p-4 text-ink xl:p-5">
      <Header pad="pb-3" />
      <p className="mt-4 text-lead font-medium">{appPanel.property}</p>
      <fieldset disabled={running} className="mt-1 min-w-0">
        <legend className="text-caption text-muted">{appPanel.prompt}</legend>
        <ul className="mt-3 border-t border-hairline">
          {appPanel.areas.map((area, i) => (
            <Row key={area.id} area={area} demo={demo} uid={uid} inputRef={i === 0 ? firstBox : undefined} />
          ))}
        </ul>
      </fieldset>
      <p id={lineId} className="mt-2 flex min-h-[2lh] items-center text-caption text-muted">
        {statusLine(demo)}
      </p>
      <div className="mt-2 flex min-h-11 items-center gap-3">
        <Button
          onClick={() => {
            if (!unavailable) demo.start();
          }}
          aria-disabled={unavailable || undefined}
          aria-describedby={lineId}
          className="min-w-0 flex-1"
        >
          {label}
        </Button>
        {demo.phase === "done" ? (
          <Button variant="tertiary" onClick={chooseAgain} className="shrink-0">
            {appPanel.buttons.choose}
          </Button>
        ) : null}
      </div>
      <p className="mt-2 text-caption text-muted">{appPanel.note}</p>
      <p role="status" aria-live="polite" className="sr-only">
        {demo.message}
      </p>
    </div>
  );
}
