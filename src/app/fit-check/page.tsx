import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { faqFor } from "@/content/faq";
import { fitCheckPage } from "@/content/tools";
import { pageMetadata } from "@/lib/site";
import { FaqCentered } from "@/components/blocks/FaqCentered";
import { FeatureRows } from "@/components/blocks/FeatureRows";
import { FitCheck } from "@/components/blocks/FitCheck";
import { holdLines } from "@/components/blocks/holdLines";
import { Band, Container } from "@/components/ui/Band";
import { Headline } from "@/components/ui/SectionHead";

export const metadata: Metadata = pageMetadata("/fit-check", "Seven questions from the Lienry design brief, scored as you go: see whether your building suits a resident cleaning drone.");

/**
 * /fit-check: the tool is the first screen. On the pale accent tint, the centred h1 and its lead, then
 * the fit check as the home page has it (the questions beside the live score from 1024; below it the
 * score first, and a score strip at the foot of the screen while the questions scroll): the rail's full
 * width below 1280, so the result column keeps room for its zone labels, and the middle 10 of the 12
 * columns from 1280. Then what the check tells you as a feature row beside the scan picture, and the
 * questions about it on paper.
 */
export default function FitCheckPage() {
  const { hero, about, faq } = fitCheckPage;
  // The h1 and the lead hold their fallback-font line counts on phones, so the web fonts arriving never
  // move the check under them.
  const hold = holdLines(2);
  return (
    <>
      <Band id="hero" as="header" tone="tint" pad="hero" labelledBy="hero-heading">
        <Container>
          <div className="mx-auto flex max-w-[43.75rem] flex-col items-center text-center">
            <h1 id="hero-heading" className={`em-accent text-h1 ${hold.className}`} style={hold.style}>
              <Headline text={hero.headline} emphasis={hero.emphasis} />
            </h1>
            <p className="mt-5 text-lead leading-[1.55] text-fg-muted max-md:min-h-[calc(var(--lead)*1lh)]" style={{ "--lead": 3 } as CSSProperties}>
              {hero.lead}
            </p>
          </div>
          <div className="mt-10 lg:mt-12 xl:grid-12">
            <div className="xl:col-span-10 xl:col-start-2">
              <FitCheck id="page-fit" />
            </div>
          </div>
        </Container>
      </Band>
      <FeatureRows
        id="about"
        label={about.headline}
        items={[{ id: "what-it-tells-you", title: about.headline, paragraphs: about.paragraphs, link: about.link, image: about.image }]}
      />
      <FaqCentered tone="paper" headline={faq.headline} items={faqFor("fitCheck")} />
    </>
  );
}
