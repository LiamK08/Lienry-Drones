import type { Metadata } from "next";
import { homesPage } from "@/content/pages";
import { australiaStats } from "@/content/stats";
import { PageHero } from "@/components/blocks/PageHero";
import { CtaBlock, StatsBlock, Steps, Tiles } from "@/components/blocks/Blocks";
import { LandlordStory } from "@/components/home/LandlordStory";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Lienry Drones",
  description: "A waterproof ground pod, a drone that knows each material, and an app that starts the clean wherever you are. For houses, apartments, rentals and solar farms.",
  alternates: { canonical: "/homes-and-rentals" },
};

export default function HomesPage() {
  const h = homesPage;
  return (
    <>
      <PageHero eyebrow={h.eyebrow} headline={h.headline} lead={h.lead} imageId={h.heroImageId} imageAlt="The Lienry ground pod beside a house at first light">
        <Button href="/register-interest?type=homeowner" size="lg">
          Register interest
        </Button>
        <Button href="/register-interest?type=landlord" size="md" variant="tertiary" arrow>
          I own rentals
        </Button>
      </PageHero>
      <div className="h-[var(--section-y)]" aria-hidden="true" />
      <Steps id="how" eyebrow={h.steps.eyebrow} headline={h.steps.headline} items={h.steps.items} />
      <LandlordStory />
      <Tiles id="app" eyebrow={h.app.eyebrow} headline={h.app.headline} items={h.app.items} columns={4} />
      <StatsBlock id="australia" headline={h.statsHeadline} stats={australiaStats} />
      <CtaBlock id="homes-cta" eyebrow="Register interest" headline="Tell us about your property." body="Homes, apartments, rental properties and solar farms. We are pre-launch and reply personally." cta={{ label: "Register interest", href: "/register-interest?type=homeowner" }} imageId="m3-pod-master" />
    </>
  );
}
