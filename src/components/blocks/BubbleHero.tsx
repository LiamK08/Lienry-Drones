import type { CSSProperties } from "react";
import type { ImageRef } from "@/lib/types";
import { Picture } from "@/components/ui/Picture";
import { Headline } from "@/components/ui/SectionHead";
import { holdLines } from "@/components/blocks/holdLines";

// Where each round picture sits. The text runs in the flow between two zones the pictures keep to, so
// no picture ever lies under a line of it, whatever the headline wraps to: a top zone under the bar
// (the hero's top padding) and a bottom zone (its bottom padding). Below 1024 the top zone holds three
// across and the bottom zone two (the sixth is hidden); from 1024 each zone holds three. Every spot
// keeps 12px or more clear of its zone's edge, beyond the drift's 10px.
//   top zone:    below 768 from 56 to 240; from 768 to 1023 to 256; from 1024 to 280
//   bottom zone: below 768 the last 216; from 768 the last 224; from 1024 the last 232
const SPOTS = [
  "-left-[28px] top-[74px] size-[128px] md:top-[72px] md:size-[150px] lg:-left-[1.5%] lg:top-[76px] lg:size-[184px]",
  "left-[34%] top-[62px] size-[118px] md:left-[37%] md:top-[64px] md:size-[132px] lg:left-[27%] lg:top-[64px] lg:size-[132px]",
  "-right-[16px] top-[88px] size-[124px] md:top-[84px] md:size-[148px] lg:right-[3%] lg:top-[80px] lg:size-[176px]",
  "-left-[24px] bottom-[52px] size-[132px] md:left-[6%] md:bottom-[40px] md:size-[160px] lg:left-[12%] lg:bottom-[40px] lg:size-[168px]",
  "-right-[14px] bottom-[62px] size-[124px] md:right-[8%] md:bottom-[48px] md:size-[150px] lg:right-[9%] lg:bottom-[24px] lg:size-[192px]",
  "hidden lg:block lg:left-[52%] lg:bottom-[84px] lg:size-[116px]",
] as const;

/**
 * The about page's first screen: the pale accent tint, fading to white two thirds of the way down, a
 * large centred headline with its accent italic and a short muted paragraph, ringed by round pictures
 * in the zones above and below the text (SPOTS). A soft accent glow sits behind the headline. On load
 * the pictures pop in one after another, then each drifts slowly about its spot on its own loop. Under
 * reduced motion they simply appear and stay still.
 */
export function BubbleHero({ headline, emphasis, lead, images, mobileLines }: { headline: string; emphasis: string; lead: string; images: readonly ImageRef[]; mobileLines?: number }) {
  const hold = holdLines(mobileLines);
  return (
    <header
      id="hero"
      data-band="hero"
      data-tone="tint"
      data-scatter=""
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-[linear-gradient(to_bottom,var(--color-tint)_0%,var(--color-tint)_32%,var(--color-plaster)_76%)] pb-[13.5rem] pt-[15rem] text-ink md:pb-56 md:pt-64 lg:pb-[14.5rem] lg:pt-[17.5rem]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[45%] -z-10 h-[22rem] w-[44rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-pill bg-accent/10 blur-3xl" />
      <ul aria-hidden="true" className="absolute inset-0">
        {images.slice(0, SPOTS.length).map((im, i) => (
          <li key={im.id} className={`absolute ${SPOTS[i]}`}>
            <div className="bubble-pop size-full" style={{ animationDelay: `${150 + i * 140}ms` } as CSSProperties}>
              <div className="bubble-drift size-full overflow-hidden rounded-pill" style={{ animationDuration: `${8 + (i % 3) * 2.5}s`, animationDelay: `${-i * 1.7}s` } as CSSProperties}>
                <Picture id={im.id} alt="" position={im.position} aspect="1/1" rounded="none" sizes="(min-width: 1024px) 192px, 160px" />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="page-x relative mx-auto w-full max-w-[1048px] text-center">
        <h1 id="hero-heading" className={`em-accent mx-auto max-w-none text-balance text-[2.5rem] leading-none tracking-[-0.03em] md:text-[4.5rem] lg:text-[5.5rem] ${hold.className}`} style={hold.style}>
          <Headline text={headline} emphasis={emphasis} breakBefore />
        </h1>
        <p className="mx-auto mt-6 max-w-[34rem] text-lead leading-[1.55] text-fg-muted lg:mt-7">{lead}</p>
      </div>
    </header>
  );
}
