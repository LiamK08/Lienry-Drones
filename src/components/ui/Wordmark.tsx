// The Lienry Drones mark: three building silhouettes with the flight arc cut through them.
// Left block, centre block, right block and base. Drawn in a 529 x 785 box, filled with
// currentColor so it follows light and dark surfaces. Source: docs/brand/lienry-mark-source.png.
export const MARK_VIEWBOX = "0 0 529 785";
export const MARK_PATHS = [
  "M0 370 121 294v344A894.9 894.9 0 0 1 0 732.6Z",
  "M159 91 296 0l96 67v82A894.9 894.9 0 0 1 159 599Z",
  "M405 248l124 88v449H18.6A618.1 618.1 0 0 0 405 248Z",
] as const;

/** The mark alone. The header centres it inside its home link, which carries the name. */
export function Mark({
  className = "h-7 w-auto",
  title,
}: {
  className?: string;
  /** Accessible name when the mark stands alone; leave unset inside a link or beside text that already names it. */
  title?: string;
}) {
  return (
    <svg className={className} viewBox={MARK_VIEWBOX} fill="currentColor" role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      {MARK_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
