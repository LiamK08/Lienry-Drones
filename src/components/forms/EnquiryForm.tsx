"use client";

import { useId, useState } from "react";
import { enquirySchema, enquiryTypes, enquiryTypeLabels, propertyCounts, propertyTypes } from "@/lib/enquiry-schema";
import { registerPage } from "@/content/register";
import { useEnquiryType } from "@/components/forms/EnquiryTypeTabs";
import { Button } from "@/components/ui/Button";
import { Field, SelectField, checkInput, choiceBox, choiceInput, describedBy, fieldArea, fieldControl, radioCard } from "@/components/ui/Field";
import { TextLink } from "@/components/ui/TextLink";

type Errors = Partial<Record<string, string>>;

/** Moves focus to the success heading as it mounts, so the confirmation is announced and in view. */
const focusOnMount = (el: HTMLHeadingElement | null) => el?.focus();

/** radioCard (ui/Field), tightened for a 480px card: 12 in, 12 to the label, the dot centred on the label's lines. */
const typeCard = radioCard.replace("items-start gap-4", "items-center gap-3").replace(" p-4 ", " p-3 ");

/**
 * The enquiry form on /register-interest and the home page. Every control is a Field (role tokens, so
 * it reads on plaster); the type comes from ?type= (or the page's enquirer tabs, see EnquiryTypeTabs)
 * and picks the organisation field's label. Errors sit under their control and focus moves to the
 * first; on success the form is replaced by a panel whose heading takes the focus.
 *
 * The layout follows the form's own width (a container query), not the viewport: from 384px the
 * radios and the short fields pair up, which suits the 480px card on /register-interest, the home
 * card (390 wide at 1024, wider above) and a phone alike.
 */
export function EnquiryForm() {
  const [type, setType] = useEnquiryType();
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
    <form onSubmit={onSubmit} noValidate className="@container flex flex-col gap-6" aria-describedby={`${id}-note`}>
      <fieldset>
        <legend className="text-small font-medium text-fg">I am a</legend>
        <div className="mt-4 grid gap-2 @[24rem]:grid-cols-2">
          {enquiryTypes.map((t) => (
            <label key={t} className={`${typeCard} text-small text-fg`}>
              <span className={choiceBox}>
                <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className={choiceInput} />
              </span>
              {enquiryTypeLabels[t]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-x-4 gap-y-5 @[24rem]:grid-cols-2">
        {text("name", "Name", { autoComplete: "name", required: true })}
        {text("email", "Email", { type: "email", autoComplete: "email", required: true })}
        {text("phone", "Phone (optional)", { type: "tel", autoComplete: "tel" })}
        {text("organisation", `${type === "investor" ? "Fund or firm" : type === "commercial" ? "Company or strata" : "Organisation"} (optional)`, { autoComplete: "organization" })}
        {/* The investor's count label wraps at 211px, so this pair aligns on its controls. */}
        <div className="self-end">
          <Field id={fid("propertyType")} label="Property type">
            <SelectField id={fid("propertyType")} name="propertyType" options={propertyTypes} placeholder="Choose one" defaultValue="" />
          </Field>
        </div>
        <div className="self-end">
          <Field id={fid("propertyCount")} label={type === "investor" ? "Properties you would like to see it on" : "How many properties"}>
            <SelectField id={fid("propertyCount")} name="propertyCount" options={propertyCounts} placeholder="Choose one" defaultValue="" />
          </Field>
        </div>
        {text("location", "Suburb or city", { autoComplete: "address-level2", placeholder: "Sydney" })}
        <div className="@[24rem]:col-span-2">
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

      <label className="flex cursor-pointer items-start gap-4 text-small text-fg-muted transition-[color] duration-200 ease-instrument hover:text-fg motion-reduce:transition-none">
        <span className={choiceBox}>
          <input type="checkbox" name="updates" className={checkInput} />
        </span>
        <span className="max-w-prose">Keep me posted as the pilot program takes shape. No marketing lists, and you can stop any time.</span>
      </label>

      <div className="flex flex-col items-start gap-4 @[24rem]:flex-row @[24rem]:items-center @[24rem]:gap-6">
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
