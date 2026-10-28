"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { calculatorCopy as copy } from "@/content/calculator";
import { LIMITS, formatAud, formatPerArea, formatWhole, inRange, parsePercent, parseWhole, perSquareMetre, totalOver } from "@/lib/calculator";
import { propertyTypes } from "@/lib/enquiry-schema";
import { Button } from "@/components/ui/Button";
import { Field, SelectField, describedBy, fieldControl } from "@/components/ui/Field";

export type PropertyType = (typeof propertyTypes)[number];

export type CostCalculatorProps = {
  /** The results heading's id: the form is labelled by it. */
  headingId: string;
  /** The results heading's words. The listing layout shows it over the results; the split layout
   *  leaves the heading to the band (render it there with `headingId`). */
  heading?: string;
  /** The id of the note under the results ("Uses only the figures you enter..."): the form is described by it. */
  noteId: string;
  /** The building type chosen at load ("" for none). */
  defaultType?: PropertyType | "";
  /** "split" (default): the fields beside one results panel, on the band's grid. "listing"
   *  (/calculator): one panel, the building type as pill chips and the fields beside a summary of the
   *  results, its note and the follow-on pill. The ids, the arithmetic and the status line are the
   *  same in both. */
  layout?: "split" | "listing";
};

type FieldKey = "area" | "spend" | "rise";

/** "{five}" style templates. */
const fill = (template: string, values: Record<string, string>) => template.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? "");

/** A figure with a break opportunity after each thousands comma, so a long total wraps at a comma. */
const breakable = (v: string): ReactNode[] => v.split(",").flatMap((part, i) => (i ? [",", <wbr key={i} />, part] : [part]));

/** Thousands commas, three digits at a time from the right ("0012000" keeps its zeros: "0,012,000"). */
const group = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/**
 * A whole number re-grouped with thousands commas as it is typed, so the area and the spend always
 * read alike. The caret stays after the same digit. Deleting a comma deletes the digit beside it
 * instead (the comma would only come back). Anything but digits, commas and spaces is left exactly as
 * typed, for the blur to flag.
 */
function regroup(next: string, caret: number | null, prev: string, inputType: string | undefined): { value: string; caret: number | null } {
  let value = next;
  let at = caret;
  const digitsOf = (s: string) => s.replace(/\D/g, "");
  if (at !== null && value.length === prev.length - 1 && digitsOf(value) === digitsOf(prev) && digitsOf(value) !== "") {
    if (inputType === "deleteContentForward") value = value.slice(0, at) + value.slice(at + 1);
    else if (at > 0) {
      value = value.slice(0, at - 1) + value.slice(at);
      at -= 1;
    }
  }
  if (!/^[\d,\s]*$/.test(value)) return { value, caret: at };
  const before = at === null ? null : digitsOf(value.slice(0, at)).length;
  const grouped = group(digitsOf(value));
  if (before === null) return { value: grouped, caret: null };
  // The caret goes after the same count of digits in the grouped text.
  let pos = 0;
  for (let seen = 0; pos < grouped.length && seen < before; pos++) if (/\d/.test(grouped[pos])) seen++;
  return { value: grouped, caret: pos };
}

/** A whole-number field (the area, the spend) that keeps its thousands commas as it is typed, with an optional prefix ("$") drawn inside its left edge. */
function WholeInput({ id, value, onValue, onBlur, invalid, describedBy: described, prefix }: { id: string; value: string; onValue: (v: string) => void; onBlur: () => void; invalid: boolean; describedBy?: string; prefix?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  // After React writes the re-grouped value (which puts the caret at the end), put it back.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && caret.current !== null && document.activeElement === el) el.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  });
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const r = regroup(e.target.value, e.target.selectionStart, value, (e.nativeEvent as InputEvent).inputType);
    if (r.value !== value) caret.current = r.caret;
    else if (r.caret !== null) {
      // Re-grouped to the same text (a comma or space typed mid-number): nothing renders, so the effect
      // above never runs, but React still writes the value back, caret at the end. Put it back after that.
      const el = e.target;
      const at = r.caret;
      queueMicrotask(() => document.activeElement === el && el.setSelectionRange(at, at));
    }
    onValue(r.value);
  };
  const input = (
    <input
      ref={ref}
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      enterKeyHint="done"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      aria-invalid={invalid || undefined}
      aria-describedby={described}
      className={prefix ? `${fieldControl} pl-8` : fieldControl}
    />
  );
  if (!prefix) return input;
  return (
    <div className="relative">
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-body text-fg-muted">
        {prefix}
      </span>
      {input}
    </div>
  );
}

