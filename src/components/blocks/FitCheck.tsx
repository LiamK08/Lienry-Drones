"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { fitCheck } from "@/content/home";
import { enquirySchema, enquiryTypeLabels, enquiryTypes } from "@/lib/enquiry-schema";
import { Button } from "@/components/ui/Button";
import { Field, SelectField, describedBy, fieldControl } from "@/components/ui/Field";
import { useIndicator } from "@/components/home/useIndicator";

type Answer = (typeof fitCheck.answers)[number]["id"];
type Zone = (typeof fitCheck.panel.zones)[number]["id"];
type Question = (typeof fitCheck.groups)[number]["questions"][number];

const all: Question[] = fitCheck.groups.flatMap((g) => g.questions);
const scoreOf = (a: Answer) => fitCheck.answers.find((x) => x.id === a)?.score ?? 0;
const { zones, verdicts } = fitCheck.panel;
/** Moves focus into the send form's first field, or onto its confirmation, as it opens. */
const focusOnMount = (el: HTMLElement | null) => el?.focus();

/** The weighted sum: each question's weight, in full for a Yes and by half for a Partly. */
const percent = (answers: Record<string, Answer>) => Math.round(all.reduce((s, q) => s + (answers[q.id] ? q.weight * scoreOf(answers[q.id]) : 0), 0));
const BUILDING = new Set<string>(fitCheck.groups[0].questions.map((q) => q.id));
/**
 * The ceiling the building answers set. Those three are hard requirements: a No there holds the score
 * (and so the verdict) under the middle zone, a Partly under the high one.
 */
const capOf = (answers: Record<string, Answer>) => {
  const building = [...BUILDING].map((id) => answers[id]);
  return building.includes("no") ? 39 : building.includes("partly") ? 74 : 100;
};
/** The score out of 100 as shown: the weighted sum under the building answers' ceiling, so the score, the bar and the verdict always agree. */
const scoreFor = (answers: Record<string, Answer>) => Math.min(percent(answers), capOf(answers));
/**
 * The verdict for the answers so far. All seven answered, it is the score's; partway, it is judged on
 * the share of the weight answered (under the same ceiling), so a first Yes never reads as a poor fit.
 */
function verdictFor(answers: Record<string, Answer>) {
  const asked = all.filter((q) => answers[q.id]);
  const weight = asked.reduce((s, q) => s + q.weight, 0);
  const share = weight ? Math.round((percent(answers) / weight) * 100) : 0;
  const pct = asked.length === all.length ? scoreFor(answers) : Math.min(share, capOf(answers));
  return verdicts.find((v) => pct >= v.min) ?? verdicts[verdicts.length - 1];
}
/** The points to talk through, three at most: every No in question order, then the Partlys, the building's first. */
const gapsOf = (answers: Record<string, Answer>) => {
  const nos = all.filter((q) => answers[q.id] === "no");
  const partlys = all.filter((q) => answers[q.id] === "partly").sort((a, b) => b.weight - a.weight);
  return [...nos, ...partlys].slice(0, 3);
};

// A chosen answer takes its own tone: Yes the accent tint, Partly the warm debris tone, No a soft red.
// The chosen pill also takes a solid edge in its own tone (6:1 or more on white) and the heavier weight,
// so the choice never rests on colour alone. `edge` and `fill` paint the home card's gliding marker.
const tone: Record<Answer, { edge: string; fill: string; text: string }> = {
  yes: { edge: "border-accent", fill: "bg-tint", text: "text-accent" },
  partly: { edge: "border-debris-text", fill: "bg-fit-partly-soft", text: "text-debris-text" },
  no: { edge: "border-fit-no", fill: "bg-fit-no-soft", text: "text-fit-no" },
};
const chosen = (a: Answer) => `${tone[a].edge} ${tone[a].fill} font-semibold ${tone[a].text}`;
const forced = "forced-colors:forced-color-adjust-none forced-colors:border-[Highlight] forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]";

