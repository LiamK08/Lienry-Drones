import type { CSSProperties } from "react";
import type { Action } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/SectionHead";
import { holdLines } from "@/components/blocks/holdLines";

/**
 * A solution page's first screen: two soft glows (warm left, teal right) that fade out before the
 * band ends, then a centred eyebrow, the h1 (700px at most), a paragraph (950px) and one pill. No
 * picture, so the h1 is the LCP element. 64 under the bar and 96 above the strip at every width.
 *
 * Inter and its fallback wrap the paragraph differently, so it holds lines too: `leadLines` is the
 * larger of the two counts on phones (below 768) and from 768. With the h1's hold on phones, the web
 * fonts arriving never move the pill or the strip.
 */
export function CenterHero({
  eyebrow,
  headline,
  emphasis,
  lead,
  primary,
  mobileLines,
  leadLines,
}: {
  eyebrow: string;
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
        <div className="absolute -left-24 -top-16 size-[26rem] rounded-pill bg-[#d9c7a8]/25 blur-3xl" />
        <div className="absolute -right-24 top-0 size-[24rem] rounded-pill bg-accent/10 blur-3xl" />
      </div>
      <Container className="max-md:px-2">
        <div className="mx-auto flex max-w-[59.375rem] flex-col items-center text-center">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="hero-heading" className={`em-accent mx-auto max-w-[43.75rem] text-h1 ${hold.className}`} style={hold.style}>
            <Headline text={headline} emphasis={emphasis} />
          </h1>
          <p className={`mx-auto mt-8 max-w-[59.375rem] text-body leading-[1.2] text-fg ${leadHold.className}`} style={leadHold.style}>
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
