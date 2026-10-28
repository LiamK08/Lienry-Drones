import Link from "next/link";
import type { MenuFeature, MenuGroup } from "@/lib/site";
import { Icon } from "@/components/blocks/Icon";
import { Button } from "@/components/ui/Button";

// One tile tone for every group: the accent on its pale tint (a group's `tone` in src/lib/site.ts is no
// longer read: three hues read as a rainbow, and amber is a status tone, never a second accent).
const tile = "bg-tint text-accent";

function Item({ href, label, note, icon, onPick }: { href: string; label: string; note: string; icon: string; onPick: () => void }) {
  return (
    <li>
      <Link href={href} onClick={onPick} className="group/item flex gap-3 rounded-[0.625rem] p-2 transition-[background-color] duration-200 hover:bg-paper">
        <span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-[0.625rem] ${tile}`}>
          <Icon name={icon} className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-small font-medium text-ink group-hover/item:underline group-hover/item:decoration-1 group-hover/item:underline-offset-4">{label}</span>
          <span className="mt-0.5 block text-caption leading-[1.45] text-muted">{note}</span>
        </span>
      </Link>
    </li>
  );
}

/**
 * A header panel: one column per group under a small Inter heading, its links as an icon tile (one
 * tone), a label and a one-line note, all in Inter (the serif is for headings, not menus). Resources
 * opens with a dark card: a title, three links each with its subject as a plain sentence-case note, and
 * a pill.
 */
export function MenuPanel({ groups, feature, onPick }: { groups: readonly MenuGroup[]; feature?: MenuFeature; onPick: () => void }) {
  const cols = groups.reduce((n, g) => n + (g.cols ?? 1), 0);
  return (
    <div className={`grid gap-6 ${feature ? "grid-cols-[22rem_1fr]" : ""}`}>
      {feature ? (
        <div className="on-dark flex flex-col rounded-card bg-night p-5 text-white">
          <p className="text-[1.0625rem] font-medium leading-snug">{feature.title}</p>
          <ul className="mt-4 flex-1">
            {feature.items.map((i) => (
              <li key={i.href} className="border-t border-white/10 py-3">
                <Link href={i.href} onClick={onPick} className="group/f block">
                  <span className="block text-small leading-[1.45] text-white group-hover/f:underline group-hover/f:decoration-1 group-hover/f:underline-offset-4">{i.label}</span>
                  <span className="mt-0.5 block text-caption leading-[1.45] text-muted-on-dark">{i.tag}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Button href={feature.action.href} onClick={onPick} variant="secondary" size="sm" arrow className="mt-2 self-start">
            {feature.action.label}
          </Button>
        </div>
      ) : null}
      <div className="grid gap-x-6 gap-y-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {groups.map((g) => (
          <div key={g.heading} style={{ gridColumn: `span ${g.cols ?? 1}` }}>
            <p className="px-2 pb-2 pt-1 text-caption font-medium text-muted">{g.heading}</p>
            <ul className={`grid gap-x-6 gap-y-1 ${g.cols === 2 ? "grid-cols-2" : ""}`}>
              {g.links.map((l) => (
                <Item key={`${l.href}-${l.label}`} {...l} onPick={onPick} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
