"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useCanRender3d, useMediaQuery, useOnScreen } from "@/lib/hooks";
import { captureVariant, isCapture, now, onTick } from "@/lib/clock";
import { bindPlayback } from "@/lib/video";
import { layers as LAYERS, project, zones, type LayerId, type StepId, type ZoneId } from "@/content/software";
import { DEFAULT_LAYERS, createControl, type HoverInfo, type Layers } from "@/components/three/software/control";

export type { StepId } from "@/content/software";

const PanelReadouts = dynamic(() => import("./PanelReadouts"), { ssr: false, loading: () => <p className="mt-3 text-caption" role="status">Loading panel data…</p> });

const SoftwareScene = dynamic(() => import("@/components/three/SoftwareScene"), { ssr: false, loading: () => null });

const CYCLE_MS = 48000;
const HOLD_MS = 2600;
// The recording shows a whole clean in twelve seconds.
const CAPTURE_CYCLE_MS = 10000;
const CAPTURE_HOLD_MS = 2000;
const noop = () => () => {};
const PANELS_IN_PLAN = 320;
const DEMO = { wash: 64, completed: 204 };
/** The poster's fade once the live model has drawn its first frame. */
const POSTER_FADE_MS = 200;

/** The layers each step shows. Clean is the window's own default, so its first paint is unchanged. */
const PRESET_LAYERS: Record<StepId, Layers> = {
  map: { scan: true, wash: false, debris: false, zones: false },
  plan: { scan: false, wash: false, debris: false, zones: true },
  clean: { ...DEFAULT_LAYERS },
  rescan: { scan: false, wash: false, debris: true, zones: false },
};

type Hover = { info: NonNullable<HoverInfo>; x: number; y: number };

/** The poster covers the live canvas until the model's first frame, then fades out and unmounts. */
type Paint = "waiting" | "painted" | "settled";

export type SoftwareWindowProps = {
  /** Applies a step's layers and camera in live mode. Unset: the window's default (the clean). */
  preset?: StepId;
  /** The band the window sits on; it sets the border. sunken (default): border-strong/40. raised: hairline. */
  tone?: "raised" | "sunken";
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
      <rect x="1" y="1" width="3" height="8" fill="currentColor" />
      <rect x="6" y="1" width="3" height="8" fill="currentColor" />
    </svg>
  ) : (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 1l7 4-7 4z" fill="currentColor" />
    </svg>
  );
}

/** One figure of the clean. In a row (768 to 1023) the values sit on one line under labels that may wrap. */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col border-t border-hairline py-2.5">
      <dt className="label text-muted">{label}</dt>
      <dd className="readout mt-auto pt-1 text-small text-ink">{value}</dd>
    </div>
  );
}

/**
 * The desktop software as a window: the title bar, the layer bar, the zone tree, the model, the
 * clean's figures and the wash timeline, then its own notes row (the illustrative-model note and
 * "Inspect panel data"), so a band never adds or doubles the note. About 672px tall from 1024.
 *
 * Live mode (a capable device from 768px, motion allowed) runs the WebGL model: on demand, only on
 * screen and while playing, with the poster over the canvas until the first frame. A `preset` from
 * the step tabs sets the layers and flies home to the overview; the toggles and zones still work
 * afterwards. Recording mode (phones, reduced motion, weak devices, no WebGL) plays a recording of
 * the model and renders no control it cannot honour: no layer toggles and no timeline, the zones as
 * a plain list, the figures at their demo values.
 *
 * From 1024: zones 216 | canvas | figures 240, the canvas 34rem tall. From 768 to 1023: the canvas
 * at 16:10, then (live) the four zone buttons as a row, then the figures as a five-column row.
 * Below 768: the tall recording at 4:5 and the figures in two columns.
 */
