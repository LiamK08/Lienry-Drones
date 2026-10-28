"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { FACADE_MAP_SIZE, FacadeMap, facadeCellAt, facadeRowOf, type FacadeRow } from "@/components/software/FacadeMap";
import { CELLS } from "@/components/three/software/dims";
import { zones } from "@/content/software";
import { DroneGlyph } from "@/components/home/DroneGlyph";

// The step stage's hands-on clean (step 03): the visitor washes the demo building's facade map. A drag
// across a floor gives each panel it crosses one pass, a press or tap on a floor gives the whole floor
// one, and the arrow keys wash the route floor by floor. Every panel takes two passes, as the model's
// "pass 1 of 2" and "pass 2 of 2" do, and each pass washes off half the debris on it. Demo data on a
// coded map: no time, speed or saving figures, and the count changes only with the visitor's input.
// Until the visitor starts, the drone runs the route itself, floor by floor (never under reduced motion).

const TOTAL = CELLS.length;

/** One pass over `cells`: a panel is washed once, or washed if it had its first pass. */
function pass(from: Float32Array, cells: Iterable<number>): Float32Array {
  const next = Float32Array.from(from);
  for (const i of cells) next[i] = next[i] >= 0.5 ? 1 : 0.5;
  return next;
}
const washedIn = (cells: Float32Array) => cells.reduce((n, v) => (v >= 1 ? n + 1 : n), 0);
const onceIn = (cells: Float32Array) => cells.reduce((n, v) => (v > 0 && v < 1 ? n + 1 : n), 0);

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
/** The drone's own run: both passes of every floor, in about four seconds, inside the step's six. */
const SWEEPS = ROUTE.flatMap((row) => [row, row]);
const AUTO = SWEEPS.reduce<Float32Array[]>((states, row) => [...states, pass(states[states.length - 1], row.cells)], [new Float32Array(TOTAL)]);
const SWEEP_MS = 80;

const zoneOf = (row: FacadeRow) => zones.find((z) => z.id === CELLS[row.cells[0]].zone) ?? zones[0];

export type Wash = ReturnType<typeof useWash>;

/**
 * The clean's state: the drone's own run while the step plays and nobody has touched the map, then
 * the visitor's map from the moment their input first washes it. `onWash` hears each change the
 * visitor makes, with `done` true when that change washed the last panel.
 */
