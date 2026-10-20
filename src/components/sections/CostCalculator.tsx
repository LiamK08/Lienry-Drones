"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { calculatorCopy as copy } from "@/content/calculator";
import { LIMITS, formatAud, formatPerArea, formatWhole, inRange, parsePercent, parseWhole, perSquareMetre, totalOver } from "@/lib/calculator";
import { propertyTypes } from "@/lib/enquiry-schema";
import { Button } from "@/components/ui/Button";
import { Field, PrefixInput, SelectField, describedBy, fieldControl } from "@/components/ui/Field";

export type PropertyType = (typeof propertyTypes)[number];

export type CostCalculatorProps = {
  /** The band heading's id: the form is labelled by it. */
  headingId: string;
  /** The id of the note under the results ("Uses only the figures you enter..."): the form is described by it. */
  noteId: string;
  /** The building type chosen at load ("" for none). */
  defaultType?: PropertyType | "";
  /** "split" (default, /commercial): the fields beside one results panel. "listing" (/calculator): a
   *  200px sidebar of fields and building-type chips beside a grid of result cards, a note card and
   *  the follow-on card. The ids, the arithmetic and the status line are the same in both. */
  layout?: "split" | "listing";
};

type FieldKey = "area" | "spend" | "rise";

/** "{five}" style templates. */
const fill = (template: string, values: Record<string, string>) => template.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? "");

/** A figure with a break opportunity after each thousands comma, so a long total wraps at a comma. */
const breakable = (v: string): ReactNode[] => v.split(",").flatMap((part, i) => (i ? [",", <wbr key={i} />, part] : [part]));

// The listing sidebar's building type: one radio chip per type (the native radio is sr-only inside its
// label). The edge rests on border-control (WCAG 1.4.11) and darkens on hover; chosen is the accent
// fill with a white label (6.41:1), which hovers darker; the label draws the focus ring.
const chip =
  "flex min-h-[2.125rem] w-full cursor-pointer items-center rounded-hard border border-control bg-white px-4 py-1.5 text-[0.8125rem] leading-[1.2] text-fg-muted " +
  "transition-[background-color,border-color,color] duration-200 ease-instrument motion-reduce:transition-none hover:border-fg " +
  "has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-white has-[:checked]:hover:border-accent-hover has-[:checked]:hover:bg-accent-hover " +
  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-focus";

/** A listing card's 250px white panel; its content sits at the bottom. */
const cardPanel = "flex h-[15.625rem] flex-col justify-end rounded-card bg-white p-6";
/** A listing card's title, line and meta under its panel. */
const cardTitle = "mt-2.5 font-display text-[1.5rem] leading-[1.2] tracking-[-0.02em] text-fg";
const cardLine = "mt-4 text-small leading-[1.2] text-fg";
const cardMeta = "mt-1.5 text-small leading-[1.2] text-fg-muted";

/**
 * The cost calculator: what outsourced exterior cleaning costs the visitor over 5 and 10 years, and
 * per square metre, from their own figures only. No Lienry price, saving, ROI or comparison, and
 * nothing leaves the browser (no fetch, no storage).
 *
 * The values update on every keystroke with no tween; errors show on blur only (a non-empty, invalid
 * field), and valid whole numbers are reformatted with thousands separators on blur, never while
 * focused. One polite status region reads the totals 600ms after the last change while the spend is
 * valid. The building type changes only the area label and the follow-on link. Neither the form nor
 * the panel ever reveals.
 *
 * Split layout: from 1024 the fields stack in columns 1-5 and the results panel takes 7-12; from 768
 * the fields are two by two above the panel; below 768 everything is one column.
 *
 * Listing layout: from 1024 a 200px sidebar (the three fields, then the building type as seven radio
 * chips) beside a three-column grid: the three results as cards (a 250px value panel, the label, a
 * line and a meta line), then the note card and the follow-on card, a whole-card link. From 768 the
 * sidebar's fields and chips sit side by side above the cards; below 768 everything is one column.
 */
