"use client";

import { useId, useState, type RefObject } from "react";
import { fitCheck } from "@/content/home";
import { enquirySchema, enquiryTypeLabels, enquiryTypes } from "@/lib/enquiry-schema";
import { Button } from "@/components/ui/Button";
import { Field, SelectField, describedBy, fieldControl } from "@/components/ui/Field";
import styles from "./FitCheck.module.css";
import { all, labelOf, verdicts, zoneLabel, zoneTone, type Answers, type Question, type Verdict } from "./model";
import { GapRow, ZoneBar, longestGaps } from "./parts";

const { panel } = fitCheck;
const { send } = panel;
/** Moves focus onto the sent line as it takes the form's place. */
const focusOnMount = (el: HTMLElement | null) => el?.focus({ preventScroll: true });
// The longest verdict line: with the three longest points, a hidden copy of it holds the result's room.
const longestLine = [...verdicts.map((v) => v.body)].sort((a, b) => b.length - a.length)[0];

/**
 * The head of the result, where the statements stood: the score out of 100 in light Inter (it counts
 * to a new value: `shown`) with the zone's name beside it in the serif and the zone's own tone, the
 * three-zone bar, the verdict's line and up to three points to talk through (the Nos first, then the
 * Partlys), or a clear line when there are none. From 1024, where the card keeps one height, it holds
 * the room of the longest line and three points, so changing an answer never moves what follows.
 * Focus lands on it as it arrives.
 */
