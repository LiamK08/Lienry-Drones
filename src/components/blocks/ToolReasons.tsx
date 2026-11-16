import type { ReactNode } from "react";
import { fitCheck } from "@/content/home";
import type { fitCheckPage } from "@/content/tools";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { SectionHead } from "@/components/ui/SectionHead";
import { all, chosen, gapsOf, groupOf, scoreFor, verdictFor, zoneTone, type Answers } from "./fitcheck/model";
import { GapRow, ZoneBar } from "./fitcheck/parts";

export type ToolReasonsProps = {
  /** The band's id; the heading is `${id}-heading`. */
  id: string;
  about: (typeof fitCheckPage)["about"];
};

const tick = (
  <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3.5 8.5 3 3 6-7" />
  </svg>
);
/** A card's small picture: a white card in the check's own parts, light inside a night card too. Decoration, so hidden from assistive technology. */
const mini = "on-light rounded-card bg-white p-5 text-ink";

/** The third statement as the check shows it: its place in the seven, the statement and its three answers, the first chosen. */
function QuestionMini() {
  const at = 2;
  return (
    <div aria-hidden="true" className={mini}>
      <div className="flex items-center gap-3 text-caption">
        <p className="shrink-0 tabular-nums">
          <span className="font-medium text-ink">{fitCheck.steps.count.replace("{n}", String(at + 1))}</span>
          <span className="text-muted"> · {groupOf(all[at])}</span>
        </p>
        <span className="flex min-w-0 flex-1 gap-1">
          {all.map((q, i) => (
            <span key={q.id} className={`h-1 flex-1 rounded-pill ${i < at ? "bg-accent" : i === at ? "bg-accent/45" : "bg-line"}`} />
          ))}
        </span>
      </div>
      <p className="mt-4 font-display text-[1.25rem] leading-[1.25] tracking-[-0.01em] text-balance">{all[at].text}</p>
      <div className="mt-4 grid gap-1.5">
        {fitCheck.answers.map((a, i) => (
          <span key={a.id} className={`flex h-9 items-center justify-center rounded-pill border text-small ${i === 0 ? chosen(a.id) : "border-transparent bg-paper font-medium text-ink"}`}>
            {a.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A made-up result, scored by the check's own sums and tagged as an example: the score, its zone, the bar and the points it raises. */
function ExampleMini({ tag, answers }: { tag: string; answers: Answers }) {
  const pct = scoreFor(answers);
  const verdict = verdictFor(answers);
  return (
    <div aria-hidden="true" className={mini}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-small font-medium text-ink">{fitCheck.panel.label}</p>
        <span className="rounded-hard border border-hairline px-2 py-0.5 text-[0.75rem] font-medium leading-[1.4] text-muted">{tag}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3">
        <p className="flex items-baseline gap-1.5">
          <span className="text-[3rem] font-light leading-none tracking-[-0.04em] tabular-nums">{pct}</span>
          <span className="text-small leading-none text-muted">{fitCheck.panel.outOf}</span>
        </p>
        <p className={`font-display text-[1.25rem] leading-[1.25] ${zoneTone[verdict.zone].text}`}>{verdict.title}</p>
      </div>
      <ZoneBar pct={pct} zone={verdict.zone} done labels={false} className="mt-4" />
      <ul className="mt-3 border-t border-line">
        {gapsOf(answers).map((q) => (
          <GapRow key={q.id} q={q} no={answers[q.id] === "no"} still />
        ))}
      </ul>
    </div>
  );
}

/** The three things the building needs, from the design brief, as a ticked list. */
function NeedsMini({ needs }: { needs: readonly string[] }) {
  return (
    <ul aria-hidden="true" className={`${mini} py-3`}>
      {needs.map((n) => (
        <li key={n} className="flex items-center gap-3 border-b border-line py-2.5 text-small leading-[1.5] last:border-b-0">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-pill bg-tint text-accent">{tick}</span>
          {n}
        </li>
      ))}
    </ul>
  );
}

/**
 * What a tool tells you, under the tool (/fit-check): a centred heading over three cards at the panel
 * radius (night, tint, night), three across from 1024 and stacked below it. Each card is a title, a
 * sentence and a small coded picture built from the fit check's own parts and tokens: the question
 * card, an example result (tagged "Example", so nobody reads it as their own or as a customer's) and
 * the three things the building needs. The pictures are decoration: hidden from assistive technology,
 * with no hover effect. A text link under the cards leads on.
 */
export function ToolReasons({ id, about }: ToolReasonsProps) {
  const picture = (card: (typeof about.cards)[number]): ReactNode =>
    card.example ? <ExampleMini tag={card.example.tag} answers={card.example.answers as Answers} /> : card.needs ? <NeedsMini needs={card.needs} /> : <QuestionMini />;
  return (
    <Band id={id} tone="plaster" labelledBy={`${id}-heading`}>
      <Container>
        <SectionHead id={`${id}-heading`} layout="center" headline={about.headline} emphasis={about.emphasis} />
        <ul className="mt-(--head-gap) grid gap-5 lg:grid-cols-3 lg:gap-6">
          {about.cards.map((card, i) => (
            <li key={card.id} className={`flex flex-col gap-8 rounded-panel p-6 md:p-8 ${i % 2 ? "bg-tint text-ink" : "on-dark bg-night text-plaster"}`}>
              <div>
                <h3 className="text-h3 text-balance">{card.title}</h3>
                <p className="mt-3 text-body text-fg-muted">{card.body}</p>
              </div>
              <div className="mt-auto">{picture(card)}</div>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex justify-center">
          <Button href={about.link.href} variant="tertiary" arrow>
            {about.link.label}
          </Button>
        </div>
      </Container>
    </Band>
  );
}
