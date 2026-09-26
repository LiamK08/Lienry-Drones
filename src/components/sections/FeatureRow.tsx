import type { Action, ImageRef, Tone } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { FactList, type Fact } from "@/components/ui/FactList";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";

export type FeatureRowProps = {
  /** The band's id; the title is `${id}-heading`. */
  id: string;
  tone: Tone;
  /** The image's side from 1024. Sides alternate within a page. */
  side: "left" | "right";
  /** An h2 at the H2 step: no italic, nothing above it. */
  title: string;
  body: string;
  link?: Action;
  /** Three or four items. */
  facts: readonly Fact[];
  /** Default "caption". */
  termStyle?: "caption" | "strong";
  image: ImageRef;
};

/**
 * One feature as a band: the image in six columns beside the text in five, one empty column
 * between. The text column is anchored top and bottom: title, body and link at the top, the fact
 * list at the bottom ending on the image's bottom edge. From 1024 the image is a fill frame
 * between 385px and 684px tall, so it stretches to the text. Below 1024: the image at 4:3, then
 * title, body, link and facts.
 */
export function FeatureRow({ id, tone, side, title, body, link, facts, termStyle = "caption", image }: FeatureRowProps) {
  const dark = tone === "ink";
  const right = side === "right";
  return (
    <Band id={id} tone={tone} labelledBy={`${id}-heading`}>
      <Container>
        <div className="grid gap-y-4 lg:grid-cols-12 lg:gap-x-6">
          <div data-col className={right ? "lg:col-span-6 lg:col-start-7 lg:row-start-1" : "lg:col-span-6"}>
            <Picture
              id={image.id}
              alt={image.alt}
              position={image.position}
              fit="fill"
              fillFrom="lg"
              aspect="4/3"
              minHeight="385px"
              maxHeight="684px"
              sizes="(min-width: 1440px) 684px, (min-width: 1024px) 48vw, 100vw"
            />
          </div>
          <div data-col className={right ? "lg:col-span-5 lg:col-start-1 lg:row-start-1" : "lg:col-span-5 lg:col-start-8"}>
            <Reveal className="flex h-full flex-col">
              <div>
                <h2 id={`${id}-heading`} className="text-h2">
                  {title}
                </h2>
                <p className={`mt-2 text-body lg:mt-3 ${dark ? "text-muted-on-dark" : "text-muted"}`}>{body}</p>
                {link ? (
                  <div className="mt-4 flex">
                    <Button href={link.href} variant="tertiary" onDark={dark} arrow>
                      {link.label}
                    </Button>
                  </div>
                ) : null}
              </div>
              <FactList items={facts} termStyle={termStyle} tone={dark ? "dark" : "light"} className="mt-6 lg:mt-auto lg:pt-6" />
            </Reveal>
          </div>
        </div>
      </Container>
    </Band>
  );
}