// The listing's building type: one radio pill per type, as the fit check's answers are drawn (the
// native radio is sr-only inside its label, and the label draws the focus ring). Chosen is the accent
// tint with a 2px accent edge (the border and an inset ring, so the pill never changes size) and the
// accent label, so the choice never rests on the colour of the text alone; in forced colours it is
// HighlightText on Highlight, hovered or not. The label text is the type's name and nothing else: it is
// the radio's accessible name.
const chip =
  "relative inline-flex h-9 cursor-pointer select-none items-center rounded-pill border px-4 text-small font-medium " +
  "transition-[background-color,border-color,color,box-shadow] duration-200 ease-instrument motion-reduce:transition-none " +
  "border-line bg-white text-fg-muted hover:border-ink hover:text-ink " +
  "has-[:checked]:border-accent has-[:checked]:bg-tint has-[:checked]:text-accent has-[:checked]:shadow-[inset_0_0_0_1px_var(--color-accent)] not-forced-colors:has-[:checked]:hover:border-accent not-forced-colors:has-[:checked]:hover:text-accent " +
  "forced-colors:has-[:checked]:forced-color-adjust-none forced-colors:has-[:checked]:border-[Highlight] forced-colors:has-[:checked]:bg-[Highlight] forced-colors:has-[:checked]:text-[HighlightText] " +
  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-focus";

/**
 * The cost calculator: what outsourced exterior cleaning costs the visitor over 5 and 10 years, and
 * per square metre, from their own figures only. No Lienry price, saving, ROI or comparison, and
 * nothing leaves the browser (no fetch, no storage).
 *
 * The values update on every keystroke with no tween; until a value can be worked out, its place says
 * what it still needs (the empty state). The area and the spend keep thousands commas as they are
 * typed; errors show on blur only (a non-empty, invalid field). One polite status region reads the
 * totals 600ms after the last change while the spend is valid. The building type changes only the
 * area label and the follow-on link. Neither the form nor the panel ever reveals.
 *
 * Listing layout: one white panel. From 1024 the inputs take five of its twelve columns (the building
 * type as pill chips, then the three fields) and the summary takes seven on paper: its heading, the
 * three results as rows (the label and how it is worked out, the figure at the right), the note, then
 * the follow-on pill. Below 1024 the summary follows the inputs, and from 768 to 1023 the three fields
 * sit in one row. Below 768 each result row reads label, figure, then how it is worked out.
 *
 * Split layout: from 1024 the fields stack in columns 1-5 and the results panel takes 7-12; from 768
 * the fields are two by two above the panel; below 768 everything is one column.
 */
