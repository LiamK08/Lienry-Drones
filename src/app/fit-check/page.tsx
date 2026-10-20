import type { Metadata } from "next";
import Link from "next/link";
import { faqFor } from "@/content/faq";
import { fitCheckPage } from "@/content/tools";
import { pageMetadata } from "@/lib/site";
import { FaqCards } from "@/components/blocks/FaqCards";
import { FitCheck } from "@/components/blocks/FitCheck";
import { SplitHero } from "@/components/blocks/SplitHero";
import { Band, Container } from "@/components/ui/Band";

export const metadata: Metadata = pageMetadata("/fit-check", "Seven questions from the Lienry design brief, scored as you go: see whether your building suits a resident cleaning drone.");

/** `text` with its first `phrase` set bold. */
function withStrong(text: string, phrase: string) {
  const at = text.indexOf(phrase);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <strong className="font-semibold">{phrase}</strong>
      {text.slice(at + phrase.length)}
    </>
  );
}

/**
 * /fit-check: the compact split hero, the check in one centred column on the hero's paper, then a
 * white band with what the check covers and four questions as open cards.
 */
export default function FitCheckPage() {
  const { hero, intro, about, faq } = fitCheckPage;
  return (
    <>
      <SplitHero variant="compact" mobileLines={3} eyebrow={hero.eyebrow} headline={hero.headline} emphasis={hero.emphasis} image={hero.image} />
      <Band id="check" tone="paper" pad="none" labelledBy="page-fit-g0" className="py-14">
        <Container>
          <FitCheck
            id="page-fit"
            layout="column"
            badge={intro.badge}
            intro={intro.lines.map((line, i) => (
              <p key={line} className="max-w-none">
                {i === 0 ? withStrong(line, intro.strong) : line}
              </p>
            ))}
          />
        </Container>
      </Band>
      <Band id="explainer" tone="plaster" pad="none" labelledBy="explainer-heading" className="py-20">
        <Container>
          <div className="mx-auto max-w-[50rem] max-md:px-[9px]">
            <h2 id="explainer-heading" className="text-[1.875rem] leading-[1.1] tracking-[-0.02em] text-ink md:text-[2rem]">
              {about.headline}
            </h2>
            <div className="mt-5 space-y-4">
              {about.paragraphs.map((p) => (
                <p key={p} className="max-w-none text-body leading-[1.3] text-ink">
                  {p}
                </p>
              ))}
            </div>
            <p className="mt-4">
              <Link href={about.link.href} className="link inline-block py-1 text-body">
                {about.link.label}
              </Link>
            </p>
            <FaqCards id="faq" headline={faq.headline} items={faqFor("fitCheck")} className="mt-16" />
          </div>
        </Container>
      </Band>
    </>
  );
}
