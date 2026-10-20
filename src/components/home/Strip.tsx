import { strip } from "@/content/home";

/**
 * The strip under the hero: a dark band with its label at the left and a slow loop of what the system
 * is designed for. The list is in the DOM once for screen readers; the moving copy is aria-hidden.
 */
export function Strip() {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10">
      {strip.items.map((item) => (
        <li key={item} className="flex items-center gap-10 whitespace-nowrap font-display text-[1.5rem] text-white/80">
          {item}
          <span aria-hidden="true" className="size-1.5 rounded-pill bg-accent-on-dark" />
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label={strip.label} data-band="strip" data-tone="ink" className="on-dark relative flex h-20 items-center overflow-hidden bg-night text-white">
      <p className="page-x relative z-10 flex h-full shrink-0 items-center bg-night pr-8 text-small text-white/70">{strip.label}</p>
      <div className="flex min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="marquee flex w-max">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
