"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { useCanRender3d, useMediaQuery, useOnScreen } from "@/lib/hooks";
import { captureVariant, isCapture, now, onTick } from "@/lib/clock";
import { bindPlayback } from "@/lib/video";
import { layers as LAYERS, type LayerId, type StepId, type ZoneId } from "@/content/software";
import { DEFAULT_LAYERS, createControl, type HoverInfo, type Layers, type SceneControl } from "@/components/three/software/control";
import { MODELS, type Activity, type ModelId, type WindowModel } from "./models";

export type { StepId } from "@/content/software";

const PanelReadouts = dynamic(() => import("./PanelReadouts"), { ssr: false, loading: () => <p className="mt-3 text-caption" role="status">Loading panel data…</p> });

const SoftwareScene = dynamic(() => import("@/components/three/SoftwareScene"), { ssr: false, loading: () => null });

const CYCLE_MS = 48000;
const HOLD_MS = 2600;
// The recording shows a whole clean in twelve seconds.
const CAPTURE_CYCLE_MS = 10000;
const CAPTURE_HOLD_MS = 2000;
const noop = () => () => {};
/** The poster's fade once the live model has drawn its first frame. */
const POSTER_FADE_MS = 200;
/** The timeline thumb's width: the zone segments sit half of it in from each end, under its centre. */
const THUMB = 16;

/** The layers each step shows. Clean is the window's own default, so its first paint is unchanged. */
const PRESET_LAYERS: Record<StepId, Layers> = {
  map: { scan: true, wash: false, debris: false, zones: false },
  plan: { scan: false, wash: false, debris: false, zones: true },
  clean: { ...DEFAULT_LAYERS },
  rescan: { scan: false, wash: false, debris: true, zones: false },
  report: { scan: false, wash: true, debris: true, zones: false },
};

/** Each zone's cells, and each zone's washed share in whole percent (in the order of the model's zones). */
function deriveShares(model: WindowModel) {
  const zoneCells = model.zones.map((z) => model.cellZones.flatMap((zone, i) => (zone === z.id ? [i] : [])));
  const sharesOf = (cells: ArrayLike<number>) => zoneCells.map((ids) => Math.floor((100 * ids.filter((i) => cells[i] >= 0.999).length) / ids.length));
  return { sharesOf, demoShares: sharesOf(model.demo.cells) };
}
const SHARES: Record<ModelId, ReturnType<typeof deriveShares>> = { building: deriveShares(MODELS.building), solar: deriveShares(MODELS.solar) };

type Hover = { info: NonNullable<HoverInfo>; x: number; y: number };

/**
 * The live scene's life: off (not mounted), starting (mounted, not drawn yet), painted (first frame
 * drawn, the poster fading out) and settled (the poster unmounted). The poster covers the canvas
 * until the first frame.
 */
type Paint = "off" | "starting" | "painted" | "settled";

export type SoftwareWindowProps = {
  /** Applies a step's layers and camera in live mode. Unset: the window's default (the clean). */
  preset?: StepId;
  /** The window is in the first screen (/download): its stand-in frame is the page's LCP image, so it
   *  loads eagerly at high priority instead of lazily. */
  priority?: boolean;
  /** "inset": the window sits in a frame of its own (ProductClose), so it takes the frame's inner corner and no shadow. */
  frame?: "bare" | "inset";
  /** Which model the window runs: the 12-storey building (default) or the four-row solar array. */
  model?: ModelId;
};

/** Whether the window runs the live WebGL model: a capable device from 768px, and motion allowed. */
export function useSoftwareLive(): boolean {
  const can3d = useCanRender3d();
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  return can3d && !reduce;
}

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <rect x="1.5" y="1" width="2.5" height="8" fill="currentColor" />
      <rect x="6" y="1" width="2.5" height="8" fill="currentColor" />
    </svg>
  ) : (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2.5 1l6.5 4-6.5 4z" fill="currentColor" />
    </svg>
  );
}

/** A layer's key, as the model draws it: the scan's points, the washed glass, the debris shading, the zone outlines. */
function LayerKey({ id }: { id: LayerId }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="shrink-0">
      {id === "scan" ? (
        <g fill="var(--color-glass)">
          <circle cx="2.5" cy="2.5" r="1.25" />
          <circle cx="7.5" cy="2.5" r="1.25" />
          <circle cx="2.5" cy="7.5" r="1.25" />
          <circle cx="7.5" cy="7.5" r="1.25" />
        </g>
      ) : id === "wash" ? (
        <rect x="0.5" y="0.5" width="9" height="9" fill="var(--color-glass)" />
      ) : id === "debris" ? (
        <rect x="0.5" y="0.5" width="9" height="9" fill="#e0a13a" />
      ) : (
        <rect x="1" y="1" width="8" height="8" fill="none" stroke="var(--color-glass)" strokeWidth="1.5" strokeDasharray="2 1.5" />
      )}
    </svg>
  );
}

