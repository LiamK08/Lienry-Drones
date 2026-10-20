import type { Action } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/SectionHead";

/**
 * A solution page's first screen: two soft accent glows behind a centred eyebrow, a two-line h1, a
 * paragraph and one pill. No picture, so the h1 is the LCP element.
 */
export function CenterHero({ eyebrow, headline, emphasis, lead, primary }: { eyebrow: string; headline: string; emphasis?: string; lead: string; primary: Action }) {
  return (
    <Band id="hero" as="header" tone="plaster" pad="hero" labelledBy="hero-heading" className="overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 size-[26rem] rounded-pill bg-accent/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-40 size-[30rem] rounded-pill bg-[#d9c7a8]/25 blur-3xl" />
      <Container className="relative">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="hero-heading" className="em-accent text-h1">
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
