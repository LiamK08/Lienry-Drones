import type { Metadata } from "next";
import type { ReactNode } from "react";
import { companyPage } from "@/content/company";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { BubbleHero } from "@/components/blocks/BubbleHero";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";

export const metadata: Metadata = pageMetadata(
  "/company",
  "Lienry Drones is a Sydney company at concept stage, building a resident cleaning drone and raising a pre-seed round.",
);

/** Each hyphenated word ("pre-seed") kept whole on its line by markup, not a character, so copied text stays as written. */
function keepWhole(text: string): ReactNode[] {
  return text.split(/(\S+-\S+)/).map((part, i) => (i % 2 ? <span key={i} className="whitespace-nowrap">{part}</span> : part));
}

/**
 * /company: the tinted hero with round pictures around the headline; the story on the page's 12
 * columns (why we exist in five beside its picture in six, then where we are, how we work and what we
 * are exploring as one open row of three, each a picture over its title and paragraph); the pre-seed
 * round on paper (its heading and paragraph, and beside them the investor action over the media
 * line); then the closing panel. Below 768 the story reads straight down, each of the three its text then its picture;
 * from 768 to 1023 each sets its picture beside its text.
 */
export default function CompanyPage() {
  const { hero, story, founders, close, media } = companyPage;
  const { lead, items } = story;
  return (
    <>
      <BubbleHero mobileLines={3} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} images={hero.images} />
      <Band id="story" tone="plaster" labelledBy={`${lead.id}-heading`}>
        <Container>
          <div className="grid gap-8 lg:grid-12 lg:items-center">
            <div className="lg:col-span-5">
              <h2 id={`${lead.id}-heading`} className="text-h2s">
                {lead.title}
              </h2>
              {lead.paragraphs.map((p) => (
                <p key={p} className="mt-5 max-w-[34rem] text-lead leading-[1.55] text-fg-muted">
                  {p}
                </p>
              ))}
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <Picture id={lead.image.id} alt={lead.image.alt} position={lead.image.position} aspect="3/2" rounded="image" sizes="(min-width: 1440px) 684px, (min-width: 1024px) 48vw, 100vw" />
            </div>
          </div>
          <ul className="mt-16 grid gap-12 md:gap-10 lg:mt-24 lg:grid-12 lg:gap-y-0">
            {items.map((it) => (
              // Below 768 the text comes first, so the lead's picture is never followed straight by another.
              <li key={it.id} className="flex flex-col gap-6 md:grid md:grid-cols-2 md:items-center lg:col-span-4 lg:flex lg:items-stretch">
                <div className="order-2 md:order-none">
                  <Picture id={it.image.id} alt={it.image.alt} position={it.image.position} aspect="3/2" rounded="image" sizes="(min-width: 1440px) 443px, (min-width: 1024px) 31vw, (min-width: 768px) 46vw, 100vw" />
                </div>
                <div>
                  <h3 id={`${it.id}-heading`} className="text-h3">
                    {it.title}
                  </h3>
                  {it.paragraphs.map((p) => (
                    <p key={p} className="mt-3 max-w-[30rem] text-body leading-[1.6] text-fg-muted">
                      {p}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Band>
      <Band id="round" tone="paper" labelledBy="round-heading">
        {/* The heading and its paragraph in seven columns; the investor action and the media line in the
            last four, set to the paragraph's foot. */}
        <Container className="grid gap-8 lg:grid-12 lg:items-end">
          <div className="lg:col-span-7">
            {/* The heading keeps "pre-seed" whole, so it breaks between words; the paragraph may break at a hyphen. */}
            <h2 id="round-heading" className="text-h2s">
              {keepWhole(founders.headline)}
            </h2>
            <p className="mt-5 max-w-[38rem] text-body leading-[1.6] text-fg-muted">{founders.body}</p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <Button href={founders.action.href} arrow>
              {founders.action.label}
            </Button>
            <p className="mt-4 max-w-[24rem] text-small leading-[1.5] text-fg-muted">{media}</p>
          </div>
        </Container>
      </Band>
      <AccentPanel id="closing" headline={close.headline} action={close.action} />
    </>
  );
}
