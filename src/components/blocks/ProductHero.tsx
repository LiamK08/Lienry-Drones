import type { CSSProperties, ReactNode } from "react";
import { Band, Container } from "@/components/ui/Band";
import { Headline } from "@/components/ui/SectionHead";
import { SoftwareWindow } from "@/components/software/SoftwareWindow";
import { holdLines } from "@/components/blocks/holdLines";

export type ProductHeroProps = {
  /** The h1's id, which labels the band. Default "hero-heading". */
  headingId?: string;
  headline: string;
  /** The trailing phrase of `headline`, set in the accent italic. */
  emphasis?: string;
  lead: string;
  /** Lines the h1 holds on phones (its fallback-font wrap, the larger of the two from 360 to 412). */
  mobileLines?: number;
  /** Lines the h1 holds below 370 only, where the web font wraps it one line more than the fallback
   *  (Lienry Desktop's one-line headline). */
  narrowLines?: number;
  /** Lines the lead holds below 384 (`narrow`, default `phone`), from 384 to 767 (`phone`) and from 768
   *  (`wide`): Inter and its fallback wrap it differently, so the larger count of the two in each range. */
  leadLines?: { narrow?: number; phone: number; wide: number };
  /** The calls to action under the lead (the pills, or Lienry Desktop's download set). */
  actions: ReactNode;
};

/**
 * A product page's first screen (/platform, /download): the product itself under its headline. On white,
 * behind the head, one still blurred accent glow; a centred column of the h1 with its accent italic, the
 * lead (18/1.55, 608px at most) and the actions. Below it, on the 12-column grid's middle ten columns from
 * 1024, the working software window in a translucent white frame (the panel corners, a white edge, a
 * long soft shadow; solid, never a backdrop blur). Behind the frame's lower part a pale sky pool rises
 * from the white to the tint and settles back to white before the band ends: an empty layer, so no
 * gradient sits behind any text, and the band meets the next one without a seam.
 *
 * The window's poster is the page's LCP image (`priority`). The h1 and the lead hold their fallback-font
 * line counts, so the web fonts arriving never move the window.
 */
export function ProductHero({ headingId = "hero-heading", headline, emphasis, lead, mobileLines, narrowLines, leadLines, actions }: ProductHeroProps) {
  const base = holdLines(mobileLines);
  const hold = narrowLines
    ? { className: `${base.className} max-[370px]:min-h-[calc(var(--h1-narrow)*1lh)]`, style: { ...base.style, "--h1-narrow": narrowLines } as CSSProperties }
    : base;
  const leadHold = leadLines
    ? {
        className: "max-[23.99rem]:min-h-[calc(var(--lead-narrow)*1lh)] min-[24rem]:max-md:min-h-[calc(var(--lead-phone)*1lh)] md:min-h-[calc(var(--lead-wide)*1lh)]",
        style: { "--lead-narrow": leadLines.narrow ?? leadLines.phone, "--lead-phone": leadLines.phone, "--lead-wide": leadLines.wide } as CSSProperties,
      }
    : { className: "", style: undefined };
  return (
    <Band id="hero" as="header" tone="plaster" pad="hero" labelledBy={headingId} className="isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -top-48 left-1/2 -z-10 h-[32rem] w-[56rem] max-w-full -translate-x-1/2 rounded-pill bg-accent-on-dark/30 blur-3xl" />
      <Container>
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h1 id={headingId} className={`em-accent text-h1 text-balance ${hold.className}`} style={hold.style}>
            <Headline text={headline} emphasis={emphasis} />
          </h1>
          <p className={`mt-5 max-w-[38rem] text-balance text-lead leading-[1.55] text-fg-muted ${leadHold.className}`} style={leadHold.style}>
            {lead}
          </p>
          <div className="mt-8 flex w-full flex-col items-center">{actions}</div>
        </div>
      </Container>
      {/* Full bleed (the band's own margins undone), so the pool runs edge to edge; it ends at the band's
          foot (the hero pad, --section-y, below the frame). Its top is a fixed step below the frame's top
          (about the window's middle at each width), never a share of its height: the window settles its
          height as it loads, and a top that followed it would count as a layout shift. */}
      <div className="relative isolate -mx-(--page-margin) mt-10 px-(--page-margin) md:mt-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[36rem] -bottom-(--section-y) -z-10 bg-[linear-gradient(to_bottom,transparent,var(--color-tint)_55%,var(--color-tint)_72%,transparent)] md:top-[30rem] lg:top-[24rem]"
        />
        <Container>
          <div className="lg:grid-12">
            <div className="rounded-panel border border-white bg-white/60 p-2 shadow-[0_48px_96px_-48px_rgb(17_26_34/0.28)] md:p-3 lg:col-span-10 lg:col-start-2">
              <SoftwareWindow priority frame="inset" />
            </div>
          </div>
        </Container>
      </div>
    </Band>
  );
}
