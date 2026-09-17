import type { Metadata } from "next";
import { platformPage } from "@/content/pages";
import { PageHero } from "@/components/blocks/PageHero";
import { AlternatingRows, CtaBlock, SpecTable } from "@/components/blocks/Blocks";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Platform",
  description: "One drone platform, two systems, six parts: dock, tether, drone, scan, software and automation. Built for buildings under 70 metres.",
  alternates: { canonical: "/platform" },
};

export default function PlatformPage() {
  return (
    <>
      <PageHero eyebrow={platformPage.eyebrow} headline={platformPage.headline} lead={platformPage.lead} imageId={platformPage.heroImageId} imageAlt="The Lienry drone finishing a glass wash at first light">
        <Button href="/register-interest" size="lg">
          Register interest
        </Button>
        <Button href="/commercial" size="lg" variant="secondary">
          Commercial system
        </Button>
      </PageHero>
      <div className="h-[var(--section-y)]" aria-hidden="true" />
      <AlternatingRows id="parts" rows={platformPage.parts} />
      <SpecTable id="specs" eyebrow={platformPage.specs.eyebrow} headline={platformPage.specs.headline} rows={platformPage.specs.rows} />
      <CtaBlock id="platform-cta" eyebrow="Pre-launch" headline="Be part of the first buildings." body="Register interest for your property, or book a conversation about the commercial pilot program." cta={{ label: "Register interest", href: "/register-interest" }} secondary={{ label: "Book a pilot", href: "/register-interest?type=commercial" }} />
    </>
  );
}
