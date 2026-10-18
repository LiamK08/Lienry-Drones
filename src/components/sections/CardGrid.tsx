import type { BandTone, ImageRef } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { MediaCard, type CardAspect } from "@/components/ui/MediaCard";
import { RevealItem, RevealList } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

export type CardGridItem = {
  /** The card's key, and its id as `${id}-${key}`. */
  key: string;
  /** An id for the card's list item, so a link such as /platform#dock lands on it. */
  anchor?: string;
  /** A step or part number such as "01", above the title. */
  index?: string;
  title: string;
  body: string;
  /** The whole card is one link. */
  href?: string;
  image: ImageRef;
};

export type CardGridProps = {
  /** The band's id; the heading is `${id}-heading`. */
  id: string;
  tone: BandTone;
  eyebrow: string;
  headline: string;
  /** The trailing phrase of `headline`, in the italic. */
  emphasis?: string;
  intro: string;
  /** Cards in a row from 1024: 2 (684px at 1440) or 3 (448px). Two across from 768 either way. */
  columns: 2 | 3;
  aspect: CardAspect;
  items: readonly CardGridItem[];
};

const SIZES = {
  2: "(min-width: 1440px) 684px, (min-width: 768px) calc(50vw - 36px), calc(100vw - 32px)",
  3: "(min-width: 1440px) 448px, (min-width: 1024px) 31vw, (min-width: 768px) calc(50vw - 36px), calc(100vw - 32px)",
} as const;

const SPAN = { 2: "lg:col-span-6", 3: "lg:col-span-4" } as const;

/**
 * Image-led cards in a grid: the section head (split), then the cards on the 12-column grid, two or
 * three across from 1024, two from 768 and one below, 40 between rows. The cards rise in once.
 */
export function CardGrid({ id, tone, eyebrow, headline, emphasis, intro, columns, aspect, items }: CardGridProps) {
  return (
    <Band id={id} tone={tone} labelledBy={`${id}-heading`}>
      <Container>
        <SectionHead id={`${id}-heading`} eyebrow={eyebrow} headline={headline} emphasis={emphasis} intro={intro} />
        <RevealList className="mt-(--head-gap) grid gap-y-10 md:grid-cols-2 md:gap-x-6 lg:grid-12">
          {items.map((item) => (
            <RevealItem key={item.key} id={item.anchor} className={SPAN[columns]}>
              <MediaCard
                id={`${id}-${item.key}`}
                media={{ kind: "image", id: item.image.id, alt: item.image.alt, position: item.image.position, positionSm: item.image.positionSm, aspect, sizes: SIZES[columns] }}
                index={item.index}
                title={item.title}
                body={item.body}
                href={item.href}
              />
            </RevealItem>
          ))}
        </RevealList>
      </Container>
    </Band>
  );
}
