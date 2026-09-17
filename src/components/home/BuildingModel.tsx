"use client";

import dynamic from "next/dynamic";
import { useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { useCanRender3d } from "@/lib/hooks";
import { buildingSection } from "@/content/home";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { getVideo } from "@/lib/media";

const BuildingScene = dynamic(() => import("@/components/three/BuildingScene"), { ssr: false, loading: () => null });

const legendColour: Record<string, string> = { scanned: "bg-[#e8e2d6] border border-hairline", washed: "bg-glass-tint", debris: "bg-[#c99a5b]" };

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
      <rect x="40" y="20" width="280" height="470" rx="6" fill="#e4dfd5" />
      <rect x="130" y="4" width="60" height="18" rx="9" fill="#f3efe7" stroke="#dcd5c8" />
      {Array.from({ length: cols * rows }).map((_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const order = r * cols + c;
        const scannedRow = (rows - r) / rows <= scan;
        const fill = order < washed ? "#cfe6ec" : debris.has((rows - 1 - r) * cols + c) ? (scannedRow ? "#c99a5b" : "#d8b98f") : scannedRow ? "#e8e2d6" : "#d9d3c8";
        return <rect key={i} x={52 + c * 28.5} y={32 + r * 32} width={26} height={29} rx={2} fill={fill} />;
      })}
      {scan > 0 && scan < 1 ? <rect x="40" y={490 - scan * 470} width="280" height="2" fill="#8ed4e0" /> : null}
    </svg>
  );
}

export function BuildingModel() {
  const ref = useRef<HTMLDivElement>(null);
  const can3d = useCanRender3d();
  const video = getVideo(buildingSection.videoId);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 35%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 60, damping: 20, mass: 0.6 });
  const [p, setP] = useState(0);
  useMotionValueEvent(progress, "change", (v) => setP(v));

  return (
    <Section id="software-view" ariaLabelledby="software-heading" tone="raised" className="border-y border-hairline">
      <Container>
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-4">
            <SectionHeading id="software-heading" eyebrow={buildingSection.eyebrow} headline={buildingSection.headline} />
            <p className="mt-5 max-w-[40ch] text-body text-muted">{buildingSection.body}</p>
            <ul className="mt-8 space-y-3">
              {buildingSection.legend.map((l) => (
                <li key={l.key} className="flex items-center gap-3 text-small">
                  <span className={`h-3.5 w-3.5 rounded-[3px] ${legendColour[l.key]}`} aria-hidden="true" />
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
          <div ref={ref} className="md:col-span-8">
            <div className="relative aspect-[4/3] overflow-hidden rounded-panel border border-hairline bg-[linear-gradient(180deg,#f7f3ec_0%,#ece6da_100%)] md:aspect-[16/11]">
              <div className="absolute inset-0 bg-[linear-gradient(#dcd5c8_1px,transparent_1px),linear-gradient(90deg,#dcd5c8_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" aria-hidden="true" />
              {can3d ? (
                <div className="absolute inset-0" aria-hidden="true">
                  <BuildingScene progress={progress} />
                </div>
              ) : video ? (
                <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster={`/media/${buildingSection.videoId}-poster.jpg`}>
                  <source src={`/media/${buildingSection.videoId}.webm`} type="video/webm" />
                  <source src={`/media/${buildingSection.videoId}.mp4`} type="video/mp4" />
                </video>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <FacadeSvg progress={p} />
                </div>
              )}
              <span className="readout absolute left-3 top-3 rounded-chip bg-raised/90 px-2 py-1 text-[0.6875rem] uppercase tracking-[0.08em] text-muted">Software view</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
