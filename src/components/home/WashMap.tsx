"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { DEBRIS_SHOWN, FACADE_MAP_SIZE, FacadeMap, facadeCellAt, facadeRowOf, type FacadeRow } from "@/components/software/FacadeMap";
import { CELLS } from "@/components/three/software/dims";
import { zones } from "@/content/software";
import { DroneGlyph } from "@/components/home/DroneGlyph";

// The step stage's hands-on clean (step 03): the visitor washes the demo building's facade map. A drag
// across a floor gives each panel it crosses one pass, a press or tap on a floor gives the whole floor
// one, and the arrow keys wash the route floor by floor. A clean panel is washed in one pass; a panel
// with debris on it takes both, as the model's "pass 2 of 2" does. Demo data on a coded map: no time,
// speed or saving figures, and the count changes only with the visitor's input. Until the visitor
// starts, the drone runs the route itself, floor by floor (never under reduced motion).

const TOTAL = CELLS.length;
const dirty = (i: number) => CELLS[i].debris > DEBRIS_SHOWN;

/** One pass over `cells`: a panel is washed, or washed once if debris needs a second pass. */
function pass(from: Float32Array, cells: Iterable<number>): Float32Array {
  const next = Float32Array.from(from);
  for (const i of cells) next[i] = next[i] >= 1 || !dirty(i) || next[i] >= 0.5 ? 1 : 0.5;
  return next;
}
const washedIn = (cells: Float32Array) => cells.reduce((n, v) => (v >= 1 ? n + 1 : n), 0);

/** The floors in the order the window's clean runs them: each zone top down, then the next zone. */
const ROUTE: FacadeRow[] = (() => {
  const order = new Map(zones.map((z) => [z.id, z.order]));
  const cells = CELLS.map((c, i) => ({ i, zone: order.get(c.zone) ?? 9, floor: c.floor, bay: c.bay })).sort((a, b) => a.zone - b.zone || b.floor - a.floor || a.bay - b.bay);
  const rows: FacadeRow[] = [];
  for (const { i } of cells) {
    const row = facadeRowOf(i);
    if (!rows.includes(row)) rows.push(row);
  }
  return rows;
})();
/** The drone's own run: every floor once, and a floor with debris on it twice. */
const SWEEPS = ROUTE.flatMap((row) => (row.cells.some(dirty) ? [row, row] : [row]));
const AUTO = SWEEPS.reduce<Float32Array[]>((states, row) => [...states, pass(states[states.length - 1], row.cells)], [new Float32Array(TOTAL)]);
const SWEEP_MS = 130;

const zoneOf = (row: FacadeRow) => zones.find((z) => z.id === CELLS[row.cells[0]].zone) ?? zones[0];

export type Wash = ReturnType<typeof useWash>;

/**
 * The clean's state: the drone's own run while the step plays and nobody has touched the map, then
 * the visitor's map from the moment they start. `onDone` is called when the visitor's input washes
 * the last panel.
 */
