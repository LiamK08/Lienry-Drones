"use client";

// F2a STUB. The props, `StepId` and `useSoftwareLive` are final; F2c replaces the inside of
// `SoftwareWindow` with the window extracted from home/SoftwareView.tsx (docs/REDESIGN-SPEC.md B6,
// changes 1-6) without changing any of them. Until then it renders a plain box of the window's
// real size, with its "Demo data" chrome and its notes row.

import { useCanRender3d, useMediaQuery } from "@/lib/hooks";
import { project } from "@/content/software";

/**
 * The four software steps. The same union as `StepId` in src/content/software.ts (added by F2b);
 * once that lands, this becomes `export type { StepId } from "@/content/software"`.
 */
export type StepId = "map" | "plan" | "clean" | "rescan";

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

/**
 * The desktop software window with its own notes row under the frame (the illustrative-model note
 * and "Inspect panel data"), so a band never adds or doubles the note. About 672px tall from 1024.
 */
export function SoftwareWindow({ preset, tone = "sunken" }: SoftwareWindowProps) {
  const border = tone === "sunken" ? "border-border-strong/40" : "border-hairline";
  return (
    <div data-software-preview data-preset={preset}>
      <div role="group" aria-label={`${project.app}, demo window`} className={`overflow-hidden rounded-hard border bg-plaster text-ink ${border}`}>
        <div className="flex h-10 items-center justify-between border-b border-hairline px-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="whitespace-nowrap text-small font-medium">{project.app}</span>
            <span className="hidden truncate text-small text-muted sm:inline">{project.name}</span>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <span className="label whitespace-nowrap text-ink">Preview</span>
            <span className="label whitespace-nowrap text-muted">Demo data</span>
          </div>
        </div>
        {/* The layer bar, the canvas and the timeline: 632px from 1024. Below it, the canvas at
            16:10 (768-1023) or 4:5 (phones), plus the rows the window adds under it there. */}
        <div aria-hidden="true" className="bg-raised">
          <svg className="block aspect-[4/5] w-full md:aspect-[16/10] lg:aspect-auto lg:h-[39.5rem]" />
          <svg className="block h-[12.25rem] w-full border-t border-hairline lg:hidden" />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:justify-between">
        <p className="text-caption text-muted">Model is illustrative. The software will render each property from its scan.</p>
        <details className="text-caption text-muted md:w-[28rem]">
          <summary className="cursor-pointer underline underline-offset-4">Inspect panel data</summary>
          <p className="mt-3">Demo data. These readings are illustrative, not operating specifications.</p>
        </details>
      </div>
    </div>
  );
}
