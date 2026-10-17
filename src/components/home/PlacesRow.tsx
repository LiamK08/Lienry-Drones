import { places } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";
import { MediaCard } from "@/components/ui/MediaCard";
import { RevealItem } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { SnapTrack, SnapTrackControls } from "@/components/ui/SnapTrack";

// Three tall portraits in view from 1024 (448px at 1440), 46% of the page from 768, 82% below.
const sizes = "(min-width: 1440px) 448px, (min-width: 1024px) 31vw, (min-width: 768px) 46vw, 82vw";

/**
 * Where it works, on ink: five full 2:3 portraits on a track at every width, three in view from 1024
 * with the rest a step along, the previous and next buttons in the head's aside. Each card is one
 * link to the page of the system that serves it.
 */
export function PlacesRow() {
  return (
    <Band id="places" tone="ink" labelledBy="places-heading">
      <Container>
        <SectionHead
          id="places-heading"
          eyebrow={places.eyebrow}
          headline={places.headline}
          emphasis={places.emphasis}
          intro={places.intro}
          action={<SnapTrackControls trackId="places-track" prevLabel={places.track.prevLabel} nextLabel={places.track.nextLabel} />}
        />
        <div className="mt-(--head-gap)">
          <SnapTrack id="places-track" from="none" visible={3} columns={3} controls="external" label={places.track.label} prevLabel={places.track.prevLabel} nextLabel={places.track.nextLabel}>
            {places.cards.map((card) => (
              <RevealItem key={card.id}>
                <MediaCard
                  id={`place-${card.id}`}
                  media={{ kind: "image", id: card.id, alt: `${card.title}: ${card.body}`, aspect: "2/3", sizes }}
                  title={card.title}
                  body={card.body}
                  href={card.href}
                />
              </RevealItem>
            ))}
          </SnapTrack>
        </div>
      </Container>
    </Band>
  );
}
