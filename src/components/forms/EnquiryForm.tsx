"use client";

import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { enquirySchema, enquiryTypes, enquiryTypeLabels, propertyCounts, propertyTypes, type EnquiryType } from "@/lib/enquiry-schema";
import { registerPage } from "@/content/register";
import { Button } from "@/components/ui/Button";
import { Field, SelectField, choiceBox, choiceInput, describedBy, fieldArea, fieldControl, radioCard } from "@/components/ui/Field";
import { TextLink } from "@/components/ui/TextLink";

type Errors = Partial<Record<string, string>>;

/** Moves focus to the success heading as it mounts, so the confirmation is announced and in view. */
const focusOnMount = (el: HTMLHeadingElement | null) => el?.focus();

/**
 * The enquiry form on /register-interest. Every control is a Field (role tokens, so it reads on
 * plaster); the type comes from ?type= and picks the organisation field's label. Errors sit under
 * their control and focus moves to the first; on success the form is replaced by a panel whose
 * heading takes the focus.
 */
export function EnquiryForm() {
  const params = useSearchParams();
  const initialType = (enquiryTypes as readonly string[]).includes(params.get("type") ?? "") ? (params.get("type") as EnquiryType) : "homeowner";
  const [type, setType] = useState<EnquiryType>(initialType);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const id = useId();
  const fid = (name: string) => `${id}-${name}`;

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
      document.getElementById(fid(first))?.focus();
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
      <div data-form-success="" role="status" className="border-t border-rule pt-8">
        <h2 ref={focusOnMount} tabIndex={-1} className="text-h3 focus-visible:outline-none">
          {registerPage.success.headline}
        </h2>
        <p className="mt-4 text-body text-fg-muted">{registerPage.success.body}</p>
      </div>
    );
  }

  const text = (name: string, label: string, props: React.ComponentPropsWithoutRef<"input"> = {}) => (
    <Field id={fid(name)} label={label} error={errors[name]}>
      <input
        id={fid(name)}
        name={name}
        className={fieldControl}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={describedBy(fid(name), undefined, errors[name])}
        {...props}
      />
    </Field>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8" aria-describedby={`${id}-note`}>
      <fieldset>
        <legend className="text-small font-medium text-fg">I am a</legend>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {enquiryTypes.map((t) => (
            <label key={t} className={`${radioCard} text-small text-fg`}>
              <span className={choiceBox}>
                <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className={choiceInput} />
              </span>
              {enquiryTypeLabels[t]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 md:grid-cols-2">
        {text("name", "Name", { autoComplete: "name", required: true })}
        {text("email", "Email", { type: "email", autoComplete: "email", required: true })}
        {text("phone", "Phone (optional)", { type: "tel", autoComplete: "tel" })}
        {text("organisation", `${type === "investor" ? "Fund or firm" : type === "commercial" ? "Company or strata" : "Organisation"} (optional)`, { autoComplete: "organization" })}
        <Field id={fid("propertyType")} label="Property type">
          <SelectField id={fid("propertyType")} name="propertyType" options={propertyTypes} placeholder="Choose one" defaultValue="" />
        </Field>
        <Field id={fid("propertyCount")} label={type === "investor" ? "Properties you would like to see it on" : "How many properties"}>
          <SelectField id={fid("propertyCount")} name="propertyCount" options={propertyCounts} placeholder="Choose one" defaultValue="" />
        </Field>
        {text("location", "Suburb or city", { autoComplete: "address-level2", placeholder: "Sydney" })}
        <div className="md:col-span-2">
          <Field id={fid("message")} label="Anything else">
            <textarea
              id={fid("message")}
              name="message"
              rows={4}
              className={fieldArea}
              placeholder={type === "investor" ? "Fund, stage, and what you would like to see." : "How many buildings, which surfaces, and when."}
            />
          </Field>
        </div>
        <div className="hidden" aria-hidden="true">
          <label htmlFor={fid("company")}>Company</label>
          <input id={fid("company")} name="company" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-4 text-small text-fg-muted">
        <span className={choiceBox}>
          <input type="checkbox" name="updates" className={choiceInput} />
        </span>
        <span className="max-w-prose">Keep me posted as the pilot program takes shape. No marketing lists, and you can stop any time.</span>
      </label>

      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
        <Button type="submit" size="lg" disabled={status === "sending"} aria-busy={status === "sending"}>
          {status === "sending" ? "Sending…" : "Register interest"}
        </Button>
        <p id={`${id}-note`} className="text-caption text-fg-muted">
          We only use your details to reply. See our <TextLink href="/privacy">privacy policy</TextLink>.
        </p>
      </div>
      {status === "failed" ? (
        <p role="alert" className="text-small text-error">
          Something went wrong sending that. Please try again later.
        </p>
      ) : null}
    </form>
  );
}
