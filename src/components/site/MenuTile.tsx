import { MENU_GLYPHS, type MenuGlyphName } from "@/components/site/menuGlyphs";

/**
 * A menu link's icon: a night tile holding a solid white glyph with one water-blue detail (the
 * header's panels at 40px, the phone menu at 36px). Decorative beside the link's label. Its colours
 * hold in forced colours, so the white glyph never lands on a light Canvas.
 */
export function MenuTile({ name, size = "panel" }: { name: string; size?: "panel" | "phone" }) {
  const glyph = MENU_GLYPHS[name as MenuGlyphName] ?? MENU_GLYPHS.grid;
  const box = size === "panel" ? "size-10 rounded-[0.625rem]" : "size-9 rounded-[0.5rem]";
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center bg-night text-white forced-color-adjust-none ${box}`}>
      <svg viewBox="0 0 24 24" className={size === "panel" ? "size-6" : "size-[1.375rem]"}>
        <path d={glyph.base} fill="currentColor" fillRule="evenodd" />
        <path d={glyph.accent} fillRule="evenodd" className="fill-water" />
      </svg>
    </span>
  );
}
