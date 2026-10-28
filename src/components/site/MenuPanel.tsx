import Link from "next/link";
import type { MenuFeature, MenuGroup } from "@/lib/site";
import { Icon } from "@/components/blocks/Icon";

// The icon tiles' tones, one per group: Lienry's teal, a warm sand and a water green.
const tones = {
  teal: "bg-tint text-accent",
  sand: "bg-tint text-accent",
  green: "bg-tint text-accent",
} as const;

function Item({ href, label, note, icon, tone, onPick }: { href: string; label: string; note: string; icon: string; tone: MenuGroup["tone"]; onPick: () => void }) {
  return (
    <li>
      <Link href={href} onClick={onPick} className="group/item flex gap-3 rounded-[0.625rem] p-2 transition-[background-color] duration-200 hover:bg-paper">
        <span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-[0.625rem] ${tones[tone]}`}>
          <Icon name={icon} className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-[0.9375rem] leading-snug text-ink group-hover/item:underline group-hover/item:decoration-1 group-hover/item:underline-offset-4">{label}</span>
          <span className="mt-0.5 block font-display text-[0.8125rem] leading-snug text-muted">{note}</span>
        </span>
      </Link>
    </li>
  );
}

/**
 * A header panel: one column per group, each under a serif heading (muted on Solutions and Resources),
 * its links as an icon tile, a serif title and a serif note. Resources opens with a dark card of three
 * tagged links and a pill.
 */
export function MenuPanel({ groups, feature, onPick }: { groups: readonly MenuGroup[]; feature?: MenuFeature; onPick: () => void }) {
  const cols = groups.reduce((n, g) => n + (g.cols ?? 1), 0);
  return (
    <div className={`grid gap-6 ${feature ? "grid-cols-[22rem_1fr]" : ""}`}>
      {feature ? (
        <div className="on-dark flex flex-col rounded-card bg-night p-5 text-white">
          <p className="font-display text-[1.375rem] leading-tight">{feature.title}</p>
          <ul className="mt-4 flex-1">
            {feature.items.map((i) => (
              <li key={i.href} className="border-t border-white/10 py-3">
                <Link href={i.href} onClick={onPick} className="group/f block">
                  <span className="inline-block rounded-hard bg-accent px-1.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.04em] text-white">{i.tag}</span>
                  <span className="mt-1.5 block font-display text-[1.0625rem] leading-snug group-hover/f:underline group-hover/f:decoration-1 group-hover/f:underline-offset-4">{i.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={feature.action.href} onClick={onPick} className="mt-2 inline-flex h-10 items-center gap-2 self-start rounded-pill bg-white pl-1 pr-4 text-small font-medium text-ink">
            <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-pill bg-accent text-white">
              →
            </span>
            {feature.action.label}
          </Link>
        </div>
      ) : null}
      <div className="grid gap-x-6 gap-y-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {groups.map((g) => (
          <div key={g.heading} style={{ gridColumn: `span ${g.cols ?? 1}` }}>
            <p className={`px-2 pb-2 pt-1 font-display text-[1.25rem] ${g.muted ? "text-muted" : "text-ink"}`}>{g.heading}</p>
            <ul className={`grid gap-x-6 gap-y-1 ${g.cols === 2 ? "grid-cols-2" : ""}`}>
              {g.links.map((l) => (
                <Item key={`${l.href}-${l.label}`} {...l} tone={g.tone} onPick={onPick} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
