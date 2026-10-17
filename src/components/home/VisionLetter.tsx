import { visionLetter } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

/**
 * The founder's letter in large serif (`.letter`, the H3 step) on plaster. From 1024 the head and the
 * sign-off hold columns 1-4, the head at the top and the sign-off at the foot, and the letter runs in
 * 6-12. Below 1024: head, the letter, then the sign-off. There is no portrait until a real
 * photograph is supplied.
 */
export function VisionLetter() {
  const { eyebrow, headline, paragraphs, signature, link } = visionLetter;
  return (
    <Band id="letter" tone="plaster" labelledBy="letter-heading">
      <Container>
        <div className="flex flex-col lg:grid-12">
          <div data-col className="contents lg:col-span-4 lg:flex lg:flex-col lg:justify-between">
            <SectionHead id="letter-heading" layout="stack" eyebrow={eyebrow} headline={headline} className="order-1" />
            <div className="order-3 mt-10 lg:mt-0">
              <p className="text-body font-medium text-fg">{signature.name}</p>
              <p className="mt-2 text-small text-fg-muted">{signature.title}</p>
              <Button href={link.href} variant="tertiary" arrow className="mt-4">
                {link.label}
              </Button>
            </div>
          </div>
          <Reveal className="order-2 mt-(--head-gap) lg:col-span-7 lg:col-start-6 lg:mt-0">
            <div className="letter space-y-6">
              {paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </Band>
  );
}
