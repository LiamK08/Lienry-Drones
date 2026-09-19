"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useCanRender3d, useMediaQuery, useOnScreen } from "@/lib/hooks";
import { captureVariant, isCapture, now, onTick } from "@/lib/clock";
import { bindPlayback } from "@/lib/video";
import { getVideo } from "@/lib/media";
import { layers as LAYERS, project, softwareSection, zones, type LayerId, type ZoneId } from "@/content/software";
import { DEFAULT_LAYERS, createControl, type HoverInfo, type Layers } from "@/components/three/software/control";
import { Container, Rule, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const SoftwareScene = dynamic(() => import("@/components/three/SoftwareScene"), { ssr: false, loading: () => null });

const CYCLE_MS = 48000;
const HOLD_MS = 2600;
// The recording shows a whole clean in twelve seconds.
const CAPTURE_CYCLE_MS = 10000;
const CAPTURE_HOLD_MS = 2000;
const noop = () => () => {};
const PANELS_IN_PLAN = 320;
const DEMO = { wash: 64, completed: 204 };

type Hover = { info: NonNullable<HoverInfo>; x: number; y: number };

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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-hairline py-2.5">
      <dt className="label text-muted">{label}</dt>
      <dd className="readout mt-1 text-small text-ink">{value}</dd>
    </div>
  );
}

/**
 * The software view as the desktop app itself: a window with a title bar, the zone tree, the live
 * model, the clean's numbers and a timeline. Desktop browsers get the WebGL model; phones and
 * reduced motion get a recording of it, so the window reads the same everywhere.
 */
