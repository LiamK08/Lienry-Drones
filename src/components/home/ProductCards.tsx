import { productCards } from "@/content/home";
import { AppPanel } from "@/components/app/AppPanel";
import { Band, Container } from "@/components/ui/Band";
import { MediaCard, type MediaCardMedia } from "@/components/ui/MediaCard";
import { RevealItem, RevealList } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

// 448px at 1440; a third of the grid from 1024; the full column below it.
const sizes = "(min-width: 1440px) 448px, (min-width: 1024px) 31vw, 100vw";

type Card = (typeof productCards.cards)[number];

function media(card: Card): MediaCardMedia {
  if (card.image) {
    return { kind: "image", id: card.image.id, alt: card.image.alt, position: card.image.position, aspect: "4/3", sizes };
  }
  // The app card shows coded UI, not a render: the panel sits on the sunken ground 16px from the
  // top (24px from 768) and 32px from the left, and runs 24px past the right edge of the frame.
  return {
    kind: "fragment",
    aspect: "4/3",
    ariaLabel: card.fragment.ariaLabel,
    note: card.fragment.note,
    node: (
      <div className="absolute left-8 top-4 -right-6 md:top-6">
        <AppPanel mode="fragment" />
      </div>
    ),
  };
}

/**
 * What a buyer chooses between, straight after the Built-for row: the commercial system, the home
 * system and the phone app, as three image-led cards. Three across from 1024, stacked 32px apart
 * below it.
 */
export function ProductCards() {
  return (
    <Band id="products" tone="raised" labelledBy="products-heading">
      <Container>
        <SectionHead id="products-heading" headline={productCards.headline} aside={{ intro: productCards.intro }} />
        <RevealList className="mt-[var(--gap-head)] grid gap-8 lg:grid-cols-3 lg:gap-6">
          {productCards.cards.map((card) => (
            <RevealItem key={card.title}>
              <MediaCard media={media(card)} meta={card.meta} title={card.title} body={card.body} link={card.link} />
            </RevealItem>
          ))}
        </RevealList>
      </Container>
    </Band>
  );
}
