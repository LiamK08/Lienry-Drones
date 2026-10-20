import type { CSSProperties } from "react";
import type { ImageRef } from "@/lib/types";
import { Picture } from "@/components/ui/Picture";
import { Headline } from "@/components/ui/SectionHead";
import { holdLines } from "@/components/blocks/holdLines";

// Where each round picture sits, on phones (three across the top, two under the text) and from 1024
// (six around the headline), with its size at each.
const SPOTS = [
  "-left-6 top-[5.5rem] size-32 lg:left-[3%] lg:top-[26%] lg:size-36",
  "left-1/2 top-16 size-32 -translate-x-1/2 lg:left-[20%] lg:top-[18%] lg:size-28 lg:translate-x-0",
  "-right-6 top-[6.5rem] size-32 lg:right-[22%] lg:top-[17%] lg:size-24",
  "-left-8 bottom-16 size-32 lg:bottom-auto lg:left-[14%] lg:top-[60%]",
  "-right-6 bottom-20 size-32 lg:bottom-auto lg:right-[4%] lg:top-[28%] lg:size-36",
  "hidden lg:block lg:right-[16%] lg:top-[62%] lg:size-32",
] as const;

/**
 * The about page's first screen: an accent ground that fades to white at its foot, a large centred
 * headline with its italic line and a short paragraph, ringed by round pictures. On load the pictures
 * pop in one after another, then each drifts slowly about its spot on its own loop. Under reduced
 * motion they simply appear and stay still.
 */
export function BubbleHero({ headline, emphasis, lead, images, mobileLines }: { headline: string; emphasis: string; lead: string; images: readonly ImageRef[]; mobileLines?: number }) {
  const hold = holdLines(mobileLines);
  return (
    <header
      id="hero"
      data-band="hero"
      data-tone="ink"
      aria-labelledby="hero-heading"
      className="on-dark relative isolate overflow-hidden bg-[linear-gradient(to_bottom,var(--color-accent)_0%,var(--color-accent)_62%,#ffffff_100%)] pb-64 pt-[calc(var(--nav-h)+13rem)] text-white lg:pb-40 lg:pt-[calc(var(--nav-h)+5rem)]"
    >
      <ul aria-hidden="true" className="absolute inset-0">
        {images.slice(0, SPOTS.length).map((im, i) => (
          <li key={im.id} className={`absolute ${SPOTS[i]}`}>
            <div className="bubble-pop size-full" style={{ animationDelay: `${150 + i * 140}ms` } as CSSProperties}>
              <div className="bubble-drift size-full overflow-hidden rounded-pill border-4 border-white/25" style={{ animationDuration: `${8 + (i % 3) * 2.5}s`, animationDelay: `${-i * 1.7}s` } as CSSProperties}>
                <Picture id={im.id} alt="" position={im.position} aspect="1/1" rounded="none" sizes="144px" />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="page-x relative mx-auto max-w-4xl text-center">
        <h1 id="hero-heading" className={`mx-auto max-w-none text-balance text-[2.5rem] leading-[1.05] tracking-[-0.03em] md:text-[4.5rem] ${hold.className}`} style={hold.style}>
          <Headline text={headline} emphasis={emphasis} breakBefore />
        </h1>
        <p className="mx-auto mt-6 max-w-md text-body text-white/90">{lead}</p>
      </div>
    </header>
  );
}
