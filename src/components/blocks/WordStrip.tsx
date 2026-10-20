import { MarqueeToggle } from "@/components/ui/MarqueeToggle";

/**
 * A quiet strip under a hero: a small caption, 36, then words set in the serif, muted, on a slow loop
 * (the `.marquee` keyframes, 40s) inside a 1110px window that fades at both edges. The words say
 * what the system is designed for; they are not customers or partners. The list is in the DOM once
 * for screen readers; the moving copy is aria-hidden. Under reduced motion the copy and the fade go
 * and the one list wraps, centred. From 768 a faded 1px rule closes the strip.
 */
export function WordStrip({ label, items }: { label: string; items: readonly string[] }) {
  const row = (copy: boolean) => (
    <ul
      aria-hidden={copy || undefined}
      className={`flex shrink-0 items-center gap-12 pr-12 whitespace-nowrap ${
        copy ? "motion-reduce:hidden" : "motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-3 motion-reduce:pr-0 motion-reduce:whitespace-normal"
      }`}
    >
      {items.map((w) => (
        <li key={w} className="font-display text-[1.5rem] leading-[1.2] text-ink/55">
          {w}
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label={label} data-band="for" data-tone="plaster" data-marquee="" className="page-x relative bg-plaster pb-20 md:pb-[4.75rem]">
      <div className="mx-auto max-w-[69.375rem] text-center">
        <p className="mx-auto max-w-none text-label leading-[1.4] font-normal uppercase tracking-[0.08em] text-muted max-md:text-[0.6875rem]">{label}</p>
        <div className="mt-9 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_30%,black_70%,transparent)] motion-reduce:[mask-image:none]">
          {/* The loop moves by half the track: two lists, so even the shortest list (four words, about
              870px) fills the 1110px window at every point of the loop. */}
          <div className="marquee flex w-max motion-reduce:w-full motion-reduce:justify-center">
            {row(false)}
            {row(true)}
            {row(true)}
            {row(true)}
          </div>
        </div>
      </div>
      <MarqueeToggle name="the scrolling words" className="absolute bottom-6 right-(--page-margin) text-muted hover:bg-ink/[0.06] hover:text-ink md:bottom-5" />
      <div aria-hidden="true" className="page-x absolute inset-x-0 bottom-0 max-md:hidden">
        <div className="mx-auto h-px max-w-[72rem] bg-gradient-to-r from-transparent via-line to-transparent" />
      </div>
    </section>
  );
}
