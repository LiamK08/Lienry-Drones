import type { Metadata } from "next";
import { platformFaq, platformPage } from "@/content/pages";
import { PageHero } from "@/components/blocks/PageHero";
import { AlternatingRows, CtaBlock, SpecTable } from "@/components/blocks/Blocks";
import { Faq } from "@/components/blocks/Faq";
import { FilmBand } from "@/components/home/FilmBand";
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
      <FilmBand videoId="h1-hero-film" stillId="h0-hero-still" eyebrow="See it work" headline="Water, light and nobody on site." body="The drone finishes a glass wash at first light. This is the whole idea in eight seconds." cta={{ label: "Register interest", href: "/register-interest" }} />
      <SpecTable id="specs" eyebrow={platformPage.specs.eyebrow} headline={platformPage.specs.headline} rows={platformPage.specs.rows} />
      <Faq id="faq" eyebrow={platformFaq.eyebrow} headline={platformFaq.headline} items={platformFaq.items} />
      <CtaBlock id="platform-cta" eyebrow="Pre-launch" headline="Be part of the first buildings." body="Register interest for your property, or book a conversation about the commercial pilot program." cta={{ label: "Register interest", href: "/register-interest" }} secondary={{ label: "Book a pilot", href: "/register-interest?type=commercial" }} />
    </>
  );
}
