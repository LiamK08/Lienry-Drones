"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useCanRender3d, useOnScreen } from "@/lib/hooks";
import { bindPlayback } from "@/lib/video";
import { buildingSection } from "@/content/home";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { getVideo } from "@/lib/media";

const BuildingScene = dynamic(() => import("@/components/three/BuildingScene"), { ssr: false, loading: () => null });

const DURATION_MS = 6000;
const legendColour: Record<string, string> = { scanned: "bg-[#e8e2d6] border border-hairline", washed: "bg-[#cfe6ec]", debris: "bg-[#c99a5b]" };
const GRID = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M40 0H0V40' fill='none' stroke='%23dcd5c8'/%3E%3C/svg%3E")`;

/** SVG facade used when WebGL is unavailable, on small or low-power devices, and under reduced motion. */
function FacadeSvg({ progress }: { progress: number }) {
  const cols = 9;
  const rows = 14;
  const debris = new Set<number>();
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) debris.add((r + 1) * cols + c + 1);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) debris.add((r + 8) * cols + c + 4);
  const washed = Math.floor(Math.max(0, (progress - 0.42) / 0.58) * cols * rows);
  const scan = Math.min(1, progress / 0.4);
  return (
    <svg viewBox="0 0 360 520" className="mx-auto h-full w-auto max-h-[520px]" role="img" aria-label="Illustration of the software view: a building facade with scanned, washed and debris tiles">
      <rect x="40" y="20" width="280" height="470" rx="2" fill="#e4dfd5" />
      <rect x="130" y="4" width="60" height="18" rx="2" fill="#f3efe7" stroke="#dcd5c8" />
      {Array.from({ length: cols * rows }).map((_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const order = r * cols + c;
        const scannedRow = (rows - r) / rows <= scan;
        const fill = order < washed ? "#cfe6ec" : debris.has((rows - 1 - r) * cols + c) ? (scannedRow ? "#c99a5b" : "#d8b98f") : scannedRow ? "#e8e2d6" : "#d9d3c8";
        return <rect key={i} x={52 + c * 28.5} y={32 + r * 32} width={26} height={29} rx={1} fill={fill} />;
      })}
      {scan > 0 && scan < 1 ? <rect x="40" y={490 - scan * 470} width="280" height="2" fill="#8ed4e0" /> : null}
    </svg>
  );
}

/**
 * The software view. The scan-and-wash sequence plays once each time the panel comes on
 * screen (IntersectionObserver), the WebGL canvas renders on demand only while it plays,
 * and nothing runs while the panel is off screen.
 */
export function BuildingModel() {
  const can3d = useCanRender3d();
  const reduce = useReducedMotion();
  const video = getVideo(buildingSection.videoId);
  const [nearRef, near] = useOnScreen<HTMLDivElement>("600px 0px 600px 0px");
  const [panelRef, onScreen] = useOnScreen<HTMLDivElement>("0px");
  const progress = useRef(0);
  const [shown, setShown] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const play = onScreen && !reduce;

  // Warm the three.js chunk in idle time after load so its evaluation never lands mid-scroll.
  useEffect(() => {
    if (!can3d) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const warm = () => {
      void import("@/components/three/BuildingScene");
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(warm, { timeout: 3000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(warm, 1500);
    return () => window.clearTimeout(t);
  }, [can3d]);

  useEffect(() => {
    if (!play) return;
    const start = performance.now();
    let raf = 0;
    let last = -1;
    progress.current = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      progress.current = t;
      const step = Math.round(t * 50) / 50;
      if (step !== last) {
        last = step;
        setShown(step);
      }
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    return bindPlayback(el, 0.2);
  }, [video]);

  const p = reduce ? 1 : shown;

  return (
    <Section id="software-view" ariaLabelledby="software-heading" tone="raised" className="border-y border-hairline">
      <Container>
        <div ref={nearRef} className="grid gap-10 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-4">
            <SectionHeading id="software-heading" eyebrow={buildingSection.eyebrow} headline={buildingSection.headline} />
            <p className="mt-5 max-w-[40ch] text-body text-muted">{buildingSection.body}</p>
            <ul className="mt-8 space-y-3">
              {buildingSection.legend.map((l) => (
                <li key={l.key} className="flex items-center gap-3 text-small">
                  <span className={`h-3.5 w-3.5 ${legendColour[l.key]}`} aria-hidden="true" />
                  {l.label}
                </li>
              ))}
            </ul>
            <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-hairline pt-6 text-caption text-muted">
              <div>
                <dt className="readout text-[0.6875rem] uppercase tracking-[0.08em]">Scan</dt>
                <dd className="readout mt-1 text-[1.25rem] text-ink">{Math.round(Math.min(1, p / 0.4) * 100)}%</dd>
              </div>
              <div>
                <dt className="readout text-[0.6875rem] uppercase tracking-[0.08em]">Wash progress</dt>
                <dd className="readout mt-1 text-[1.25rem] text-ink">{Math.round(Math.max(0, Math.min(1, (p - 0.42) / 0.58)) * 100)}%</dd>
              </div>
            </dl>
            <p className="mt-6 text-caption text-muted">{buildingSection.note}</p>
          </Reveal>
          <div className="md:col-span-8">
            <div ref={panelRef} className="relative aspect-[4/3] overflow-hidden rounded-hard border border-hairline bg-raised md:aspect-[16/11]">
              <div className="absolute inset-0 opacity-60" style={{ backgroundImage: GRID }} aria-hidden="true" />
              {can3d ? (
                <div className="absolute inset-0" aria-hidden="true">
                  {near ? <BuildingScene progress={progress} active={play} /> : null}
                </div>
              ) : video ? (
                <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted loop playsInline preload="metadata" poster={`/media/${buildingSection.videoId}-poster.jpg`}>
                  <source src={`/media/${buildingSection.videoId}.webm`} type="video/webm" />
                  <source src={`/media/${buildingSection.videoId}.mp4`} type="video/mp4" />
                </video>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <FacadeSvg progress={p} />
                </div>
              )}
              <span className="caption absolute left-3 top-3">Software view</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
