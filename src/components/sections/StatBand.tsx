import type { Stat } from "@/content/stats";
import type { Action } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { RevealItem, RevealList } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

/** A figure Lienry is designed around: design intent, never a result (src/content/home.ts `designFacts`). */
export type DesignFact = { term: string; value: string; unit?: string; text: string };

export type StatBandProps = {
  /** The band's id; the heading is `${id}-heading`. */
  id: string;
  headline: string;
  /** The trailing phrase of `headline`, in the italic. */
  emphasis?: string;
  intro: string;
  /** The line under the figures: `CITED_NOTE` for cited figures, `designFacts.note` for design facts. */
  note: string;
  /** The band's one primary, as an inverse (plaster) button beside the note. */
  action?: Action;
} & (
  | { kind: "cited"; items: readonly Stat[] }
  | { kind: "design"; items: readonly DesignFact[] }
);

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

// Two to four equal columns from 1024; at 1440 two columns are 684px and three are 448px.
const columns = {
  1: "",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
} as const;

function Figure({ value, unit, className = "" }: { value: string; unit?: string; className?: string }) {
  return (
    <p className={`flex max-w-none flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className="numeral text-plaster">{value}</span>
      {unit ? <span className="text-small text-muted-on-dark">{unit}</span> : null}
    </p>
  );
}

/**
 * The page's one saturated band, filled honestly: an ink band with the section head, 48, then two
 * to four equal columns. Each column is a 1px rule, 16, then (design facts) the term and 8, the
 * figure with its unit on the baseline, 12, and the text; cited figures carry, 12 under the text,
 * a source line with its index and a link to the primary source. After the columns, 32, then the
 * note (cited: `CITED_NOTE`; design: "Design intent. Concept stage.") with the optional inverse
 * primary at the right. Below 1024 everything stacks. The columns reveal once; nothing counts up.
 */
export function StatBand(props: StatBandProps) {
  const { id, headline, emphasis, intro, note, action } = props;
  const count = Math.min(Math.max(props.items.length, 1), 4) as 1 | 2 | 3 | 4;
  const item = "border-t border-plaster/20 pt-4";

  return (
    <Band id={id} tone="ink" labelledBy={`${id}-heading`}>
      <Container>
        <SectionHead id={`${id}-heading`} headline={headline} emphasis={emphasis} aside={{ intro }} tone="dark" />

        <RevealList className={`mt-[var(--gap-head)] grid gap-y-4 lg:gap-x-6 ${columns[count]}`}>
          {props.kind === "cited"
            ? props.items.map((stat, i) => (
                <RevealItem key={stat.id} className={item}>
                  <Figure value={stat.value} />
                  <p className="mt-3 text-body text-plaster">{stat.label}</p>
                  <p className="mt-3 text-caption text-muted-on-dark">
                    <sup className="mr-1 text-label">{i + 1}</sup>
                    {stat.source}.{" "}
                    <a href={stat.sourceUrl} className="water-link text-glass-on-dark" target="_blank" rel="noreferrer noopener">
                      Source<span className="sr-only">, opens in a new tab</span>
                    </a>
                  </p>
                </RevealItem>
              ))
            : props.items.map((fact) => (
                <RevealItem key={fact.term} className={item}>
                  <p className="text-caption text-muted-on-dark">{fact.term}</p>
                  <Figure value={fact.value} unit={fact.unit} className="mt-2" />
                  <p className="mt-3 text-body text-plaster">{fact.text}</p>
                </RevealItem>
              ))}
        </RevealList>

        <div className="mt-8 flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <p className="text-caption text-muted-on-dark">{note}</p>
          {action ? (
            <Button href={action.href} variant="inverse" arrow className="shrink-0">
              {action.label}
            </Button>
          ) : null}
        </div>
      </Container>
    </Band>
  );
}
