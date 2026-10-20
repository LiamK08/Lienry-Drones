import type { CSSProperties } from "react";
import type { ImageRef } from "@/lib/types";
import { Picture } from "@/components/ui/Picture";
import { Headline } from "@/components/ui/SectionHead";
import { holdLines } from "@/components/blocks/holdLines";

// Where each round picture sits, on phones (three across the top, two under the text, the sixth
// hidden) and from 1024 (six around the headline, tops fixed in a 900px hero), with its size at each.
const SPOTS = [
  "-left-[29px] top-[82px] size-[130px] lg:left-[3%] lg:top-[150px] lg:size-[254px]",
  "left-[33%] top-[57px] size-[140px] lg:left-[31.3%] lg:top-[123px] lg:size-[178px]",
  "-right-[13px] top-[90px] size-[130px] lg:left-[62.2%] lg:right-auto lg:top-[98px] lg:size-[158px]",
  "-left-[27px] bottom-[71px] size-[140px] lg:bottom-auto lg:left-[18.75%] lg:top-[420px] lg:size-[216px]",
  "-right-[11px] bottom-[84px] size-[130px] lg:bottom-auto lg:right-[4.5%] lg:top-[181px] lg:size-[246px]",
  "hidden lg:block lg:right-[19.1%] lg:top-[464px] lg:size-[232px]",
] as const;

/**
 * The about page's first screen: an accent ground that holds to just under halfway, then fades to
 * white, a large centred headline with its italic line and a short paragraph, ringed by round
 * pictures. From 1024 it is 900 tall with the text centred in it, whatever the headline's line
 * count. The fade stays within 12% of the accent until 72% down, so the paragraph's last line keeps
 * 4.5:1 (about 4.9 at 1024, 5.1 at 1440 and on a 320 phone), then runs to white. On load the
 * pictures pop in one after another, then each drifts slowly about its spot on its own loop. Under
 * reduced motion they simply appear and stay still.
 */
export function BubbleHero({ headline, emphasis, lead, images, mobileLines }: { headline: string; emphasis: string; lead: string; images: readonly ImageRef[]; mobileLines?: number }) {
  const hold = holdLines(mobileLines);
  return (
    <header
      id="hero"
      data-band="hero"
      data-tone="ink"
      data-scatter=""
      aria-labelledby="hero-heading"
      className="on-dark relative isolate min-h-[848px] overflow-hidden bg-[linear-gradient(to_bottom,var(--color-accent)_0%,var(--color-accent)_47%,color-mix(in_srgb,var(--color-accent)_88%,#ffffff)_72%,#ffffff_100%)] pb-20 pt-[300px] text-white lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:pb-0 lg:pt-0"
    >
      <ul aria-hidden="true" className="absolute inset-0">
        {images.slice(0, SPOTS.length).map((im, i) => (
          <li key={im.id} className={`absolute ${SPOTS[i]}`}>
            <div className="bubble-pop size-full" style={{ animationDelay: `${150 + i * 140}ms` } as CSSProperties}>
              <div className="bubble-drift size-full overflow-hidden rounded-pill" style={{ animationDuration: `${8 + (i % 3) * 2.5}s`, animationDelay: `${-i * 1.7}s` } as CSSProperties}>
                <Picture id={im.id} alt="" position={im.position} aspect="1/1" rounded="none" sizes="(min-width: 1024px) 256px, 140px" />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="page-x relative mx-auto w-full max-w-[1048px] text-center">
        <h1 id="hero-heading" className={`mx-auto max-w-none text-balance text-[2.5rem] leading-none tracking-[-0.03em] md:text-[4.5rem] lg:text-[5.5rem] ${hold.className}`} style={hold.style}>
          <Headline text={headline} emphasis={emphasis} breakBefore />
        </h1>
        <p className="mx-auto mt-6 max-w-[520px] text-[1.125rem] leading-[1.55] text-white lg:mt-7">{lead}</p>
      </div>
    </header>
  );
}
