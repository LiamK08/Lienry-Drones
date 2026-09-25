import type { Metadata } from "next";
import { Suspense } from "react";
import { registerPage } from "@/content/pages";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Band, Container } from "@/components/ui/Band";
import { Picture } from "@/components/ui/Picture";

export const metadata: Metadata = {
  title: "Lienry Drones",
  description: "Tell us about your property. Homeowners, landlords, commercial pilot buildings and investors.",
  alternates: { canonical: "/register-interest" },
};

// /register-interest (docs/REDESIGN-SPEC.md C7): the ask alone on its page, context left and the
// untouched form right. From 1024 the left column is a flex column whose image takes the space
// left under the routes, so both columns end on the form's last line. Below 1024 the columns
// stack (heading, lead, routes, form) with no image.
export default function RegisterInterestPage() {
  const image = registerPage.image;
  return (
    <Band id="register" tone="plaster" pad="page" labelledBy="register-heading">
      <Container className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-6">
        <div data-col className="flex flex-col lg:col-span-5">
          <h1 id="register-heading" className="text-h1">
            {registerPage.headline}
          </h1>
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
          <Picture
            id={image.id}
            alt={image.alt}
            position={image.position}
            fit="fill"
            fillFrom="lg"
            aspect="4/3"
            minHeight="16rem"
            sizes="(min-width: 1440px) 566px, 40vw"
            className="mt-8 hidden lg:flex lg:flex-1"
          />
        </div>
        <div data-col className="lg:col-span-6 lg:col-start-7">
          <Suspense fallback={<div className="h-96 rounded-hard bg-raised" aria-hidden="true" />}>
            <EnquiryForm />
          </Suspense>
        </div>
      </Container>
    </Band>
  );
}
