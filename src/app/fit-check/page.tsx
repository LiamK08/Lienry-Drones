import type { Metadata } from "next";
import { fitCheckPage } from "@/content/tools";
import { pageMetadata } from "@/lib/site";
import { FitCheck } from "@/components/blocks/FitCheck";
import { SplitHero } from "@/components/blocks/SplitHero";
import { Band, Container } from "@/components/ui/Band";
import { SectionHead } from "@/components/ui/SectionHead";

export const metadata: Metadata = pageMetadata("/fit-check", "Seven questions from the Lienry design brief, scored as you go: see whether your building suits a resident cleaning drone.");

/** /fit-check: the split hero, then the fit check on its own band. */
export default function FitCheckPage() {
  const { hero, head } = fitCheckPage;
  return (
    <>
      <SplitHero eyebrow={hero.eyebrow} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} image={hero.image} />
      <Band id="check" tone="plaster" labelledBy="check-heading">
        <Container>
          <SectionHead id="check-heading" layout="center" eyebrow={head.eyebrow} headline={head.headline} intro={head.intro} />
          <div className="mx-auto mt-(--head-gap) max-w-6xl">
            <FitCheck id="page-fit" />
          </div>
        </Container>
      </Band>
    </>
  );
}
