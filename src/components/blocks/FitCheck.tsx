"use client";

import { useState } from "react";
import { fitCheck } from "@/content/home";
import { Button } from "@/components/ui/Button";

type Answer = (typeof fitCheck.answers)[number]["id"];

const all = fitCheck.groups.flatMap((g) => g.questions);
const scoreOf = (a: Answer) => fitCheck.answers.find((x) => x.id === a)?.score ?? 0;

/**
 * The fit check: seven questions in two groups, each answered Yes, Partly or No with a row of small
 * pills (a radio group per question), beside a panel that scores the answers live. The panel names
 * the verdict once all seven are answered and lists the questions marked Partly or No. Indicative only.
 */
export function FitCheck({ id = "fit" }: { id?: string }) {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const answered = Object.keys(answers).length;
  const score = Object.values(answers).reduce((s, a) => s + scoreOf(a), 0);
  const done = answered === all.length;
  const verdict = fitCheck.panel.verdicts.find((v) => score >= v.min) ?? fitCheck.panel.verdicts[fitCheck.panel.verdicts.length - 1];
  const gaps = all.filter((q) => answers[q.id] && answers[q.id] !== "yes");

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
                            className={`relative flex h-8 cursor-pointer items-center rounded-pill border px-3.5 text-caption transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
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
