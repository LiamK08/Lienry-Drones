import type { Metadata } from "next";
import { Suspense } from "react";
import { registerPage } from "@/content/register";
import { pageMetadata } from "@/lib/site";
import { holdLines } from "@/components/blocks/holdLines";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { EnquiryTypeProvider, EnquiryTypeTabs } from "@/components/forms/EnquiryTypeTabs";
import { Band } from "@/components/ui/Band";
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
 * /register-interest: one band on a 1,200px rail, 684 | 36 | 480 at 1440. Left: the eyebrow, the h1
 * with its accent italic, the lead, three ticks, and a card that stretches to the form's bottom edge:
 * tabs of the four enquirer types (each with Lienry's own line, tied to the form's "I am a" radios),
 * then what happens next. Right: the enquiry form in a bordered card. The accent glow spills over the
 * footer's top edge, so the band sits above it and clips only sideways.
 */
export default function RegisterInterestPage() {
  const r = registerPage;
  const hold = holdLines(1);
  return (
    <Band
      id="register"
      tone="plaster"
      pad="hero"
      labelledBy="register-heading"
      className="z-10 overflow-x-clip lg:pt-[calc(var(--nav-h)+3.5rem)] lg:pb-[5.625rem]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[18rem] size-[28rem] -translate-x-1/2 rounded-pill bg-[#d9c7a8]/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 left-1/2 size-[24rem] -translate-x-1/2 rounded-pill bg-accent/10 blur-3xl" />
      <div className="relative mx-auto w-full max-w-[75rem]">
        <EnquiryTypeProvider>
          <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_30rem]">
            <div className="lg:flex lg:flex-col">
              <p className="eyebrow flex w-fit">{r.eyebrow}</p>
              <h1 id="register-heading" className={`em-accent mt-9 text-h1 ${hold.className}`} style={hold.style}>
                <Headline text={r.headline} emphasis={r.emphasis} />
              </h1>
              <p className="mt-3 max-w-none text-body leading-[1.2] text-fg">{r.lead}</p>
              <ul className="mt-9 space-y-2">
                {r.checks.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-body leading-[1.3] text-fg">
                    <Tick />
                    {c}
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-col rounded-card border border-line bg-paper/50 p-5 lg:flex-1">
                <div className="flex flex-1 flex-col px-6 py-4">
                  <EnquiryTypeTabs />
                  <div className="mt-10 border-t border-line pt-6 lg:mt-auto">
                    <p className="text-small font-medium text-fg">{r.next.title}</p>
                    <ol className="mt-4 space-y-3">
                      {r.next.steps.map((s) => (
                        <li key={s.n} className="flex items-center gap-3 text-small text-fg">
                          <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-pill bg-tint text-caption font-medium text-accent">
                            {s.n}
                          </span>
                          <span>{s.text}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-card border border-accent/60 bg-white p-5">
              <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
                <EnquiryForm />
              </Suspense>
            </div>
          </div>
        </EnquiryTypeProvider>
      </div>
    </Band>
  );
}
