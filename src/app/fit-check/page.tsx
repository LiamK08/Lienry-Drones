import type { Metadata } from "next";
import { faqFor, faqIntro, homeFaqLink } from "@/content/faq";
import { fitCheckPage } from "@/content/tools";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { FaqCentered } from "@/components/blocks/FaqCentered";
import { FeatureRows } from "@/components/blocks/FeatureRows";
import { FitCheck } from "@/components/blocks/FitCheck";
import { ToolHero } from "@/components/blocks/ToolHero";

export const metadata: Metadata = pageMetadata("/fit-check", "Seven questions from the Lienry design brief, scored as you go: see whether your building suits a resident cleaning drone.");

/**
 * /fit-check: the tool is the first screen. The tool hero (the centred h1 and its lead on the pale
 * accent tint), then the check as one raised card with no title of its own (the h1 is the page's one
 * title): a bar of the questions answered opens the questions, beside the live score from 1024; below
 * it the questions come first, the score after them, and a score strip at the foot of the screen while
 * the questions scroll. Then what the check tells you as a feature row beside the scan picture, the
 * questions about the check on paper, and the closing panel, on to a conversation or the calculator.
 */
export default function FitCheckPage() {
  const { hero, about, faq, close } = fitCheckPage;
  return (
    <>
      <ToolHero headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} mobileLines={2} leadLines={3}>
        <FitCheck id="page-fit" head="progress" resultAfter />
      </ToolHero>
      <FeatureRows
        id="about"
        label={about.headline}
        items={[{ id: "what-it-tells-you", title: about.headline, paragraphs: about.paragraphs, link: about.link, image: about.image }]}
      />
      <FaqCentered tone="paper" headline={faq.headline} items={faqFor("fitCheck", "/fit-check")} intro={faqIntro} link={homeFaqLink} />
      <AccentPanel id="close" headline={close.headline} action={close.action} secondary={close.secondary} />
    </>
  );
}
