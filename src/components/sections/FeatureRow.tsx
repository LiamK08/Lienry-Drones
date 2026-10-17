import type { Action, BandTone, ImageRef, LegacyTone } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { FactList, type Fact } from "@/components/ui/FactList";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";

export type FeatureRowProps = {
  /** The band's id; the heading is `${id}-heading`. */
  id: string;
  tone: BandTone | LegacyTone;
  eyebrow: string;
  /** The h2: never italic. */
  headline: string;
  intro: string;
  /** The image's side from 1024. */
  side: "left" | "right";
  /** Below 1024: "head-first" (default) or "media-first". */
  mobile?: "media-first" | "head-first";
  facts?: readonly Fact[];
  /** Default "caption". */
  termStyle?: "caption" | "strong";
  link?: Action;
  image: ImageRef;
};

const SIZES = "(min-width: 1440px) 684px, (min-width: 1024px) calc(50vw - 36px), (min-width: 768px) calc(100vw - 48px), calc(100vw - 32px)";

/**
 * One feature as a band. From 1024 on the 12-column grid: the image in six columns (a fill frame,
 * 24rem to 42.75rem tall) beside the head in five, one empty column between, with the facts pinned to
 * the foot of the text column so it ends on the image's bottom edge. Below 1024 the DOM order sets
 * the order: head, 40, image, 40, facts ("head-first"), or the image first ("media-first").
 */
export function FeatureRow({ id, tone, eyebrow, headline, intro, side, mobile = "head-first", facts, termStyle = "caption", link, image }: FeatureRowProps) {
  const right = side === "right";
  const textCol = right ? "lg:col-start-1" : "lg:col-start-8";
  const head = (
    <SectionHead
      id={`${id}-heading`}
      layout="stack"
      eyebrow={eyebrow}
      headline={headline}
      intro={intro}
      link={link}
      className={`lg:col-span-5 lg:row-start-1 ${textCol} ${mobile === "media-first" ? "mt-10 lg:mt-0" : ""}`}
    />
  );
  const media = (
    <div data-col className={`lg:col-span-6 lg:row-span-2 lg:row-start-1 ${right ? "lg:col-start-7" : "lg:col-start-1"} ${mobile === "head-first" ? "mt-10 lg:mt-0" : ""}`}>
      <Picture
        id={image.id}
        alt={image.alt}
        position={image.position}
        positionMd={image.positionMd}
        positionSm={image.positionSm}
        fit="fill"
        fillFrom="lg"
        aspect="4/3"
        minHeight="24rem"
        maxHeight="42.75rem"
        sizes={SIZES}
      />
    </div>
  );
  return (
    <Band id={id} tone={tone} labelledBy={`${id}-heading`}>
      <Container>
        <div className="flex flex-col lg:grid-12 lg:grid-rows-[auto_1fr]">
          {mobile === "media-first" ? (
            <>
              {media}
              {head}
            </>
          ) : (
            <>
              {head}
              {media}
            </>
          )}
          {facts && facts.length > 0 ? (
            <FactList items={facts} termStyle={termStyle} className={`mt-10 lg:col-span-5 lg:row-start-2 lg:mt-0 lg:self-end ${textCol}`} />
          ) : null}
        </div>
      </Container>
    </Band>
  );
}