export function CostCalculator({ headingId, heading, noteId, defaultType = "", layout = "split" }: CostCalculatorProps) {
  const [type, setType] = useState<PropertyType | "">(defaultType);
  const [area, setArea] = useState("");
  const [spend, setSpend] = useState("");
  const [rise, setRise] = useState<string>(copy.fields.rise.defaultValue);
  const [shown, setShown] = useState<Record<FieldKey, boolean>>({ area: false, spend: false, rise: false });
  const [summary, setSummary] = useState("");

  const areaN = parseWhole(area);
  const spendN = parseWhole(spend);
  const riseN = parsePercent(rise);
  const areaOk = inRange(areaN, LIMITS.area);
  const spendOk = inRange(spendN, LIMITS.spend);
  const riseOk = inRange(riseN, LIMITS.rise);
  const valid: Record<FieldKey, boolean> = { area: areaOk, spend: spendOk, rise: riseOk };
  const raw: Record<FieldKey, string> = { area, spend, rise };

  const totals = spendOk && riseOk ? { five: totalOver(5, spendN!, riseN!), ten: totalOver(10, spendN!, riseN!) } : null;
  const rate = spendOk && areaOk ? perSquareMetre(spendN!, areaN!) : null;
  const five = totals ? formatAud(totals.five) : null;
  const ten = totals ? formatAud(totals.ten) : null;
  const perArea = rate !== null ? formatPerArea(rate, copy.outputs.underOne) : null;

  // The status line follows the figures 600ms after the last change, and only while the spend is valid.
  useEffect(() => {
    if (!five || !ten) return;
    const next = [fill(copy.status.five, { five }), fill(copy.status.ten, { ten }), perArea ? fill(copy.status.perArea, { perArea }) : ""].filter(Boolean).join(" ");
    const t = window.setTimeout(() => setSummary(next), 600);
    return () => window.clearTimeout(t);
  }, [five, ten, perArea]);

  const change = (key: FieldKey, value: string) => {
    if (key === "area") setArea(value);
    else if (key === "spend") setSpend(value);
    else setRise(value);
    // An error shown on blur goes as soon as the field is valid (or empty) again.
    if (shown[key]) {
      const ok = value.trim() === "" || (key === "rise" ? inRange(parsePercent(value), LIMITS.rise) : inRange(parseWhole(value), key === "area" ? LIMITS.area : LIMITS.spend));
      if (ok) setShown((s) => ({ ...s, [key]: false }));
    }
  };

  const blur = (key: FieldKey) => {
    const value = raw[key];
    const empty = value.trim() === "";
    setShown((s) => ({ ...s, [key]: !empty && !valid[key] }));
    if (!empty && valid[key] && key !== "rise") {
      const n = parseWhole(value);
      if (n !== null) change(key, formatWhole(n));
    }
  };

  const error = (key: FieldKey) => (shown[key] ? copy.fields[key].error : undefined);
  const route = copy.routes[type];
  const solar = type === "Solar farm";
  // What each result still needs before it can be worked out.
  const needsTotal = !spendOk ? copy.needs.spend : copy.needs.rise;
  const needsRate = !spendOk && !areaOk ? copy.needs.both : !areaOk ? (solar ? copy.needs.areaSolar : copy.needs.area) : copy.needs.spend;
  const rows = [
    { key: "five", id: "cost-five", label: copy.outputs.five, value: five, needs: needsTotal, line: copy.listing.results.five },
    { key: "ten", id: "cost-ten", label: copy.outputs.ten, value: ten, needs: needsTotal, line: copy.listing.results.ten },
    { key: "perArea", id: "cost-area-rate", label: copy.outputs.perArea, value: perArea, needs: needsRate, line: solar ? copy.listing.results.perAreaSolar : copy.listing.results.perArea },
  ];

  /** An output's text: the figure, or what it still needs, in the small muted text. */
  const readout = (value: string | null, needs: string, wrapAtCommas = false) =>
    value ? wrapAtCommas ? breakable(value) : value : <span className="text-small font-normal leading-[1.5] text-fg-muted">{needs}</span>;

  const areaField = (
    <Field id="cost-area" label={solar ? copy.fields.area.labelSolar : copy.fields.area.label} error={error("area")}>
      <WholeInput id="cost-area" value={area} onValue={(v) => change("area", v)} onBlur={() => blur("area")} invalid={shown.area} describedBy={describedBy("cost-area", undefined, error("area"))} />
    </Field>
  );
  const spendField = (
    <Field id="cost-spend" label={copy.fields.spend.label} error={error("spend")}>
      <WholeInput id="cost-spend" prefix={copy.fields.spend.prefix} value={spend} onValue={(v) => change("spend", v)} onBlur={() => blur("spend")} invalid={shown.spend} describedBy={describedBy("cost-spend", undefined, error("spend"))} />
    </Field>
  );
  const riseField = (
    <Field id="cost-rise" label={copy.fields.rise.label} help={copy.fields.rise.help} error={error("rise")}>
      <input
        id="cost-rise"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="done"
        value={rise}
        onChange={(e) => change("rise", e.target.value)}
        onBlur={() => blur("rise")}
        aria-invalid={shown.rise || undefined}
        aria-describedby={describedBy("cost-rise", copy.fields.rise.help, error("rise"))}
        className={fieldControl}
      />
    </Field>
  );
  const status = (
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {summary}
    </p>
  );

  if (layout === "listing") {
    return (
      <form
        data-calculator=""
        aria-labelledby={headingId}
        aria-describedby={noteId}
        noValidate
        onSubmit={(e) => e.preventDefault()}
        className="overflow-hidden rounded-panel border border-line bg-white lg:grid lg:grid-cols-12"
      >
        <div className="p-5 md:p-8 lg:col-span-5 lg:p-10">
          <fieldset id="cost-type" className="min-w-0">
            <legend className="text-small font-medium text-fg">{copy.fields.type.label}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {propertyTypes.map((t) => (
                <label key={t} className={chip}>
                  <input type="radio" name="cost-type" value={t} checked={type === t} onChange={() => setType(t)} className="sr-only" />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>
          {/* From 768 to 1023 the three fields sit in a row: each label holds two lines, set to its foot,
              so the fields line up however the labels wrap. */}
          <div className="mt-8 grid gap-6 md:grid-cols-3 md:[&>div>label]:flex md:[&>div>label]:min-h-[2.625rem] md:[&>div>label]:items-end lg:grid-cols-1 lg:[&>div>label]:block lg:[&>div>label]:min-h-0">
            {areaField}
            {spendField}
            {riseField}
          </div>
        </div>
        <div className="border-t border-line bg-paper p-5 md:p-8 lg:col-span-7 lg:border-l lg:border-t-0 lg:p-10">
          <h2 id={headingId} className="text-h3">
            {heading}
          </h2>
          <dl className="mt-6 border-t border-line">
            {rows.map((r) => (
              // The label comes first for a screen reader. On phones the figure follows it, then how it is
              // worked out; from 768 the figure sits at the right of the row, beside both.
              <div key={r.key} className="border-b border-line py-5 md:grid md:grid-cols-[minmax(0,1fr)_minmax(9rem,auto)] md:gap-x-6">
                <dt className="text-body font-medium leading-[1.5] text-fg md:col-start-1 md:row-start-1">{r.label}</dt>
                <dd className="mt-1 min-w-0 md:col-start-2 md:row-span-2 md:row-start-1 md:mt-0 md:self-center md:text-right">
                  <span id={r.id} className="block min-w-0 font-sans text-[1.75rem] font-light leading-[1.2] tracking-[-0.02em] tabular-nums text-fg [overflow-wrap:anywhere] md:text-[2rem]">
                    {readout(r.value, r.needs, true)}
                  </span>
                </dd>
                <dd className="mt-1 text-small leading-[1.5] text-fg-muted md:col-start-1 md:row-start-2">{r.line}</dd>
              </div>
            ))}
          </dl>
          <p id={noteId} className="mt-4 text-small leading-[1.5] text-fg-muted">
            {copy.note}
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
            <Button href={route.href} arrow>
              {route.label}
            </Button>
            <p className="max-w-[22rem] text-small leading-[1.5] text-fg-muted">{copy.listing.route}</p>
          </div>
          {status}
        </div>
      </form>
    );
  }

  return (
    <form data-calculator="" aria-labelledby={headingId} aria-describedby={noteId} noValidate onSubmit={(e) => e.preventDefault()} className="lg:grid-12">
      <div className="grid gap-6 md:grid-cols-2 md:gap-x-6 lg:col-span-5 lg:grid-cols-1">
        <Field id="cost-type" label={copy.fields.type.label}>
          <SelectField id="cost-type" options={propertyTypes} placeholder={copy.fields.type.placeholder} value={type} onChange={(v) => setType(v as PropertyType | "")} />
        </Field>
        {areaField}
        {spendField}
        {riseField}
      </div>
      <div className="mt-10 lg:col-span-6 lg:col-start-7 lg:mt-0">
        <div className="rounded-card border border-line bg-white p-6 lg:p-8">
          <dl>
            {rows.map((r) => (
              <div key={r.key} className="border-t border-line py-6 first:border-t-0 first:pt-0 last:pb-0">
                <dt className="text-small text-fg-muted">{r.label}</dt>
                <dd className="mt-2">
                  <span id={r.id} className="block min-w-0 font-light tabular-nums text-h2 text-fg [overflow-wrap:anywhere]">
                    {readout(r.value, r.needs)}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <p id={noteId} className="mt-4 text-caption text-fg-muted">
          {copy.note}
        </p>
        <div className="mt-2">
          <Button href={route.href} variant="tertiary" arrow>
            {route.label}
          </Button>
        </div>
        {status}
      </div>
    </form>
  );
}
