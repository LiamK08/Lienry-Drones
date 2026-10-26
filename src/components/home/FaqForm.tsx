import { faq } from "@/content/home";
import { faqFor } from "@/content/faq";
import { FaqRows } from "@/components/blocks/FaqRows";
import { BookingCard } from "@/components/forms/BookingCard";
import { Band, Container } from "@/components/ui/Band";
import { Headline } from "@/components/ui/SectionHead";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The questions on paper, beside the ask: the head and the rows on the left (the wider column from
 * 1200, as the reference's), and on the right a card
 * under an accent title bar (sticky from 1024) that books a call: a day, a time, then the enquiry form
 * (BookingCard). A person confirms the time by email.
 */
export function FaqForm() {
  return (
    <Band id="faq" tone="paper" pad="compact" labelledBy="faq-heading">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16 min-[75rem]:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] min-[75rem]:gap-[3.75rem]">
          <div>
            <Reveal animate y={10}>
              <h2 id="faq-heading" className="em-accent text-h2s">
                <Headline text={faq.headline} emphasis={faq.emphasis} />
              </h2>
            </Reveal>
            <div className="mt-8 lg:mt-12">
              <FaqRows id="faq" items={faqFor("platform")} />
            </div>
          </div>
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)] lg:self-start">
            <div className="overflow-hidden rounded-card border border-line bg-white">
              <h3 className="bg-accent py-3 text-center text-[1.25rem] leading-[1.4] tracking-[-0.01em] text-white">{faq.formTitle}</h3>
              <div className="p-6 md:p-8">
                <p className="mb-6 text-small text-muted">{faq.formNote}</p>
                <BookingCard />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Band>
  );
}