export function useWash({ active, reduce, onDone }: { active: boolean; reduce: boolean; onDone?: () => void }) {
  const [k, setK] = useState(0);
  const [mine, setMine] = useState<{ cells: Float32Array; version: number; front: FacadeRow | null } | null>(null);
  // The visitor's map as the handlers last left it (state follows it), and the states to step back to.
  const live = useRef<Float32Array | null>(null);
  const history = useRef<Float32Array[]>([]);
  const version = useRef(0);
  const settle = useRef(0);

  const auto = active && !reduce && mine === null;
  useEffect(() => {
    if (!auto) return;
    window.clearTimeout(settle.current);
    let n = 0;
    const t = window.setInterval(() => {
      n += 1;
      setK(n);
      if (n >= SWEEPS.length) window.clearInterval(t);
    }, SWEEP_MS);
    return () => {
      window.clearInterval(t);
      // Back to the start once the panel has faded out, so the next run opens on the unwashed map.
      settle.current = window.setTimeout(() => setK(0), 700);
    };
  }, [auto]);

  // What the visitor takes over: the drone's run as far as it has gone, or a fresh map once it has
  // washed everything, so there is always something left to wash.
  const current = () => live.current ?? (k >= SWEEPS.length ? new Float32Array(TOTAL) : AUTO[k]);
  const commit = (next: Float32Array, front: FacadeRow | null, keep = true) => {
    const before = live.current ? washedIn(live.current) : -1;
    if (keep) {
      history.current.push(current());
      if (history.current.length > 100) history.current.shift();
    }
    live.current = next;
    version.current += 1;
    setMine({ cells: next, version: version.current, front });
    if (before < TOTAL && washedIn(next) === TOTAL) onDone?.();
  };

  const cells = mine ? mine.cells : AUTO[k];
  const washed = washedIn(cells);
  const front = mine ? mine.front : k > 0 ? SWEEPS[k - 1] : null;
  return {
    cells,
    version: mine ? 1000 + mine.version : k,
    washed,
    total: TOTAL,
    complete: washed === TOTAL,
    engaged: mine !== null,
    /** Where the drone is in its own run: null before it starts and once it has finished. */
    running: mine === null && k > 0 && k < SWEEPS.length ? zoneOf(SWEEPS[k - 1]).name : null,
    finished: mine === null && k >= SWEEPS.length,
    front,
    /** A gesture starts: the visitor takes over from what the map shows now. */
    begin() {
      if (!live.current) {
        live.current = current();
        setMine({ cells: live.current, version: version.current, front: null });
      }
      history.current.push(live.current);
    },
    /** One pass over the cells a drag crossed (the gesture's state was kept when it began). */
    stroke(hit: number[]) {
      commit(pass(current(), hit), null, false);
    },
    /** One pass over the floor holding a cell: a press or tap on the map. */
    floor(cell: number) {
      const row = facadeRowOf(cell);
      commit(pass(current(), row.cells), row, false);
    },
    /** The next floor of the route that is not yet washed. */
    next() {
      const base = current();
      const row = ROUTE.find((r) => r.cells.some((i) => base[i] < 1));
      if (row) commit(pass(base, row.cells), row);
    },
    /** Back to the map before the last change. */
    back() {
      const prev = history.current.pop();
      if (!prev) return;
      live.current = prev;
      version.current += 1;
      setMine({ cells: prev, version: version.current, front: null });
    },
    reset() {
      commit(new Float32Array(TOTAL), null);
    },
    all() {
      commit(new Float32Array(TOTAL).fill(1), null);
    },
  };
}

type Point = { x: number; y: number; px: number; py: number };
type Drag = { id: number; sx: number; sy: number; started: boolean; last: number; prev: Point };

/**
 * The map as a control: a labelled slider (its value is the panels washed) that takes drags, presses
 * and taps, and the keyboard: Right or Up washes the next floor, Left or Down steps back, Home starts
 * again, End washes every floor. The drone glyph rides under a mouse or pen; on touch a sideways drag
 * washes and an upward or downward one still scrolls the page.
 */
