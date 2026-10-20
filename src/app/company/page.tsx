import type { Metadata } from "next";
import { companyPage, type StoryRowLayout } from "@/content/company";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { BubbleHero } from "@/components/blocks/BubbleHero";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture, type PictureAspect } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = pageMetadata(
  "/company",
  "Lienry Drones is a Sydney company at concept stage, building a resident cleaning drone and raising a pre-seed round.",
);

// Each story row's frame from 1024 (see StoryRowLayout): its width and columns, the order of text and
// picture, the paragraph's measure and the picture's ratio, corners and served width. Below 1024 every
// row is text, 20, then picture.
const ROWS: Record<
  StoryRowLayout,
  { grid: string; text: string; image: string; measure: string; aspect: PictureAspect; rounded: "image" | "media"; sizes: string }
> = {
  wide: {
    grid: "max-w-[1328px] lg:grid-cols-[minmax(0,644fr)_minmax(0,664fr)]",
    text: "",
    image: "",
    measure: "max-w-[500px]",
    aspect: "4/3",
    rounded: "image",
    sizes: "(min-width: 1440px) 664px, (min-width: 1024px) 47vw, 100vw",
  },
  imageLeft: {
    grid: "max-w-[1200px] lg:grid-cols-[minmax(0,575fr)_minmax(0,575fr)] lg:gap-[50px]",
    text: "lg:order-2",
    image: "lg:order-1",
    measure: "max-w-[500px]",
    aspect: "9/7",
    rounded: "media",
    sizes: "(min-width: 1440px) 575px, (min-width: 1024px) 46vw, 100vw",
  },
  textLeft: {
    grid: "max-w-[1200px] lg:grid-cols-[minmax(0,480fr)_minmax(0,670fr)] lg:gap-[50px]",
    text: "",
    image: "",
    measure: "max-w-[480px]",
    aspect: "9/7",
    rounded: "media",
    sizes: "(min-width: 1440px) 670px, (min-width: 1024px) 54vw, 100vw",
  },
};

/**
 * /company: the accent hero with round pictures around the headline; one story band holding four rows
 * (text beside a rounded picture: a wide first row, then picture, text, picture) and, centred under
 * them, the pre-seed round; then the accent panel with the media line below it.
 */
export default function CompanyPage() {
  const { hero, rows, founders, close, media } = companyPage;
  return (
    <>
      <BubbleHero mobileLines={3} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} images={hero.images} />
      <Band id="story" tone="plaster" pad="none" ariaLabel="Our story" className="pb-14 pt-0 lg:pt-11">
        <Container>
          <div className="flex flex-col gap-20 lg:gap-[100px]">
            {rows.map((r) => {
              const l = ROWS[r.layout];
              return (
                <section key={r.id} aria-labelledby={`${r.id}-heading`} className={`mx-auto grid w-full items-center gap-5 ${l.grid}`}>
                  <Reveal className={l.text}>
                    <h2 id={`${r.id}-heading`} className="text-h2s [text-wrap:wrap]">
                      {r.title}
                    </h2>
                    {r.paragraphs.map((p) => (
                      <p key={p} className={`mt-4 text-[0.875rem] leading-[1.2] text-ink ${l.measure}`}>
                        {p}
                      </p>
                    ))}
                  </Reveal>
                  <div className={l.image}>
                    <Picture id={r.image.id} alt={r.image.alt} position={r.image.position} aspect={l.aspect} rounded={l.rounded} sizes={l.sizes} />
                  </div>
                </section>
              );
            })}
          </div>
          <section id="round" aria-labelledby="round-heading" className="mx-auto mt-12 flex max-w-[600px] flex-col items-center text-center lg:mt-11">
            <h2 id="round-heading" className="text-h2s">
              {founders.headline}
            </h2>
            <p className="mt-5 max-w-[600px] text-[0.875rem] leading-[1.2] text-ink">{founders.body}</p>
            <Button href={founders.action.href} arrow className="mt-7">
              {founders.action.label}
            </Button>
          </section>
        </Container>
      </Band>
      <AccentPanel id="closing" headline={close.headline} action={close.action} note={media} band="close" />
    </>
  );
}
