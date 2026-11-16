import { all, zones, zoneTone, type Question, type Zone } from "./model";

// The fit check's shared drawings: the three-zone bar and a point to talk through. No state, so the
// tool pages' example cards draw them too.

/**
 * The three-zone bar: each zone's pale track, the fill up to the score in the verdict's colour, and the
 * labels: the verdict's in its colour, the others muted; it is set heavier once all seven are
 * answered, so the colour shows the live verdict and the weight confirms the final one. The labels are
 * 12px so each holds one line over its zone (13px from 640 where the bar is wide: `roomy`); a small
 * example of the bar goes without them (`labels`).
 */
export function ZoneBar({ pct, zone: at, done, roomy = false, labels = true, className = "" }: { pct: number; zone: Zone | null; done: boolean; roomy?: boolean; labels?: boolean; className?: string }) {
  const fill = at ? zoneTone[at].fill : "";
  return (
    <div aria-hidden="true" className={className}>
      <div className="relative flex h-1.5 gap-0.5 overflow-hidden rounded-pill">
        {zones.map((z, i) => {
          const to = zones[i + 1]?.from ?? 100;
          const width = to - z.from;
          // The share of this zone the score has passed.
          const filled = Math.max(0, Math.min(1, (pct - z.from) / width));
          return (
            <span key={z.id} style={{ flexBasis: `${width}%` }} className={`relative h-full min-w-0 grow overflow-hidden ${zoneTone[z.id].track} forced-colors:bg-[GrayText]`}>
              <span
                style={{ width: `${filled * 100}%` }}
                className={`absolute inset-y-0 left-0 transition-[width,background-color] duration-500 ease-instrument motion-reduce:transition-none forced-colors:bg-[Highlight] ${fill}`}
              />
            </span>
          );
        })}
      </div>
      <div className={labels ? "mt-2 flex gap-0.5" : "hidden"}>
        {zones.map((z, i) => {
          const to = zones[i + 1]?.from ?? 100;
          // Read as a scale: the low label from the bar's start, the middle one centred on its zone, the
          // high one to the bar's end, so the three stand apart even on a phone.
          const align = i === 0 ? "text-left" : i === zones.length - 1 ? "text-right" : "text-center";
          return (
            <span
              key={z.id}
              style={{ flexBasis: `${to - z.from}%` }}
              className={`min-w-0 grow whitespace-nowrap text-[0.75rem] leading-[1.3] transition-[color] duration-300 motion-reduce:transition-none max-[359px]:whitespace-normal ${roomy ? "sm:text-caption" : ""} ${align} ${at === z.id ? zoneTone[z.id].text : "text-muted"} ${at === z.id && done ? "font-semibold" : ""}`}
            >
              {z.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** One point to talk through: a round mark (a cross for a No, a dash for a Partly) and its phrase. It rises in as it joins, unless `still`. */
export function GapRow({ q, no, still = false }: { q: Question; no: boolean; still?: boolean }) {
  return (
    <li className={`flex items-center gap-3 border-b border-line py-2 text-small leading-[1.5] text-ink last:border-b-0 ${still ? "" : "animate-[gap-in_400ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"}`}>
      <span aria-hidden="true" className={`flex size-6 shrink-0 items-center justify-center rounded-pill ${no ? "bg-fit-no-soft text-fit-no" : "bg-fit-partly-soft text-debris-text"}`}>
        <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d={no ? "m5 5 6 6m0-6-6 6" : "M4.5 8h7"} />
        </svg>
      </span>
      <span>
        <span className="sr-only">{no ? "No: " : "Partly: "}</span>
        {q.gap}
      </span>
    </li>
  );
}

/** The three longest points: a hidden copy of them holds the room the points can take. */
export const longestGaps = [...all].sort((a, b) => b.gap.length - a.gap.length).slice(0, 3);
