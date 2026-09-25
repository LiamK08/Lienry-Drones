import type { ImageRef, Tone } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { MediaCard } from "@/components/ui/MediaCard";
import { RevealItem } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { SnapTrack } from "@/components/ui/SnapTrack";

export type StepCardsItem = {
  /** The step number, e.g. "01": the card's label when `numbered`. */
  n?: string;
  title: string;
  body: string;
  image: ImageRef;
};

export type StepCardsProps = {
  /** The band's id; the heading is `${id}-heading`. */
  id: string;
  tone: Tone;
  headline: string;
  /** The trailing phrase of `headline`, in the italic. */
  emphasis?: string;
  intro: string;
  /** Each card's label is its number. */
  numbered: boolean;
  /** Cards in a row from 1024. */
  columns: 3 | 4;
  aspect: "4/5" | "1/1";
  items: readonly StepCardsItem[];
  /** The track's name and its previous and next buttons, below 1024. */
  track: { label: string; prevLabel: string; nextLabel: string };
};

// Four columns are 330px at 1440 and three are 448px; a track item is 46% from 768 and 82% below.
const sizes = {
  3: "(min-width: 1440px) 448px, (min-width: 1024px) 31vw, (min-width: 768px) 46vw, 82vw",
  4: "(min-width: 1440px) 330px, (min-width: 1024px) 23vw, (min-width: 768px) 46vw, 82vw",
} as const;

/**
 * A row of step cards: the section head, 48, then image-led cards in a row of `columns` from 1024
 * and a snap track with previous and next buttons below it (SnapTrack). Each card is its image,
 * the Concept render caption, the step number as its label, the title and the body. The cards
 * rise in with a 60ms stagger.
 */
export function StepCards({ id, tone, headline, emphasis, intro, numbered, columns, aspect, items, track }: StepCardsProps) {
  const dark = tone === "ink";
  return (
    <Band id={id} tone={tone} labelledBy={`${id}-heading`}>
      <Container>
        <SectionHead id={`${id}-heading`} headline={headline} emphasis={emphasis} aside={{ intro }} tone={dark ? "dark" : "light"} />
        <div className="mt-[var(--gap-head)]">
          <SnapTrack columns={columns} label={track.label} prevLabel={track.prevLabel} nextLabel={track.nextLabel} tone={dark ? "dark" : "light"}>
            {items.map((item, i) => (
              <RevealItem key={item.title}>
                <MediaCard
                  media={{ kind: "image", id: item.image.id, alt: item.image.alt, position: item.image.position, aspect, sizes: sizes[columns] }}
                  label={numbered ? (item.n ?? String(i + 1).padStart(2, "0")) : undefined}
                  title={item.title}
                  body={item.body}
                  tone={dark ? "dark" : "light"}
                />
              </RevealItem>
            ))}
          </SnapTrack>
        </div>
      </Container>
    </Band>
  );
}
