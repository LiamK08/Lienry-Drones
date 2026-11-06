import Link from "next/link";
import type { MenuFeature, MenuGroup, MenuLink } from "@/lib/site";
import { MenuTile } from "@/components/site/MenuTile";
import { Button } from "@/components/ui/Button";
import { FacadeMap } from "@/components/software/FacadeMap";
import { CELLS, FLOORS } from "@/components/three/software/dims";
import { fitCheck } from "@/content/home";

// One tile for every group: a night tile with a white and water-blue glyph (MenuTile). A
// group's `tone` in src/lib/site.ts is not read: three hues read as a rainbow, and amber is a status tone.

function Item({ href, label, note, icon, onPick }: MenuLink & { onPick: () => void }) {
  return (
    <li>
      <Link href={href} onClick={onPick} className="flex gap-3 rounded-[0.625rem] p-2 transition-[background-color] duration-200 hover:bg-tint motion-reduce:transition-none">
        <MenuTile name={icon} />
        <span className="min-w-0">
          <span className="block text-small font-medium text-ink">{label}</span>
          <span className="mt-0.5 block text-caption leading-[1.45] text-muted">{note}</span>
        </span>
      </Link>
    </li>
  );
}

/**
 * The demo building partway through a clean, for the Platform card's map (static; the software's own
 * facade map, src/components/software): from the top, the roof glazing and the top floors washed, the
 * next floors on their first pass, the rest still to wash, with the debris the re-scan shaded still on
 * the cells not yet washed. Demo data, as everywhere the coded model shows.
 */
const DEMO_CLEAN = Float32Array.from(CELLS, (c) => {
  if (c.face === "R") return 1;
  const fromTop = FLOORS - 1 - c.floor;
  if (c.face === "N") return fromTop < 2 ? 1 : fromTop === 2 ? (c.bay < 10 ? 1 : 0.5) : fromTop === 3 && c.bay < 6 ? 0.5 : 0;
  return fromTop === 0 ? 1 : fromTop === 1 && c.bay < 5 ? 0.5 : 0;
});

/** The fit check's first questions, for the Solutions card's tray (the rest fall under its foot). */
const FIRST_QUESTIONS = fitCheck.groups.flatMap((g) => g.questions).slice(0, 4);

/** The panel's feature card: the Resources list on night, the Platform accent card or the Solutions tint card. */
function Feature({ feature: f, onPick }: { feature: MenuFeature; onPick: () => void }) {
  if (f.kind === "list") {
    return (
      <div className="on-dark flex flex-col rounded-card bg-night p-5 text-white">
        <p className="text-[1.0625rem] font-medium leading-snug">{f.title}</p>
        <ul className="mt-4 flex-1">
          {f.items.map((i) => (
            <li key={i.href} className="border-t border-white/10 py-3">
              <Link href={i.href} onClick={onPick} className="group/f block">
                <span className="block text-small leading-[1.45] text-white group-hover/f:underline group-hover/f:decoration-1 group-hover/f:underline-offset-4">{i.label}</span>
                <span className="mt-0.5 block text-caption leading-[1.45] text-muted-on-dark">{i.tag}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Button href={f.action.href} onClick={onPick} variant="secondary" size="sm" arrow className="mt-2 self-start">
          {f.action.label}
        </Button>
      </div>
    );
  }
  if (f.kind === "accent") {
    // The link in white on the accent (6.99:1); the focus ring keeps the dark surface's light step.
    return (
      <div className="on-dark flex flex-col overflow-hidden rounded-card bg-accent px-5 pt-5 text-white [--s-link-hover:var(--color-white)] [--s-link:var(--color-white)]">
        <p className="text-[1.0625rem] font-medium leading-snug">{f.title}</p>
        <p className="mt-1.5 text-small leading-[1.5] text-white/85">{f.body}</p>
        <Button href={f.link.href} onClick={onPick} variant="tertiary" arrow className="self-start">
          {f.link.label}
        </Button>
        {/* A tray of the software's facade map, cut off by the card's foot: decorative, so hidden from
            assistive technology with its tag. */}
        <div aria-hidden="true" className="mt-4 min-h-[7.5rem] flex-1 basis-0 overflow-hidden rounded-t-[0.625rem] bg-white px-3 pt-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-caption font-medium leading-none text-ink">Demo building, mid-clean</span>
            <span className="shrink-0 rounded-hard border border-line px-1.5 py-0.5 text-[0.6875rem] leading-none text-muted">Demo data</span>
          </div>
          <div className="mt-3">
            <FacadeMap cells={DEMO_CLEAN} version={1} wash debris selected={null} decorative strong />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-tint px-5 pt-5 text-ink">
      <p className="text-[1.0625rem] font-medium leading-snug">{f.title}</p>
      <p className="mt-1.5 text-small leading-[1.5] text-muted">{f.body}</p>
      <Button href={f.link.href} onClick={onPick} variant="tertiary" arrow className="self-start">
        {f.link.label}
      </Button>
      {/* A tray of the fit check as it opens, its first questions with their answers not yet picked, cut
          off by the card's foot: decorative, so hidden from assistive technology. */}
      <div aria-hidden="true" className="mt-4 min-h-[7.5rem] flex-1 basis-0 overflow-hidden rounded-t-[0.625rem] bg-white px-3 pt-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-caption font-medium leading-none text-ink">Fit check</span>
          <span className="shrink-0 text-[0.6875rem] leading-none text-muted">{fitCheck.panel.answered.replace("{n}", "0")}</span>
        </div>
        <ul className="mt-3 border-t border-line">
          {FIRST_QUESTIONS.map((q) => (
            <li key={q.id} className="border-b border-line py-2.5">
              <span className="block text-caption leading-snug text-ink">{q.text}</span>
              <span className="mt-1.5 flex gap-1">
                {fitCheck.answers.map((a) => (
                  <span key={a.id} className="rounded-pill bg-paper px-2.5 py-1 text-[0.6875rem] font-medium leading-none text-muted">
                    {a.label}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * A header panel: its feature card (22.5rem) beside one column per group under a small Inter heading,
 * its links as an icon tile (one tone), a label and a one-line note, all in Inter (the serif is for
 * headings, not menus); a link hovers on the tint. Platform opens on the accent card with the coded
 * facade map, Solutions on the fit check's tint card, Resources on the dark list card with its pill.
 */
export function MenuPanel({ groups, feature, onPick }: { groups: readonly MenuGroup[]; feature: MenuFeature; onPick: () => void }) {
  const cols = groups.reduce((n, g) => n + (g.cols ?? 1), 0);
  return (
    <div className="grid grid-cols-[22.5rem_1fr] gap-6">
      <Feature feature={feature} onPick={onPick} />
      <div className="grid content-start gap-x-6 gap-y-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
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
