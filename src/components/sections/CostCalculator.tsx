"use client";

import { useEffect, useState } from "react";
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
};

type FieldKey = "area" | "spend" | "rise";

/** "{five}" style templates. */
const fill = (template: string, values: Record<string, string>) => template.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? "");

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
 * From 1024 the fields stack in columns 1-5 and the results panel takes 7-12; from 768 the fields
 * are two by two above the panel; below 768 everything is one column.
 */
export function CostCalculator({ headingId, noteId, defaultType = "" }: CostCalculatorProps) {
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
    { key: "five", id: "cost-five", label: copy.outputs.five, value: five },
    { key: "ten", id: "cost-ten", label: copy.outputs.ten, value: ten },
    { key: "perArea", id: "cost-area-rate", label: copy.outputs.perArea, value: perArea },
  ];

  return (
    <form data-calculator="" aria-labelledby={headingId} aria-describedby={noteId} noValidate onSubmit={(e) => e.preventDefault()} className="lg:grid-12">
      <div className="grid gap-6 md:grid-cols-2 md:gap-x-6 lg:col-span-5 lg:grid-cols-1">
        <Field id="cost-type" label={copy.fields.type.label}>
          <SelectField id="cost-type" options={propertyTypes} placeholder={copy.fields.type.placeholder} value={type} onChange={(v) => setType(v as PropertyType | "")} />
        </Field>
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
      </div>
      <div className="mt-10 lg:col-span-6 lg:col-start-7 lg:mt-0">
        <div className="surface-raised rounded-hard border border-rule p-6 lg:p-8">
          <dl>
            {rows.map((r) => (
              <div key={r.key} className="border-t border-rule py-6 first:border-t-0 first:pt-0 last:pb-0">
                <dt className="text-small text-fg-muted">{r.label}</dt>
                <dd className="mt-2">
                  <span id={r.id} className="block min-w-0 font-light tabular-nums text-h2 text-fg [overflow-wrap:anywhere]">
                    {r.value ?? (
                      <>
                        <span aria-hidden="true" className="text-fg-muted">
                          {copy.outputs.empty}
                        </span>
                        <span className="sr-only">{copy.outputs.emptySr}</span>
                      </>
                    )}
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
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {summary}
        </p>
      </div>
    </form>
  );
}
