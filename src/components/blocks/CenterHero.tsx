import type { Action } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/SectionHead";
import { holdLines } from "@/components/blocks/holdLines";

/**
 * A solution page's first screen: two soft accent glows behind a centred eyebrow, a two-line h1, a
 * paragraph and one pill. No picture, so the h1 is the LCP element. On phones the band has a minimum
 * height that holds the h1 at its fallback-font wrap, so the web font arriving never moves the band below.
 */
export function CenterHero({ eyebrow, headline, emphasis, lead, primary, mobileLines }: { eyebrow: string; headline: string; emphasis?: string; lead: string; primary: Action; mobileLines?: number }) {
  const hold = holdLines(mobileLines);
  return (
    <Band id="hero" as="header" tone="plaster" pad="hero" labelledBy="hero-heading" className="min-h-[42rem] overflow-hidden md:min-h-0">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 size-[26rem] rounded-pill bg-accent/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-40 size-[30rem] rounded-pill bg-[#d9c7a8]/25 blur-3xl" />
      <Container className="relative">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="hero-heading" className={`em-accent text-h1 ${hold.className}`} style={hold.style}>
            <Headline text={headline} emphasis={emphasis} />
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-body text-fg-muted md:text-lead">{lead}</p>
          <Button href={primary.href} arrow className="mt-8">
            {primary.label}
          </Button>
        </div>
      </Container>
    </Band>
  );
}
