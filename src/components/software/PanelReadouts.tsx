"use client";

import { useState } from "react";
import { PLANNED } from "@/components/three/software/layout";
import { PANELS as SOLAR_PANELS } from "@/components/three/solar/layout";
import { solarZones, zones } from "@/content/software";
import type { ModelId } from "./models";

type Readout = { name: string; surface: string; pressure: string; lastWashed: string; debris: number };

const READOUTS: Record<ModelId, Readout[]> = {
  building: PLANNED.map((p) => {
    const zone = zones.find((z) => z.id === p.zone)!;
    return { name: `${zone.name} · Level ${p.floor + 1} · Panel ${p.bay + 1}`, surface: zone.surface, pressure: zone.pressure, lastWashed: p.lastWashed, debris: p.debris };
  }),
  solar: SOLAR_PANELS.map((p) => {
    const zone = solarZones.find((z) => z.id === p.zone)!;
    return { name: `${zone.name} · ${p.level === 1 ? "Upper" : "Lower"} line · Module ${p.col + 1}`, surface: zone.surface, pressure: zone.pressure, lastWashed: p.lastWashed, debris: p.debris };
  }),
};

/** The same panel data as the canvas hover, available to keyboard and screen-reader users. */
export default function PanelReadouts({ model = "building" }: { model?: ModelId }) {
  const [index, setIndex] = useState(0);
  const list = READOUTS[model];
  const panel = list[index];
  return (
    <div className="mt-4 border-t border-rule pt-4">
      <label className="block text-small text-fg-muted">
        Panel
        <select value={index} onChange={(e) => setIndex(Number(e.target.value))} className="mt-2 block w-full rounded-hard border border-border-strong bg-raised p-2 text-small text-ink">
          {list.map((p, i) => (
            <option key={i} value={i}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-caption text-fg-muted" aria-live="polite">
        <dt>Material</dt>
        <dd>{panel.surface}</dd>
        <dt>Example pressure</dt>
        <dd>{panel.pressure}</dd>
        <dt>Last washed</dt>
        <dd>{panel.lastWashed}</dd>
        <dt>{model === "solar" ? "Soiling" : "Debris build-up"}</dt>
        <dd>{Math.round(panel.debris * 100)}%</dd>
      </dl>
      <p className="mt-4 text-caption text-fg-muted">Demo data. These readings are illustrative, not operating specifications.</p>
    </div>
  );
}
