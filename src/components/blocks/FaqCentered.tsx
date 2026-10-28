import type { FaqItem } from "@/components/sections/Faq";
import { FaqRows } from "@/components/blocks/FaqRows";
import { Band, Container } from "@/components/ui/Band";
import { Reveal } from "@/components/ui/Reveal";

// "section" is the band rhythm; "page" is the solution pages' compact rhythm (the owner asked for it
// to stay compact), Band's compact pad. "tight" is retired into "section".
const pads = { section: "section", tight: "section", page: "compact" } as const;

/**
 * The questions, centred: the heading at the inner section step (36, no italic: the accent italic is
 * the page h1's alone), then the rows on the 12-column grid, 8 columns wide from 1024 (6 when `narrow`).
 */
export function FaqCentered({
  id = "faq",
  headline = "Frequently asked questions",
  items,
  tone = "plaster",
  tight = false,
  spacing,
  narrow = false,
}: {
  id?: string;
  /** Default "Frequently asked questions". */
  headline?: string;
  items: readonly FaqItem[];
  tone?: "plaster" | "paper";
  /** @deprecated Use spacing="section". */
  tight?: boolean;
  spacing?: keyof typeof pads;
  narrow?: boolean;
}) {
  const space = spacing ?? (tight ? "tight" : "section");
  return (
    <Band id={id} tone={tone} pad={pads[space]} labelledBy={`${id}-heading`}>
      <Container>
        <div className="lg:grid-12">
          <div className={narrow ? "lg:col-span-6 lg:col-start-4" : "lg:col-span-8 lg:col-start-3"}>
            <Reveal animate y={10} className="flex flex-col items-center text-center">
              <h2 id={`${id}-heading`} className="text-h2s">
                {headline}
              </h2>
            </Reveal>
            <div className="mt-10">
              <FaqRows id={id} items={items} />
            </div>
          </div>
        </div>
      </Container>
    </Band>
  );
}
