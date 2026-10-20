import type { FaqItem } from "@/components/sections/Faq";
import { FaqRows } from "@/components/blocks/FaqRows";
import { Band, Container } from "@/components/ui/Band";
import { Headline } from "@/components/ui/SectionHead";
import { Reveal } from "@/components/ui/Reveal";

/** The questions, centred: the eyebrow, "Frequently asked questions" with its accent italic, then the rows. */
export function FaqCentered({ id = "faq", items, tone = "plaster", tight = false }: { id?: string; items: readonly FaqItem[]; tone?: "plaster" | "paper"; tight?: boolean }) {
  return (
    <Band id={id} tone={tone} pad={tight ? "none" : "section"} labelledBy={`${id}-heading`} className={tight ? "pb-6 pt-20 lg:pt-[7.5rem]" : ""}>
      <Container>
        <div className="mx-auto max-w-2xl">
          <Reveal animate y={10} className="flex flex-col items-center text-center">
            <p className="eyebrow">Got questions?</p>
            <h2 id={`${id}-heading`} className="em-accent text-h1">
              <Headline text="Frequently asked questions" emphasis="questions" />
            </h2>
          </Reveal>
          <div className="mt-10">
            <FaqRows id={id} items={items} />
          </div>
        </div>
      </Container>
    </Band>
  );
}
