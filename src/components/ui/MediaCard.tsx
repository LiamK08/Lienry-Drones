import Link from "next/link";
import type { ReactNode } from "react";
import type { Action } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";

export type MediaCardMedia =
  | { kind: "image"; id: string; alt: string; aspect: "4/3" | "4/5" | "1/1" | "2/1"; position?: string; sizes: string }
  | { kind: "fragment"; node: ReactNode; aspect: "4/3"; ariaLabel: string; note: string };

export type MediaCardProps = {
  media: MediaCardMedia;
  /** Sentence-case subtitle, text-caption muted. */
  meta?: string;
  /** A .label: a system name or a step number. */
  label?: string;
  /** h3 at the H3 step. */
  title: string;
  /** text-small muted; at most 4 lines. */
  body: string;
  /** A tertiary link at the foot of the card. */
  link?: Action;
  /** The title becomes the link, and a stretched ::after makes the whole card one target with the
   *  focus ring on the card. `arrow` puts an arrow glyph after the title (the sibling cards). */
  wholeCard?: { href: string; arrow?: boolean };
  tone?: "light" | "dark";
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
 * media (4px, cover), 16, label or meta, 8, title, 8, body, 16, link. The link sits at the foot of
 * the card, so the links of a row of cards line up.
 *
 * The root is a `div` that fills its parent's height: wrap it in the `li` of a list or track.
 * A fragment (a piece of coded UI such as the app panel) sits in a sunken 4:3 frame that is
 * `role="img"` with `ariaLabel`; the node inside is aria-hidden and positions itself (the frame's
 * inner layer is `absolute inset-0`), and `note` is its caption, 8px under the frame. From 1024,
 * where cards sit in rows, the frame gives up the note's height: frame and note together take an
 * image's 4:3 box, so the text under a fragment starts level with the text under the images.
 */
export function MediaCard({ media, meta, label, title, body, link, wholeCard, tone = "light" }: MediaCardProps) {
  const dark = tone === "dark";
  const muted = dark ? "text-muted-on-dark" : "text-muted";
  const ring = dark ? "focus-visible:after:outline-glass-on-dark" : "focus-visible:after:outline-glass";

  return (
    <div className={`group relative flex h-full flex-col ${dark ? "text-plaster" : "text-ink"}`}>
      {media.kind === "image" ? (
        <Picture id={media.id} alt={media.alt} aspect={media.aspect} position={media.position} sizes={media.sizes} />
      ) : (
        <figure className="lg:flex lg:aspect-[4/3] lg:flex-col">
          <div role="img" aria-label={media.ariaLabel} className="relative aspect-[4/3] w-full overflow-hidden rounded-hard bg-sunken lg:aspect-auto lg:flex-1">
            <div className="absolute inset-0" aria-hidden="true">
              {media.node}
            </div>
          </div>
          <figcaption className={`mt-2 text-caption ${muted}`}>{media.note}</figcaption>
        </figure>
      )}

      {label || meta ? (
        <div className="mt-4">
          {label ? <p className={`label ${muted}`}>{label}</p> : null}
          {meta ? <p className={`text-caption ${muted} ${label ? "mt-1" : ""}`}>{meta}</p> : null}
        </div>
      ) : null}

      <h3 className={`text-h3 ${label || meta ? "mt-2" : "mt-4"}`}>
        {wholeCard ? (
          <Link
            href={wholeCard.href}
            className={`decoration-1 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:rounded-hard after:content-[''] focus-visible:outline-0 focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-solid ${ring}`}
          >
            {title}
            {wholeCard.arrow ? <TitleArrow /> : null}
          </Link>
        ) : (
          title
        )}
      </h3>
      <p className={`mt-2 text-small ${muted}`}>{body}</p>

      {link ? (
        // relative z-10 keeps the link clickable above a whole-card link's stretched ::after.
        <div className="relative z-10 mt-auto flex pt-4">
          <Button href={link.href} variant="tertiary" onDark={dark} arrow>
            {link.label}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
