import type { BandTone, ClipRef, ImageRef, LegacyTone } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { MediaCard } from "@/components/ui/MediaCard";
import { RevealItem } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { SnapTrack } from "@/components/ui/SnapTrack";

export type StepCardsItem = {
  /** The step number, e.g. "01": the card's index. */
  n: string;
  title: string;
  body: string;
  image: ImageRef;
  clip?: ClipRef | null;
};

export type StepCardsProps = {
  /** The band's id; the heading is `${id}-heading` and each card `${id}-${n}`. */
  id: string;
  tone: BandTone | LegacyTone;
  eyebrow: string;
  headline: string;
  /** The trailing phrase of `headline`, in the italic. */
  emphasis?: string;
  intro: string;
  aspect: "4/3" | "3/4";
  items: readonly StepCardsItem[];
  /** The track's name and its previous and next buttons, below 1024. */
  track: { label: string; prevLabel: string; nextLabel: string };
  /** Cards in a row from 1024. Default 3 (448px at 1440). */
  columns?: 3 | 4;
};

// Three columns are 448px at 1440 and four 330px; a track item is 46% from 768 and 82% below.
const SIZES = {
  3: "(min-width: 1440px) 448px, (min-width: 1024px) calc((100vw - 96px) / 3), (min-width: 768px) 46vw, 82vw",
  4: "(min-width: 1440px) 330px, (min-width: 1024px) calc(25vw - 30px), (min-width: 768px) 46vw, 82vw",
} as const;

/**
 * A row of numbered step cards: the section head (split), then the cards, three across from 1024
 * and a snap track with previous and next buttons below it. Each card is its image, its number, the
 * title and the body; the cards are not links, so they neither zoom nor underline.
 */
export function StepCards({ id, tone, eyebrow, headline, emphasis, intro, aspect, items, track, columns = 3 }: StepCardsProps) {
  return (
    <Band id={id} tone={tone} labelledBy={`${id}-heading`}>
      <Container>
        <SectionHead id={`${id}-heading`} eyebrow={eyebrow} headline={headline} emphasis={emphasis} intro={intro} />
        <div className="mt-(--head-gap)">
          <SnapTrack columns={columns} from="lg" label={track.label} prevLabel={track.prevLabel} nextLabel={track.nextLabel}>
            {items.map((item) => (
              <RevealItem key={item.n}>
                <MediaCard
                  id={`${id}-${item.n}`}
                  media={{ kind: "image", id: item.image.id, alt: item.image.alt, position: item.image.position, positionSm: item.image.positionSm, aspect, sizes: SIZES[columns] }}
                  clip={item.clip}
                  index={item.n}
                  title={item.title}
                  body={item.body}
                />
              </RevealItem>
            ))}
          </SnapTrack>
        </div>
      </Container>
    </Band>
  );
}
