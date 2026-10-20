"use client";

import { useState, type ReactNode } from "react";
import { fitCheck } from "@/content/home";
import { Button } from "@/components/ui/Button";

type Answer = (typeof fitCheck.answers)[number]["id"];

const all = fitCheck.groups.flatMap((g) => g.questions);
const scoreOf = (a: Answer) => fitCheck.answers.find((x) => x.id === a)?.score ?? 0;

export type FitCheckProps = {
  /** Prefixes the radio names and label ids. Column: the group headings are `${id}-g0`, `${id}-g1`. */
  id?: string;
  /** "card" (default, the home page): questions beside the scoring panel. "column": one centred 684px
   *  column under a seven-segment progress bar, with the result and the buttons after the questions. */
  layout?: "card" | "column";
  /** Column only: the opening paragraphs, over the first group. */
  intro?: ReactNode;
  /** Column only: a small tag at the end of the button row. */
  badge?: string;
};

/**
 * The fit check: seven questions in two groups, each answered Yes, Partly or No with a row of small
 * pills (a radio group per question), beside a panel that scores the answers live. The panel names
 * the verdict once all seven are answered and lists the questions marked Partly or No. Indicative only.
 */
export function FitCheck({ id = "fit", layout = "card", intro, badge }: FitCheckProps) {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const answered = Object.keys(answers).length;
  const score = Object.values(answers).reduce((s, a) => s + scoreOf(a), 0);
  const done = answered === all.length;
  const verdict = fitCheck.panel.verdicts.find((v) => score >= v.min) ?? fitCheck.panel.verdicts[fitCheck.panel.verdicts.length - 1];
  const gaps = all.filter((q) => answers[q.id] && answers[q.id] !== "yes");

  if (layout === "column") {
    const count = fitCheck.panel.answered.replace("{n}", String(answered));
    return (
      <>
        <div
          role="progressbar"
          aria-label="Questions answered"
          aria-valuemin={0}
          aria-valuemax={all.length}
          aria-valuenow={answered}
          aria-valuetext={count}
          className="mx-auto flex max-w-[77rem] gap-[11px]"
        >
          {all.map((q, i) => (
            <span
              key={q.id}
              className={`h-1 flex-1 rounded-pill transition-[background-color] duration-200 motion-reduce:transition-none ${i < answered ? "bg-accent" : "bg-line"}`}
            />
          ))}
        </div>

        <div className="mx-auto mt-6 max-w-[42.75rem]">
          {intro ? <div className="space-y-6 text-body leading-6 text-ink">{intro}</div> : null}

          {fitCheck.groups.map((g, gi) => (
            <div key={g.label} role="group" aria-labelledby={`${id}-g${gi}`} className={gi ? "mt-12" : "mt-8"}>
              <h2 id={`${id}-g${gi}`} className="text-[1.875rem] leading-[1.2] tracking-[-0.02em] text-ink">
                {g.label}
              </h2>
              <ol className="mt-8 space-y-8">
                {g.questions.map((q) => {
                  const n = all.findIndex((x) => x.id === q.id) + 1;
                  return (
                    <li key={q.id} className="flex flex-col gap-2.5">
                      <p id={`${id}-${q.id}`} className="max-w-none text-[1.125rem] font-semibold leading-[1.4] tracking-[-0.01em] text-ink">
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
                              className={`relative flex h-[38px] cursor-pointer items-center rounded-pill border px-4 text-small shadow-[0_1px_2px_rgb(0_0_0/0.06)] transition-[background-color,border-color,color] duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
                                on ? "border-accent bg-accent text-white" : "border-line bg-white text-ink hover:border-ink"
                              }`}
                            >
                              <input type="radio" name={`${id}-${q.id}`} value={a.id} checked={on} onChange={() => setAnswers((s) => ({ ...s, [q.id]: a.id }))} className="sr-only" />
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

          <div className="mt-12 rounded-card border border-line bg-white p-6 shadow-[0_1px_2px_rgb(0_0_0/0.06)]">
            <div aria-live="polite">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-label font-medium uppercase tracking-[0.08em] text-accent">{fitCheck.panel.label}</p>
                <p className="text-caption text-muted">{count}</p>
              </div>
              {done ? (
                <div className="mt-4">
                  <p className="font-display text-[3rem] leading-none text-ink">
                    {score % 1 ? score.toFixed(1) : score}
                    <span className="text-[1.5rem] text-muted"> / 7</span>
                  </p>
                  <p className="mt-3 font-display text-[1.5rem] leading-[1.2] tracking-[-0.01em] text-ink">{verdict.title}</p>
                  <p className="mt-2 text-small text-muted">{verdict.body}</p>
                  {gaps.length ? (
                    <div className="mt-5">
                      <p className="text-caption font-medium text-ink">{fitCheck.panel.gaps}</p>
                      <ul className="mt-2 space-y-1">
                        {gaps.map((q) => (
                          <li key={q.id} className="text-caption text-muted">
                            · {q.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-small text-muted">{answered ? `${all.length - answered} to go.` : fitCheck.panel.empty}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button href={fitCheck.panel.primary.href} size="sm" arrow>
                {fitCheck.panel.primary.label}
              </Button>
              <Button href={fitCheck.panel.secondary.href} variant="secondary" size="sm">
                {fitCheck.panel.secondary.label}
              </Button>
            </div>
            {badge ? <p className="rounded-hard border border-line bg-white px-2.5 py-1 text-caption text-muted">{badge}</p> : null}
          </div>
          <p className="mt-4 text-caption text-muted">{fitCheck.panel.note}</p>
        </div>
      </>
    );
  }

  return (
    <div className="grid overflow-hidden rounded-panel border border-line bg-white shadow-[0_32px_64px_-48px_rgb(0_0_0/0.35)] lg:grid-cols-[1.25fr_1fr]">
      <div className="p-6 md:p-10">
        <p className="text-label font-medium uppercase tracking-[0.08em] text-accent">{fitCheck.eyebrow}</p>
        <h3 className="mt-4 text-h3">{fitCheck.title}</h3>
        <p className="mt-2 text-small text-muted">{fitCheck.intro}</p>
        {fitCheck.groups.map((g) => (
          <fieldset key={g.label} className="mt-8">
            <legend className="text-label font-medium uppercase tracking-[0.08em] text-muted">{g.label}</legend>
            <ol className="mt-2">
              {g.questions.map((q) => {
                const n = all.findIndex((x) => x.id === q.id) + 1;
                return (
                  <li key={q.id} className="flex flex-col gap-3 border-b border-line py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                    <span id={`${id}-${q.id}`} className="flex gap-3 text-small text-ink">
                      <span aria-hidden="true" className="w-4 shrink-0 text-muted">
                        {n}
                      </span>
                      {q.text}
                    </span>
                    <span role="radiogroup" aria-labelledby={`${id}-${q.id}`} className="flex shrink-0 gap-2 pl-7 sm:pl-0">
                      {fitCheck.answers.map((a) => {
                        const on = answers[q.id] === a.id;
                        return (
                          <label
                            key={a.id}
                            className={`relative flex h-8 cursor-pointer items-center rounded-pill border px-3.5 text-caption transition-[background-color,border-color,color] duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
                              on ? "border-accent bg-accent text-white" : "border-line bg-white text-ink hover:border-ink"
                            }`}
                          >
                            <input type="radio" name={`${id}-${q.id}`} value={a.id} checked={on} onChange={() => setAnswers((s) => ({ ...s, [q.id]: a.id }))} className="sr-only" />
                            {a.label}
                          </label>
                        );
                      })}
                    </span>
                  </li>
                );
              })}
            </ol>
          </fieldset>
        ))}
      </div>

      <div className="flex flex-col bg-paper p-6 md:p-10">
        <div className="flex items-center justify-between">
          <p className="text-label font-medium uppercase tracking-[0.08em] text-accent">{fitCheck.panel.label}</p>
          <p className="text-caption text-muted">{fitCheck.panel.answered.replace("{n}", String(answered))}</p>
        </div>
        <div aria-live="polite" className="flex flex-1 flex-col justify-center py-10 text-center">
          {done ? (
            <>
              <p className="font-display text-[4rem] leading-none text-ink">
                {score % 1 ? score.toFixed(1) : score}
                <span className="text-h3 text-muted"> / 7</span>
              </p>
              <p className="mt-4 text-h3">{verdict.title}</p>
              <p className="mx-auto mt-2 max-w-sm text-small text-muted">{verdict.body}</p>
              {gaps.length ? (
                <div className="mx-auto mt-6 max-w-sm text-left">
                  <p className="text-caption font-medium text-ink">{fitCheck.panel.gaps}</p>
                  <ul className="mt-2 space-y-1">
                    {gaps.map((q) => (
                      <li key={q.id} className="text-caption text-muted">
                        · {q.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <p aria-hidden="true" className="font-display text-[5rem] leading-none text-accent/40">
                ?
              </p>
              <p className="mx-auto mt-4 max-w-xs text-small text-muted">{answered ? `${all.length - answered} to go.` : fitCheck.panel.empty}</p>
            </>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <Button href={fitCheck.panel.primary.href} size="lg" className="w-full">
            {fitCheck.panel.primary.label}
          </Button>
          <Button href={fitCheck.panel.secondary.href} variant="secondary" size="lg" className="w-full">
            {fitCheck.panel.secondary.label}
          </Button>
          <p className="mt-1 text-caption text-muted">{fitCheck.panel.note}</p>
        </div>
      </div>
    </div>
  );
}
