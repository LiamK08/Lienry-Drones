import type { FaqItem } from "@/components/sections/Faq";
import { FaqRows } from "@/components/blocks/FaqRows";
import { Band, Container } from "@/components/ui/Band";
import { Headline } from "@/components/ui/SectionHead";
import { Reveal } from "@/components/ui/Reveal";

// "section" is the band rhythm; "tight" runs into the band below (/platform); "page" is the solution
// pages' 88 above and 150 below (56 on phones).
const spacings = {
  section: "",
  tight: "pb-6 pt-20 lg:pt-[7.5rem]",
  page: "pt-[5.5rem] pb-[9.375rem] max-md:py-14",
} as const;

/**
 * The questions, centred: the eyebrow, "Frequently asked questions" with its accent italic, then the
 * rows. `narrow` holds the rows to 600px under the wider heading.
 */
export function FaqCentered({
  id = "faq",
  items,
  tone = "plaster",
  tight = false,
  spacing,
  narrow = false,
}: {
  id?: string;
  items: readonly FaqItem[];
  tone?: "plaster" | "paper";
  /** @deprecated Use spacing="tight". */
  tight?: boolean;
  spacing?: keyof typeof spacings;
  narrow?: boolean;
}) {
  const space = spacing ?? (tight ? "tight" : "section");
  return (
    <Band id={id} tone={tone} pad={space === "section" ? "section" : "none"} labelledBy={`${id}-heading`} className={spacings[space]}>
      <Container>
        <div className="mx-auto max-w-2xl">
          <Reveal animate y={10} className="flex flex-col items-center text-center">
            <h2 id={`${id}-heading`} className="em-accent text-h1 max-md:text-h2s">
              <Headline text="Frequently asked questions" emphasis="questions" />
            </h2>
          </Reveal>
          <div className={`mx-auto mt-10 ${narrow ? "max-w-[37.5rem]" : ""}`}>
            <FaqRows id={id} items={items} />
          </div>
        </div>
      </Container>
    </Band>
  );
}
