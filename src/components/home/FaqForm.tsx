import { Suspense } from "react";
import { faq } from "@/content/home";
import { faqFor } from "@/content/faq";
import { FaqRows } from "@/components/blocks/FaqRows";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Band, Container } from "@/components/ui/Band";
import { Headline } from "@/components/ui/SectionHead";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The questions on paper, beside the ask: the head and the rows on the left, and on the right a card
 * that holds the enquiry form under an accent title bar (sticky from 1024).
 */
export function FaqForm() {
  return (
    <Band id="faq" tone="paper" pad="compact" labelledBy="faq-heading">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <Reveal animate y={10}>
              <h2 id="faq-heading" className="em-accent text-h2s">
                <Headline text={faq.headline} emphasis={faq.emphasis} />
              </h2>
            </Reveal>
            <div className="mt-8">
              <FaqRows id="faq" items={faqFor("platform")} />
            </div>
          </div>
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)] lg:self-start">
            <div className="overflow-hidden rounded-card border border-line bg-white">
              <p className="max-w-none bg-accent py-3 text-center font-display text-[1.25rem] text-white">{faq.formTitle}</p>
              <div className="p-6 md:p-8">
                <p className="mb-6 text-small text-muted">{faq.formNote}</p>
                <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
                  <EnquiryForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Band>
  );
}
