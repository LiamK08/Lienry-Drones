import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { Strip } from "@/components/home/Strip";
import { WhyFit } from "@/components/home/WhyFit";
import { ExpandCards } from "@/components/home/ExpandCards";
import { StepTimer } from "@/components/home/StepTimer";
import { SystemCards } from "@/components/home/SystemCards";
import { Explore } from "@/components/home/Explore";
import { SafetyPanel } from "@/components/home/SafetyPanel";
import { FaqForm } from "@/components/home/FaqForm";
import { brand, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata("/", brand.description);

/**
 * Home: on a session's first visit the intro (drones build the mark, then the paper fades into the
 * film), then the film, the strip of what it is designed for, why it matters with the fit check, five
 * expanding reasons, the five timed steps, three settings, the explore band, the safety panel, and the
 * questions beside the enquiry form. Then the footer.
 */
export default function HomePage() {
  return (
    <>
      <Intro />
      <Hero />
      <Strip />
      <WhyFit />
      <ExpandCards />
      <StepTimer />
      <SystemCards />
      <Explore />
      <SafetyPanel />
      <FaqForm />
    </>
  );
}