export function useWash({ active, reduce, onWash }: { active: boolean; reduce: boolean; onWash?: (done: boolean) => void }) {
  const [k, setK] = useState(0);
  const [mine, setMine] = useState<{ cells: Float32Array; version: number; front: FacadeRow | null } | null>(null);
  // The keyboard is on the map: the drone's run waits there, so the control's value holds still.
  const [held, setHeld] = useState(false);
  // The visitor's map as the handlers last left it (state follows it), and the states to step back to.
  const live = useRef<Float32Array | null>(null);
  const history = useRef<Float32Array[]>([]);
  const version = useRef(0);
  const settle = useRef(0);
  const run = useRef(0);

  const auto = active && !reduce && mine === null;
  useEffect(() => {
    if (!auto) return;
    window.clearTimeout(settle.current);
    run.current = 0;
    return () => {
      // Back to the start once the panel has faded out, so the next run opens on the unwashed map.
      settle.current = window.setTimeout(() => setK(0), 700);
    };
  }, [auto]);
  useEffect(() => {
    if (!auto || held) return;
    const t = window.setInterval(() => {
      run.current = Math.min(SWEEPS.length, run.current + 1);
      setK(run.current);
      if (run.current >= SWEEPS.length) window.clearInterval(t);
    }, SWEEP_MS);
    return () => window.clearInterval(t);
  }, [auto, held]);

  // What the visitor takes over: the drone's run as far as it has gone, or a fresh map once it has
  // washed everything, so there is always something left to wash.
  const current = () => live.current ?? (k >= SWEEPS.length ? new Float32Array(TOTAL) : AUTO[k]);
  const show = (next: Float32Array, front: FacadeRow | null) => {
    const before = live.current ? washedIn(live.current) : -1;
    live.current = next;
    version.current += 1;
    setMine({ cells: next, version: version.current, front });
    onWash?.(before < TOTAL && washedIn(next) === TOTAL);
  };
  const commit = (next: Float32Array, front: FacadeRow | null, keep = true) => {
    if (keep) {
      history.current.push(current());
      if (history.current.length > 100) history.current.shift();
    }
    show(next, front);
  };

  const cells = mine ? mine.cells : AUTO[k];
  const washed = washedIn(cells);
  const front = mine ? mine.front : k > 0 ? SWEEPS[k - 1] : null;
  return {
    cells,
    version: mine ? 1000 + mine.version : k,
    washed,
    /** The panels that have had one of their two passes. */
    once: onceIn(cells),
    total: TOTAL,
    complete: washed === TOTAL,
    engaged: mine !== null,
    /** Where the drone is in its own run: null before it starts, while it waits and once it has finished. */
    running: mine === null && !held && k > 0 && k < SWEEPS.length ? zoneOf(SWEEPS[k - 1]).name : null,
    finished: mine === null && k >= SWEEPS.length,
    front,
    /** The keyboard reaches the map (true) or leaves it: the drone's run waits for it meanwhile. */
    hold: setHeld,
    /** A gesture washes its first panel: the visitor takes over from what the map shows now. */
    begin() {
      if (!live.current) {
        live.current = current();
        setMine({ cells: live.current, version: version.current, front: null });
      }
      history.current.push(live.current);
    },
    /** One pass over the cells a drag crossed (the gesture's state was kept at its first). */
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
      if (prev) show(prev, null);
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
type Drag = { id: number; sx: number; sy: number; started: boolean; begun: boolean; last: number; prev: Point };

/**
 * The map as a control: a labelled slider (its value is the panels washed) that takes drags, presses
 * and taps, and the keyboard: Right or Up gives the next floor a pass, Left or Down steps back, Home
 * starts again, End washes every floor. The drone glyph rides under a mouse or pen; on touch a sideways
 * drag washes and an upward or downward one still scrolls the page. Nothing is taken over until a
 * gesture washes a panel, so a scroll that starts on the map, or a press in a gap, leaves it as it was.
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
    if (!hit.length) return;
    if (!d.begun) {
      d.begun = true;
      wash.begin();
    }
    wash.stroke(hit);
  };
  const schedule = () => {
    if (!frame.current) frame.current = requestAnimationFrame(flush);
  };
  const spray = (on: boolean) => glyph.current?.toggleAttribute("data-spray", on);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const p = at(e);
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, started: false, begun: false, last: -2, prev: p };
    // A mouse or pen keeps the map until it lets go, wherever it goes, so every press ends here.
    if (e.pointerType !== "touch") e.currentTarget.setPointerCapture(e.pointerId);
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
    // A mouse or pen moving with no button held has let go somewhere the map never heard: that press is over.
    if (e.pointerType !== "touch" && !(e.buttons & 1)) {
      end(e, false);
      return;
    }
    if (!d.started) {
      const dx = e.clientX - d.sx;
      const dy = e.clientY - d.sy;
      if (Math.hypot(dx, dy) < 4) return;
      // On touch only a sideways drag washes: an upward or downward one is the page's to scroll.
      if (e.pointerType === "touch" && Math.abs(dy) >= Math.abs(dx)) return;
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
      if (cell < 0) return;
      wash.begin();
      wash.floor(cell);
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
      aria-valuetext={`${wash.washed} of ${wash.total} panels washed${wash.once ? `, ${wash.once} with one pass` : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => end(e, true)}
      onPointerCancel={(e) => end(e, false)}
      onPointerEnter={(e) => hover(true, e)}
      onPointerLeave={(e) => hover(false, e)}
      onKeyDown={onKeyDown}
      onFocus={(e) => wash.hold(e.currentTarget.matches(":focus-visible"))}
      onBlur={() => wash.hold(false)}
      className="group/map relative cursor-none touch-pan-y select-none rounded-hard"
    >
      <FacadeMap cells={wash.cells} version={wash.version} wash debris selected={null} ease debrisLayer decorative strong />
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
