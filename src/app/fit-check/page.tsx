import type { Metadata } from "next";
import { faqFor, faqIntro, homeFaqLink } from "@/content/faq";
import { fitCheckPage } from "@/content/tools";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { FaqCentered } from "@/components/blocks/FaqCentered";
import { FitCheck } from "@/components/blocks/FitCheck";
import { ToolHero } from "@/components/blocks/ToolHero";
import { ToolReasons } from "@/components/blocks/ToolReasons";

export const metadata: Metadata = pageMetadata("/fit-check", "Seven questions from the Lienry design brief, scored as you go: see whether your building suits a resident cleaning drone.");

/**
 * /fit-check: the tool is the first screen. The tool hero (the centred h1 and its lead on the pale
 * accent tint), then the check as one raised card with no title of its own (the h1 is the page's one
 * title): one statement at a time, beside the live result sheet from 1024 and under a one-line readout
 * below it. Then what the check tells you as three cards (the questions, an example result, the three
 * things the building needs), the questions about the check on paper, and the closing panel, on to a
 * conversation or the calculator.
 */
export default function FitCheckPage() {
  const { hero, about, faq, close } = fitCheckPage;
  return (
    <>
      <ToolHero headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} mobileLines={2} leadLines={3}>
        <FitCheck id="page-fit" />
      </ToolHero>
      <ToolReasons id="about" about={about} />
      <FaqCentered tone="paper" headline={faq.headline} items={faqFor("fitCheck", "/fit-check")} intro={faqIntro} link={homeFaqLink} />
      <AccentPanel id="close" headline={close.headline} action={close.action} secondary={close.secondary} />
    </>
  );
}
