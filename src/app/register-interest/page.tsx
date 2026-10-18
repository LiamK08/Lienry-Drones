import type { Metadata } from "next";
import { Suspense } from "react";
import { registerPage } from "@/content/register";
import { pageMetadata } from "@/lib/site";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Band, Container } from "@/components/ui/Band";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";

export const metadata: Metadata = pageMetadata(
  "/register-interest",
  "Tell us about your property. Homeowners, landlords, commercial pilot buildings and investors.",
);

/**
 * /register-interest: the ask alone on its page, one plaster band. From 1024 the head in columns 1-5
 * with the image taking the space under it, so both columns end on the form's last line, and the form
 * in 7-12. Below 1024 the head, then the form, with no image.
 */
export default function RegisterInterestPage() {
  const { eyebrow, headline, emphasis, lead, image } = registerPage;
  return (
    <Band id="register" tone="plaster" pad="hero" labelledBy="register-heading">
      <Container>
        <div className="flex flex-col gap-y-10 lg:grid-12 lg:gap-y-0">
          <div data-col className="flex flex-col lg:col-span-5">
            <SectionHead id="register-heading" as="h1" size="h1" layout="stack" eyebrow={eyebrow} headline={headline} emphasis={emphasis} intro={lead} reveal={false} />
            <Picture
              id={image.id}
              alt={image.alt}
              position={image.position}
              fit="fill"
              fillFrom="lg"
              aspect="4/3"
              minHeight="16rem"
              sizes="(min-width: 1440px) 566px, 40vw"
              className="mt-10 hidden lg:flex lg:flex-1"
            />
          </div>
          <div data-col className="lg:col-span-6 lg:col-start-7">
            <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
              <EnquiryForm />
            </Suspense>
          </div>
        </div>
      </Container>
    </Band>
  );
}
