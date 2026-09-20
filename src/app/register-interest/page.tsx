import type { Metadata } from "next";
import { Suspense } from "react";
import { registerPage } from "@/content/pages";
import { Container } from "@/components/ui/Section";
import { EnquiryForm } from "@/components/forms/EnquiryForm";

export const metadata: Metadata = {
  title: "Register interest",
  description: "Tell us about your property. Homeowners, landlords, commercial pilot buildings and investors.",
  alternates: { canonical: "/register-interest" },
};

export default function RegisterInterestPage() {
  return (
    <div className="page-x bg-plaster pb-[var(--section-y)] pt-[calc(var(--nav-h)+3rem)] md:pt-[calc(var(--nav-h)+5rem)]">
      <Container className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <h1 className="text-h1">{registerPage.headline}</h1>
          <p className="mt-5 max-w-prose text-lead text-muted">{registerPage.lead}</p>
          <dl className="mt-10 max-w-prose space-y-4 border-t border-hairline pt-6 text-small">
            <div>
              <dt className="text-small font-medium text-ink">Homes and rentals</dt>
              <dd className="mt-1 text-muted">Register interest and we will be in touch as the home system takes shape.</dd>
            </div>
            <div>
              <dt className="text-small font-medium text-ink">Commercial buildings</dt>
              <dd className="mt-1 text-muted">Book a pilot conversation for buildings under 70 metres in Sydney.</dd>
            </div>
            <div>
              <dt className="text-small font-medium text-ink">Investors</dt>
              <dd className="mt-1 text-muted">We are raising a pre-seed round. Liam replies directly.</dd>
            </div>
          </dl>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <Suspense fallback={<div className="h-96 rounded-hard bg-raised" aria-hidden="true" />}>
            <EnquiryForm />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}
