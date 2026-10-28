import { faq } from "@/content/home";
import { faqFor } from "@/content/faq";
import { FaqRows } from "@/components/blocks/FaqRows";
import { BookingCard } from "@/components/forms/BookingCard";
import { Band, Container } from "@/components/ui/Band";
import { Headline } from "@/components/ui/SectionHead";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The questions on paper, beside the ask, on the 12-column grid: the head (at the home section step)
 * and the rows in columns 1-6, and in columns 8-12 (7-12 below 1200, so its form keeps two columns)
 * one white card, sticky from 1024, that books a call:
 * its title and a line in the card's body, then a day, a time and the enquiry form (BookingCard). A
 * person confirms the time by email.
 */
export function FaqForm() {
  return (
    <Band id="faq" tone="paper" pad="compact" labelledBy="faq-heading">
      <Container>
        <div className="grid gap-12 lg:grid-12 lg:gap-y-0">
          <div className="lg:col-span-6">
            <Reveal animate y={10}>
              <h2 id="faq-heading" className="text-h2">
                <Headline text={faq.headline} emphasis={faq.emphasis} />
              </h2>
            </Reveal>
            <div className="mt-8 lg:mt-12">
              <FaqRows id="faq" items={faqFor("platform")} />
            </div>
          </div>
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)] lg:col-span-6 lg:col-start-7 lg:self-start min-[75rem]:col-span-5 min-[75rem]:col-start-8">
            <div className="rounded-card border border-line bg-white p-6 md:p-8">
              <h3 className="text-h3">{faq.formTitle}</h3>
              <p className="mt-2 text-small text-muted">{faq.formNote}</p>
              <div className="mt-6">
                <BookingCard />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Band>
  );
}