// The score bar's zones: the pale track of each, its fill while the score sits in it, and its label.
const zoneTone: Record<Zone, { track: string; fill: string; text: string }> = {
  low: { track: "bg-fit-no-soft", fill: "bg-fit-no-bar", text: "text-fit-no" },
  mid: { track: "bg-fit-partly-soft", fill: "bg-debris", text: "text-debris-text" },
  high: { track: "bg-tint", fill: "bg-accent", text: "text-accent" },
};

export type FitCheckProps = {
  /** Prefixes the radio names and label ids. Column: the group headings are `${id}-g0`, `${id}-g1`. */
  id?: string;
  /** "card" (default, the home page): questions beside the scoring panel. "column": one centred column
   *  on the 12-column grid under a seven-segment progress bar, with the result and the buttons after the
   *  questions. */
  layout?: "card" | "column";
  /** Column only: the opening paragraphs, over the first group. */
  intro?: ReactNode;
  /** Column only: a small tag at the end of the button row. */
  badge?: string;
};

/**
 * The fit check: seven questions in two groups, each answered Yes, Partly or No with a row of small
 * pills (a radio group per question). A chosen pill takes its answer's tone. The score out of 100 shows
 * a dash until the first answer, then is live (it changes at once, never counting up), over a bar in
 * three zones that fills to it in the verdict's colour (verdictFor: judged on the share answered while
 * partway). A No or a Partly on a building question caps the score and the verdict alike (capOf). Under
 * it, the verdict's lead line and up to three points the answers raise (the Nos first, then the
 * Partlys), or a clear line when there are none. Indicative only.
 *
 * The home card is one white card: the questions beside a paper result column from 1024, where the
 * chosen tone glides between a row's pills; on smaller screens the result comes first, and once a
 * question is answered a strip at the foot of the questions keeps the score in view (sticky to the
 * bottom of the screen while the result's score is off it) with a button back to the result. The result
 * holds one height in every state, its room shown before the first answer as the rows the points will
 * fill. Its actions keep their roles: "Book a pilot conversation" is the primary, and "Send me my
 * result" (a secondary, unavailable until a question is answered) opens a short form in the column
 * (name and email) that sends the answers with the score through the enquiry route, to be answered by a
 * person; "Start again" clears every answer. The column layout links on instead.
 */
