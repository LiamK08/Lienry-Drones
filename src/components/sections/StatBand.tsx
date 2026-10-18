import type { Stat } from "@/content/stats";
import type { Action, BandTone, LegacyTone } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { RevealItem, RevealList } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { TextLink } from "@/components/ui/TextLink";

export type StatBandProps = {
  /** The band's id; the heading is `${id}-heading`. */
  id: string;
  tone: BandTone | LegacyTone;
  eyebrow: string;
  headline: string;
  /** Cited figures from src/content/stats.ts (`pickStats`). */
  items: readonly Stat[];
  /** The line about the figures: `CITED_NOTE`. */
  note: string;
  /** "head" (default): the note is the head's aside. "foot": the head takes `intro` and the note follows the cells. */
  notePosition?: "head" | "foot";
  /** Required with notePosition="foot". */
  intro?: string;
  /** The band's one primary, 32 under the cells. */
  action?: Action;
};

/** The note under every cited band: the figures describe the industry, never Lienry. */
export const CITED_NOTE =
  "These figures describe the industry, not Lienry's results. Lienry Drones is pre-launch and has no customer results to report.";

/** The stats of `list` named by `ids`, in that order. Throws on an id that is not in `list`. */
export function pickStats(list: readonly Stat[], ids: readonly string[]): Stat[] {
  return ids.map((id) => {
    const stat = list.find((s) => s.id === id);
    if (!stat) throw new Error(`StatBand: no stat "${id}" in src/content/stats.ts.`);
    return stat;
  });
}

/**
 * Cited figures: the section head, then the cells (two across from 768, three from 1024 when there
 * are three), each a rule, 16, the numeral, 16, its label, 16, the source line with its index and a
 * link to the primary source (new tab). Nothing counts up; the cells rise in once.
 */
export function StatBand({ id, tone, eyebrow, headline, items, note, notePosition = "head", intro, action }: StatBandProps) {
  const foot = notePosition === "foot";
  return (
    <Band id={id} tone={tone} labelledBy={`${id}-heading`}>
      <Container>
        {foot ? (
          <SectionHead id={`${id}-heading`} eyebrow={eyebrow} headline={headline} intro={intro ?? ""} />
        ) : (
          <SectionHead id={`${id}-heading`} eyebrow={eyebrow} headline={headline} action={<p className="max-w-none text-body text-fg-muted">{note}</p>} />
        )}
        <RevealList className={`mt-(--head-gap) grid gap-y-10 md:grid-cols-2 md:gap-x-6 ${items.length === 3 ? "lg:grid-cols-3" : ""}`}>
          {items.map((stat, i) => (
            <RevealItem key={stat.id} className="border-t border-rule pt-4">
              <p className="numeral text-fg">{stat.value}</p>
              <p className="mt-4 text-lead text-fg">{stat.label}</p>
              <p className="mt-4 text-caption text-fg-muted">
                <sup className="mr-2 text-label">{i + 1}</sup>
                {stat.source}.{" "}
                <TextLink external href={stat.sourceUrl}>
                  Source
                </TextLink>
              </p>
            </RevealItem>
          ))}
        </RevealList>
        {foot ? <p className="mt-8 max-w-[96ch] text-caption text-fg-muted">{note}</p> : null}
        {action ? (
          <div data-actions="" className="mt-8">
            <Button href={action.href} arrow>
              {action.label}
            </Button>
          </div>
        ) : null}
      </Container>
    </Band>
  );
}
