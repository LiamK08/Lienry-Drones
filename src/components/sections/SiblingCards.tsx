import { siblings } from "@/content/pages";
import { Band, Container } from "@/components/ui/Band";
import { MediaCard } from "@/components/ui/MediaCard";
import { RevealItem, RevealList } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

export type SiblingCardsProps = {
  /** The page this band sits on: its own card is never shown. */
  current: "commercial" | "homes" | "solar";
};

const ORDER = ["commercial", "homes", "solar"] as const;

/**
 * The other two product pages, as whole-card links: a sunken band (id `more`) with the section
 * head (its aside links to /platform), 48, then two cards of six columns each: the image at 2:1,
 * its caption, the title with an arrow, and a one-line body. Below 1024 they stack 24px apart.
 */
export function SiblingCards({ current }: SiblingCardsProps) {
  const cards = ORDER.filter((key) => key !== current).map((key) => siblings.cards[key]);
  return (
    <Band id="more" tone="sunken" labelledBy="more-heading">
      <Container>
        <SectionHead id="more-heading" headline={siblings.headline} aside={{ intro: siblings.intro, link: siblings.link }} />
        <RevealList className="mt-[var(--gap-head)] grid gap-6 lg:grid-cols-2">
          {cards.map((card) => (
            // The body is one short line (68 characters at most): it runs the card's width rather
            // than wrapping at the 45ch paragraph cap, which is set for running text.
            <RevealItem key={card.href} className="[&_p]:max-w-none">
              <MediaCard
                media={{
                  kind: "image",
                  id: card.image.id,
                  alt: card.image.alt,
                  position: card.image.position,
                  aspect: "2/1",
                  sizes: "(min-width: 1440px) 684px, (min-width: 1024px) 48vw, 100vw",
                }}
                title={card.title}
                body={card.body}
                wholeCard={{ href: card.href, arrow: true }}
              />
            </RevealItem>
          ))}
        </RevealList>
      </Container>
    </Band>
  );
}