export function CostCalculator({ headingId, noteId, defaultType = "", layout = "split" }: CostCalculatorProps) {
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
  const rows = [
    { key: "five", id: "cost-five", label: copy.outputs.five, value: five, more: copy.listing.results.five },
    { key: "ten", id: "cost-ten", label: copy.outputs.ten, value: ten, more: copy.listing.results.ten },
    { key: "perArea", id: "cost-area-rate", label: copy.outputs.perArea, value: perArea, more: copy.listing.results.perArea },
  ];

  /** An output's text: the figure, or the dash (with its sr-only words) before there is one. */
  const readout = (value: string | null, wrapAtCommas = false) =>
    value ? (
      wrapAtCommas ? breakable(value) : value
    ) : (
      <>
        <span aria-hidden="true" className="text-fg-muted">
          {copy.outputs.empty}
        </span>
        <span className="sr-only">{copy.outputs.emptySr}</span>
      </>
    );

  const areaField = (
    <Field id="cost-area" label={type === "Solar farm" ? copy.fields.area.labelSolar : copy.fields.area.label} error={error("area")}>
      <input
        id="cost-area"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="done"
        value={area}
        onChange={(e) => change("area", e.target.value)}
        onBlur={() => blur("area")}
        aria-invalid={shown.area || undefined}
        aria-describedby={describedBy("cost-area", undefined, error("area"))}
        className={fieldControl}
      />
    </Field>
  );
  const spendField = (
    <Field id="cost-spend" label={copy.fields.spend.label} error={error("spend")}>
      <PrefixInput
        id="cost-spend"
        prefix={copy.fields.spend.prefix}
        inputMode="numeric"
        value={spend}
        onChange={(v) => change("spend", v)}
        onBlur={() => blur("spend")}
        invalid={shown.spend}
        describedBy={describedBy("cost-spend", undefined, error("spend"))}
      />
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
    const L = copy.listing;
    return (
      <form
        data-calculator=""
        aria-labelledby={headingId}
        aria-describedby={noteId}
        noValidate
        onSubmit={(e) => e.preventDefault()}
        className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start lg:gap-x-[25px]"
      >
        <div className="md:grid md:grid-cols-2 md:items-start md:gap-x-6 lg:mt-3 lg:block">
          {/* 34px white fields at 14px from 768 (16px below it, so iOS does not zoom in on focus). */}
          <div className="grid gap-4 [&_input]:h-[2.125rem] [&_input]:bg-white md:[&_input]:text-small md:[&_span]:text-small">
            {areaField}
            {spendField}
            {riseField}
          </div>
          <fieldset id="cost-type" className="mt-6 min-w-0 md:mt-0 lg:mt-6">
            <legend className="text-small font-medium text-fg">{copy.fields.type.label}</legend>
            <div className="mt-2 grid grid-cols-2 gap-[0.5625rem] lg:grid-cols-1">
              {propertyTypes.map((t) => (
                <label key={t} className={chip}>
                  <input type="radio" name="cost-type" value={t} checked={type === t} onChange={() => setType(t)} className="sr-only" />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="mt-10 lg:mt-0">
          <dl className="grid gap-4 md:grid-cols-3 md:gap-6 lg:gap-12">
            {rows.map((r) => (
              // The label comes first for a screen reader; the value panel shows first.
              <div key={r.key} className="flex flex-col">
                <dt className={`order-2 ${cardTitle}`}>{r.label}</dt>
                <dd className={`order-1 ${cardPanel}`}>
                  <span id={r.id} className="block min-w-0 font-light tabular-nums text-h2s text-fg [overflow-wrap:anywhere]">
                    {readout(r.value, true)}
                  </span>
                </dd>
                <dd className={`order-3 ${cardLine}`}>{r.more.line}</dd>
                <dd className={`order-4 ${cardMeta}`}>{r.more.meta}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 grid gap-4 md:mt-6 md:grid-cols-2 md:gap-6 lg:mt-12 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col">
              <div className={cardPanel}>
                <p className="font-display text-h3 text-fg">{L.note.panel}</p>
              </div>
              <p className={cardTitle}>{L.note.title}</p>
              <p id={noteId} className={cardLine}>
                {copy.note}
              </p>
              <p className={cardMeta}>{L.note.meta}</p>
            </div>
            {/* The follow-on route: a whole-card link (the title's ::after covers the card). */}
            <div className="group relative flex flex-col">
              <div
                aria-hidden="true"
                className={`${cardPanel} transition-[background-color] duration-300 ease-settle motion-reduce:transition-none group-hover:bg-tint group-has-[:focus-visible]:bg-tint`}
              >
                <span className="flex size-14 items-center justify-center rounded-pill bg-accent text-white">
                  <svg
                    viewBox="0 0 16 16"
                    className="size-5 transition-transform duration-300 ease-settle group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
                  </svg>
                </span>
              </div>
              <p className={cardTitle}>
                <Link
                  href={route.href}
                  className="decoration-1 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:rounded-card after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-solid focus-visible:after:outline-focus"
                >
                  {route.label}
                </Link>
              </p>
              <p className={cardLine}>{L.route.line}</p>
              <p className={cardMeta}>{L.route.meta}</p>
            </div>
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
        <div className="surface-raised rounded-hard border border-rule p-6 lg:p-8">
          <dl>
            {rows.map((r) => (
              <div key={r.key} className="border-t border-rule py-6 first:border-t-0 first:pt-0 last:pb-0">
                <dt className="text-small text-fg-muted">{r.label}</dt>
                <dd className="mt-2">
                  <span id={r.id} className="block min-w-0 font-light tabular-nums text-h2 text-fg [overflow-wrap:anywhere]">
                    {readout(r.value)}
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