function Swatch({ colour, children }: { colour: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <span aria-hidden="true" className="size-2 shrink-0" style={{ background: colour }} />
      {children}
    </li>
  );
}

/** One figure of the clean, as a row: the name on the left, the value on the right. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-hairline py-2 first:border-t-0">
      <dt className="text-caption text-muted">{label}</dt>
      <dd className="readout whitespace-nowrap text-caption text-ink">{value}</dd>
    </div>
  );
}

/**
 * The desktop software as a window: the title bar, the layer bar, the model, the wash route's zones,
 * the inspector (the clean's progress, the facade map and its figures) and the wash timeline, then
 * its own notes row (the illustrative-model note and "Inspect panel data"), so a band never adds or
 * doubles the note.
 *
 * Live mode (a capable device from 768px, motion allowed) runs the WebGL model: on demand, only on
 * screen and while playing, with the poster over the canvas until the first frame. A `preset` from
 * the step tabs sets the layers and flies home to the overview; the toggles and zones still work
 * afterwards. The model reports what it draws (each panel's wash, the leg of the route, the camera's
 * heading), and the zones, the facade map, the status chip and the compass follow it. Recording mode
 * (phones, reduced motion, weak devices, no WebGL) plays a recording of the model and renders no
 * control it cannot honour: no layer toggles, no timeline, no chip or compass, the zones as a plain
 * list, the figures and the map at their demo values.
 *
 * The layout follows the window's own width (a container), not the page's: from 56rem the zones |
 * the model | the inspector, 34rem tall; from 38rem the model (28rem) over the zones as a row, the
 * inspector beside both; from 26rem (a half-width column on a desktop) the model square, the zones as
 * a row, the inspector in two columns (progress and figures | the map); below that (phones) the model
 * at 4:5, the zones two by two, then the inspector. Both
 * modes render the same rows at the same heights, so the switch to live mode after hydration moves
 * nothing.
 *
 * The window is always light (`on-light`) and marked `data-ui`, whatever band it sits on; its notes
 * row underneath takes the band's colours. The recording has no poster attribute: a lazy `<img>`
 * under the video stands in until its first frame.
 */
