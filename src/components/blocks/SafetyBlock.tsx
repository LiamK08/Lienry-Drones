import type { ReactNode } from "react";
import type { Stat } from "@/content/stats";
import type { Action, ImageRef } from "@/lib/types";
import { Icon } from "@/components/blocks/Icon";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/SectionHead";
import { TextLink } from "@/components/ui/TextLink";

export type SafetyBlockProps = {
  /** @deprecated Ignored: the site has no eyebrows (owner, 21 October 2026). */
  eyebrow?: string;
  headline: string;
  /** The trailing phrase of `headline`, its payoff, set in the italic in the night's accent (the pale glass blue). */
  emphasis?: string;
  /** The one line under the head. */
  aside: string;
  /** The panel's pill (the primary, on the night panel's accent fill). */
  action: Action;
  /** Four facts, two by two from 640: what is designed in (the honest stand-in for badges: Lienry claims
   *  no certifications and no approvals). */
  tiles: readonly { icon: string; title: string; text: string }[];
  /** "attached" when the band above is white and already ends on its own pad. Default "section". */
  pad?: "section" | "attached";
  /** @deprecated Ignored: the tags are folded into the tiles. */
  tags?: readonly string[];
  /** @deprecated Ignored: the night panel carries no picture. */
  image?: ImageRef;
};

export type FiguresBlockProps = {
  id: string;
  /** @deprecated Ignored: the site has no eyebrows (owner, 21 October 2026). */
  eyebrow?: string;
  headline: string;
  /** The trailing phrase of `headline`, its payoff, set in the italic in the night's accent (the pale glass blue). */
  emphasis?: string;
  /** The one line under the head. */
  aside: string;
  /** @deprecated Ignored: the night panel carries no picture. */
  image?: ImageRef;
  /** Cited figures from src/content/stats.ts (`pickStats`). */
  items: readonly Stat[];
  /** The line under the head's aside: `CITED_NOTE`. */
  note: string;
};

// The tiles: the card corners, a hairline edge on the raised ink.
const tile = "rounded-card border border-white/12 bg-ink-raised p-5";

/**
 * The night panel of the solution pages (the reference's security slot): an inset `bg-night` panel with
 * the panel corners on the rail, inside a white band. 56 inside from 1200, 40 from 768, 20 on a phone.
 * From 1200 the head (the h2 at the inner section step, its line, then the head's own content) stands on
 * the left, centred against the right-hand column; below it the two stack.
 */
function NightPanel({ id, pad = "section", headline, emphasis, aside, head, children }: { id: string; pad?: "section" | "attached"; headline: string; emphasis?: string; aside: string; head?: ReactNode; children: ReactNode }) {
  return (
    <Band id={id} tone="plaster" pad={pad} labelledBy={`${id}-heading`}>
      <Container>
        <div className="on-dark grid gap-8 rounded-panel bg-night p-5 md:gap-10 md:p-10 min-[75rem]:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] min-[75rem]:items-center min-[75rem]:gap-16 min-[75rem]:p-14">
          <div className="flex flex-col items-start">
            <h2 id={`${id}-heading`} className={emphasis ? "em-accent text-h2s text-white" : "text-h2s text-white"}>
              <Headline text={headline} emphasis={emphasis} />
            </h2>
            <p className="mt-4 text-lead leading-[1.55] text-fg-muted">{aside}</p>
            {head}
          </div>
          {children}
        </div>
      </Container>
    </Band>
  );
}

/**
 * Safety as a night panel: the head, its line and one pill on the left; on the right four fact tiles,
 * two by two from 640, each an icon disc in the pale accent over a white title and a short muted note
 * (below 640 the tiles stack, the disc beside the text). What is designed in, and "We do not claim any
 * approvals", stand in for badges.
 */
export function SafetyBlock({ headline, emphasis, aside, action, tiles, pad }: SafetyBlockProps) {
  return (
    <NightPanel
      id="safety"
      pad={pad}
      headline={headline}
      emphasis={emphasis}
      aside={aside}
      head={
        <Button href={action.href} arrow className="mt-8">
          {action.label}
        </Button>
      }
    >
      <ul className="grid gap-2.5 sm:auto-rows-fr sm:grid-cols-2 md:gap-3">
        {tiles.map((t) => (
          <li key={t.title} className={`${tile} flex items-start gap-4 sm:block`}>
            <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-white/10 text-accent-on-dark">
              <Icon name={t.icon} className="size-6" />
            </span>
            <div className="min-w-0">
              <p className="text-body font-medium leading-[1.4] text-white sm:mt-4">{t.title}</p>
              <p className="mt-1 text-small leading-[1.5] text-fg-muted">{t.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </NightPanel>
  );
}

/**
 * Cited figures on the same night panel (/solar): the head, its line and the cited note on the left; on
 * the right one tile per figure, stacked: the numeral (Inter light, 44px), its label, and the source line
 * with its index and a link to the primary source (new tab). From 640 the numeral stands beside its label.
 */
export function FiguresBlock({ id, headline, emphasis, aside, items, note }: FiguresBlockProps) {
  return (
    <NightPanel id={id} headline={headline} emphasis={emphasis} aside={aside} head={<p className="mt-6 text-small leading-[1.5] text-fg-muted md:max-w-prose">{note}</p>}>
      <ul className="grid gap-2.5 md:gap-3">
        {items.map((stat, i) => (
          <li key={stat.id} className={`${tile} sm:grid sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-x-6`}>
            <p className="numeral text-[2.75rem] text-white">{stat.value}</p>
            <div className="mt-3 sm:mt-0">
              <p className="text-body leading-[1.5] text-white">{stat.label}</p>
              <p className="mt-2 text-caption text-fg-muted">
                <sup className="mr-2 text-label">{i + 1}</sup>
                {stat.source}.{" "}
                <TextLink external href={stat.sourceUrl}>
                  Source
                </TextLink>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </NightPanel>
  );
}