export function ResultTop({ shown, pct, verdict, gaps, answers, focusRef, className = "" }: { shown: number; pct: number; verdict: Verdict; gaps: Question[]; answers: Answers; focusRef: RefObject<HTMLDivElement | null>; className?: string }) {
  return (
    <div className={className}>
      <div ref={focusRef} tabIndex={-1} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 focus-visible:outline-none">
        <p className="flex items-baseline gap-2 text-ink">
          <span className="text-[4.5rem] font-light leading-none tracking-[-0.04em] tabular-nums">{shown}</span>
          <span className="text-lead leading-none text-muted">{panel.outOf}</span>
        </p>
        <p className={`font-display text-[1.5rem] leading-[1.2] tracking-[-0.01em] transition-[color] duration-300 motion-reduce:transition-none ${zoneTone[verdict.zone].text}`}>{verdict.title}</p>
      </div>
      <ZoneBar pct={pct} zone={verdict.zone} done roomy className="mt-5" />
      <div className="mt-6 grid">
        <div aria-hidden="true" className="pointer-events-none invisible [grid-area:1/1] max-lg:hidden">
          <p className="text-body leading-[1.6]">
            {longestLine} {panel.gaps}
          </p>
          <ul className="mt-2">
            {longestGaps.map((q) => (
              <GapRow key={q.id} q={q} no still />
            ))}
          </ul>
        </div>
        <div className="[grid-area:1/1]">
          <p className="text-body leading-[1.6] text-ink">
            {verdict.body} {gaps.length ? panel.gaps : null}
          </p>
          {gaps.length ? (
            <ul className="mt-2">
              {gaps.map((q) => (
                <GapRow key={q.id} q={q} no={answers[q.id] === "no"} />
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-small leading-[1.5] text-muted">{panel.clear}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The foot of the result: the primary action ("Book a pilot conversation") beside "Start again", then
 * the send form in place, so the result stays in view while it is filled in: a name, an email and who
 * is asking, sent with the answers and the score through the enquiry route and answered by a person
 * (no report is sent). The name and the email each keep a line of room under them for an error, and the
 * line that says a send failed takes the helper's place, so nothing moves. Once sent, a status line that names the
 * address rises into the form's place. The indicative note closes the card.
 */
export function ResultFoot({ pct, count, verdict, answers, onRestart, className = "" }: { pct: number; count: string; verdict: Verdict; answers: Answers; onRestart: () => void; className?: string }) {
  const [mode, setMode] = useState<"form" | "sending" | "sent" | "failed">("form");
  const [errors, setErrors] = useState<Partial<Record<"name" | "email", string>>>({});
  const [sentTo, setSentTo] = useState("");
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const sent = mode === "sent";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mode === "sending") return;
    const form = new FormData(e.currentTarget);
    const lines = all.map((q, i) => `${i + 1}. ${q.text}: ${answers[q.id] ? labelOf(answers[q.id]) : "Not answered"}`);
    const parsed = enquirySchema.safeParse({
      // The select shows each type's label; the enquiry carries its id.
      type: enquiryTypes.find((t) => enquiryTypeLabels[t] === form.get("type")) ?? "commercial",
      source: "fit-check",
      name: form.get("name"),
      email: form.get("email"),
      company: form.get("company") ?? "",
      message: [`Fit check: ${pct} / 100 (${zoneLabel(verdict.zone)}), ${count}.`, ...lines].join("\n"),
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
      if (res.ok) setSentTo(parsed.data.email);
      setMode(res.ok ? "sent" : "failed");
    } catch {
      setMode("failed");
    }
  }

  // A field over the line of room its error takes (label 21, 8, control 48, 8, one caption line), so
  // an error never moves what follows.
  const input = (name: "name" | "email", label: string, props: React.ComponentPropsWithRef<"input">) => (
    <div className="min-h-[6.625rem] min-w-0 flex-1">
      <Field id={fid(name)} label={label} error={errors[name]}>
        <input id={fid(name)} name={name} className={fieldControl} aria-invalid={errors[name] ? true : undefined} aria-describedby={describedBy(fid(name), undefined, errors[name])} {...props} />
      </Field>
    </div>
  );
  const [sentLead, sentTail = ""] = send.sent.body.split("{email}");

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
        <Button href={panel.action.href} arrow>
          {panel.action.label}
        </Button>
        <Button variant="tertiary" onClick={onRestart}>
          {panel.restart}
        </Button>
      </div>
      <div className="mt-6 grid border-t border-line pt-6">
        <form noValidate onSubmit={onSubmit} aria-labelledby={fid("title")} inert={sent} className={`[grid-area:1/1] ${sent ? "invisible" : ""}`}>
          <p id={fid("title")} className="font-display text-[1.5rem] leading-[1.2] tracking-[-0.01em] text-ink">
            {send.title}
          </p>
          <div className="mt-1.5 grid text-small leading-[1.5]">
            <p aria-hidden={mode === "failed" || undefined} className={`text-muted [grid-area:1/1] ${mode === "failed" ? "invisible" : ""}`}>
              {send.body}
            </p>
            {mode === "failed" ? (
              <p role="alert" className="text-error [grid-area:1/1]">
                {send.failed}
              </p>
            ) : (
              <p aria-hidden="true" className="invisible [grid-area:1/1]">
                {send.failed}
              </p>
            )}
          </div>
          {/* From 640 two rows: the name beside who is asking (the wider), then the email beside the submit,
              which lines up with the field. From 1024, in the card's half, the fields set their text at
              14px, so the longest option ("Commercial building pilot") shows whole. */}
          <div className="mt-4 [--s-field:var(--color-white)] lg:[&_input]:text-small lg:[&_select]:text-small">
            <div className="sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-x-4">
              {input("name", "Name", { autoComplete: "name" })}
              <div className="min-h-[6.625rem]">
                <Field id={fid("type")} label={send.who}>
                  <SelectField id={fid("type")} name="type" options={enquiryTypes.map((t) => enquiryTypeLabels[t])} defaultValue={enquiryTypeLabels.commercial} />
                </Field>
              </div>
            </div>
            <div className="sm:flex sm:items-start sm:gap-x-4">
              {input("email", "Email", { type: "email", autoComplete: "email", inputMode: "email" })}
              <Button type="submit" size="lg" className="w-full sm:mt-[1.8125rem] sm:w-auto sm:min-w-[9.5rem]" disabled={mode === "sending"} aria-busy={mode === "sending" || undefined}>
                {mode === "sending" ? send.sending : send.submit}
              </Button>
            </div>
          </div>
          <div className="hidden" aria-hidden="true">
            <label htmlFor={fid("company")}>Company</label>
            <input id={fid("company")} name="company" tabIndex={-1} autoComplete="off" />
          </div>
        </form>
        {sent ? (
          <div role="status" ref={focusOnMount} tabIndex={-1} className={`${styles.riseIn} flex items-start gap-4 self-center [grid-area:1/1] focus-visible:outline-none`}>
            <span aria-hidden="true" className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-pill bg-tint text-accent">
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3.5 8.5 3 3 6-7" />
              </svg>
            </span>
            <span>
              <span className="block font-display text-[1.5rem] leading-[1.2] tracking-[-0.01em] text-ink">{send.sent.title}</span>
              <span className="mt-1.5 block text-small leading-[1.5] text-muted">
                {sentLead}
                <span className="font-medium text-ink [overflow-wrap:anywhere]">{sentTo}</span>
                {sentTail}
              </span>
            </span>
          </div>
        ) : null}
      </div>
      <p className="mt-5 text-caption text-muted sm:mt-1">{panel.note}</p>
    </div>
  );
}
