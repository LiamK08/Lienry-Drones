import type { Metadata } from "next";
import { Suspense } from "react";
import { registerPage } from "@/content/register";
import { pageMetadata } from "@/lib/site";
import { holdLines } from "@/components/blocks/holdLines";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { EnquiryTypeProvider, EnquiryTypeTabs } from "@/components/forms/EnquiryTypeTabs";
import { Band, Container } from "@/components/ui/Band";
import { Headline } from "@/components/ui/SectionHead";

export const metadata: Metadata = pageMetadata(
  "/register-interest",
  "Tell us about your property. Homeowners, landlords, commercial pilot buildings and investors.",
);

/** A 16px tick in a 24px box. */
function Tick() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-6 shrink-0 p-1 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 8.5 3 3 7-7" />
    </svg>
  );
}

/**
 * /register-interest: one band on the page's rail. From 1024 the left six columns hold the h1 with its
 * accent italic, the lead and three ticks, then the enquirer card (tabs of the four enquirer types,
 * each with Lienry's own line and a link, tied to the form's "I am a" radios, then what happens next),
 * at its own height; the form takes columns 8-12 in its card beside them. Below 1024 the form follows
 * the ticks, and the enquirer card comes after it. The accent glow spills over the footer's top edge,
 * so the band sits above it and clips only sideways.
 */
export default function RegisterInterestPage() {
  const r = registerPage;
  const hold = holdLines(1);
  return (
    <Band id="register" tone="plaster" pad="hero" labelledBy="register-heading" className="z-10 overflow-x-clip">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[18rem] size-[28rem] -translate-x-1/2 rounded-pill bg-accent-on-dark/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 left-1/2 size-[24rem] -translate-x-1/2 rounded-pill bg-accent/10 blur-3xl" />
      <Container className="relative">
        <EnquiryTypeProvider>
          <div className="grid gap-10 lg:grid-12 lg:grid-rows-[auto_1fr] lg:items-start lg:gap-y-10">
            <div className="lg:col-span-6">
              <h1 id="register-heading" className={`em-accent text-h1 ${hold.className}`} style={hold.style}>
                <Headline text={r.headline} emphasis={r.emphasis} />
              </h1>
              <p className="mt-4 max-w-[36rem] text-lead leading-[1.55] text-fg-muted">{r.lead}</p>
              <ul className="mt-8 space-y-3">
                {r.checks.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-body leading-[1.5] text-fg">
                    <Tick />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-card border border-line bg-white p-5 md:p-8 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
              <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
                <EnquiryForm />
              </Suspense>
            </div>
            <div className="rounded-card border border-line bg-white p-5 md:p-8 lg:col-span-6 lg:row-start-2">
              <EnquiryTypeTabs />
              <div className="mt-8 border-t border-line pt-6">
                <p className="text-small font-medium text-fg">{r.next.title}</p>
                <ol className="mt-4 space-y-3">
                  {r.next.steps.map((s) => (
                    <li key={s.n} className="flex items-start gap-3 text-small leading-[1.5] text-fg">
                      <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-pill bg-tint text-caption font-medium text-accent">
                        {s.n}
                      </span>
                      <span className="pt-0.5">{s.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </EnquiryTypeProvider>
      </Container>
    </Band>
  );
}
