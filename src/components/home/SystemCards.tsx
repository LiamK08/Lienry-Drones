import Link from "next/link";
import { systems } from "@/content/home";
import { australiaStats, solarStats } from "@/content/stats";
import { Band, Container } from "@/components/ui/Band";
import { SectionHead } from "@/components/ui/SectionHead";
import { Icon } from "@/components/blocks/Icon";

const stats = [...solarStats, ...australiaStats];

/**
 * Three settings on the accent tint, as even white cards: the setting's icon and name, a meta line,
 * the statement in the serif (Lienry's design intent, never a customer's words), then, ruled off at
 * the foot, three figures with short labels, one note and a link. Every card has the same rows, so
 * the three stand the same height with no gap inside. Commercial and home figures are design intent;
 * solar's are cited, with their sources linked in the note.
 */
export function SystemCards() {
  return (
    <Band id="systems" tone="tint" labelledBy="systems-heading">
      <Container>
        <SectionHead id="systems-heading" layout="center" headline={systems.headline} intro={systems.intro} link={systems.link} />
        <ul className="mx-auto mt-(--head-gap) grid max-w-[75rem] gap-5 lg:grid-cols-3">
          {systems.cards.map((c) => {
            const cited = "cited" in c && c.cited ? c.cited.map((x) => ({ ...stats.find((s) => s.id === x.id)!, short: x.label, sourceShort: x.source })) : null;
            const figures = cited ? cited.map((s) => ({ value: s.value, label: s.short })) : ("figures" in c && c.figures) || [];
            return (
              <li key={c.id} className="flex flex-col rounded-card bg-white p-7 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-16px_rgb(0_0_0/0.12)]">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-[0.625rem] bg-tint text-accent">
                    <Icon name={c.icon} className="size-[1.125rem]" />
                  </span>
                  <p className="font-sans text-[1.0625rem] font-semibold leading-tight tracking-[-0.02em] text-ink">{c.name}</p>
                </div>
                <p className="mt-3 text-caption text-muted">{c.sub}</p>
                <p className="mt-5 font-display text-[1.25rem] leading-[1.35] text-ink">{c.statement}</p>
                <div className="mt-auto pt-8">
                  <dl className="grid grid-cols-3 gap-4 border-t border-line pt-6">
                    {figures.map((f) => (
                      <div key={f.label} className="flex flex-col">
                        <dt className="order-2 mt-2 text-caption leading-[1.35] text-muted lg:min-h-[2.7em]">{f.label}</dt>
                        <dd className="order-1 font-display text-[1.75rem] leading-none text-ink">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-5 text-caption leading-[1.4] text-muted lg:min-h-[calc(2.8em+0.25rem)]">
                    {c.note}
                    {cited ? (
                      <>
                        {" "}Sources:{" "}
                        {cited.map((s, i) => (
                          <span key={s.id}>
                            <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" title={s.source} className="link inline-block py-0.5">
                              {s.sourceShort}
                            </a>
                            {i < cited.length - 1 ? ", " : "."}
                          </span>
                        ))}
                      </>
                    ) : null}
                  </p>
                  <Link href={c.link.href} className="mt-4 inline-flex min-h-6 items-center gap-1 text-small font-medium text-accent hover:underline hover:underline-offset-4">
                    Read more <span aria-hidden="true">→</span>
                    <span className="sr-only">: {c.link.label}</span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </Band>
  );
}
