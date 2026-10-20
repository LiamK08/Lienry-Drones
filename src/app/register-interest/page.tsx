import type { Metadata } from "next";
import { Suspense } from "react";
import { registerPage } from "@/content/register";
import { pageMetadata } from "@/lib/site";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Band, Container } from "@/components/ui/Band";
import { Headline } from "@/components/ui/SectionHead";

export const metadata: Metadata = pageMetadata(
  "/register-interest",
  "Tell us about your property. Homeowners, landlords, commercial pilot buildings and investors.",
);

function Tick() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 8.5 3 3 7-7" />
    </svg>
  );
}

/**
 * /register-interest: one band over two soft glows. Left: the eyebrow, the h1 with its accent italic,
 * the lead, three ticks and a card of what happens next. Right: the enquiry form in a bordered card.
 */
export default function RegisterInterestPage() {
  const r = registerPage;
  return (
    <Band id="register" tone="plaster" pad="hero" labelledBy="register-heading" className="overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/3 top-20 size-[28rem] rounded-pill bg-accent/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-1/4 size-[24rem] rounded-pill bg-[#d9c7a8]/20 blur-3xl" />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow">{r.eyebrow}</p>
            <h1 id="register-heading" className="em-accent text-h1">
              <Headline text={r.headline} emphasis={r.emphasis} />
            </h1>
            <p className="mt-5 max-w-xl text-body text-fg-muted md:text-lead">{r.lead}</p>
            <ul className="mt-8 space-y-3">
              {r.checks.map((c) => (
                <li key={c} className="flex gap-3 text-small text-fg">
                  <Tick />
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-10 rounded-card border border-line bg-white p-8">
              <p className="font-display text-[1.5rem]">{r.next.title}</p>
              <ol className="mt-6 space-y-4">
                {r.next.steps.map((s) => (
                  <li key={s.n} className="flex items-start gap-4 text-small text-fg">
                    <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-tint text-caption font-medium text-accent">
                      {s.n}
                    </span>
                    <span className="pt-1">{s.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="rounded-card border border-accent/40 bg-white p-6 md:p-8">
            <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
              <EnquiryForm />
            </Suspense>
          </div>
        </div>
      </Container>
    </Band>
  );
}
