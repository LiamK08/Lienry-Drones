import { strip } from "@/content/home";
import { Icon } from "@/components/blocks/Icon";

/**
 * The strip under the hero: a 74px dark band with its label at the left and a slow loop of marks
 * (an icon and a semibold name) for what the system is designed for. These are not customers or
 * partners. The list is in the DOM once for screen readers; the moving copy is aria-hidden.
 */
export function Strip() {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-16 pr-16">
      {strip.items.map((item) => (
        <li key={item.label} className="flex items-center gap-2.5 whitespace-nowrap text-[1.1875rem] font-semibold tracking-[-0.02em] text-white/75">
          <Icon name={item.icon} className="size-6" />
          {item.label}
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label={strip.label} data-band="strip" data-tone="ink" className="on-dark relative flex h-[4.625rem] items-center overflow-hidden bg-night text-white">
      <p className="page-x relative z-10 flex h-full shrink-0 items-center bg-night pr-8 text-small text-white/70">{strip.label}</p>
      <div className="flex min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="marquee flex w-max">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
