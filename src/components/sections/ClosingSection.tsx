import type { ReactNode } from "react";
import type { Action, ClipRef, ImageRef } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { HoverClip } from "@/components/ui/HoverClip";
import { Picture } from "@/components/ui/Picture";
import { Reveal, RevealItem, RevealList } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

/** One frame of the collage, with a slot for a future hover clip. */
export type CollageItem = { id: string; alt: string; position?: string; positionSm?: string; clip?: ClipRef | null };

export type ClosingMedia =
  | { kind: "collage"; items: readonly [CollageItem, CollageItem, CollageItem] }
  | { kind: "image"; image: ImageRef & { positionSm?: string } };

export type ClosingSectionProps = {
  /** The band's id; the heading is `${id}-heading`. */
  id: string;
  eyebrow: string;
  headline: string;
  emphasis?: string;
  body: string;
  /** The band's one primary. */
  primary: Action;
  /** Tertiary links after the primary: the page's other enquiry routes. */
  links?: readonly Action[];
  media: ClosingMedia;
};

// A collage frame: half the media column (columns 7-12 from 1024), half the grid from 768, half the page below.
const HALF = "(min-width: 1440px) 330px, (min-width: 1024px) calc(25vw - 30px), (min-width: 768px) calc(50vw - 36px), calc(50vw - 24px)";
const SINGLE = "(min-width: 1440px) 684px, (min-width: 1024px) calc(50vw - 36px), (min-width: 768px) calc(100vw - 48px), calc(100vw - 32px)";

function Frame({ item, children }: { item: CollageItem; children: ReactNode }) {
  return (
    <div data-hover-target="" data-hover-clip={item.clip ? "" : undefined} className="h-full w-full">
      {children}
    </div>
  );
}

/**
 * Every page's close, on plaster (the page's last band before the ink footer). From 1024 the head
 * in columns 1-5 at the top, the body and actions pinned to the foot of the same columns, and the
 * media in 7-12 across both rows: a collage (a 2:3 anchor beside two fill tiles) or one image at
 * 3:2. Below 1024 one order everywhere: eyebrow, 16, h2, 40, media, 24, body, 32, the primary at
 * its natural width, 16, the links stacked.
 */
export function ClosingSection({ id, eyebrow, headline, emphasis, body, primary, links, media }: ClosingSectionProps) {
  const mediaNode =
    media.kind === "collage" ? (
      <RevealList className="grid grid-cols-2 grid-rows-2 gap-(--gutter)">
        {(() => {
          const [a, b, c] = media.items;
          return (
            <>
              <RevealItem className="row-span-2">
                <Frame item={a}>
                  <Picture id={a.id} alt={a.alt} aspect="2/3" position={a.position} positionSm={a.positionSm} sizes={HALF} overlay={a.clip ? <HoverClip clip={a.clip} position={a.position} /> : undefined} />
                </Frame>
              </RevealItem>
              {[b, c].map((t) => (
                <RevealItem key={t.id} className="flex">
                  <Frame item={t}>
                    <Picture
                      id={t.id}
                      alt={t.alt}
                      fit="fill"
                      frameAspect={1.4}
                      position={t.position}
                      positionSm={t.positionSm}
                      sizes={HALF}
                      className="h-full w-full"
                      overlay={t.clip ? <HoverClip clip={t.clip} position={t.position} /> : undefined}
                    />
                  </Frame>
                </RevealItem>
              ))}
            </>
          );
        })()}
      </RevealList>
    ) : (
      <Reveal>
        <Picture
          id={media.image.id}
          alt={media.image.alt}
          aspect="3/2"
          aspectSm="4/3"
          position={media.image.position}
          positionMd={media.image.positionMd}
          positionSm={media.image.positionSm}
          sizes={SINGLE}
        />
      </Reveal>
    );

  return (
    <Band id={id} tone="plaster" labelledBy={`${id}-heading`}>
      <Container>
        <div className="flex flex-col lg:grid-12 lg:grid-rows-[auto_1fr]">
          <SectionHead id={`${id}-heading`} layout="stack" eyebrow={eyebrow} headline={headline} emphasis={emphasis} className="lg:col-span-5 lg:row-start-1" />
          <div data-col className="mt-(--head-gap) lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:mt-0">
            {mediaNode}
          </div>
          <Reveal className="mt-6 lg:col-span-5 lg:row-start-2 lg:mt-0 lg:self-end">
            <p className="text-balance text-lead text-fg-muted">{body}</p>
            <div data-actions="" className="mt-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
              <Button href={primary.href} size="lg" arrow>
                {primary.label}
              </Button>
              {links?.map((l) => (
                <Button key={l.href} href={l.href} variant="tertiary" arrow>
                  {l.label}
                </Button>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </Band>
  );
}
