import type { CSSProperties } from "react";
import type { Action } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/SectionHead";
import { holdLines } from "@/components/blocks/holdLines";

/**
 * A solution page's first screen: two soft accent glows that fade out before the band ends, then the
 * centred h1 (700px at most), the lead (18/1.55, 608px at most, so a line stays under 70 characters)
 * and one pill. No picture, so the h1 is the LCP element. 64 under the bar and 96 above the strip at
 * every width.
 *
 * Inter and its fallback wrap the lead differently, so it holds lines too: `leadLines` is the larger
 * of the two counts on phones (below 768) and from 768. With the h1's hold on phones, the web fonts
 * arriving never move the pill or the strip.
 */
export function CenterHero({
  headline,
  emphasis,
  lead,
  primary,
  mobileLines,
  leadLines,
}: {
  /** @deprecated Ignored: the site has no eyebrows (owner, 21 October 2026). */
  eyebrow?: string;
  headline: string;
  emphasis?: string;
  lead: string;
  primary: Action;
  mobileLines?: number;
  leadLines?: { phone: number; wide: number };
}) {
  const hold = holdLines(mobileLines);
  const leadHold = leadLines
    ? { className: "max-md:min-h-[calc(var(--lead-phone)*1lh)] md:min-h-[calc(var(--lead-wide)*1lh)]", style: { "--lead-phone": leadLines.phone, "--lead-wide": leadLines.wide } as CSSProperties }
    : { className: "", style: undefined };
  return (
    <Band id="hero" as="header" tone="plaster" pad="none" labelledBy="hero-heading" className="isolate overflow-hidden pt-[calc(var(--nav-h)+4rem)] pb-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
        <div className="absolute -left-24 -top-16 size-[26rem] rounded-pill bg-accent-on-dark/25 blur-3xl" />
        <div className="absolute -right-24 top-0 size-[24rem] rounded-pill bg-accent/10 blur-3xl" />
      </div>
      <Container>
        <div className="mx-auto flex max-w-[43.75rem] flex-col items-center text-center">
          <h1 id="hero-heading" className={`em-accent text-h1 ${hold.className}`} style={hold.style}>
            <Headline text={headline} emphasis={emphasis} />
          </h1>
          <p className={`mt-6 max-w-[38rem] text-lead leading-[1.55] text-fg-muted ${leadHold.className}`} style={leadHold.style}>
            {lead}
          </p>
          <Button href={primary.href} arrow className="mt-8">
            {primary.label}
          </Button>
        </div>
      </Container>
    </Band>
  );
}
