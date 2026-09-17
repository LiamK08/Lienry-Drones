import { Hero } from "@/components/home/Hero";
import { PropertyStrip } from "@/components/home/PropertyStrip";
import { SystemExplainer } from "@/components/home/SystemExplainer";
import { BuildingModel } from "@/components/home/BuildingModel";
import { TwoSystems } from "@/components/home/TwoSystems";
import { PlacesCarousel } from "@/components/home/PlacesCarousel";
import { LandlordStory } from "@/components/home/LandlordStory";
import { Counters } from "@/components/home/Counters";
import { VisionLetter } from "@/components/home/VisionLetter";
import { Safety } from "@/components/home/Safety";
import { ClosingCta } from "@/components/home/ClosingCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PropertyStrip />
      <SystemExplainer />
      <BuildingModel />
      <TwoSystems />
      <PlacesCarousel />
      <LandlordStory />
      <Counters />
      <VisionLetter />
      <Safety />
      <ClosingCta />
    </>
  );
}
