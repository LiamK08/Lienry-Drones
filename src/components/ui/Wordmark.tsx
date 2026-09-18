// The Lienry Drones mark: three building silhouettes with the flight arc cut through them.
// Left block, centre block, right block and base. Drawn in a 529 x 785 box, filled with
// currentColor so it follows light and dark surfaces. Source: docs/brand/lienry-mark-source.png.
export const MARK_VIEWBOX = "0 0 529 785";
export const MARK_PATHS = [
  "M0 370 121 294v344A894.9 894.9 0 0 1 0 732.6Z",
  "M159 91 296 0l96 67v82A894.9 894.9 0 0 1 159 599Z",
  "M405 248l124 88v449H18.6A618.1 618.1 0 0 0 405 248Z",
] as const;

export function Mark({
  className = "h-7 w-auto",
  animate = false,
  title,
}: {
  className?: string;
  /** Rise the three blocks into place on mount, in step with the hero reveal. */
  animate?: boolean;
  /** Accessible name when the mark stands alone; leave unset next to the wordmark text. */
  title?: string;
}) {
  return (
    <svg className={className} viewBox={MARK_VIEWBOX} fill="currentColor" role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      {MARK_PATHS.map((d, i) => (
        <path key={d} d={d} className={animate ? "mark-rise" : undefined} style={animate ? { animationDelay: `${140 + i * 80}ms` } : undefined} />
      ))}
    </svg>
  );
}

export function Wordmark({ className = "", animate = false }: { className?: string; animate?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Mark className="h-[26px] w-auto shrink-0" animate={animate} />
      <span className="font-display text-[1.375rem] leading-none tracking-[-0.01em]">
        Lienry <span className="font-sans text-[0.75rem] font-medium uppercase tracking-[0.12em] align-middle opacity-70">Drones</span>
      </span>
    </span>
  );
}
