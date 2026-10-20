import Link from "next/link";
import { systems } from "@/content/home";
import { australiaStats, solarStats } from "@/content/stats";
import { Band, Container } from "@/components/ui/Band";
import { SectionHead } from "@/components/ui/SectionHead";

const stats = [...solarStats, ...australiaStats];

/**
 * Three settings on the accent tint: white cards, each with its name and setting, a statement in the
 * serif, three figures and a link. The commercial and home figures are design intent (the intro says
 * so); the solar figures are cited, each with its source link.
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
              <li key={c.id} className="flex flex-col rounded-card border border-line bg-white p-6 md:p-8">
                <p className="text-small font-medium text-ink">{c.name}</p>
                <p className="mt-1 text-caption text-muted">{c.sub}</p>
                <p className="mt-6 font-display text-[1.5rem] leading-snug text-ink">{c.statement}</p>
                <dl className="mt-auto grid grid-cols-3 gap-4 border-t border-line pt-6">
                  {figures.map((f) => (
                    <div key={f.label}>
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
                        <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="link">
                          {s.source.split(",")[0]}
                        </a>
                        {i < cited.length - 1 ? "; " : "."}
                      </span>
                    ))}
                  </p>
                ) : null}
                <Link href={c.link.href} className="mt-6 inline-flex items-center gap-1 text-small font-medium text-accent hover:underline hover:underline-offset-4">
                  {c.link.label} <span aria-hidden="true">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Band>
  );
}