export function SoftwareWindow({ preset, tone = "sunken" }: SoftwareWindowProps) {
  const can3d = useCanRender3d();
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const wide = useMediaQuery("(min-width: 768px)");
  const [nearRef, near] = useOnScreen<HTMLDivElement>("600px 0px 600px 0px");
  const [viewRef, onScreen] = useOnScreen<HTMLDivElement>("0px");
  const controlRef = useRef(createControl());
  const [layers, setLayers] = useState<Layers>(() => ({ ...PRESET_LAYERS[preset ?? "clean"] }));
  const [readoutsOpen, setReadoutsOpen] = useState(false);
  const [selected, setSelected] = useState<ZoneId | null>(null);
  const [wash, setWash] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [completed, setCompleted] = useState(0);
  const [hover, setHover] = useState<Hover | null>(null);
  const [paint, setPaint] = useState<Paint>("waiting");
  const dragging = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
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
    }
  }

  // The scene unmounts when the window is far off screen; the poster covers it again until the
  // remounted scene draws.
  const sceneMounted = live && near;
  if (!sceneMounted && paint !== "waiting") setPaint("waiting");

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
    control.requestFrame();
  }, [live, preset]);

  const onFirstFrame = useCallback(() => setPaint((p) => (p === "waiting" ? "painted" : p)), []);

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
    control.requestFrame();
  }, [live, onScreen, playing]);

  useEffect(() => {
    controlRef.current.onHover = (info, x, y) => {
      if (!info) return setHover(null);
      const r = viewRef.current?.getBoundingClientRect();
      const width = r?.width ?? 400;
      setHover({ info, x: Math.min(x - (r?.left ?? 0) + 14, width - 208), y: y - (r?.top ?? 0) + 14 });
    };
  }, [viewRef]);

  // The wash runs along the route on its own; the timeline scrubs it, and the numbers follow the model.
  useEffect(() => {
    if (!live || !onScreen || !playing) return;
    const control = controlRef.current;
    const capture = isCapture();
    const cycle = capture ? CAPTURE_CYCLE_MS : CYCLE_MS;
    const hold = capture ? CAPTURE_HOLD_MS : HOLD_MS;
    let raf = 0;
    let last = now();
    let holdUntil = 0;
    let shown = -1;
    let shownDone = -1;
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
      if (!capture) raf = requestAnimationFrame(tick);
    };
    if (capture) return onTick(tick);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live, onScreen, playing]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || live || reduce || !playing) {
      el?.pause();
      return;
    }
    return bindPlayback(el, 0.2);
  }, [live, reduce, wide, playing]);

  const toggle = useCallback((id: LayerId) => {
    const control = controlRef.current;
    const next = { ...control.layers, [id]: !control.layers[id] };
    control.layers = next;
    if (id === "scan" && next.scan) control.scanStartedAt = now();
    setLayers(next);
    control.requestFrame();
  }, []);

  const fly = useCallback(
    (id: ZoneId) => {
      const control = controlRef.current;
      const next = selected === id ? null : id;
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

  const pct = live ? wash : DEMO.wash;
  const done = live ? completed : DEMO.completed;
  const variant = wide ? "wide" : "tall";
  const tall = capture === "tall";
  const border = tone === "sunken" ? "border-border-strong/40" : "border-hairline";
  const showsPlaying = playing && !reduce;

  const pause = (
    <button
      type="button"
      onClick={() => setPlaying((p) => !p)}
      disabled={reduce}
      aria-label={showsPlaying ? "Pause preview" : "Play preview"}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-hard border border-hairline text-ink hover:bg-sunken disabled:opacity-50"
    >
      <PlayIcon playing={showsPlaying} />
    </button>
  );

  return (
    <div ref={nearRef} data-software-preview data-preset={preset} data-live={live ? "" : undefined} data-painted={live && paint !== "waiting" ? "" : undefined}>
      <div role="group" aria-label={`${project.app}, demo window`} className={`overflow-hidden rounded-hard border bg-plaster text-ink ${border}`}>
        <div className="flex h-10 items-center justify-between border-b border-hairline px-3 text-small">
          <div className="flex min-w-0 items-center gap-3">
            <span className="whitespace-nowrap font-medium text-ink">{project.app}</span>
            <span className="hidden truncate text-muted sm:inline">{project.name}</span>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <span className="label flex items-center gap-2 whitespace-nowrap text-ink">
              <span className="h-1.5 w-1.5 bg-water" aria-hidden="true" />
              Preview
            </span>
            <span className="label whitespace-nowrap text-muted">Demo data</span>
          </div>
        </div>

        {live ? (
          <div className="flex h-10 items-center justify-between gap-3 border-b border-hairline px-2">
            <div className="flex items-center gap-1" role="group" aria-label="Layers">
              {LAYERS.map((l) => {
                const on = layers[l.id];
                return (
                  <button
                    key={l.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(l.id)}
                    className={`h-7 rounded-hard px-2.5 text-small transition-colors duration-150 ease-instrument ${on ? "bg-ink text-plaster" : "text-muted hover:bg-sunken hover:text-ink"}`}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
            <span className="truncate pr-1 text-caption text-muted">Auto orbit. Drag to look around.</span>
          </div>
        ) : (
          <div className="flex h-10 items-center justify-between gap-3 border-b border-hairline px-3">
            <span className="truncate text-caption text-muted">Recording of the model</span>
            {pause}
          </div>
        )}

        <div className={tall ? "grid" : "grid lg:grid-cols-[13.5rem_minmax(0,1fr)_15rem]"}>
          {tall ? null : live ? (
            <div className="border-t border-hairline lg:border-r lg:border-t-0">
              <p className="label hidden px-3 pb-2 pt-3 text-muted lg:block">Zones</p>
              <ul className="grid grid-cols-4 lg:block">
                {zones.map((z, i) => (
                  <li key={z.id} className={i > 0 ? "border-l border-hairline lg:border-l-0" : undefined}>
                    <button
                      type="button"
                      onClick={() => fly(z.id)}
                      aria-pressed={selected === z.id}
                      className={`flex h-full min-h-11 w-full flex-col justify-center px-3 text-left transition-colors duration-150 ease-instrument hover:bg-sunken lg:border-t lg:border-hairline lg:py-2.5 ${selected === z.id ? "bg-sunken" : ""}`}
                    >
                      <span className="block text-small text-ink">{z.name}</span>
                      <span className="hidden text-caption text-muted lg:block">
                        {z.surface}. {z.preset}, {z.pressure}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="hidden border-t border-hairline px-3 py-3 text-caption text-muted lg:block">Two passes per floor, top down. Click a zone to fly to it.</p>
            </div>
          ) : (
            <div className="hidden border-r border-hairline lg:block">
              <p className="label px-3 pb-2 pt-3 text-muted">Zones</p>
              <ul>
                {zones.map((z) => (
                  <li key={z.id} className="border-t border-hairline px-3 py-2.5">
                    <span className="block text-small text-ink">{z.name}</span>
                    <span className="block text-caption text-muted">
                      {z.surface}. {z.preset}, {z.pressure}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="border-t border-hairline px-3 py-3 text-caption text-muted">Two passes per floor, top down.</p>
            </div>
          )}

          <div
            ref={viewRef}
            className={`relative order-first bg-raised lg:order-none ${tall ? "aspect-[4/5]" : "aspect-[4/5] md:aspect-[16/10] lg:aspect-auto lg:h-[34rem]"}`}
            onPointerLeave={() => setHover(null)}
          >
            {live ? (
              <>
                <div className="absolute inset-0" aria-hidden="true">
                  {near ? <SoftwareScene controlRef={controlRef} onFirstFrame={onFirstFrame} /> : null}
                </div>
                {paint !== "settled" ? (
                  // The recording's poster is 1020x756: contained, so the roof and the base stay in frame.
                  <img
                    src="/video/software-view-wide-poster.jpg"
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                    className={`pointer-events-none absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ease-instrument ${paint === "painted" ? "opacity-0" : "opacity-100"}`}
                  />
                ) : null}
              </>
            ) : (
              <video
                key={variant}
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover md:object-contain"
                muted
                loop
                playsInline
                preload="metadata"
                controls={reduce}
                poster={`/video/software-view-${variant}-poster.jpg`}
                aria-label="Recording of the software view: the model of a 12-storey building being scanned and washed"
              >
                <source src={`/video/software-view-${variant}.webm`} type="video/webm" />
                <source src={`/video/software-view-${variant}.mp4`} type="video/mp4" />
              </video>
            )}
            {hover ? (
              <div
                className="pointer-events-none absolute z-10 w-max max-w-[16rem] rounded-hard bg-ink px-2.5 py-2 text-caption text-plaster"
                style={{ left: hover.x, top: hover.y }}
                aria-hidden="true"
              >
                <span className="block font-medium">{hover.info.zone}</span>
                <span className="block text-muted-on-dark">{hover.info.surface}</span>
                <span className="block text-muted-on-dark">Pressure {hover.info.pressure}</span>
                <span className="block text-muted-on-dark">Last washed {hover.info.lastWashed}</span>
                {hover.info.debris > 0.2 ? <span className="block text-muted-on-dark">Debris build-up {Math.round(hover.info.debris * 100)}%</span> : null}
              </div>
            ) : null}
          </div>

          <div className={tall ? "hidden" : "border-t border-hairline lg:border-l lg:border-t-0"}>
            <p className="label px-3 pb-2 pt-3 text-muted">This clean</p>
            <dl className="grid grid-cols-2 gap-x-4 px-3 pb-1 md:grid-cols-5 lg:block">
              <Stat label="Scan age" value={project.scanAge} />
              <Stat label="Wash progress" value={`${Math.round(pct)}%`} />
              <Stat label="Panels completed" value={`${done} / ${PANELS_IN_PLAN}`} />
              <Stat label="Debris zones found" value={String(project.debrisZones)} />
              <Stat label="Next scheduled clean" value={project.nextClean} />
            </dl>
          </div>
        </div>

        {live ? (
          <div className="flex h-12 items-center gap-3 border-t border-hairline px-3">
            {pause}
            <span className="label w-12 text-muted">Wash</span>
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
              className="timeline min-w-0 flex-1"
              style={{ "--fill": `${pct}%` } as CSSProperties}
            />
            <span className="readout w-12 text-small text-ink">{Math.round(pct)}%</span>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:justify-between">
        <p className="text-caption text-muted">Model is illustrative. The software will render each property from its scan.</p>
        <details className="text-caption text-muted md:w-md" onToggle={(e) => setReadoutsOpen(e.currentTarget.open)}>
          <summary className="cursor-pointer underline underline-offset-4">Inspect panel data</summary>
          {readoutsOpen ? <PanelReadouts /> : null}
        </details>
      </div>
    </div>
  );
}