export function SoftwareView() {
  const can3d = useCanRender3d();
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 768px)");
  const [nearRef, near] = useOnScreen<HTMLDivElement>("600px 0px 600px 0px");
  const [viewRef, onScreen] = useOnScreen<HTMLDivElement>("0px");
  const controlRef = useRef(createControl());
  const [layers, setLayers] = useState<Layers>(() => ({ ...DEFAULT_LAYERS }));
  const [selected, setSelected] = useState<ZoneId | null>(null);
  const [wash, setWash] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [completed, setCompleted] = useState(0);
  const [hover, setHover] = useState<Hover | null>(null);
  const dragging = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const live = can3d && !reduce;
  const film = getVideo(softwareSection.filmId);
  const capture = useSyncExternalStore(noop, captureVariant, () => null);

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
    control.active = live && onScreen;
    control.requestFrame();
  }, [live, onScreen]);

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
    if (!el || live || reduce) return;
    return bindPlayback(el, 0.2);
  }, [live, reduce, wide]);

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

  return (
    <Section id="software-view" ariaLabelledby="software-heading" tone="raised" className="border-y border-hairline">
      <Container>
        <Reveal className="max-w-statement">
          <Rule className="mb-5" />
          <h2 id="software-heading" className="text-h2">
            {softwareSection.headline}
          </h2>
          <p className="mt-4 max-w-[46ch] text-body text-muted">{softwareSection.body}</p>
        </Reveal>

        <div ref={nearRef} className="mt-10 md:mt-14">
          <div className="overflow-hidden rounded-hard border border-hairline bg-plaster text-ink" role="group" aria-label={`${project.app}, demo window`}>
            <div className="flex h-10 items-center justify-between border-b border-hairline px-3 text-small">
              <div className="flex min-w-0 items-center gap-3">
                <span className="whitespace-nowrap font-medium text-ink">{project.app}</span>
                <span className="hidden truncate text-muted sm:inline">{project.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="label flex items-center gap-2 whitespace-nowrap text-ink">
                  <span className="h-1.5 w-1.5 bg-water" aria-hidden="true" />
                  Live
                </span>
                <span className="label whitespace-nowrap border border-hairline px-1.5 py-1 text-muted">Demo data</span>
              </div>
            </div>

            <div className="flex h-10 items-center justify-between border-b border-hairline px-2">
              <div className="flex items-center gap-1" role="group" aria-label="Layers">
                {LAYERS.map((l) => {
                  const on = layers[l.id];
                  return (
                    <button
                      key={l.id}
                      type="button"
                      aria-pressed={on}
                      disabled={!live}
                      onClick={() => toggle(l.id)}
                      className={`h-7 rounded-hard px-2.5 text-small transition-colors duration-150 ease-instrument disabled:pointer-events-none ${on ? "bg-ink text-plaster" : "text-muted hover:bg-sunken hover:text-ink"}`}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
              <span className="hidden pr-1 text-caption text-muted md:block">{live ? "Auto orbit. Drag to look around." : "Recording of the model"}</span>
            </div>

            <div className={capture === "tall" ? "grid" : "grid md:grid-cols-[13.5rem_minmax(0,1fr)_15rem]"}>
              <aside className={capture === "tall" ? "hidden" : "hidden border-r border-hairline md:block"}>
                <p className="label px-3 pb-2 pt-3 text-muted">Zones</p>
                <ul>
                  {zones.map((z) => (
                    <li key={z.id}>
                      <button
                        type="button"
                        onClick={() => fly(z.id)}
                        disabled={!live}
                        aria-pressed={selected === z.id}
                        className={`w-full border-t border-hairline px-3 py-2.5 text-left transition-colors duration-150 ease-instrument hover:bg-sunken disabled:pointer-events-none ${selected === z.id ? "bg-sunken" : ""}`}
                      >
                        <span className="block text-small text-ink">{z.name}</span>
                        <span className="block text-caption text-muted">
                          {z.surface}. {z.preset}, {z.pressure}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="border-t border-hairline px-3 py-3 text-caption text-muted">Two passes per floor, top down. Click a zone to fly to it.</p>
              </aside>

              <div
                ref={viewRef}
                className={capture === "tall" ? "relative aspect-[4/5]" : "relative aspect-[4/5] md:aspect-auto md:h-[34rem] lg:h-[38rem]"}
                style={{ background: "linear-gradient(to bottom, #fbf9f4 0%, #f1ece3 55%, #e6e0d4 100%)" }}
                onPointerLeave={() => setHover(null)}
              >
                {live ? (
                  <div className="absolute inset-0" aria-hidden="true">
                    {near ? <SoftwareScene controlRef={controlRef} /> : null}
                  </div>
                ) : (
                  <video
                    key={variant}
                    ref={videoRef}
                    className="absolute inset-0 h-full w-full object-cover"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    controls={!!reduce}
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

              <aside className={capture === "tall" ? "hidden" : "border-t border-hairline md:border-l md:border-t-0"}>
                <p className="label px-3 pb-2 pt-3 text-muted">This clean</p>
                <dl className="grid grid-cols-2 gap-x-4 px-3 pb-1 md:block">
                  <Stat label="Scan age" value={project.scanAge} />
                  <Stat label="Wash progress" value={`${Math.round(pct)}%`} />
                  <Stat label="Panels completed" value={`${done} / ${PANELS_IN_PLAN}`} />
                  <Stat label="Debris zones found" value={String(project.debrisZones)} />
                  <Stat label="Next scheduled clean" value={project.nextClean} />
                </dl>
              </aside>
            </div>

            <div className="flex h-12 items-center gap-3 border-t border-hairline px-3">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                disabled={!live}
                aria-label={playing ? "Pause the wash" : "Play the wash"}
                className="flex h-7 w-7 items-center justify-center rounded-hard border border-hairline text-ink hover:bg-sunken disabled:opacity-50"
              >
                <PlayIcon playing={playing && live} />
              </button>
              <span className="label w-12 text-muted">Wash</span>
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={pct}
                disabled={!live}
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
              <span className="readout w-12 text-right text-small text-ink">{Math.round(pct)}%</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-12 md:items-end">
          <p className="max-w-[44ch] text-caption text-muted md:col-span-6">{softwareSection.note}</p>
          <figure className="md:col-span-5 md:col-start-8">
            <div className="relative overflow-hidden rounded-hard bg-sunken" style={{ aspectRatio: "16/9" }}>
              {film ? (
                <FilmTile id={softwareSection.filmId} paused={!!reduce} />
              ) : (
                <div className="flex h-full items-end p-3" data-media-placeholder={softwareSection.filmId}>
                  <span className="caption">Film to come</span>
                </div>
              )}
            </div>
            <figcaption className="caption mt-2">{softwareSection.filmCaption}</figcaption>
          </figure>
        </div>
      </Container>
    </Section>
  );
}

function FilmTile({ id, paused }: { id: string; paused: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || paused) return;
    return bindPlayback(el, 0.3);
  }, [paused]);
  return (
    <video ref={ref} className="h-full w-full object-cover" muted loop playsInline preload="metadata" controls={paused} poster={`/media/${id}-poster.jpg`}>
      <source src={`/media/${id}.webm`} type="video/webm" />
      <source src={`/media/${id}.mp4`} type="video/mp4" />
    </video>
  );
}
