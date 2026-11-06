import { why } from "@/content/home";
import { FitCheck } from "@/components/blocks/FitCheck";
import { Band, Container } from "@/components/ui/Band";
import { SectionHead } from "@/components/ui/SectionHead";

/**
 * Why it matters: the centred statement over the fit check, on the accent tint washing down to white, so
 * the band runs into the white band under it. The check is a raised card: the rail's full width below
 * 1200, and from 1200 the middle 10 of the 12 columns, centred.
 */
export function WhyFit() {
  return (
    <Band id="fit-check" tone="tint" labelledBy="why-heading" className="bg-[linear-gradient(165deg,var(--color-tint)_0%,color-mix(in_srgb,var(--color-tint)_55%,var(--color-plaster))_40%,var(--color-plaster)_100%)]">
      <Container>
        <SectionHead id="why-heading" layout="center" headline={why.headline} intro={why.intro} />
        <div className="mt-(--head-gap) min-[75rem]:mx-auto min-[75rem]:max-w-[calc(100%*10/12)]">
          <FitCheck />
        </div>
      </Container>
    </Band>
  );
}
