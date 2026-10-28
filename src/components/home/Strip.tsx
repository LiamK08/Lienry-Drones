import { strip } from "@/content/home";
import { Icon } from "@/components/blocks/Icon";

/**
 * The strip under the hero: a 74px dark band with its label on the rail's left edge and a slow loop of
 * marks (an icon and a name, quieter than the hero's support line) for what the system is designed for.
 * These are not customers or partners. The loop fades in beside the label and out at the far edge, so no
 * mark is ever cut hard. The list is in the DOM once for screen readers; the moving copy is aria-hidden.
 */
export function Strip() {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10 md:gap-14 md:pr-14">
      {strip.items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 whitespace-nowrap text-body font-medium text-white/60">
          <Icon name={item.icon} className="size-5" />
          {item.label}
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label={strip.label} data-band="strip" data-tone="ink" className="on-dark relative flex h-[4.625rem] items-center overflow-hidden bg-night text-white">
      <p className="flex h-full shrink-0 items-center pl-(--bleed) pr-4 text-caption text-white/70 md:pr-6 md:text-small">{strip.label}</p>
      <div className="flex min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4rem,black_calc(100%-4rem),transparent)] md:[mask-image:linear-gradient(to_right,transparent,black_7rem,black_calc(100%-7rem),transparent)]">
        <div className="marquee flex w-max">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
