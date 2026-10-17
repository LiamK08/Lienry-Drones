import { benefits } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";
import { MediaCard } from "@/components/ui/MediaCard";
import { RevealItem, RevealList } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

// Three columns of the grid at 1440 (330px), a quarter of the grid from 1024, half from 768; below
// 768 the cards are rows with a thumbnail.
const sizes = "(min-width: 1440px) 330px, (min-width: 1024px) 23vw, (min-width: 768px) 46vw, 112px";

/**
 * Why it is built the way it is: four whole-card links on plaster, three grid columns each from 1024,
 * two by two from 768, and thumbnail rows on phones so the section stays one screen tall. Card 1
 * plays the commercial clip over its still on hover or keyboard focus (fine pointers only, never
 * under reduced motion or Save-Data); on touch every card is its still.
 */
export function Benefits() {
  return (
    <Band id="benefits" tone="plaster" labelledBy="benefits-heading">
      <Container>
        <SectionHead id="benefits-heading" eyebrow={benefits.eyebrow} headline={benefits.headline} emphasis={benefits.emphasis} intro={benefits.intro} />
        <RevealList className="mt-(--head-gap) grid gap-6 md:grid-cols-2 md:gap-y-10 lg:grid-12">
          {benefits.cards.map((card) => (
            <RevealItem key={card.id} className="lg:col-span-3">
              <MediaCard
                id={`benefit-${card.id}`}
                layout="row-sm"
                media={{ kind: "image", id: card.id, alt: card.alt, aspect: "4/5", position: card.position, sizes }}
                clip={card.clip}
                title={card.title}
                body={card.body}
                href={card.href}
              />
            </RevealItem>
          ))}
        </RevealList>
      </Container>
    </Band>
  );
}
