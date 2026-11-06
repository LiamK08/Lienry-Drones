import type { CSSProperties } from "react";
import type { ImageRef } from "@/lib/types";
import { Picture } from "@/components/ui/Picture";

// Each card's width, its tilt at rest and fanned, from 768 (the middle one narrower and in front), and its
// overlap: 2.5rem with the card before it. Below 768 the first card is left out and the other two lean -3
// and 3 degrees at 11rem, so only the last overlaps there.
const cards = [
  { width: "w-44 md:w-[15rem] lg:w-[18rem] xl:w-[22rem]", rest: "-4deg", fan: "-5.5deg", sm: "", phone: false, overlap: "" },
  { width: "w-44 max-[374px]:w-36 md:w-[14rem] lg:w-[16.5rem] xl:w-[20rem]", rest: "1deg", fan: "2.5deg", sm: "-3deg", phone: true, overlap: "md:-ml-10" },
  { width: "w-44 max-[374px]:w-36 md:w-[15rem] lg:w-[18rem] xl:w-[22rem]", rest: "4deg", fan: "5.5deg", sm: "3deg", phone: true, overlap: "-ml-10" },
] as const;

/**
 * Three stills as framed cards, fanned: each a white card (the card corners, 8px of frame, a long soft
 * shadow in the night's own value) holding a 3:4 picture with the image corners, the three overlapping
 * by 2.5rem and leaning -4, 1 and 4 degrees, the middle one in front and set a little lower. Hovering
 * the fan opens it 1.5 degrees further and lifts each card 4px (300ms); under reduced motion nothing
 * moves. Below 768 two cards show, 11rem wide at -3 and 3 degrees, inside the page margins.
 *
 * The tilt is static (no scroll link). Each still is framed once on the page.
 */
export function PictureFan({ pictures }: { pictures: readonly ImageRef[] }) {
  return (
    <div className="group/fan flex items-center justify-center">
      {pictures.slice(0, cards.length).map((p, i) => {
        const c = cards[i];
        const style = { "--rest": c.rest, "--fan": c.fan, "--sm": c.sm || c.rest } as CSSProperties;
        return (
          <div
            key={p.id}
            style={style}
            className={`${c.phone ? "" : "max-md:hidden"} ${c.width} ${c.overlap} relative shrink-0 rounded-card bg-white p-2 shadow-[0_24px_48px_-24px_rgb(17_26_34/0.35)] [rotate:var(--sm)] md:[rotate:var(--rest)] ${
              i === 1 ? "z-10 md:translate-y-2" : ""
            } transition-[rotate,translate] duration-300 ease-settle motion-reduce:transition-none md:motion-safe:group-hover/fan:[rotate:var(--fan)] md:motion-safe:group-hover/fan:-translate-y-1 ${
              i === 1 ? "md:motion-safe:group-hover/fan:translate-y-1" : ""
            }`}
          >
            <Picture
              id={p.id}
              alt={p.alt}
              position={p.position}
              aspect="3/4"
              rounded="image"
              sizes="(min-width: 1280px) 336px, (min-width: 1024px) 272px, (min-width: 768px) 224px, 160px"
            />
          </div>
        );
      })}
    </div>
  );
}
