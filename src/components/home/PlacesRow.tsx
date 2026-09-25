import { places } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";
import { MediaCard } from "@/components/ui/MediaCard";
import { RevealItem } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { SnapTrack } from "@/components/ui/SnapTrack";

// 330px at 1440 (four across the grid), a quarter of the grid from 1024, 46% to 1023, 82% below.
const sizes = "(min-width: 1440px) 330px, (min-width: 1024px) 23vw, (min-width: 768px) 46vw, 82vw";

/**
 * Five kinds of property on a track at every width: four show at once from 1024, the fifth is one
 * step along. Each card is one link to the page of the system that serves it.
 */
export function PlacesRow() {
  return (
    <Band id="places" tone="plaster" labelledBy="places-heading">
      <Container>
        <SectionHead id="places-heading" headline={places.headline} emphasis={places.emphasis} aside={{ intro: places.intro }} />
        <div className="mt-[var(--gap-head)]">
          <SnapTrack
            from="none"
            visible={4}
            columns={4}
            label={places.track.label}
            prevLabel={places.track.prevLabel}
            nextLabel={places.track.nextLabel}
          >
            {places.cards.map((card) => (
              <RevealItem key={card.id}>
                <MediaCard
                  media={{ kind: "image", id: card.id, alt: `${card.title}: ${card.body}`, aspect: "4/5", position: card.position, sizes }}
                  label={card.system}
                  title={card.title}
                  body={card.body}
                  wholeCard={{ href: card.href }}
                />
              </RevealItem>
            ))}
          </SnapTrack>
        </div>
      </Container>
    </Band>
  );
}
