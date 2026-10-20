import type { ImageRef } from "@/lib/types";
import { Picture } from "@/components/ui/Picture";
import { Headline } from "@/components/ui/SectionHead";
import { holdLines } from "@/components/blocks/holdLines";

// Where each round picture sits around the headline (desktop only), and its size.
const SPOTS = [
  "left-[3%] top-[26%] size-36",
  "left-[20%] top-[18%] size-28",
  "left-[14%] top-[60%] size-32",
  "right-[22%] top-[17%] size-24",
  "right-[4%] top-[28%] size-36",
  "right-[16%] top-[62%] size-32",
] as const;

/**
 * The about page's first screen: an accent ground that fades to white at its foot, a large centred
 * headline with its italic line, a short paragraph, and round pictures floating around it from 1024.
 */
export function BubbleHero({ headline, emphasis, lead, images, mobileLines }: { headline: string; emphasis: string; lead: string; images: readonly ImageRef[]; mobileLines?: number }) {
  const hold = holdLines(mobileLines);
  return (
    <header id="hero" data-band="hero" data-tone="ink" aria-labelledby="hero-heading" className="on-dark relative isolate min-h-[38rem] overflow-hidden md:min-h-0 bg-[linear-gradient(to_bottom,var(--color-accent)_0%,var(--color-accent)_62%,#ffffff_100%)] pb-40 pt-[calc(var(--nav-h)+5rem)] text-white">
      <ul aria-hidden="true" className="absolute inset-0 hidden lg:block">
        {images.slice(0, SPOTS.length).map((im, i) => (
          <li key={im.id} className={`absolute overflow-hidden rounded-pill border-4 border-white/20 ${SPOTS[i]}`}>
            <Picture id={im.id} alt="" position={im.position} aspect="1/1" rounded="none" sizes="144px" />
          </li>
        ))}
      </ul>
      <div className="page-x relative mx-auto max-w-4xl text-center">
        <h1 id="hero-heading" className={`mx-auto max-w-none text-balance text-[3rem] leading-[1.02] md:text-[4.5rem] ${hold.className}`} style={hold.style}>
          <Headline text={headline} emphasis={emphasis} breakBefore />
        </h1>
        <p className="mx-auto mt-6 max-w-md text-body text-white/85">{lead}</p>
      </div>
    </header>
  );
}
