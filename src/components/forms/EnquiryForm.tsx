"use client";

import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { enquirySchema, enquiryTypes, enquiryTypeLabels, propertyCounts, propertyTypes, type EnquiryType } from "@/lib/enquiry-schema";
import { registerPage } from "@/content/pages";
import { Button } from "@/components/ui/Button";

type Errors = Partial<Record<string, string>>;

const inputCls =
  "mt-2 block w-full rounded-hard border border-border-strong bg-raised px-3.5 py-3 text-body text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none";

export function EnquiryForm() {
  const params = useSearchParams();
  const initialType = (enquiryTypes as readonly string[]).includes(params.get("type") ?? "") ? (params.get("type") as EnquiryType) : "homeowner";
  const [type, setType] = useState<EnquiryType>(initialType);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const id = useId();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const raw = Object.fromEntries(form.entries());
    const parsed = enquirySchema.safeParse({ ...raw, type, updates: form.get("updates") === "on" });
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      const first = Object.keys(next)[0];
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/enquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed.data) });
      setStatus(res.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-hard border border-hairline bg-raised p-8">
        <h2 className="text-h3">{registerPage.success.headline}</h2>
        <p className="mt-3 text-body text-muted">{registerPage.success.body}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8" aria-describedby={`${id}-note`}>
      <fieldset>
        <legend className="text-small font-medium">I am a</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {enquiryTypes.map((t) => (
            <label
              key={t}
              className={`flex cursor-pointer items-center gap-3 rounded-hard border px-4 py-3 text-small transition-colors ${type === t ? "border-ink bg-raised" : "border-hairline bg-raised hover:border-border-strong"}`}
            >
              <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="h-4 w-4 accent-[#1c1a17]" />
              {enquiryTypeLabels[t]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="text-small font-medium">
            Name
          </label>
          <input id={`${id}-name`} name="name" autoComplete="name" required className={inputCls} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${id}-name-err` : undefined} />
          {errors.name ? <p id={`${id}-name-err`} className="mt-1.5 text-caption text-debris-text">{errors.name}</p> : null}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="text-small font-medium">
            Email
          </label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" required className={inputCls} aria-invalid={!!errors.email} aria-describedby={errors.email ? `${id}-email-err` : undefined} />
          {errors.email ? <p id={`${id}-email-err`} className="mt-1.5 text-caption text-debris-text">{errors.email}</p> : null}
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className="text-small font-medium">
            Phone <span className="text-muted">(optional)</span>
          </label>
          <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" className={inputCls} />
        </div>
        <div>
          <label htmlFor={`${id}-organisation`} className="text-small font-medium">
            {type === "investor" ? "Fund or firm" : type === "commercial" ? "Company or strata" : "Organisation"} <span className="text-muted">(optional)</span>
          </label>
          <input id={`${id}-organisation`} name="organisation" autoComplete="organization" className={inputCls} />
        </div>
        <div>
          <label htmlFor={`${id}-propertyType`} className="text-small font-medium">
            Property type
          </label>
          <select id={`${id}-propertyType`} name="propertyType" className={inputCls} defaultValue="">
            <option value="">Choose one</option>
            {propertyTypes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-propertyCount`} className="text-small font-medium">
            {type === "investor" ? "Properties you would like to see it on" : "How many properties"}
          </label>
          <select id={`${id}-propertyCount`} name="propertyCount" className={inputCls} defaultValue="">
            <option value="">Choose one</option>
            {propertyCounts.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-location`} className="text-small font-medium">
            Suburb or city
          </label>
          <input id={`${id}-location`} name="location" autoComplete="address-level2" className={inputCls} placeholder="Sydney" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-message`} className="text-small font-medium">
            Anything else
          </label>
          <textarea id={`${id}-message`} name="message" rows={4} className={inputCls} placeholder={type === "investor" ? "Fund, stage, and what you would like to see." : "How many buildings, which surfaces, and when."} />
        </div>
        <div className="hidden" aria-hidden="true">
          <label htmlFor={`${id}-company`}>Company</label>
          <input id={`${id}-company`} name="company" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      <label className="flex items-start gap-3 text-small text-muted">
        <input type="checkbox" name="updates" className="mt-1 h-4 w-4 accent-[#1c1a17]" />
        <span className="max-w-prose">Keep me posted as the pilot program takes shape. No marketing lists, and you can stop any time.</span>
      </label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={status === "sending"} aria-busy={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send"}
        </Button>
        <p id={`${id}-note`} className="text-caption text-muted">
          We only use your details to reply. See our <a href="/privacy" className="water-link">privacy policy</a>.
        </p>
      </div>
      {status === "failed" ? (
        <p role="alert" className="text-small text-debris-text">
          Something went wrong sending that. Please try again, or email us directly.
        </p>
      ) : null}
    </form>
  );
}
