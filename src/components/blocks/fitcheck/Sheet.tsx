"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { fitCheck } from "@/content/home";
import { useIndicator } from "@/components/home/useIndicator";
import styles from "./FitCheck.module.css";
import { all, chosen, forced, labelOf, tone, type Answer, type Answers, type Verdict } from "./model";
import { ZoneBar } from "./parts";

const { panel } = fitCheck;
/** A sheet's place in the fan: its tilt, how far it sits up and to the left of the front one, and its turn to arrive. */
const fanned = (deg: number, dx: number, dy: number, i: number) => ({ "--tilt": `${deg}deg`, "--dx": `${dx}px`, "--dy": `${dy}px`, "--i": i }) as CSSProperties;

/**
 * A statement's three answers as one small switch, on the result: a radio group of three pills on a
 * paper track. The chosen tone is painted by one marker that glides to the next choice (useIndicator)
 * and takes that answer's tone and solid edge as it goes; until the marker is in place the chosen pill
 * paints its own. The chosen pill keeps its tone's text and the heavier weight, so the choice never
 * rests on colour alone. Each pill gives a little while pressed.
 */
function AnswerSwitch({ name, labelledBy, value, onPick }: { name: string; labelledBy: string; value?: Answer; onPick: (a: Answer) => void }) {
  const rowRef = useRef<HTMLSpanElement>(null);
  const active = value ? fitCheck.answers.findIndex((a) => a.id === value) : -1;
  useIndicator(rowRef, active);
  return (
    <span ref={rowRef} role="radiogroup" aria-labelledby={labelledBy} className="group/ind relative flex shrink-0 gap-0.5 rounded-pill bg-paper p-0.5">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-[1] h-(--ih) w-(--iw) translate-x-(--ix) translate-y-(--iy) rounded-pill border opacity-0 group-data-[indicator-ready]/ind:opacity-100 group-data-[indicator-ready]/ind:transition-[translate,width,background-color,border-color] group-data-[indicator-ready]/ind:duration-[250ms] group-data-[indicator-ready]/ind:ease-instrument motion-reduce:transition-none! forced-colors:forced-color-adjust-none forced-colors:border-[Highlight] forced-colors:bg-[Highlight] ${value ? `${tone[value].edge} ${tone[value].fill}` : "border-transparent"}`}
      />
      {fitCheck.answers.map((a) => {
        const on = value === a.id;
        return (
          <label
            key={a.id}
            data-indicator-item=""
            className={`${styles.give} relative flex h-9 cursor-pointer select-none items-center justify-center rounded-pill border px-2 text-caption has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-focus lg:h-7 lg:px-2 lg:text-[0.75rem] ${
              on ? `${chosen(a.id)} ${forced} group-data-[indicator-ready]/ind:border-transparent group-data-[indicator-ready]/ind:bg-transparent` : "border-transparent font-medium text-muted hover:text-ink"
            }`}
          >
            <input type="radio" name={name} value={a.id} checked={on} onChange={() => onPick(a.id)} className="sr-only" />
            {/* Over the marker, which paints under the labels. */}
            <span className="relative z-[2]">{a.label}</span>
          </label>
        );
      })}
    </span>
  );
}

export type SheetProps = {
  /** Prefixes the radio names and the row ids. */
  id: string;
  answers: Answers;
  /** The statement on screen, marked on the sheet; -1 once the result shows. */
  step: number;
  /** The result is showing: every row's tag becomes its switch, and below 1024 the list joins the page. */
  done: boolean;
  /** The score as shown (it counts to a new value). */
  shown: number;
  pct: number;
  verdict: Verdict;
  /** "2 of 7 answered". */
  count: string;
  onPick: (q: string, a: Answer) => void;
  /** The card's title and its line of introduction, at the head of the panel from 1024 (the home card). */
  titled?: boolean;
  className?: string;
};

/**
 * The live result beside the questions, from 1024: a white sheet headed "Your fit" on an accent panel,
 * with the score ("so far" until all seven are answered, then out of 100; a dash before the first
 * answer, so an empty check never reads as nought), the three-zone bar and the seven statements,
 * numbered 01 to 07, each gaining its Yes, Partly or No tag in that answer's tone as it is answered.
 * Behind it two blank ruled sheets are fanned a few degrees: decoration only, with nothing written on
 * them (no report is sent, so none is drawn). The three arrive once, as the card first comes into
 * view (FitCheck.module.css; none under reduced motion), and then rest: the fan is marked done as the
 * front sheet lands, so a resize across 1024 never plays the entrance again. The home card's panel
 * opens on the card's title; without one the fan sits at the panel's middle.
 *
 * On the result every row's tag turns into its switch ("Check your answers"): an answer changed there
 * re-scores at once. Below 1024 the sheet is not shown while answering (one line at the top of the
 * card reads the score instead); on the result its list joins the card, plain, between the result and
 * the send form, so the answers are changed in the same place at every width.
 */
export function Sheet({ id, answers, step, done, shown, pct, verdict, count, onPick, titled = false, className = "" }: SheetProps) {
  const [fan, setFan] = useState<"wait" | "in" | "done">("wait");
  const fanRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = fanRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setFan((f) => (f === "wait" ? "in" : f));
        io.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const answered = all.filter((q) => answers[q.id]).length;
  const complete = answered === all.length;
  const back = `${styles.sheet} ${styles.ruled} pointer-events-none absolute inset-0 hidden rounded-card px-6 py-7 lg:block`;

  return (
    <div className={`px-5 md:px-10 lg:relative lg:m-3 lg:flex lg:flex-col lg:overflow-hidden lg:rounded-card lg:bg-accent lg:p-6 xl:m-4 xl:p-7 ${titled ? "" : "lg:justify-center"} ${className}`}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 hidden size-80 rounded-pill bg-white/20 blur-[90px] lg:block" />
      {titled ? (
        <div className="relative hidden pb-12 pt-1 text-white lg:block">
          <h3 className="text-h3">{fitCheck.title}</h3>
          <p className="mt-3 max-w-[21rem] text-small text-pretty">{fitCheck.intro}</p>
        </div>
      ) : null}
      <div ref={fanRef} data-fan={fan} className={`${styles.fan} relative lg:ml-7 xl:ml-8 ${titled ? "lg:mt-auto" : "lg:mt-6"}`}>
        <div aria-hidden="true" style={fanned(-8, -10, -22, 0)} className={`${back} bg-[color-mix(in_srgb,var(--color-white)_74%,var(--color-accent))]`} />
        <div aria-hidden="true" style={fanned(-4, -5, -11, 1)} className={`${back} bg-[color-mix(in_srgb,var(--color-white)_90%,var(--color-accent))] shadow-[0_10px_30px_-16px_color-mix(in_srgb,var(--color-night)_50%,transparent)]`} />
        <div
          style={fanned(0, 0, 0, 2)}
          onAnimationEnd={(e) => {
            // The front sheet lands last (its own animation, not a tag's inside it): the entrance is over.
            if (e.target === e.currentTarget) setFan("done");
          }}
          className={`${styles.sheet} relative lg:rounded-card lg:bg-white lg:p-6 lg:shadow-[0_18px_44px_-18px_color-mix(in_srgb,var(--color-night)_60%,transparent)]`}>
          <div className="hidden lg:block">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-small font-medium text-ink">{panel.label}</p>
              <p className="text-caption text-muted tabular-nums">{count}</p>
            </div>
            <p className="mt-2 flex items-baseline gap-2 text-ink">
              <span className={`text-[3rem] font-light leading-none tracking-[-0.04em] tabular-nums ${answered ? "" : "text-muted"}`}>
                {answered ? (
                  shown
                ) : (
                  <>
                    <span aria-hidden="true">—</span>
                    <span className="sr-only">No score yet</span>
                  </>
                )}
              </span>
              <span className="text-small leading-none text-muted">{answered && !complete ? panel.soFar : panel.outOf}</span>
            </p>
            <ZoneBar pct={pct} zone={answered ? verdict.zone : null} done={complete} className="mt-4" />
          </div>
          <p className="max-lg:font-display max-lg:text-[1.5rem] max-lg:leading-[1.2] max-lg:tracking-[-0.01em] text-ink lg:mt-5 lg:border-t lg:border-line lg:pt-4 lg:text-small lg:font-medium">{done ? panel.check : panel.record}</p>
          <ol className="mt-2 lg:mt-1">
            {all.map((q, i) => {
              const value = answers[q.id];
              const here = i === step;
              const rid = `${id}-row-${q.id}`;
              return (
                <li key={q.id} className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0 lg:py-2 lg:last:pb-0">
                  <span aria-hidden="true" className={`w-4 shrink-0 self-start text-caption leading-[1.45] tabular-nums transition-[color] duration-200 motion-reduce:transition-none ${here ? "font-semibold text-accent" : "text-muted"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span id={rid} className={`min-w-0 flex-1 text-caption leading-[1.45] text-pretty transition-[color] duration-200 motion-reduce:transition-none ${value || here ? "text-ink" : "text-muted"}`}>
                    {q.text}
                  </span>
                  <span className="flex shrink-0 items-center justify-end lg:min-h-8 lg:w-[7.75rem]">
                    {done ? (
                      <AnswerSwitch name={`${id}-check-${q.id}`} labelledBy={rid} value={value} onPick={(a) => onPick(q.id, a)} />
                    ) : value ? (
                      // Keyed by the answer, so a changed answer's tag arrives afresh.
                      <span key={value} className={`${styles.tagIn} inline-flex h-6 items-center rounded-hard border px-2 text-[0.75rem] ${chosen(value)} ${forced}`}>
                        {labelOf(value)}
                      </span>
                    ) : (
                      <>
                        <span aria-hidden="true" className="mr-1 h-px w-4 bg-hairline" />
                        <span className="sr-only">{panel.pending}</span>
                      </>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