export function FitCheck({ id = "fit", layout = "card", intro, badge }: FitCheckProps) {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const answered = Object.keys(answers).length;
  const pct = scoreFor(answers);
  const done = answered === all.length;
  const verdict = verdictFor(answers);
  const gaps = gapsOf(answers);
  const count = fitCheck.panel.answered.replace("{n}", String(answered));
  const pick = (q: string, a: Answer) => setAnswers((s) => ({ ...s, [q]: a }));
  const scoreRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const restart = () => {
    setAnswers({});
    firstRef.current?.focus();
  };

  if (layout === "column") {
    return (
      <div className="lg:grid-12">
        <div className="lg:col-span-8 lg:col-start-3 xl:col-span-6 xl:col-start-4">
          <div
            role="progressbar"
            aria-label="Questions answered"
            aria-valuemin={0}
            aria-valuemax={all.length}
            aria-valuenow={answered}
            aria-valuetext={count}
            className="flex gap-2"
          >
            {all.map((q, i) => (
              <span
                key={q.id}
                className={`h-1 flex-1 rounded-pill transition-[background-color] duration-200 motion-reduce:transition-none forced-colors:forced-color-adjust-none ${i < answered ? "bg-accent forced-colors:bg-[Highlight]" : "bg-line forced-colors:bg-[GrayText]"}`}
              />
            ))}
          </div>

          {intro ? <div className="mt-8 space-y-4 text-body leading-[1.6] text-ink">{intro}</div> : null}

          {fitCheck.groups.map((g, gi) => (
            <div key={g.label} role="group" aria-labelledby={`${id}-g${gi}`} className={gi ? "mt-12" : "mt-10"}>
              <h2 id={`${id}-g${gi}`} className="text-[1.875rem] leading-[1.2] tracking-[-0.02em] text-ink">
                {g.label}
              </h2>
              <ol className="mt-6 space-y-7">
                {g.questions.map((q) => {
                  const n = all.findIndex((x) => x.id === q.id) + 1;
                  return (
                    <li key={q.id} className="flex flex-col gap-3">
                      <p id={`${id}-${q.id}`} className="max-w-none text-[1.125rem] font-semibold leading-[1.4] tracking-[-0.01em] text-pretty text-ink">
                        <span aria-hidden="true" className="mr-2 font-normal text-muted">
                          {n}.
                        </span>
                        {q.text}
                      </p>
                      <span role="radiogroup" aria-labelledby={`${id}-${q.id}`} className="flex flex-wrap gap-2">
                        {fitCheck.answers.map((a) => {
                          const on = answers[q.id] === a.id;
                          return (
                            <label
                              key={a.id}
                              className={`relative flex h-10 min-w-16 cursor-pointer items-center justify-center rounded-pill border px-4 text-small transition-[background-color,border-color,color] duration-200 motion-reduce:transition-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
                                on ? `${chosen(a.id)} ${forced}` : "border-line bg-white font-medium text-ink hover:border-ink"
                              }`}
                            >
                              <input type="radio" name={`${id}-${q.id}`} value={a.id} checked={on} onChange={() => pick(q.id, a.id)} className="sr-only" />
                              {a.label}
                            </label>
                          );
                        })}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}

          <div className="mt-12 rounded-card border border-line bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-small font-medium text-ink">{fitCheck.panel.label}</p>
              <p className="text-caption text-muted">{count}</p>
            </div>
            <Score pct={pct} answered={answered} className="mt-4" size="sm" />
            <ZoneBar pct={pct} zone={answered ? verdict.zone : null} done={done} className="mt-5" />
            <div aria-live="polite" className="mt-6">
              <Result answered={answered} done={done} verdict={verdict} gaps={gaps} answers={answers} place="column" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <Button href={fitCheck.panel.primary.href} arrow>
                {fitCheck.panel.primary.label}
              </Button>
              <Button href={fitCheck.panel.secondary.href} variant="secondary">
                {fitCheck.panel.secondary.label}
              </Button>
            </div>
            {badge ? <p className="rounded-hard border border-line bg-white px-2.5 py-1 text-caption text-muted">{badge}</p> : null}
          </div>
          <p className="mt-4 text-caption text-muted">{fitCheck.panel.note}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid rounded-panel border border-line bg-white lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      {/* The card's head across both columns; below 1024 the result follows it, then the questions. */}
      <div className="order-first border-b border-line px-5 pb-6 pt-6 md:px-10 md:pb-8 md:pt-9 lg:col-span-2 lg:row-start-1 lg:px-12">

        <h3 className="text-h3">{fitCheck.title}</h3>
        <p className="mt-2 max-w-none text-body leading-[1.6] text-muted">{fitCheck.intro}</p>
      </div>
      <div className="px-5 pb-5 pt-2 md:px-10 md:pb-10 lg:col-start-1 lg:row-start-2 lg:px-12 lg:pb-12 lg:pt-4">
        {fitCheck.groups.map((g, gi) => (
          <fieldset key={g.label} className="mt-6 md:mt-8">
            <legend className="text-small font-medium text-ink">{g.label}</legend>
            <ol className="mt-2 border-t border-line">
              {g.questions.map((q, qi) => {
                const n = all.findIndex((x) => x.id === q.id) + 1;
                return (
                  <li key={q.id} className="flex flex-col gap-3 border-b border-line py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-3.5">
                    <span id={`${id}-${q.id}`} className="flex gap-3 text-body font-medium leading-[1.4] text-ink">
                      <span aria-hidden="true" className="w-4 shrink-0 text-small font-normal leading-[1.6] text-muted tabular-nums">
                        {n}
                      </span>
                      <span className="text-pretty">{q.text}</span>
                    </span>
                    <AnswerRow id={id} q={q} value={answers[q.id]} onPick={pick} firstRef={gi === 0 && qi === 0 ? firstRef : undefined} />
                  </li>
                );
              })}
            </ol>
          </fieldset>
        ))}
        {/* Sticky within this column, so it rides along the questions and stops at their foot. */}
        {answered ? <FitStrip pct={pct} answered={answered} done={done} count={count} zone={verdict.zone} scoreRef={scoreRef} /> : null}
      </div>

      <ResultPanel pct={pct} answered={answered} done={done} verdict={verdict} gaps={gaps} answers={answers} count={count} scoreRef={scoreRef} onRestart={restart} />
    </div>
  );
}

/**
 * A question's three pills on the home card. The chosen pill's tone is painted by one marker under the
 * row that glides to the next choice (useIndicator) and takes that answer's tone as it goes; until the
 * marker is in place (the first paint, the first answer) the chosen pill paints its own. The chosen pill
 * keeps its tone's text and the heavier weight, so the choice never rests on colour alone.
 */
function AnswerRow({ id, q, value, onPick, firstRef }: { id: string; q: Question; value?: Answer; onPick: (q: string, a: Answer) => void; firstRef?: RefObject<HTMLInputElement | null> }) {
  const rowRef = useRef<HTMLSpanElement>(null);
  const active = value ? fitCheck.answers.findIndex((a) => a.id === value) : -1;
  useIndicator(rowRef, active);
  return (
    <span ref={rowRef} role="radiogroup" aria-labelledby={`${id}-${q.id}`} className="group/ind relative flex shrink-0 gap-1.5 pl-7 sm:pl-0">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 h-(--ih) w-(--iw) translate-x-(--ix) translate-y-(--iy) rounded-pill border opacity-0 group-data-[indicator-ready]/ind:opacity-100 group-data-[indicator-ready]/ind:transition-[translate,width,background-color,border-color] group-data-[indicator-ready]/ind:duration-[250ms] group-data-[indicator-ready]/ind:ease-instrument motion-reduce:transition-none! forced-colors:forced-color-adjust-none forced-colors:border-[Highlight] forced-colors:bg-[Highlight] ${value ? `${tone[value].edge} ${tone[value].fill}` : "border-transparent"}`}
      />
      {fitCheck.answers.map((a) => {
        const on = value === a.id;
        return (
          <label
            key={a.id}
            data-indicator-item=""
            className={`relative flex h-9 min-w-12 cursor-pointer items-center justify-center rounded-pill border px-3.5 text-small transition-[border-color,color,background-color] duration-200 motion-reduce:transition-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus sm:h-8 sm:px-3 ${
              on ? `${chosen(a.id)} ${forced} group-data-[indicator-ready]/ind:border-transparent group-data-[indicator-ready]/ind:bg-transparent` : "border-line font-medium text-muted hover:border-ink hover:text-ink"
            }`}
          >
            <input ref={a.id === fitCheck.answers[0].id ? firstRef : undefined} type="radio" name={`${id}-${q.id}`} value={a.id} checked={on} onChange={() => onPick(q.id, a.id)} className="sr-only" />
            {a.label}
          </label>
        );
      })}
    </span>
  );
}

type ResultProps = {
  /** Where the questions sit from the result: beside it, or below it on a phone ("card"), or above it ("column"). */
  place?: "card" | "column";
  answered: number;
  done: boolean;
  verdict: (typeof verdicts)[number];
  gaps: Question[];
  answers: Record<string, Answer>;
  className?: string;
};

/**
 * The big score in light Inter, then "/ 100": a muted dash until the first answer, so an empty check
 * never reads as a score of nought. The live line beside it reads it out.
 */
function Score({ pct, answered, size = "lg", className = "" }: { pct: number; answered: number; size?: "lg" | "sm"; className?: string }) {
  return (
    <p className={`flex items-baseline gap-2 text-ink ${className}`}>
      <span className={`${size === "lg" ? "text-[4.5rem] md:text-[5rem]" : "text-[3.5rem]"} font-light leading-none tracking-[-0.04em] tabular-nums ${answered ? "" : "text-muted"}`}>
        {answered ? (
          pct
        ) : (
          <>
            <span aria-hidden="true">—</span>
            <span className="sr-only">No score yet</span>
          </>
        )}
      </span>
      <span className="text-lead leading-none text-muted">/ 100</span>
    </p>
  );
}

/**
 * The three-zone bar: each zone's pale track, the fill up to the score in the verdict's colour, and the
 * labels: the verdict's in its colour, the others muted; it is set heavier once all seven are
 * answered, so the colour shows the live verdict and the weight confirms the final one. On a phone the
 * labels step down to 12px so each holds one line over its zone.
 */
function ZoneBar({ pct, zone: at, done, className = "" }: { pct: number; zone: Zone | null; done: boolean; className?: string }) {
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
      <div className="mt-2 flex gap-0.5">
        {zones.map((z, i) => {
          const to = zones[i + 1]?.from ?? 100;
          // Read as a scale: the low label from the bar's start, the middle one centred on its zone, the
          // high one to the bar's end, so the three stand apart even on a phone.
          const align = i === 0 ? "text-left" : i === zones.length - 1 ? "text-right" : "text-center";
          return (
            <span
              key={z.id}
              style={{ flexBasis: `${to - z.from}%` }}
              className={`min-w-0 grow whitespace-nowrap text-[0.75rem] leading-[1.3] transition-[color] duration-300 motion-reduce:transition-none sm:text-caption ${align} ${at === z.id ? zoneTone[z.id].text : "text-muted"} ${at === z.id && done ? "font-semibold" : ""}`}
            >
              {z.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** What the answers mean so far: a prompt before the first (with the rows the points will fill), then the lead line and up to three points to talk through. */
function Result({ answered, done, verdict, gaps, answers, place = "card", className = "" }: ResultProps) {
  if (!answered) {
    return (
      <div className={className}>
        <div className="flex items-start gap-3">
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className={`mt-1 size-4 shrink-0 text-accent motion-reduce:animate-none ${place === "column" ? "rotate-90" : "-rotate-90 animate-[nudge-y_1.4s_ease-in-out_infinite] lg:rotate-0 lg:animate-[nudge-x_1.4s_ease-in-out_infinite]"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 8H3m4.5-4.5L3 8l4.5 4.5" />
          </svg>
          <span>
            <span className="block text-body font-medium leading-[1.4] text-balance text-ink">
              {place === "column" ? (
                fitCheck.panel.prompt.title.above
              ) : (
                <>
                  <span className="lg:hidden">{fitCheck.panel.prompt.title.narrow}</span>
                  <span className="hidden lg:inline">{fitCheck.panel.prompt.title.wide}</span>
                </>
              )}
            </span>
            <span className="mt-1 block text-small leading-[1.5] text-pretty text-muted">{fitCheck.panel.prompt.body}</span>
          </span>
        </div>
        {place === "card" ? <GhostRows /> : null}
      </div>
    );
  }
  return (
    <div className={className}>
      <p className="text-body leading-[1.6] text-ink">
        {done ? verdict.body : verdict.lead} {gaps.length ? fitCheck.panel.gaps : null}
      </p>
      {gaps.length ? (
        <ul className="mt-3">
          {gaps.map((q) => (
            <GapRow key={q.id} q={q} no={answers[q.id] === "no"} />
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-small leading-[1.5] text-muted">{fitCheck.panel.clear}</p>
      )}
    </div>
  );
}

/** Before the first answer: the three rows the points to talk through will fill, drawn as empty outlines. */
function GhostRows() {
  return (
    <ul aria-hidden="true" className="mt-5 border-t border-line">
      {["w-[62%]", "w-[48%]", "w-[56%]"].map((w) => (
        <li key={w} className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0">
          <span className="size-6 shrink-0 rounded-pill border border-dashed border-hairline" />
          <span className={`h-2 rounded-pill bg-line ${w}`} />
        </li>
      ))}
    </ul>
  );
}

/** One point to talk through: a round mark (a cross for a No, a dash for a Partly) and its phrase. It rises in as it joins. */
function GapRow({ q, no, still = false }: { q: Question; no: boolean; still?: boolean }) {
  return (
    <li className={`flex items-center gap-3 border-b border-line py-2.5 text-small leading-[1.5] text-ink last:border-b-0 ${still ? "" : "animate-[gap-in_400ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"}`}>
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

// The tallest the result can be: the longest verdict line and the three longest points. A hidden copy
// holds the result at that height in every state, so the actions under it never move.
const longestLine = [...verdicts.flatMap((v) => [v.lead, v.body])].sort((a, b) => b.length - a.length)[0];
const longestGaps = [...all].sort((a, b) => b.gap.length - a.gap.length).slice(0, 3);

/**
 * The home card's result column, on paper inside the one card: "Your fit" with the count, the score,
 * the bar, the result, then the two actions in fixed roles ("Book a pilot conversation" the primary,
 * "Send me my result" the secondary), the note and, once anything is answered, "Start again". "Send me
 * my result" swaps the result and actions for a two-field form that sends the answers with the score;
 * the reply comes from a person. Everything that changes is announced politely.
 */
function ResultPanel({ pct, count, scoreRef, onRestart, ...result }: ResultProps & { pct: number; count: string; scoreRef: RefObject<HTMLDivElement | null>; onRestart: () => void }) {
  const { send } = fitCheck.panel;
  const [mode, setMode] = useState<"result" | "form" | "sending" | "sent" | "failed">("result");
  const [errors, setErrors] = useState<Partial<Record<"name" | "email", string>>>({});
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const zone = zones.find((z) => z.id === result.verdict.zone)?.label;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mode === "sending") return;
    const form = new FormData(e.currentTarget);
    const lines = all.map((q, i) => `${i + 1}. ${q.text}: ${fitCheck.answers.find((a) => a.id === result.answers[q.id])?.label ?? "Not answered"}`);
    const parsed = enquirySchema.safeParse({
      // The select shows each type's label; the enquiry carries its id.
      type: enquiryTypes.find((t) => enquiryTypeLabels[t] === form.get("type")) ?? "commercial",
      source: "fit-check",
      name: form.get("name"),
      email: form.get("email"),
      company: form.get("company") ?? "",
      message: [`Fit check: ${pct} / 100 (${zone}), ${count}.`, ...lines].join("\n"),
    });
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (key === "name" || key === "email") next[key] ??= issue.message;
      }
      setErrors(next);
      const first = (["name", "email"] as const).find((k) => next[k]);
      if (first) document.getElementById(fid(first))?.focus();
      return;
    }
    setErrors({});
    setMode("sending");
    try {
      const res = await fetch("/api/enquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed.data) });
      setMode(res.ok ? "sent" : "failed");
    } catch {
      setMode("failed");
    }
  }

  const input = (name: "name" | "email", label: string, props: React.ComponentPropsWithRef<"input">) => (
    <Field id={fid(name)} label={label} error={errors[name]}>
      <input id={fid(name)} name={name} className={fieldControl} aria-invalid={errors[name] ? true : undefined} aria-describedby={describedBy(fid(name), undefined, errors[name])} {...props} />
    </Field>
  );

  return (
    <div className="order-first flex flex-col border-b border-line bg-paper p-5 md:p-10 lg:col-start-2 lg:row-start-2 lg:rounded-br-panel lg:border-b-0 lg:border-l lg:p-12">
      <div ref={scoreRef} tabIndex={-1} className="focus-visible:outline-none">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-small font-medium text-ink">{fitCheck.panel.label}</p>
          <p className="text-caption text-muted tabular-nums">{count}</p>
        </div>
        <Score pct={pct} answered={result.answered} className="mt-3" />
      </div>
      <p aria-live="polite" className="sr-only">
        {result.answered ? `Score ${pct} out of 100: ${zone}. ${count}.` : ""}
      </p>
      <ZoneBar pct={pct} zone={result.answered ? result.verdict.zone : null} done={result.done} className="mt-6" />

      {mode === "result" ? (
        <>
          <div className="mt-8 grid">
            <div aria-hidden="true" className="pointer-events-none invisible [grid-area:1/1]">
              <p className="text-body leading-[1.6]">
                {longestLine} {fitCheck.panel.gaps}
              </p>
              <ul className="mt-3">
                {longestGaps.map((q) => (
                  <GapRow key={q.id} q={q} no still />
                ))}
              </ul>
            </div>
            <div className="[grid-area:1/1]">
              <Result {...result} />
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:mt-auto lg:pt-8">
            <Button href={fitCheck.panel.secondary.href} arrow>
              {fitCheck.panel.secondary.label}
            </Button>
            <Button id={fid("open")} variant="secondary" aria-disabled={!result.answered || undefined} onClick={() => result.answered && setMode("form")}>
              {send.open}
            </Button>
          </div>
        </>
      ) : mode === "sent" ? (
        <div role="status" className="mt-8 flex-1">
          <p ref={focusOnMount} tabIndex={-1} className="font-display text-[1.5rem] leading-[1.2] tracking-[-0.01em] text-ink focus-visible:outline-none">
            {send.sent.title}
          </p>
          <p className="mt-2 text-small leading-[1.5] text-muted">{send.sent.body}</p>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} aria-labelledby={fid("title")} className="mt-8 flex flex-1 flex-col">
          <p id={fid("title")} className="font-display text-[1.5rem] leading-[1.2] tracking-[-0.01em] text-ink">
            {send.title}
          </p>
          <p className="mt-2 text-small leading-[1.5] text-muted">{send.body}</p>
          <div className="mt-5 grid gap-4 [--s-field:var(--color-white)]">
            {input("name", "Name", { autoComplete: "name", ref: focusOnMount })}
            {input("email", "Email", { type: "email", autoComplete: "email", inputMode: "email" })}
            <Field id={fid("type")} label={send.who}>
              <SelectField id={fid("type")} name="type" options={enquiryTypes.map((t) => enquiryTypeLabels[t])} defaultValue={enquiryTypeLabels.commercial} />
            </Field>
          </div>
          <div className="hidden" aria-hidden="true">
            <label htmlFor={fid("company")}>Company</label>
            <input id={fid("company")} name="company" tabIndex={-1} autoComplete="off" />
          </div>
          {mode === "failed" ? (
            <p role="alert" className="mt-4 text-small text-error">
              {send.failed}
            </p>
          ) : null}
          <div className="mt-auto flex flex-col items-start gap-2 pt-8">
            <Button type="submit" size="lg" className="w-full" disabled={mode === "sending"} aria-busy={mode === "sending" || undefined}>
              {mode === "sending" ? send.sending : send.submit}
            </Button>
            <Button
              variant="tertiary"
              onClick={() => {
                setMode("result");
                // Back on the result, focus returns to the button that opened the form.
                requestAnimationFrame(() => document.getElementById(fid("open"))?.focus());
              }}
            >
              {send.back}
            </Button>
          </div>
        </form>
      )}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4">
        <p className="text-caption text-muted">{fitCheck.panel.note}</p>
        {result.answered && mode === "result" ? (
          <Button variant="tertiary" onClick={onRestart}>
            {fitCheck.panel.restart}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Below 1024: the strip at the foot of the card once a question is answered. It sticks 12px above the
 * bottom of the screen while the result panel's score is off screen, and stops at the card's foot. It
 * shows the count (the zone once all seven are answered) over the score, and a button that brings the
 * result back into view under the bar and moves the focus to it (at once under reduced motion).
 */
function FitStrip({ pct, answered, done, count, zone: at, scoreRef }: { pct: number; answered: number; done: boolean; count: string; zone: Zone; scoreRef: RefObject<HTMLDivElement | null> }) {
  const [scoreOnScreen, setScoreOnScreen] = useState(true);
  useEffect(() => {
    const el = scoreRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setScoreOnScreen(entry.isIntersecting), { rootMargin: "-56px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [scoreRef]);
  const zone = zones.find((z) => z.id === at)?.label;
  const back = () => {
    const el = scoreRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 56;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - nav - 24, behavior: reduce ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
  };
  return (
    <div
      data-fit-strip=""
      aria-hidden={scoreOnScreen || undefined}
      className={`sticky bottom-3 z-10 mt-4 flex items-center justify-between gap-4 rounded-card border border-line bg-white px-4 py-2.5 shadow-[0_6px_20px_color-mix(in_srgb,var(--color-night)_12%,transparent)] transition-[opacity] duration-200 motion-reduce:transition-none lg:hidden ${scoreOnScreen ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <span className="min-w-0">
        <span className="block text-caption leading-tight text-muted">{done ? zone : answered ? count : ""}</span>
        <span className="block text-body font-medium leading-tight text-ink tabular-nums">{pct} / 100</span>
      </span>
      <Button variant="secondary" size="sm" onClick={back} tabIndex={scoreOnScreen ? -1 : undefined}>
        {fitCheck.panel.strip.see}
      </Button>
    </div>
  );
}
