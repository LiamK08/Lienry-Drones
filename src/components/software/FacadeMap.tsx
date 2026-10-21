"use client";

import { useEffect, useRef } from "react";
import { CELLS, FLOORS, MAP } from "@/components/three/software/dims";
import type { ZoneId } from "@/content/software";

/** Gaps between the three blocks, in cell widths; a cell is CELL_H cell widths tall. */
const GAP = 1.2;
const CELL_H = 1.25;
const UNITS = MAP.north.cols + MAP.east.cols + MAP.roof.cols + GAP * 2;
/** The canvas's aspect ratio, fixed so the map never moves the layout while it draws. */
export const FACADE_MAP_ASPECT = `${UNITS} / ${FLOORS * CELL_H}`;
/** The label row's columns, matching the blocks. */
export const FACADE_MAP_COLUMNS = `${MAP.north.cols}fr ${GAP}fr ${MAP.east.cols}fr ${GAP}fr ${MAP.roof.cols}fr`;

const COLOURS = {
  pending: "#e4ded3",
  half: "#7fb0b9",
  washed: "#0f6a7c",
  amber: [224, 161, 58],
  rust: [180, 90, 28],
} as const;

const mix = (a: readonly number[], b: readonly number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

/**
 * The plan as an unfolded elevation: the north face and the east face side by side (seen from
 * outside they meet at the north-east corner), floor by floor, and the roof glazing's two rows. Each
 * cell is one planned panel: pending, washed once (one of its two passes) or washed, with the debris
 * build-up still on it shaded amber. A chosen zone keeps its colour and the rest fade back.
 * Decorative: the figures beside it say the same in text.
 */
export function FacadeMap({ cells, version, wash, debris, selected }: { cells: Float32Array; version: number; wash: boolean; debris: boolean; selected: ZoneId | null }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const cw = width / UNITS;
      const ch = height / FLOORS;
      const inset = Math.max(0.75, Math.min(1.25, cw * 0.14));
      const left = { N: 0, E: (MAP.north.cols + GAP) * cw, R: (MAP.north.cols + MAP.east.cols + GAP * 2) * cw };
      CELLS.forEach((c, i) => {
        const x = left[c.face] + (c.face === "R" ? c.bay % MAP.roof.cols : c.bay) * cw;
        const y = c.face === "R" ? Math.floor(c.bay / MAP.roof.cols) * ch : (FLOORS - 1 - c.floor) * ch;
        const done = wash ? cells[i] : 0;
        ctx.globalAlpha = selected && c.zone !== selected ? 0.32 : 1;
        ctx.fillStyle = done >= 0.999 ? COLOURS.washed : done > 0 ? COLOURS.half : COLOURS.pending;
        ctx.fillRect(x + inset / 2, y + inset / 2, cw - inset, ch - inset);
        const residue = debris ? c.debris * (1 - done) : 0;
        if (residue > 0.12) {
          const [r, g, b] = mix(COLOURS.amber, COLOURS.rust, Math.min(1, Math.max(0, (residue - 0.35) / 0.65)));
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(0.95, 0.25 + residue * 0.8)})`;
          ctx.fillRect(x + inset / 2, y + inset / 2, cw - inset, ch - inset);
        }
      });
      ctx.globalAlpha = 1;
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [cells, version, wash, debris, selected]);

  return <canvas ref={ref} aria-hidden="true" className="block w-full" style={{ aspectRatio: FACADE_MAP_ASPECT }} />;
}
