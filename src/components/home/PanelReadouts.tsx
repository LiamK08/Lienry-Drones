"use client";

import { useState } from "react";
import { PLANNED } from "@/components/three/software/layout";
import { zones } from "@/content/software";

/** The same panel data as the canvas hover, available to keyboard and screen-reader users. */
export default function PanelReadouts() {
  const [index, setIndex] = useState(0);
  const panel = PLANNED[index];
  const zone = zones.find(z => z.id === panel.zone)!;
  return (
    <div className="mt-4 border-t border-hairline pt-4">
      <label className="block text-small">
        Panel
        <select value={index} onChange={e => setIndex(Number(e.target.value))} className="mt-2 block w-full rounded-hard border border-border-strong bg-raised p-2 text-small text-ink">
          {PLANNED.map((p, i) => <option key={i} value={i}>{zones.find(z => z.id === p.zone)?.name} · Level {p.floor + 1} · Panel {p.bay + 1}</option>)}
        </select>
      </label>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-caption" aria-live="polite">
        <dt>Material</dt><dd>{zone.surface}</dd>
        <dt>Example pressure</dt><dd>{zone.pressure}</dd>
        <dt>Last washed</dt><dd>{panel.lastWashed}</dd>
        <dt>Debris build-up</dt><dd>{Math.round(panel.debris * 100)}%</dd>
      </dl>
      <p className="mt-4 text-caption">Demo data. These readings are illustrative, not operating specifications.</p>
    </div>
  );
}
