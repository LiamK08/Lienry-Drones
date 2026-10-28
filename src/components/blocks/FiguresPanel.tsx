import type { Stat } from "@/content/stats";
import { TextLink } from "@/components/ui/TextLink";

/**
 * Cited figures as a feature row's media: a paper panel with the card corners, 5:4 from 768 (it grows
 * if its text needs more), the figures side by side from 640 with a rule between them, stacked below.
 * Each figure: the numeral (Inter light), its label, and the source line with its index and a link to
 * the primary source (new tab). The row's text carries the cited note.
 */
export function FiguresPanel({ items }: { items: readonly Stat[] }) {
  return (
    <div className="flex flex-col justify-center rounded-card bg-paper px-6 py-8 md:aspect-[5/4] md:p-10 xl:p-12">
      <ul className="grid gap-8 sm:grid-cols-2 sm:gap-0">
        {items.map((stat, i) => (
          <li key={stat.id} className={i ? "border-t border-line pt-8 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8" : "sm:pr-8"}>
            <p className="numeral text-[clamp(2.75rem,1.5rem+3vw,4rem)] text-fg">{stat.value}</p>
            <p className="mt-4 text-body leading-[1.5] text-fg">{stat.label}</p>
            <p className="mt-3 text-caption text-fg-muted">
              <sup className="mr-2 text-label">{i + 1}</sup>
              {stat.source}.{" "}
              <TextLink external href={stat.sourceUrl}>
                Source
              </TextLink>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
