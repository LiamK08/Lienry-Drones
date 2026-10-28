import type { Metadata } from "next";
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

// Every story row sits on the page's 12 columns from 1024: the text in five, the picture in six at one
// shared 3:2 frame, with a column between them; "imageLeft" rows swap the sides. Below 1024 each row
// is its text, then its picture.
const SIDES = {
  textLeft: { text: "lg:col-span-5 lg:col-start-1", image: "lg:col-span-6 lg:col-start-7" },
  imageLeft: { text: "lg:col-span-5 lg:col-start-8", image: "lg:col-span-6 lg:col-start-1" },
} as const;

/**
 * /company: the tinted hero with round pictures around the headline; the story as four rows of text
 * beside a picture, alternating sides on one grid; the pre-seed round on paper (its heading beside its
 * text and the investor action, with the media line under it); then the closing panel.
 */
export default function CompanyPage() {
  const { hero, rows, founders, close, media } = companyPage;
  return (
    <>
      <BubbleHero mobileLines={3} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} images={hero.images} />
      <Band id="story" tone="plaster" ariaLabel="Our story">
        <Container>
          <div className="flex flex-col gap-16 lg:gap-24">
            {rows.map((r) => {
              const side = SIDES[r.layout];
              return (
                <section key={r.id} aria-labelledby={`${r.id}-heading`} className="grid gap-6 lg:grid-12 lg:items-center">
                  <div className={`lg:row-start-1 ${side.text}`}>
                    <h2 id={`${r.id}-heading`} className="text-h2s">
                      {r.title}
                    </h2>
                    {r.paragraphs.map((p) => (
                      <p key={p} className="mt-4 max-w-[32rem] text-body leading-[1.6] text-fg-muted">
                        {p}
                      </p>
                    ))}
                  </div>
                  <div className={`lg:row-start-1 ${side.image}`}>
                    <Picture id={r.image.id} alt={r.image.alt} position={r.image.position} aspect="3/2" rounded="image" sizes="(min-width: 1440px) 684px, (min-width: 1024px) 48vw, 100vw" />
                  </div>
                </section>
              );
            })}
          </div>
        </Container>
      </Band>
      <Band id="round" tone="paper" labelledBy="round-heading">
        <Container className="grid gap-6 lg:grid-12">
          {/* A word joiner after each hyphen keeps "pre-seed" whole, so the 36px phone head breaks between words. */}
          <h2 id="round-heading" className="text-h2s lg:col-span-5">
            {founders.headline.replaceAll("-", "-⁠")}
          </h2>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="max-w-[32rem] text-body leading-[1.6] text-fg-muted">{founders.body}</p>
            <Button href={founders.action.href} arrow className="mt-8">
              {founders.action.label}
            </Button>
            <p className="mt-6 max-w-[32rem] text-small leading-[1.5] text-fg-muted">{media}</p>
          </div>
        </Container>
      </Band>
      <AccentPanel id="closing" headline={close.headline} action={close.action} />
    </>
  );
}
