import Link from "next/link";
import { systems } from "@/content/home";
import { australiaStats, solarStats } from "@/content/stats";
import { Band, Container } from "@/components/ui/Band";
import { SectionHead } from "@/components/ui/SectionHead";
import { Mark } from "@/components/ui/Wordmark";

const stats = [...solarStats, ...australiaStats];

/**
 * Three settings on the accent tint, as white cards: the setting's name with the Lienry mark, a meta
 * line, a statement in the serif, the line it comes from (the design brief, never a customer), three
 * figures and a link. Commercial and home figures are design intent; solar's are cited with sources.
 */
export function SystemCards() {
  return (
    <Band id="systems" tone="tint" labelledBy="systems-heading">
      <Container>
        <SectionHead id="systems-heading" layout="center" eyebrow={systems.eyebrow} headline={systems.headline} intro={systems.intro} link={systems.link} />
        <ul className="mx-auto mt-(--head-gap) grid max-w-[75rem] gap-6 lg:grid-cols-3">
          {systems.cards.map((c) => {
            const cited = "cited" in c && c.cited ? c.cited.map((id) => stats.find((s) => s.id === id)!) : null;
            const figures = cited ? cited.map((s) => ({ value: s.value, label: s.label })) : ("figures" in c && c.figures) || [];
            return (
              <li key={c.id} className="flex flex-col rounded-[0.75rem] border border-line bg-white p-6">
                <p className="flex items-center gap-2 text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink">
                  <Mark className="h-5 w-auto" />
                  {c.name}
                </p>
                <p className="mt-3 text-caption text-muted">{c.sub}</p>
                <p className="mt-5 font-display text-[1.375rem] leading-[1.3] text-ink">{c.statement}</p>
                <div className="mt-6 flex items-center gap-3">
                  <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-pill bg-tint text-accent">
                    <Mark className="h-4 w-auto" />
                  </span>
                  <span>
                    <span className="block text-caption font-medium text-ink">{systems.source.name}</span>
                    <span className="block text-caption text-muted">{systems.source.role}</span>
                  </span>
                </div>
                <dl className="mt-auto grid grid-cols-3 gap-4 border-t border-line pt-5">
                  {figures.map((f) => (
                    <div key={f.label} className="mt-1">
                      <dt className="sr-only">{f.label}</dt>
                      <dd className="font-display text-[1.75rem] leading-none text-ink">{f.value}</dd>
                      <dd className="mt-2 text-caption text-muted">{cited ? f.label.split(",")[0] : f.label}</dd>
                    </div>
                  ))}
                </dl>
                {cited ? (
                  <p className="mt-4 text-caption text-muted">
                    Sources:{" "}
                    {cited.map((s, i) => (
                      <span key={s.id}>
                        <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="link inline-block py-1">
                          {s.source.split(",")[0]}
                        </a>
                        {i < cited.length - 1 ? "; " : "."}
                      </span>
                    ))}
                  </p>
                ) : null}
                <Link href={c.link.href} className="mt-5 inline-flex items-center gap-1 text-small text-accent hover:underline hover:underline-offset-4">
                  Read more <span aria-hidden="true">→</span>
                  <span className="sr-only">: {c.link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Band>
  );
}
