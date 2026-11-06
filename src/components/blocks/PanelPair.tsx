import type { Action } from "@/lib/types";
import { Icon } from "@/components/blocks/Icon";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";

export type PairTile = { icon: string; title: string; note: string };
export type PairPanel = { title: string; body: string; tiles: readonly PairTile[]; link?: Action };

/**
 * One panel of the pair: its title at the card step (an h2 at 32/30, as the feature rows' titles are),
 * one line, then four tiles, two by two, and an optional text link. Each tile is a card holding a 40px
 * round icon, a 16px title and a 14px note (plain text, not headings). On the tint the tiles are white;
 * on the night they are a faint white wash with a white hairline edge. Colours are the surface's roles,
 * so the night panel (.on-dark) resolves its own.
 *
 * From 1024 the panel spans the pair's three rows as a subgrid, so both panels' tiles start on one line
 * and the two stand equal height whatever their lines run to.
 */
function Panel({ id, panel, dark }: { id: string; panel: PairPanel; dark: boolean }) {
  return (
    <div className={`grid content-start gap-y-8 rounded-panel p-6 md:p-10 lg:row-span-3 lg:grid-rows-subgrid lg:gap-y-10 lg:p-12 ${dark ? "on-dark bg-night text-fg" : "bg-tint text-fg"}`}>
      <div>
        <h2 id={`${id}-heading`} className="text-h3 text-balance">
          {panel.title}
        </h2>
        <p className="mt-4 max-w-[30rem] text-body leading-[1.6] text-balance text-fg-muted">{panel.body}</p>
      </div>
      <ul className="grid grid-cols-2 gap-2.5 md:gap-3">
        {panel.tiles.map((t) => (
          <li key={t.title} className={`rounded-card border p-4 ${dark ? "border-white/10 bg-white/5" : "border-white bg-white"}`}>
            <span aria-hidden="true" className={`flex size-10 items-center justify-center rounded-pill text-dot ${dark ? "bg-white/10" : "bg-tint"}`}>
              <Icon name={t.icon} className="size-5" />
            </span>
            <p className="mt-4 text-body font-medium leading-[1.35] text-fg">{t.title}</p>
            <p className="mt-1 text-small leading-[1.45] text-fg-muted">{t.note}</p>
          </li>
        ))}
      </ul>
      {panel.link ? (
        <div className="-mt-4 lg:-mt-6">
          <Button href={panel.link.href} variant="tertiary" arrow>
            {panel.link.label}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Two panels side by side from 1024 (six columns each, equal height), stacked below it: the light one on
 * the pale tint, the dark one on the night. /platform's honest stand-in for the reference's integrations
 * and security pair: what the building provides, and how the design keeps people off ropes. The band is
 * named by `label`; each panel by its own title.
 */
export function PanelPair({ id, label, light, dark }: { id: string; label: string; light: PairPanel; dark: PairPanel }) {
  return (
    <Band id={id} tone="plaster" ariaLabel={label}>
      <Container>
        {/* Two equal columns one gutter apart: the twelve columns' six and six. */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2 lg:grid-rows-[auto_auto_auto] lg:gap-x-(--gutter) lg:gap-y-10">
          <Panel id={`${id}-provides`} panel={light} dark={false} />
          <Panel id={`${id}-safety`} panel={dark} dark />
        </div>
      </Container>
    </Band>
  );
}
