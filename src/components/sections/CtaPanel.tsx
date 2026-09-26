import type { Action, ImageRef } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";

export type CtaPanelProps = {
  /** The band's id; the heading is `${id}-heading`. */
  id: string;
  /** White, never italic. */
  headline: string;
  body: string;
  /** The inverse (plaster) primary. */
  primary: Action;
  /** White tertiary links after the primary: the page's other enquiry routes. */
  links?: readonly Action[];
  image: ImageRef;
};

/**
 * The closing card: one glass-deep panel across the full grid on a plaster band. From 1024 the
 * text takes columns 1-6 (40px padding) with the heading and body at the top and the actions
 * pinned to the bottom, and the image fills columns 7-12, inset 16px from the panel's top, right
 * and bottom. The panel's height follows the text.
 * Below 1024 (24px padding): heading, body, the image at 16:9, the primary, then the links.
 */
export function CtaPanel({ id, headline, body, primary, links = [], image }: CtaPanelProps) {
  return (
    <Band id={id} tone="plaster" labelledBy={`${id}-heading`}>
      <Container>
        <div className="on-dark on-accent flex flex-col gap-6 rounded-hard bg-glass-deep p-6 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:gap-y-0 lg:p-0">
          <div data-col className="contents lg:col-span-6 lg:flex lg:flex-col lg:p-10">
            <div className="order-1">
              <h2 id={`${id}-heading`} className="text-h2 text-white">
                {headline}
              </h2>
              <p className="mt-4 text-lead text-plaster">{body}</p>
            </div>
            <div className="order-3 flex flex-col items-start gap-4 lg:mt-auto lg:pt-8">
              <Button href={primary.href} variant="inverse" size="lg" arrow>
                {primary.label}
              </Button>
              {links.length > 0 ? (
                <div className="flex flex-col items-start lg:flex-row lg:gap-6">
                  {links.map((l) => (
                    <Button key={l.href} href={l.href} variant="tertiary" onAccent arrow>
                      {l.label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div data-col className="order-2 lg:col-span-6 lg:col-start-7 lg:py-4 lg:pr-4">
            <Picture
              id={image.id}
              alt={image.alt}
              position={image.position}
              fit="fill"
              fillFrom="lg"
              aspect="16/9"
              minHeight="18rem"
              sizes="(min-width: 1440px) 668px, (min-width: 1024px) 46vw, 100vw"
            />
          </div>
        </div>
      </Container>
    </Band>
  );
}