export function SoftwareWindow({ preset, priority = false, frame = "bare", model = "building" }: SoftwareWindowProps) {
  const M = MODELS[model];
  const { sharesOf, demoShares } = SHARES[model];
  const { project, zones } = M;
  const can3d = useCanRender3d();
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const wide = useMediaQuery("(min-width: 768px)");
  const finePointer = useMediaQuery("(pointer: fine)");
  const [nearRef, near] = useOnScreen<HTMLDivElement>("600px 0px 600px 0px");
  const [viewRef, onScreen] = useOnScreen<HTMLDivElement>("0px");
  const controlRef = useRef(createControl(M.cellCount));
  const needleRef = useRef<SVGSVGElement>(null);
  const northRef = useRef<HTMLSpanElement>(null);
  const [layers, setLayers] = useState<Layers>(() => ({ ...PRESET_LAYERS[preset ?? "clean"] }));
  const [readoutsOpen, setReadoutsOpen] = useState(false);
  const [selected, setSelected] = useState<ZoneId | null>(null);
  const [wash, setWash] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [completed, setCompleted] = useState(0);
  const [shares, setShares] = useState<number[]>(() => zones.map(() => 0));
  const [mapVersion, setMapVersion] = useState(0);
  // The model's cells as the map last drew them: copied from the scene's each time they change.
  const [liveCells] = useState(() => new Float32Array(M.cellCount));
  const [activity, setActivity] = useState<Activity | null>(null);
  const [spans, setSpans] = useState<SceneControl["spans"]>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const [paint, setPaint] = useState<Paint>("off");
  const dragging = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  // The recording loads and plays only once its first-frame image has painted, so that image, not the
  // video's own first frame, is the largest paint when the window is in the first screen (/download).
  const [posterShown, setPosterShown] = useState(false);
  const live = can3d && !reduce;
  const capture = useSyncExternalStore(noop, captureVariant, () => null);

  // A new preset moves the window's own state with it (the scene gets the same values below).
  // Every preset flies home to the overview, so none keeps a zone selected.
  const [presetShown, setPresetShown] = useState(preset);
  if (preset !== presetShown) {
    setPresetShown(preset);
    if (preset) {
      setLayers({ ...PRESET_LAYERS[preset] });
      setSelected(null);
      if (preset === "clean") setPlaying(true);
      // The report shows the clean finished: the wash held at 100% with every panel done.
      if (preset === "report") {
        setPlaying(false);
        setWash(100);
        setCompleted(M.cellCount);
      }
    }
  }

  // The scene mounts when the window comes within 600px of the screen and unmounts when it is far
  // away again, but never before its first frame: R3F creates the canvas asynchronously and throws
  // if it is unmounted mid-creation (a fast scroll past the window). The poster covers it meanwhile.
  const nextPaint: Paint = !live ? "off" : near ? (paint === "off" ? "starting" : paint) : paint === "starting" ? "starting" : "off";
  if (nextPaint !== paint) setPaint(nextPaint);

  // Write the preset into the scene. The first one applied skips the flight: the camera already
  // starts on the overview, so a first paint on Clean is exactly the window's default.
  const presetInScene = useRef<StepId | null>(null);
  useEffect(() => {
    if (!live || !preset || presetInScene.current === preset) return;
    const first = presetInScene.current === null;
    presetInScene.current = preset;
    const control = controlRef.current;
    control.layers = { ...PRESET_LAYERS[preset] };
    control.selected = null;
    if (!first) control.flyTo = "overview";
    if (preset === "map") control.scanStartedAt = now();
    if (preset === "report") control.wash = 1;
    control.requestFrame();
  }, [live, preset]);

  const onFirstFrame = useCallback(() => setPaint((p) => (p === "starting" ? "painted" : p)), []);

  useEffect(() => {
    if (paint !== "painted") return;
    const t = window.setTimeout(() => setPaint("settled"), POSTER_FADE_MS + 50);
    return () => window.clearTimeout(t);
  }, [paint]);

  // Warm the three.js chunk in idle time so its evaluation never lands mid-scroll.
  useEffect(() => {
    if (!live) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const warm = () => {
      void import("@/components/three/SoftwareScene");
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(warm, { timeout: 3000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(warm, 1500);
    return () => window.clearTimeout(t);
  }, [live]);

  useEffect(() => {
    const control = controlRef.current;
    control.active = live && onScreen && playing;
    control.visible = live && onScreen;
    control.requestFrame();
  }, [live, onScreen, playing]);

  useEffect(() => {
    controlRef.current.onHover = (info, x, y) => {
      if (!info) return setHover(null);
      const r = viewRef.current?.getBoundingClientRect();
      const width = r?.width ?? 400;
      const height = r?.height ?? 400;
      // The card is 224px wide and at most about 124px tall: keep it inside the model's view.
      setHover({ info, x: Math.max(8, Math.min(x - (r?.left ?? 0) + 14, width - 232)), y: Math.max(8, Math.min(y - (r?.top ?? 0) + 14, height - 132)) });
    };
  }, [viewRef]);

  // The wash runs along the route on its own while playing; the timeline scrubs it. While the window
  // is on screen (playing or paused, so a scrub shows too) the numbers, the zones, the map, the chip
  // and the compass follow what the model last drew.
  useEffect(() => {
    if (!live || !onScreen) return;
    const control = controlRef.current;
    const capture = isCapture();
    const cycle = capture ? CAPTURE_CYCLE_MS : CYCLE_MS;
    const hold = capture ? CAPTURE_HOLD_MS : HOLD_MS;
    let raf = 0;
    let last = now();
    let holdUntil = 0;
    let shown = -1;
    let shownDone = -1;
    let shownHalves = -1;
    let shownLeg = "";
    let shownSpans: SceneControl["spans"] = null;
    let shownHeading = NaN;
    const tick = () => {
      const t = now();
      const dt = capture ? Math.max(0, t - last) : Math.max(0, Math.min(100, t - last));
      last = t;
      if (playing && !dragging.current && control.layers.wash) {
        if (control.wash >= 1) {
          if (!holdUntil) holdUntil = t + hold;
          else if (t >= holdUntil) {
            control.wash = 0;
            holdUntil = 0;
          }
        } else control.wash = Math.min(1, control.wash + dt / cycle);
      }
      const pct = Math.round(control.wash * 200) / 2;
      if (pct !== shown) {
        shown = pct;
        setWash(pct);
      }
      if (control.stats.completed !== shownDone) {
        shownDone = control.stats.completed;
        setCompleted(shownDone);
      }
      let halves = 0;
      for (let i = 0; i < control.cells.length; i++) halves += control.cells[i];
      halves = Math.round(halves * 2);
      if (halves !== shownHalves) {
        shownHalves = halves;
        liveCells.set(control.cells);
        setMapVersion(halves);
        setShares(sharesOf(liveCells));
      }
      const a = control.activity;
      const leg = a ? `${a.zone}|${a.floor}|${a.pass}|${a.moving}` : "";
      if (leg !== shownLeg) {
        shownLeg = leg;
        setActivity(a ? { ...a } : null);
      }
      if (control.spans !== shownSpans) {
        shownSpans = control.spans;
        setSpans(control.spans);
      }
      // The compass turns with the camera: north is +z, which the camera faces at azimuth π. The
      // needle turns; the N stays upright and rides round the dial at the needle's tip.
      if (needleRef.current && northRef.current && Number.isFinite(control.azimuth) && control.azimuth !== shownHeading) {
        shownHeading = control.azimuth;
        const a = control.azimuth + Math.PI;
        needleRef.current.style.transform = `rotate(${a}rad)`;
        northRef.current.style.transform = `translate(${(Math.sin(a) * 15).toFixed(2)}px, ${(-Math.cos(a) * 15).toFixed(2)}px)`;
      }
      if (!capture) raf = requestAnimationFrame(tick);
    };
    if (capture) return onTick(tick);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live, onScreen, playing, liveCells, sharesOf]);

  // The image may have loaded before hydration, when its onLoad had no listener yet.
  useEffect(() => {
    const img = posterRef.current;
    if (live || !img?.complete || !img.naturalWidth) return;
    const id = requestAnimationFrame(() => setPosterShown(true));
    return () => cancelAnimationFrame(id);
  }, [live, wide]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || live || reduce || !playing || !posterShown) {
      el?.pause();
      return;
    }
    return bindPlayback(el, 0.2);
  }, [live, reduce, wide, playing, posterShown]);

  const toggle = useCallback((id: LayerId) => {
    const control = controlRef.current;
    const next = { ...control.layers, [id]: !control.layers[id] };
    control.layers = next;
    if (id === "scan" && next.scan) control.scanStartedAt = now();
    setLayers(next);
    control.requestFrame();
  }, []);

  const fly = useCallback(
    (id: ZoneId | null) => {
      const control = controlRef.current;
      const next = id === null || selected === id ? null : id;
      setSelected(next);
      control.selected = next;
      control.flyTo = next ?? "overview";
      if (next && !control.layers.zones) {
        control.layers = { ...control.layers, zones: true };
        setLayers(control.layers);
      }
      control.requestFrame();
    },
    [selected],
  );

  const scrub = (value: number) => {
    const control = controlRef.current;
    control.wash = value / 100;
    setWash(value);
    control.requestFrame();
  };

  const pct = live ? wash : M.demo.wash;
  const done = live ? completed : M.demo.completed;
  const cells = live ? liveCells : M.demo.cells;
  const zoneShares = live ? shares : demoShares;
  const variant = wide ? "wide" : "tall";
  const tall = capture === "tall";
  const showsPlaying = playing && !reduce;
  const complete = pct >= 100;
  // Whole percent, rounded down, so 100% shows only once the clean is complete.
  const shownPct = Math.floor(pct);
  const status = !live ? null : complete ? "Complete" : !layers.wash ? "Wash hidden" : showsPlaying ? "In progress" : "Paused";
  const lines = live && layers.wash && activity ? M.legLines(activity, complete) : null;
  const segments = spans ? zones.map((z) => ({ id: z.id, from: spans[z.id]?.[0] ?? 0, to: spans[z.id]?.[1] ?? 1 })) : [{ id: "all", from: 0, to: 1 }];
  const activeZone = live && layers.wash && !complete && activity && !activity.moving ? activity.zone : null;

  const pause = (
    <button
      type="button"
      onClick={() => setPlaying((p) => !p)}
      disabled={reduce}
      aria-label={showsPlaying ? "Pause preview" : "Play preview"}
      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-white text-ink shadow-[0_1px_2px_rgb(17_26_34/0.08)] transition-[background-color,border-color] duration-200 ease-instrument hover:border-border-strong hover:bg-raised disabled:opacity-40"
    >
      <PlayIcon playing={showsPlaying} />
    </button>
  );

  return (
    <div ref={nearRef} data-ui="" data-software-preview data-model={model} data-preset={preset} data-live={live ? "" : undefined} data-painted={live && (paint === "painted" || paint === "settled") ? "" : undefined}>
      <div
        role="group"
        aria-label={`${project.app}, demo window`}
        className={`on-light @container overflow-hidden border border-line bg-plaster text-fg ${frame === "inset" ? "rounded-[0.5rem]" : "rounded-[0.75rem] shadow-[0_1px_2px_rgb(17_26_34/0.05),0_28px_56px_-28px_rgb(17_26_34/0.22)]"}`}
      >
        <div className="flex h-11 items-center justify-between gap-3 border-b border-hairline bg-raised px-3 @min-[38rem]:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span aria-hidden="true" className="hidden shrink-0 gap-1.5 @min-[30rem]:flex">
              <span className="size-2.5 rounded-full bg-hairline" />
              <span className="size-2.5 rounded-full bg-hairline" />
              <span className="size-2.5 rounded-full bg-hairline" />
            </span>
            <span className="truncate whitespace-nowrap text-small font-medium text-ink">{project.app}</span>
            <span className="hidden min-w-0 items-center gap-2 text-small text-muted @min-[38rem]:flex">
              <svg width="6" height="10" viewBox="0 0 6 10" aria-hidden="true" className="shrink-0 text-border-strong">
                <path d="M1 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              <span className="truncate">{project.name}</span>
              <svg width="6" height="10" viewBox="0 0 6 10" aria-hidden="true" className="hidden shrink-0 text-border-strong @min-[48rem]:block">
                <path d="M1 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              <span className="hidden whitespace-nowrap text-ink @min-[48rem]:inline">{project.view}</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="label flex items-center gap-1.5 whitespace-nowrap text-ink">
              <span className={`size-1.5 rounded-full ${showsPlaying ? "bg-water" : "bg-border-strong"}`} aria-hidden="true" />
              Preview
            </span>
            <span className="label whitespace-nowrap rounded-hard border border-hairline bg-white px-1.5 py-1 text-muted">Demo data</span>
          </div>
        </div>

        {live ? (
          <div className="flex h-12 items-center justify-between gap-3 border-b border-hairline px-2 @min-[38rem]:px-3">
            <div className="flex items-center gap-0.5 rounded-[0.5rem] border border-hairline bg-raised p-0.5" role="group" aria-label="Layers">
              {LAYERS.map((l) => {
                const on = layers[l.id];
                return (
                  <button
                    key={l.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(l.id)}
                    className={`flex h-8 items-center gap-1.5 rounded-hard px-2.5 text-small transition-[background-color,color,box-shadow] duration-200 ease-instrument ${
                      on ? "bg-white text-ink shadow-[0_0_0_1px_var(--color-border-strong),0_1px_2px_rgb(17_26_34/0.1)]" : "text-muted hover:text-ink"
                    }`}
                  >
                    <span className={`transition-opacity duration-200 ${on ? "opacity-100" : "opacity-40"}`}>
                      <LayerKey id={l.id} />
                    </span>
                    {l.label}
                  </button>
                );
              })}
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <span className="hidden truncate text-caption text-muted @min-[46rem]:inline">{finePointer ? "Drag to orbit" : "Auto orbit"}</span>
              <button
                type="button"
                onClick={() => fly(null)}
                className="flex h-8 shrink-0 items-center gap-1.5 rounded-hard border border-hairline bg-white px-2.5 text-small text-ink transition-[background-color,border-color] duration-200 ease-instrument hover:border-border-strong hover:bg-raised"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="text-muted">
                  <path d="M1 4V1h3M8 1h3v3M11 8v3H8M4 11H1V8" fill="none" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                Overview
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-12 items-center justify-between gap-3 border-b border-hairline px-3 @min-[38rem]:px-4">
            <span className="truncate text-caption text-muted">Recording of the model</span>
            {pause}
          </div>
        )}

        <div className={tall ? "grid" : "grid @min-[38rem]:grid-cols-[minmax(0,1fr)_15rem] @min-[56rem]:grid-cols-[14rem_minmax(0,1fr)_16rem]"}>
          <div
            ref={viewRef}
            data-model-view=""
            className={`relative bg-raised ${tall ? "aspect-[4/5]" : "aspect-[4/5] @min-[26rem]:@max-[38rem]:aspect-square @min-[38rem]:col-start-1 @min-[38rem]:row-start-1 @min-[38rem]:aspect-auto @min-[38rem]:h-[28rem] @min-[56rem]:col-start-2 @min-[56rem]:h-[34rem]"}`}
            onPointerLeave={() => setHover(null)}
          >
            {live ? (
              <>
                <div className="absolute inset-0" aria-hidden="true">
                  {paint !== "off" ? <SoftwareScene model={model} controlRef={controlRef} onFirstFrame={onFirstFrame} /> : null}
                </div>
                {paint !== "settled" ? (
                  // The recording's poster is 1020x756: contained, so the roof and the base stay in frame.
                  <img
                    src={`/video/${M.video}-wide-poster.jpg`}
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                    fetchPriority={priority ? "high" : "low"}
                    className={`pointer-events-none absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ease-instrument ${paint === "painted" ? "opacity-0" : "opacity-100"}`}
                  />
                ) : null}
                {lines && !tall ? (
                  <div className="pointer-events-none absolute left-3 top-3 max-w-[calc(100%-5rem)] rounded-[0.5rem] border border-hairline bg-white px-3 py-2 shadow-[0_8px_20px_-10px_rgb(17_26_34/0.3)]">
                    <p className="flex items-center gap-2 text-caption font-medium text-ink">
                      <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${complete ? "bg-glass" : showsPlaying ? "bg-water" : "bg-border-strong"}`} />
                      <span className="truncate">{showsPlaying || complete ? lines[0] : `Paused · ${lines[0]}`}</span>
                    </p>
                    <p className="readout mt-0.5 truncate pl-3.5 text-[0.6875rem] text-muted">{lines[1]}</p>
                  </div>
                ) : null}
                {tall ? null : (
                  <div aria-hidden="true" className="pointer-events-none absolute right-3 top-3 size-11 rounded-full border border-hairline bg-white shadow-[0_8px_20px_-10px_rgb(17_26_34/0.3)]">
                    <svg ref={needleRef} viewBox="0 0 44 44" className="absolute inset-0 size-full" style={{ transform: "rotate(220deg)" }}>
                      <path d="M22 13l3 9h-6z" fill="var(--color-glass)" />
                      <path d="M22 31l3-9h-6z" fill="var(--color-hairline)" />
                    </svg>
                    <span ref={northRef} className="absolute left-[calc(50%-0.5rem)] top-[calc(50%-0.5rem)] flex size-4 items-center justify-center text-[0.6875rem] font-semibold leading-none text-glass" style={{ transform: "translate(-10px, 11px)" }}>
                      N
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* The recording's first frame until the video has one of its own: a lazy image, not a
                    poster attribute, so it never competes with the page's first screen. */}
                <img
                  key={`${variant}-poster`}
                  ref={posterRef}
                  onLoad={() => setPosterShown(true)}
                  src={`/video/${M.video}-${variant}-poster.jpg`}
                  alt=""
                  aria-hidden="true"
                  loading={priority ? "eager" : "lazy"}
                  fetchPriority={priority ? "high" : "auto"}
                  decoding="async"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover md:object-contain"
                />
                {/* One pixel short at the top: Chrome rounds the image's painted rect but floors the video's,
                    so a full-size video can be one row larger than the image and take over as the page's
                    largest paint. The strip shows the image's own background beneath. */}
                <video
                  key={variant}
                  ref={videoRef}
                  className="absolute inset-x-0 bottom-0 top-px h-[calc(100%-1px)] w-full object-cover md:object-contain"
                  muted
                  loop
                  playsInline
                  preload={posterShown ? "metadata" : "none"}
                  controls={reduce}
                  aria-label={M.recordingLabel}
                >
                  <source src={`/video/${M.video}-${variant}.webm`} type="video/webm" />
                  <source src={`/video/${M.video}-${variant}.mp4`} type="video/mp4" />
                </video>
              </>
            )}
            {hover ? (
              <div
                className="pointer-events-none absolute z-10 w-56 rounded-[0.5rem] border border-hairline bg-white px-3 py-2.5 text-caption shadow-[0_12px_28px_-12px_rgb(17_26_34/0.35)]"
                style={{ left: hover.x, top: hover.y }}
                aria-hidden="true"
              >
                <span className="block font-medium text-ink">{hover.info.zone}</span>
                <span className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 border-t border-hairline pt-1.5">
                  <span className="text-muted">Surface</span>
                  <span className="text-right text-ink">{hover.info.surface}</span>
                  <span className="text-muted">Pressure</span>
                  <span className="readout text-right text-ink">{hover.info.pressure}</span>
                  <span className="text-muted">Last washed</span>
                  <span className="text-right text-ink">{hover.info.lastWashed}</span>
                  {hover.info.debris > 0.2 ? (
                    <>
                      <span className="text-muted">{M.debrisHover}</span>
                      <span className="readout text-right text-debris-text">{Math.round(hover.info.debris * 100)}%</span>
                    </>
                  ) : null}
                </span>
              </div>
            ) : null}
          </div>

          {tall ? null : (
            <div className="flex flex-col border-t border-hairline @min-[38rem]:col-start-1 @min-[38rem]:row-start-2 @min-[56rem]:row-start-1 @min-[56rem]:border-r @min-[56rem]:border-t-0">
              <div className="hidden items-baseline justify-between px-4 pb-3 pt-4 @min-[56rem]:flex">
                <p className="label text-muted">Wash route</p>
                <span className="text-caption text-muted">
                  {zones.length} {M.zoneNoun.many}
                </span>
              </div>
              <ol className="grid grid-cols-2 gap-px bg-hairline @min-[26rem]:@max-[38rem]:grid-cols-4 @min-[38rem]:grid-cols-4 @min-[56rem]:grid-cols-1 @min-[56rem]:border-y @min-[56rem]:border-hairline">
                {zones.map((z, i) => {
                  const share = zoneShares[i];
                  const isDone = share >= 100;
                  const active = activeZone === z.id;
                  const chosen = selected === z.id;
                  const statusText = isDone ? "Done" : share > 0 || active ? `${share}%` : "Queued";
                  const rowStatus = active && !isDone ? "Washing" : statusText;
                  // From 56rem a list: the order, the name and the status on one line, the zone's surface
                  // under it, then its bar. Below, a row of four (or two by two): the name, the bar, the status.
                  const body = (
                    <>
                      <span className="flex flex-1 items-start gap-2.5 @min-[56rem]:flex-none @min-[56rem]:items-center">
                        <span
                          aria-hidden="true"
                          className={`readout hidden size-5 shrink-0 items-center justify-center rounded-full border text-[0.6875rem] leading-none @min-[56rem]:flex ${
                            isDone ? "border-glass bg-glass text-white" : active ? "border-glass text-glass" : "border-hairline text-muted"
                          }`}
                        >
                          {isDone ? (
                            <svg width="10" height="10" viewBox="0 0 10 10">
                              <path d="M2 5.2l2 2 4-4.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                          ) : (
                            z.order
                          )}
                        </span>
                        <span className="min-w-0 flex-1 text-caption font-medium leading-snug text-ink @min-[56rem]:text-small">{z.name}</span>
                        <span className={`readout hidden shrink-0 text-caption @min-[56rem]:inline ${active ? "text-glass" : "text-muted"}`}>{statusText}</span>
                      </span>
                      <span className="mt-1 hidden pl-7.5 text-caption text-muted @min-[56rem]:block">
                        {z.surface} · {z.preset} · {z.pressure}
                      </span>
                      <span aria-hidden="true" className="mt-2.5 block h-1 overflow-hidden rounded-full bg-sunken @min-[56rem]:ml-7.5">
                        <span className="block h-full bg-glass" style={{ width: `${share}%` }} />
                      </span>
                      <span className={`readout mt-1.5 flex items-center gap-1.5 text-[0.6875rem] @min-[56rem]:hidden ${active ? "text-glass" : "text-muted"}`}>
                        {isDone || active ? <span aria-hidden="true" className={`size-1.5 rounded-full ${isDone ? "bg-glass" : "bg-water"}`} /> : null}
                        {rowStatus}
                      </span>
                    </>
                  );
                  return (
                    <li key={z.id} className="bg-plaster">
                      {live ? (
                        <button
                          type="button"
                          onClick={() => fly(z.id)}
                          aria-pressed={chosen}
                          className={`relative flex h-full w-full flex-col px-4 py-3 text-left transition-[background-color] duration-200 ease-instrument focus-visible:-outline-offset-2 ${
                            chosen
                              ? "bg-tint before:absolute before:bg-glass @max-[56rem]:before:inset-x-0 @max-[56rem]:before:bottom-0 @max-[56rem]:before:h-0.5 @min-[56rem]:before:inset-y-0 @min-[56rem]:before:left-0 @min-[56rem]:before:w-0.5"
                              : "hover:bg-raised"
                          }`}
                        >
                          {body}
                        </button>
                      ) : (
                        <div className="flex h-full flex-col px-4 py-3">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
              <p className="mt-auto hidden px-4 py-3 text-caption text-muted @min-[56rem]:block">
                {M.routeNote}
                {live ? ` Select a ${M.zoneNoun.one} to fly to it.` : ""}
              </p>
            </div>
          )}

          {tall ? null : (
            <div className="flex flex-col border-t border-hairline @min-[26rem]:@max-[38rem]:grid @min-[26rem]:@max-[38rem]:grid-cols-2 @min-[38rem]:col-start-2 @min-[38rem]:row-span-2 @min-[38rem]:row-start-1 @min-[38rem]:border-l @min-[38rem]:border-t-0 @min-[56rem]:col-start-3 @min-[56rem]:row-span-1">
              {/* Progress and figures: one column beside the map from 26rem to 38rem, else (contents) items of the inspector's own column. */}
              <div className="contents @min-[26rem]:@max-[38rem]:col-start-1 @min-[26rem]:@max-[38rem]:row-start-1 @min-[26rem]:@max-[38rem]:flex @min-[26rem]:@max-[38rem]:flex-col">
                <div className="order-1 px-4 pb-4 pt-4">
                  <div className="flex h-5 items-center justify-between gap-3">
                    <p className="label text-muted">This clean</p>
                    {status ? (
                      <span className="flex items-center gap-1.5 text-caption text-muted">
                        <span aria-hidden="true" className={`size-1.5 rounded-full ${status === "In progress" ? "bg-water" : status === "Complete" ? "bg-glass" : "bg-border-strong"}`} />
                        {status}
                      </span>
                    ) : null}
                  </div>
                  <p className="readout mt-3 flex items-baseline gap-0.5 text-ink">
                    <span className="text-[2.5rem] font-light leading-none tracking-[-0.04em]">{shownPct}</span>
                    <span className="text-small text-muted">%</span>
                    <span className="sr-only"> of the route</span>
                  </p>
                  <span aria-hidden="true" className="mt-3 block h-1 overflow-hidden rounded-full bg-sunken">
                    <span className="block h-full bg-glass" style={{ width: `${pct}%` }} />
                  </span>
                  <p className="mt-2 text-caption text-muted">
                    <span className="readout text-ink">{done}</span> of {M.cellCount} panels washed
                  </p>
                </div>

                <dl className="order-3 mt-auto border-t border-hairline px-4 py-1.5">
                  <Fact label="Scan age" value={project.scanAge} />
                  <Fact label={M.debrisFact} value={String(project.debrisZones)} />
                  <Fact label="Next scheduled clean" value={project.nextClean} />
                </dl>
              </div>

              <div className="order-2 border-t border-hairline px-4 py-4 @min-[26rem]:@max-[38rem]:col-start-2 @min-[26rem]:@max-[38rem]:row-start-1 @min-[26rem]:@max-[38rem]:border-l @min-[26rem]:@max-[38rem]:border-t-0">
                <p className="label text-muted">{M.mapLabel}</p>
                <div className="mt-3">
                  <M.Map cells={cells} version={live ? mapVersion : -1} wash={live ? layers.wash : true} debris={live ? layers.debris : true} selected={live ? selected : null} />
                </div>
                {M.mapAxis ? (
                  <div aria-hidden="true" className="mt-1.5 grid text-[0.6875rem] text-muted" style={{ gridTemplateColumns: M.mapAxis.columns }}>
                    {M.mapAxis.labels.map((l, i) => (
                      <span key={i} className="whitespace-nowrap">
                        {l}
                      </span>
                    ))}
                  </div>
                ) : null}
                <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[0.6875rem] text-muted @max-[26rem]:grid-cols-4">
                  {M.legend.map((l) => (
                    <Swatch key={l.label} colour={l.colour}>
                      {l.label}
                    </Swatch>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {live ? (
          <div className="flex h-14 items-center gap-3 border-t border-hairline px-3 @min-[38rem]:px-4">
            {pause}
            <span className="label hidden text-muted @min-[38rem]:inline">Wash</span>
            <div className="relative h-8 min-w-0 flex-1">
              <div aria-hidden="true" className="pointer-events-none absolute top-[calc(50%-3px)] h-1.5" style={{ left: THUMB / 2, right: THUMB / 2 }}>
                <span className="absolute inset-x-0 top-[calc(50%-0.5px)] border-t border-dashed border-border-strong/50" />
                {segments.map((s) => {
                  const fill = Math.min(1, Math.max(0, (pct / 100 - s.from) / Math.max(1e-6, s.to - s.from)));
                  return (
                    <span
                      key={s.id}
                      className={`absolute inset-y-0 overflow-hidden rounded-full ${selected && s.id !== selected ? "bg-sunken/60" : "bg-sunken"}`}
                      style={{ left: `${s.from * 100}%`, width: `calc(${(s.to - s.from) * 100}% - 2px)` }}
                    >
                      <span className="block h-full bg-glass" style={{ width: `${fill * 100}%` }} />
                    </span>
                  );
                })}
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={pct}
                onChange={(e) => scrub(Number(e.target.value))}
                onPointerDown={() => {
                  dragging.current = true;
                }}
                onPointerUp={() => {
                  dragging.current = false;
                }}
                onBlur={() => {
                  dragging.current = false;
                }}
                aria-label="Wash progress"
                aria-valuetext={lines ? `${shownPct}%, ${lines[0]}, ${lines[1]}` : `${shownPct}%`}
                className="timeline timeline-bare absolute inset-0 h-full w-full"
                style={{ "--fill": `${pct}%` } as CSSProperties}
              />
            </div>
            <span className="readout w-11 shrink-0 text-right text-small text-ink">{shownPct}%</span>
          </div>
        ) : (
          // The live timeline's row, held empty from 768 in recording mode (and the server render), so
          // a capable device's switch to live mode after hydration moves nothing below the window.
          <div aria-hidden="true" className="hidden h-14 border-t border-hairline md:block" />
        )}
      </div>

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:justify-between">
        <p className="text-caption text-fg-muted">Model is illustrative. The software will render each property from its scan.</p>
        <details className="text-caption text-fg-muted md:w-md" onToggle={(e) => setReadoutsOpen(e.currentTarget.open)}>
          <summary className="link cursor-pointer">Inspect panel data</summary>
          {readoutsOpen ? <PanelReadouts model={model} /> : null}
        </details>
      </div>
    </div>
  );
}
