import type { Metadata } from "next";
import { companyPage } from "@/content/company";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { BubbleHero } from "@/components/blocks/BubbleHero";
import { PictureFan } from "@/components/company/PictureFan";
import { PlanTimeline } from "@/components/company/PlanTimeline";
import { VisionBand } from "@/components/company/VisionBand";
import { MenuTile } from "@/components/site/MenuTile";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { keepWhole } from "@/components/ui/keepWhole";
import { Headline } from "@/components/ui/SectionHead";

export const metadata: Metadata = pageMetadata(
  "/company",
  "Lienry Drones is a Sydney company at concept stage, building a resident cleaning drone and raising a pre-seed round.",
);

/**
 * /company: the tinted hero with round pictures around the headline; the story as one pale panel on the
 * rail (its heading in columns 1-5 beside where we are in 7-12, three framed pictures fanned, the plan as
 * a ruler of stages and how we work as its closing line); Liam's statement on a night panel over a darkened
 * still (VisionBand); the pre-seed round centred on paper (who leads
 * the company, three facts from the round, the investor action over the media line); then the closing
 * panel with its two steps.
 */
export default function CompanyPage() {
  const { hero, story, plan, vision, round, close, media } = companyPage;
  return (
    <>
      <BubbleHero mobileLines={3} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} images={hero.images} />
      <Band id="story" tone="plaster" labelledBy="story-heading">
        <Container>
          <div className="rounded-panel bg-tint px-6 py-12 md:px-10 lg:px-[4.5rem] lg:pt-16 lg:pb-24">
            <div className="grid gap-6 lg:grid-12 lg:items-start lg:gap-y-0">
              <h2 id="story-heading" className="em-accent text-h2s text-balance lg:col-span-5">
                <Headline text={story.headline} emphasis={story.emphasis} />
              </h2>
              <p className="max-w-[36rem] text-lead leading-[1.55] text-fg-muted lg:col-span-6 lg:col-start-7">{story.where}</p>
            </div>
            <div className="mt-14 lg:mt-20">
              <PictureFan pictures={story.pictures} />
            </div>
            <div className="mt-16 lg:mt-24">
              <PlanTimeline id="plan" label={plan.label} stages={plan.stages} />
            </div>
            <div className="mt-14 border-t border-ink/10 pt-8 lg:mt-20">
              <p className="max-w-[40rem] text-body leading-[1.6] text-fg-muted">
                <span className="font-medium text-ink">{story.values.lead}</span> {story.values.text}
              </p>
            </div>
          </div>
        </Container>
      </Band>
      <VisionBand id="vision" {...vision} />
      <Band id="round" tone="paper" labelledBy="round-heading">
        <Container className="flex flex-col items-center text-center">
          {/* The heading keeps "pre-seed" whole, so it breaks between words. */}
          <h2 id="round-heading" className="text-h2s text-balance">
            {keepWhole(round.headline)}
          </h2>
          <p className="mt-5 max-w-[36rem] text-lead leading-[1.55] text-balance text-fg-muted">{round.lead}</p>
          <ul className="mx-auto mt-12 grid w-full max-w-[56rem] gap-8 md:grid-cols-3 md:gap-6">
            {round.facts.map((f) => (
              <li key={f.title} className="flex flex-col items-center">
                <MenuTile name={f.glyph} />
                <p className="mt-4 text-body font-semibold leading-[1.5] text-ink">{f.title}</p>
                <p className="mt-1 max-w-[17rem] text-small leading-[1.5] text-balance text-fg-muted">{f.text}</p>
              </li>
            ))}
          </ul>
          <Button href={round.action.href} arrow className="mt-12">
            {round.action.label}
          </Button>
          <p className="mt-4 max-w-[36rem] text-small leading-[1.5] text-balance text-fg-muted">{media}</p>
        </Container>
      </Band>
      <AccentPanel id="closing" headline={close.headline} action={close.action} secondary={close.secondary} />
    </>
  );
}
