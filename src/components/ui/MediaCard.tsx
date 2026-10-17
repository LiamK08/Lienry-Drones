import Link from "next/link";
import type { ReactNode } from "react";
import type { Action, ClipRef } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { FactList, type Fact } from "@/components/ui/FactList";
import { HoverClip } from "@/components/ui/HoverClip";
import { Picture } from "@/components/ui/Picture";

export type CardAspect = "2/3" | "3/4" | "4/5" | "1/1" | "4/3" | "3/2" | "16/9";

export type MediaCardMedia =
  | { kind: "image"; id: string; alt: string; aspect: CardAspect; position?: string; positionSm?: string; sizes: string }
  /** @deprecated A coded fragment (the home product card's app panel); deleted at integration. */
  | { kind: "fragment"; node: ReactNode; aspect: "4/3"; ariaLabel: string; note: string };

export type MediaCardProps = {
  /** The card's id: the body is `${id}-body` (the whole-card link's description). */
  id: string;
  media: MediaCardMedia;
  /** A hover clip over the still (fine pointer, motion allowed); null or unset: the still alone. */
  clip?: ClipRef | null;
  /** A step number such as "01", above the title. */
  index?: string;
  /** A lowercase line above the title. */
  eyebrow?: string;
  /** h3 at the H3 step. */
  title: string;
  /** Muted body; two lines at 1440. */
  body?: string;
  /** A ruled fact list under the body, three across from 768. */
  facts?: readonly Fact[];
  /** The whole card is one link: the title is the link and its ::after covers the card. The media zooms on hover. */
  href?: string;
  /** With `href`: an arrow after the title. */
  arrow?: boolean;
  /** A tertiary link at the foot of the card (never with `href`). */
  link?: Action;
  /** "row-sm": below 768 a 112px thumbnail beside the text; a card from 768. Default "card". */
  layout?: "card" | "row-sm";
};

function TitleArrow() {
  return (
    <svg viewBox="0 0 16 16" className="ml-2 inline-block h-[0.6em] w-[0.6em]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
    </svg>
  );
}

/**
 * An image-led card with no box, border, fill or shadow: the image is the card. Top to bottom:
 * media, 16, index or eyebrow, 8, title, 8, body, 16, facts; a foot link 16 under the text, pinned to
 * the card's foot so the links of a row line up. Colours come from the surface.
 *
 * With `href` the whole card is one link (the title's ::after covers it, and its focus ring is drawn
 * on the card): hover scales the media to 1.03 over 600ms and underlines the title. A `clip` plays
 * over the still on hover or focus (HoverClip). The root is a `div` that fills its parent's height:
 * wrap it in the `li` of a list or track.
 */
export function MediaCard({ id, media, clip, index, eyebrow, title, body, facts, href, arrow = false, link, layout = "card" }: MediaCardProps) {
  const row = layout === "row-sm";
  // row-sm: a grid below 768 (thumbnail, text), a card from 768. items-stretch from 768, or the media
  // (w-full of a shrink-to-fit flex item) collapses to no width in the column.
  const cls = row
    ? "group relative grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-4 text-fg md:flex md:h-full md:flex-col md:items-stretch md:gap-0"
    : "group relative flex h-full flex-col text-fg";

  return (
    <div data-card="" data-hover-target="" data-hover-clip={clip ? "" : undefined} className={cls}>
      {media.kind === "image" ? (
        <Picture
          id={media.id}
          alt={media.alt}
          aspect={media.aspect}
          position={media.position}
          positionSm={media.positionSm}
          sizes={media.sizes}
          zoom={!!href}
          overlay={clip ? <HoverClip clip={clip} position={media.position} /> : undefined}
        />
      ) : (
        <figure className="lg:flex lg:aspect-[4/3] lg:flex-col">
          <div role="img" aria-label={media.ariaLabel} className="relative aspect-[4/3] w-full overflow-hidden rounded-hard bg-media lg:aspect-auto lg:flex-1">
            <div className="absolute inset-0" aria-hidden="true">
              {media.node}
            </div>
          </div>
          <figcaption className="mt-2 text-caption text-fg-muted">{media.note}</figcaption>
        </figure>
      )}

      <div className={row ? "md:mt-4" : "mt-4"}>
        {index ? <p className="readout text-small text-fg-muted">{index}</p> : null}
        {eyebrow ? <p className={`text-small font-medium text-fg-muted ${index ? "mt-2" : ""}`}>{eyebrow}</p> : null}
        <h3 className={`text-h3 ${index || eyebrow ? "mt-2" : ""}`}>
          {href ? (
            <Link
              href={href}
              aria-describedby={body ? `${id}-body` : undefined}
              className="decoration-1 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:rounded-hard after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-solid focus-visible:after:outline-focus"
            >
              {title}
              {arrow ? <TitleArrow /> : null}
            </Link>
          ) : (
            title
          )}
        </h3>
        {body ? (
          <p id={`${id}-body`} className={`mt-2 text-body text-fg-muted ${row ? "max-md:text-small" : ""}`}>
            {body}
          </p>
        ) : null}
        {facts && facts.length > 0 ? <FactList items={facts} columns={3} className="mt-4" /> : null}
      </div>

      {link ? (
        // relative z-10 keeps the link clickable above a whole-card link's stretched ::after.
        <div className={`relative z-10 mt-auto flex pt-4 ${row ? "max-md:col-start-2" : ""}`}>
          <Button href={link.href} variant="tertiary" arrow>
            {link.label}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
