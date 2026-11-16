"use client";

import { useEffect, useRef, useState } from "react";
import { fitCheck } from "@/content/home";
import styles from "./fitcheck/FitCheck.module.css";
import { all, gapsOf, scoreFor, verdictFor, zoneLabel, type Answer, type Answers } from "./fitcheck/model";
import { ResultFoot, ResultTop } from "./fitcheck/Result";
import { Sheet } from "./fitcheck/Sheet";
import { Steps } from "./fitcheck/Steps";
import { useCountUp } from "./fitcheck/useCountUp";

export type FitCheckProps = {
  /** Prefixes the radio names and label ids. */
  id?: string;
  /** The home card shows its own title ("Is your building a fit?") and a line under it: at the head of
   *  the result panel from 1024, and of the strip at the top of the card below it. /fit-check leaves
   *  the title to the page's h1. */
  titled?: boolean;
};

/** The card's raised shadow, mixed from the palette's night (the calculator's panel takes it too). */
export const raisedShadow = "shadow-[0_30px_80px_-30px_color-mix(in_srgb,var(--color-night)_22%,transparent)]";

/** How long a chosen answer shows before the next statement arrives by itself. */
const HOLD = 300;

/**
 * The fit check: seven statements from the design brief, one at a time, each answered Yes, Partly or
 * No, and scored out of 100 (fitcheck/model.ts: the weights, the ceiling the building answers set, the
 * three zones and the points to talk through). Indicative only.
 *
 * One raised white card on its band. The statements take the left of it (Steps): an answer holds for a
 * moment, then the next statement slides in, and "Back" returns with the earlier answer kept. From
 * 1024 the live result sits beside them as a sheet on an accent panel (Sheet): the score, which counts
 * to each new value over about 450ms (none under reduced motion; the live line reads only the final
 * figure), the three-zone bar, and the seven statements gaining their tags. Below 1024 one line in a
 * strip at the top of the card reads the count and the score so far instead.
 *
 * After the seventh answer the result takes the statements' place with a 10px rise and a fade: the
 * score and its zone, the points to talk through, "Check your answers" (the sheet's rows, each now a
 * switch that re-scores at once), the primary action and the send form in place at the foot, answered
 * by a person. From 1024 the card keeps one height through every step and the result: the result is
 * laid out from the start, out of sight and inert, in the cells the statements sit over. Below 1024
 * every step shares one height and the result, which is longer, opens downward once. Focus moves to
 * each new statement and to the result as they arrive, and a polite live line says where things stand.
 */
export function FitCheck({ id = "fit", titled = false }: FitCheckProps) {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"next" | "back" | null>(null);
  const [result, setResult] = useState(false);
  const hold = useRef(0);
  // Set by a move, so focus follows the new statement (or the result) once it is on the page.
  const follow = useRef(false);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const answered = all.filter((q) => answers[q.id]).length;
  const pct = scoreFor(answers);
  const shown = useCountUp(pct) ?? pct;
  const verdict = verdictFor(answers);
  const count = fitCheck.panel.answered.replace("{n}", String(answered));

  useEffect(() => () => window.clearTimeout(hold.current), []);
  useEffect(() => {
    if (!follow.current) return;
    follow.current = false;
    (result ? resultRef : statementRef).current?.focus({ preventScroll: true });
  }, [step, result]);

  const move = (to: number, way: "next" | "back") => {
    window.clearTimeout(hold.current);
    follow.current = true;
    if (to >= all.length) setResult(true);
    else {
      setStep(to);
      setDir(way);
    }
  };
  const pick = (q: string, a: Answer, go = false) => {
    setAnswers((s) => (s[q] === a ? s : { ...s, [q]: a }));
    if (!go) return;
    window.clearTimeout(hold.current);
    hold.current = window.setTimeout(() => move(step + 1, "next"), HOLD);
  };
  const restart = () => {
    setAnswers({});
    setResult(false);
    move(0, "back");
  };

  // What the live line says: the result once it shows; before it, the statement's place and the score so far.
  const live = result
    ? `${fitCheck.panel.label}: ${pct} out of 100, ${zoneLabel(verdict.zone)}.`
    : dir || answered
      ? `${fitCheck.steps.announce.replace("{n}", String(step + 1))}${answered ? ` ${pct} ${fitCheck.panel.soFar}.` : ""}`
      : "";
  // Until the result shows it only holds its room from 1024 (and none below): out of sight and inert.
  const rest = result ? styles.riseIn : "max-lg:hidden lg:invisible";

  return (
    <div role="group" aria-label={fitCheck.title} className={`grid rounded-panel bg-white ${raisedShadow} lg:grid-cols-2 lg:grid-rows-[auto_1fr]`}>
      {result ? null : (
        <Steps
          id={id}
          step={step}
          dir={dir}
          answers={answers}
          count={count}
          score={shown}
          onPick={pick}
          onBack={() => move(step - 1, "back")}
          onNext={() => move(step + 1, "next")}
          statementRef={statementRef}
          titled={titled}
          className="px-5 py-6 md:p-10 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:p-10"
        />
      )}
      <div inert={!result} aria-hidden={!result || undefined} className={`px-5 pt-6 md:px-10 md:pt-10 lg:col-start-1 lg:row-start-1 lg:px-10 lg:pt-10 ${rest}`}>
        <ResultTop shown={shown} pct={pct} verdict={verdict} gaps={gapsOf(answers)} answers={answers} focusRef={resultRef} />
      </div>
      <Sheet id={id} answers={answers} step={result ? -1 : step} done={result} shown={shown} pct={pct} verdict={verdict} count={count} onPick={pick} titled={titled} className={`lg:col-start-2 lg:row-span-2 lg:row-start-1 ${result ? "max-lg:mt-8" : "max-lg:hidden"}`} />
      <div inert={!result} aria-hidden={!result || undefined} className={`px-5 pb-6 pt-8 md:px-10 md:pb-10 lg:col-start-1 lg:row-start-2 lg:self-end lg:px-10 lg:pb-10 lg:pt-7 ${rest}`}>
        <ResultFoot pct={pct} count={count} verdict={verdict} answers={answers} onRestart={restart} />
      </div>
      <p aria-live="polite" className="sr-only">
        {live}
      </p>
    </div>
  );
}