export function WashSurface({ wash, label, describedBy }: { wash: Wash; label: string; describedBy: string }) {
  const box = useRef<HTMLDivElement>(null);
  const glyph = useRef<HTMLSpanElement>(null);
  const drag = useRef<Drag | null>(null);
  const queue = useRef<Point[]>([]);
  const pointer = useRef<Point | null>(null);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const at = (e: { clientX: number; clientY: number }): Point => {
    const r = box.current!.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    return { x: (px / r.width) * FACADE_MAP_SIZE.width, y: (py / r.height) * FACADE_MAP_SIZE.height, px, py };
  };

  // One update a frame: the glyph follows the pointer, and the cells a drag crossed since the last
  // frame take their pass (every cell on the path, however fast the drag).
  const flush = () => {
    frame.current = 0;
    if (pointer.current && glyph.current) glyph.current.style.translate = `${pointer.current.px}px ${pointer.current.py}px`;
    const d = drag.current;
    const points = queue.current;
    queue.current = [];
    if (!d || !points.length) return;
    const hit: number[] = [];
    const step = FACADE_MAP_SIZE.cell / 3;
    for (const p of points) {
      const n = Math.max(1, Math.ceil(Math.hypot(p.x - d.prev.x, p.y - d.prev.y) / step));
      for (let s = d.last === -2 ? 0 : 1; s <= n; s++) {
        const cell = facadeCellAt(d.prev.x + ((p.x - d.prev.x) * s) / n, d.prev.y + ((p.y - d.prev.y) * s) / n);
        if (cell >= 0 && cell !== d.last) hit.push(cell);
        d.last = cell;
      }
      d.prev = p;
    }
    if (hit.length) wash.stroke(hit);
  };
  const schedule = () => {
    if (!frame.current) frame.current = requestAnimationFrame(flush);
  };
  const spray = (on: boolean) => glyph.current?.toggleAttribute("data-spray", on);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const p = at(e);
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, started: false, last: -2, prev: p };
    wash.begin();
    spray(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const p = at(e);
    if (e.pointerType !== "touch") {
      box.current?.toggleAttribute("data-hover", true);
      pointer.current = p;
      schedule();
    }
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.started) {
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 4) return;
      d.started = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    queue.current.push(p);
    schedule();
  };
  const end = (e: PointerEvent<HTMLDivElement>, press: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      flush();
    }
    drag.current = null;
    spray(false);
    // A press or tap that never became a drag washes its floor.
    if (press && !d.started) {
      const cell = facadeCellAt(d.prev.x, d.prev.y);
      if (cell >= 0) wash.floor(cell);
    }
  };
  const hover = (on: boolean, e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    box.current?.toggleAttribute("data-hover", on);
    if (on) {
      pointer.current = at(e);
      schedule();
    } else pointer.current = null;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const act = { ArrowRight: wash.next, ArrowUp: wash.next, ArrowLeft: wash.back, ArrowDown: wash.back, Home: wash.reset, End: wash.all }[e.key];
    if (!act) return;
    e.preventDefault();
    act();
  };

  // The drone at the floor it last washed (its own run, a key or a tap): at the floor's far end.
  const f = wash.front;
  const rest = f ? { x: ((f.x + f.width) / FACADE_MAP_SIZE.width) * 100, y: ((f.y + f.height / 2) / FACADE_MAP_SIZE.height) * 100 } : null;

  return (
    <div
      ref={box}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-describedby={describedBy}
      aria-valuemin={0}
      aria-valuemax={wash.total}
      aria-valuenow={wash.washed}
      aria-valuetext={`${wash.washed} of ${wash.total} panels washed`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => end(e, true)}
      onPointerCancel={(e) => end(e, false)}
      onPointerEnter={(e) => hover(true, e)}
      onPointerLeave={(e) => hover(false, e)}
      onKeyDown={onKeyDown}
      className="group/map relative cursor-none touch-pan-y select-none rounded-hard"
    >
      <FacadeMap cells={wash.cells} version={wash.version} wash debris selected={null} ease decorative strong />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible [container-type:size]">
        {rest ? (
          <span
            className="absolute left-0 top-0 transition-[translate] duration-150 ease-linear group-data-[hover]/map:opacity-0 motion-reduce:transition-none"
            style={{ translate: `calc(${rest.x.toFixed(2)} * 1cqw) calc(${rest.y.toFixed(2)} * 1cqh)` }}
          >
            <Puck spraying={wash.running !== null} />
          </span>
        ) : null}
        <span ref={glyph} className="group/glyph absolute left-0 top-0 hidden group-data-[hover]/map:block">
          <Puck />
        </span>
      </span>
    </div>
  );
}

/** The drone on a white disc, so it reads over washed and unwashed cells alike; a water ring while it sprays. */
function Puck({ spraying = false }: { spraying?: boolean }) {
  return (
    <span
      className={`-ml-3 -mt-3 flex size-6 items-center justify-center rounded-pill bg-white text-ink shadow-[0_0_0_1px_var(--color-line)] transition-[box-shadow] duration-150 group-data-[spray]/glyph:shadow-[0_0_0_3px_var(--color-water)] motion-reduce:transition-none ${spraying ? "shadow-[0_0_0_3px_var(--color-water)]" : ""}`}
    >
      <DroneGlyph className="size-[1.125rem]" />
    </span>
  );
}
