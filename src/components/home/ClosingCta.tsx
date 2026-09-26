import { closing } from "@/content/home";
import { CtaPanel } from "@/components/sections/CtaPanel";

/**
 * The home close: one glass-deep panel carrying Lienry's three real enquiry routes. The first
 * button in `closing` is the plaster primary; the other two follow it as white links.
 */
export function ClosingCta() {
  const [primary, ...links] = closing.buttons;
  return (
    <CtaPanel
      id="closing"
      headline={closing.headline}
      body={closing.body}
      primary={primary}
      links={links}
      image={{ id: closing.imageId, alt: closing.imageAlt, position: closing.imagePosition }}
    />
  );
}
