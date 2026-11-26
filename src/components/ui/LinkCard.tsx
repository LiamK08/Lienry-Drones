import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonFace } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";

export type LinkCardProps = {
  /** Where the whole card leads: the card is one link. */
  href: string;
  /** The title, in the serif at the small card step (24px, 21 on phones). It is part of the link's name. */
  title: string;
  /** The action the card leads to, shown as a pill's face at the foot ("Read the note", "Open the tool"). */
  action: string;
  /** The picture on top, flush with the card's edges: a manifest id (Picture). It is decorative (the
   *  title names the card), so it carries no alt text. `sizes` should follow the grid the card sits in. */
  picture?: { id: string; position?: string; sizes?: string };
  /** In place of a picture: anything set in the picture's frame, at the picture's height, so a row of
   *  cards with and without pictures stays even (a key figure in the serif, a coded drawing). */
  stand?: ReactNode;
  /** A small line above the title, inside the card's body: the card's own topic ("Solar", "Costs"). It
   *  is a card label, never a label above a section heading. */
  topic?: string;
  /** The foot's right-hand slot, muted: a subject tag, a date, a reading time. */
  meta?: ReactNode;
  /** The picture's frame stands taller from 1200 (300px): for two cards sharing a row. */
  tall?: boolean;
  /** The card's ground: "tint" (default; for night and white bands) or "white" (for tint, mist and
   *  paper bands). */
  ground?: "tint" | "white";
  className?: string;
};

/**
 * The site's linked card: one link, light on any band (`.on-light` restores the light tokens inside it,
 * while the link keeps the band's focus ring). Top to bottom: the picture at a fixed height (200px, 180
 * below 768; 300 from 1200 when `tall`) or a `stand` in its place, an optional topic line, the title in
 * the serif, and a foot with the action as a pill's face on the left and a meta slot on the right.
 *
 * It answers the pointer and keyboard focus as one object (globals.css, the linked card): the card rises
 * 3px over 300ms, with a soft slate shadow on a light band or its ground one step lighter on a night
 * band; the pill fills ink; and the picture grows to 1.04 inside its frame over 500ms, so it trails the
 * card. Under reduced motion nothing moves: the pill and the ground change at once.
 *
 * The root is the link and fills its parent's width and height: put it in the `li` of a grid (with
 * `className="flex"` on the `li`, so a row's cards share a height). For the cards' entrance, make the
 * grid a `RevealList animate` and each `li` a `RevealItem` (Reveal.tsx).
 */
export function LinkCard({ href, title, action, picture, stand, topic, meta, tall = false, ground = "tint", className = "" }: LinkCardProps) {
  const frame = `relative block h-[11.25rem] shrink-0 overflow-hidden md:h-[12.5rem] ${tall ? "min-[75rem]:h-[18.75rem]" : ""}`;
  return (
    <Link href={href} data-link-card={ground} className={`group group/card link-card relative flex w-full flex-col rounded-card ${className}`}>
      <span className="on-light flex flex-1 flex-col overflow-hidden rounded-card">
        {picture ? (
          <span className={frame}>
            <Picture id={picture.id} alt="" position={picture.position} fit="fill" rounded="none" zoom sizes={picture.sizes ?? "(min-width: 1248px) 384px, (min-width: 768px) 50vw, 100vw"} className="absolute inset-0" />
          </span>
        ) : stand ? (
          <span data-link-card-stand="" className={`${frame} flex items-center justify-center`}>
            {stand}
          </span>
        ) : null}
        <span className="flex flex-1 flex-col p-5 md:px-6 md:pb-6 md:pt-5">
          {topic ? <span className="mb-2 block text-caption font-medium text-muted">{topic}</span> : null}
          <span className="block text-balance font-display text-[1.3125rem] leading-[1.2] text-ink md:text-[1.5rem]">{title}</span>
          <span className="mt-auto flex items-center justify-between gap-4 pt-8">
            <ButtonFace className="group-hover/card:border-ink group-hover/card:bg-ink group-hover/card:text-white group-focus-visible/card:border-ink group-focus-visible/card:bg-ink group-focus-visible/card:text-white">{action}</ButtonFace>
            {meta ? <span className="min-w-0 text-right text-small text-muted">{meta}</span> : null}
          </span>
        </span>
      </span>
    </Link>
  );
}
