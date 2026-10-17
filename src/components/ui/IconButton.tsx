import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type IconButtonProps = {
  /** The accessible name: the button shows only a glyph. */
  label: string;
  /** At either end of a track: aria-disabled (still focusable, announced) and clicks are ignored. */
  unavailable?: boolean;
  /** Fill with the surface colour (a control over media, e.g. FilmPause inside `on-dark on-film`). */
  filled?: boolean;
  onClick?: () => void;
  /** The glyph: an aria-hidden svg at size-4. */
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"button">, "children" | "className" | "aria-label" | "onClick">;

/**
 * The one 44px square control with a glyph (the track's previous and next, the film's pause). It takes
 * its colours from the surface: a `border-control` edge and the text colour, filled with the text
 * colour on hover. Pressed moves it 1px down; unavailable fades it to 40% and ignores clicks, keeping
 * focus where it is.
 */
export function IconButton({ label, unavailable = false, filled = false, onClick, children, className = "", ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={unavailable || undefined}
      data-icon-button=""
      onClick={() => {
        if (!unavailable) onClick?.();
      }}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-hard border border-control text-fg ${filled ? "bg-surface" : ""} transition-[background-color,color,border-color,translate] duration-200 ease-instrument motion-reduce:transition-none hover:border-fg hover:bg-fg hover:text-surface active:translate-y-px motion-reduce:active:translate-y-0 aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:border-control aria-disabled:hover:bg-transparent aria-disabled:hover:text-fg aria-disabled:active:translate-y-0 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** The arrow glyph the track controls use: pointing right, or left with `back`. */
export function ArrowGlyph({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`size-4 ${back ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
    </svg>
  );
}
