"use client";

import { useRef, type RefObject } from "react";
import { fitCheck } from "@/content/home";
import { Button } from "@/components/ui/Button";
import styles from "./FitCheck.module.css";
import { all, chosen, forced, groupOf, type Answer, type Answers } from "./model";

const { steps } = fitCheck;

/**
 * The status row over a statement: which of the seven it is and its group ("1 of 7 · The building"),
 * beside a bar of seven segments: the accent for an answered question, half the accent for the one on
 * screen, the hairline for the rest (200ms, none under reduced motion). A status line, not a label.
 */
function StatusRow({ step, answers, count }: { step: number; answers: Answers; count: string }) {
  const answered = all.filter((q) => answers[q.id]).length;
  return (
    <div className="flex items-center gap-4 text-small">
      <p className="shrink-0 tabular-nums">
        <span className="font-medium text-ink">{steps.count.replace("{n}", String(step + 1))}</span>
        <span className="text-muted"> · {groupOf(all[step])}</span>
      </p>
      <div role="progressbar" aria-label="Questions answered" aria-valuemin={0} aria-valuemax={all.length} aria-valuenow={answered} aria-valuetext={count} className="flex min-w-0 flex-1 gap-1.5">
        {all.map((q, i) => (
          <span
            key={q.id}
            className={`h-1 flex-1 rounded-pill transition-[background-color] duration-200 motion-reduce:transition-none forced-colors:forced-color-adjust-none ${
              answers[q.id] ? "bg-accent forced-colors:bg-[Highlight]" : i === step ? "bg-accent/45 forced-colors:bg-[Highlight]" : "bg-line forced-colors:bg-[GrayText]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export type StepsProps = {
  /** Prefixes the radio names and the statement's id. */
  id: string;
  step: number;
  /** The way the last move went, for the slide; null before the first move (the first paint never slides). */
  dir: "next" | "back" | null;
  answers: Answers;
  /** "2 of 7 answered", for the bar and the phone readout. */
  count: string;
  /** The score so far, as shown. */
  score: number;
  /** An answer chosen; `go` when it was a press, Enter or Space, which also moves on. */
  onPick: (q: string, a: Answer, go: boolean) => void;
  onBack: () => void;
  onNext: () => void;
  /** The statement on screen: focus moves to it as it arrives. */
  statementRef: RefObject<HTMLParagraphElement | null>;
  /** The card's title heads the phone strip (the home card). */
  titled?: boolean;
  className?: string;
};

/**
 * One statement at a time: the status row, the statement as a serif display line at the card-title
 * step, and its three answers as full-width pills in one radio group. The arrow keys move between the
 * answers without leaving the statement; a press, Enter or Space answers it and, after a short hold,
 * the next statement slides in by itself. Under the answers, "Back" returns with the earlier answer
 * kept and "Next" shows once the statement on screen has an answer; the indicative note closes the column. Every statement holds the room of the longest
 * (hidden copies in the same cell), so no step is taller than another. Below 1024, where the result
 * sheet is not shown, an accent strip at the top keeps the count and the score so far in view in one
 * line (under the card's title on the home page).
 */
export function Steps({ id, step, dir, answers, count, score, onPick, onBack, onNext, statementRef, titled = false, className = "" }: StepsProps) {
  const q = all[step];
  const value = answers[q.id];
  const answered = all.some((x) => answers[x.id]);
  // A press on a pill reaches its radio as a second click: this tells it from the click an arrow key makes.
  const pressed = useRef(false);
  const sid = `${id}-statement`;
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="mb-6 rounded-card bg-accent px-4 py-3.5 text-white lg:hidden">
        {titled ? <h3 className="mb-1 font-display text-[1.5rem] leading-[1.2] tracking-[-0.01em]">{fitCheck.title}</h3> : null}
        <p className="text-caption tabular-nums">
          {count}
          {answered ? (
            <>
              <span className="px-1.5">·</span>
              <span className="font-semibold">
                {score} {fitCheck.panel.soFar}
              </span>
            </>
          ) : null}
        </p>
      </div>
      <StatusRow step={step} answers={answers} count={count} />
      <div className="my-auto py-7 lg:py-8">
        <div key={q.id} data-dir={dir ?? undefined} className={dir ? styles.stepIn : ""}>
          <div className="grid">
            {all.map((x) => (
              <p key={x.id} aria-hidden="true" className="invisible font-display text-h3 text-balance [grid-area:1/1]">
                {x.text}
              </p>
            ))}
            <p id={sid} ref={statementRef} tabIndex={-1} className="self-end font-display text-h3 text-balance text-ink [grid-area:1/1] focus-visible:outline-none">
              {q.text}
            </p>
          </div>
          <div role="radiogroup" aria-labelledby={sid} className="mt-6 grid gap-2.5 lg:mt-8">
            {fitCheck.answers.map((a) => {
              const on = value === a.id;
              return (
                <label
                  key={a.id}
                  onClick={(e) => {
                    if (!(e.target instanceof HTMLInputElement)) pressed.current = true;
                  }}
                  className={`${styles.give} relative flex h-14 cursor-pointer select-none items-center justify-center rounded-pill border text-body has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-focus ${
                    on ? `${chosen(a.id)} ${forced}` : "border-transparent bg-paper font-medium text-ink hover:border-accent/40 hover:bg-tint"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${id}-${q.id}`}
                    value={a.id}
                    checked={on}
                    onChange={() => onPick(q.id, a.id, false)}
                    onClick={() => {
                      if (!pressed.current) return;
                      pressed.current = false;
                      onPick(q.id, a.id, true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      onPick(q.id, a.id, true);
                    }}
                    className="sr-only"
                  />
                  {a.label}
                  {/* The chosen pill's tick: with the solid edge and the heavier weight, the choice never rests on colour alone. */}
                  <svg aria-hidden="true" viewBox="0 0 16 16" className={`absolute right-5 size-4 transition-[opacity] duration-150 motion-reduce:transition-none ${on ? "opacity-100" : "opacity-0"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3.5 8.5 3 3 6-7" />
                  </svg>
                </label>
              );
            })}
          </div>
        </div>
        <div className="mt-2 flex justify-between gap-6">
          <Button variant="tertiary" onClick={onBack} className={step ? "" : "invisible"}>
            {steps.back}
          </Button>
          <Button variant="tertiary" onClick={onNext} className={value ? "" : "invisible"}>
            {step === all.length - 1 ? steps.finish : steps.next}
          </Button>
        </div>
      </div>
      <p className="text-caption text-pretty text-muted">{fitCheck.panel.note}</p>
    </div>
  );
}
