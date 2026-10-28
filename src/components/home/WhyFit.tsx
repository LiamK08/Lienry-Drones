import { why } from "@/content/home";
import { FitCheck } from "@/components/blocks/FitCheck";
import { Band, Container } from "@/components/ui/Band";
import { SectionHead } from "@/components/ui/SectionHead";

/**
 * Why it matters: the centred statement over the fit check, which fills the rail, on the accent tint
 * washing down to white, so the band runs into the white band under it.
 */
export function WhyFit() {
  return (
    <Band id="fit-check" tone="tint" labelledBy="why-heading" className="bg-[linear-gradient(165deg,var(--color-tint)_0%,color-mix(in_srgb,var(--color-tint)_55%,var(--color-plaster))_40%,var(--color-plaster)_100%)]">
      <Container>
        <SectionHead id="why-heading" layout="center" headline={why.headline} intro={why.intro} />
        <div className="mt-(--head-gap)">
          <FitCheck />
        </div>
      </Container>
    </Band>
  );
}
