import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Picture } from "@/components/ui/Picture";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealItem, RevealList } from "@/components/ui/Reveal";
import type { Stat } from "@/content/stats";

export function Steps({ id, eyebrow, headline, items, tone = "plaster" }: { id: string; eyebrow: string; headline: string; items: { n: string; title: string; body: string }[]; tone?: "plaster" | "raised" | "sunken" }) {
  return (
    <Section id={id} ariaLabelledby={`${id}-heading`} tone={tone}>
      <Container>
        <Reveal>
          <SectionHeading id={`${id}-heading`} eyebrow={eyebrow} headline={headline} />
        </Reveal>
        <RevealList className="mt-12 grid gap-8 md:mt-16 md:grid-cols-4 md:gap-6">
          {items.map((s) => (
            <RevealItem key={s.n} className="border-t border-hairline pt-5">
              <p className="readout text-[0.75rem] text-glass">{s.n}</p>
              <h3 className="mt-3 font-sans text-h4 font-medium">{s.title}</h3>
              <p className="mt-2 text-small text-muted">{s.body}</p>
            </RevealItem>
          ))}
        </RevealList>
      </Container>
    </Section>
  );
}

export function Tiles({ id, eyebrow, headline, items, tone = "raised", columns = 3 }: { id: string; eyebrow: string; headline: string; items: { title: string; body: string }[]; tone?: "plaster" | "raised" | "sunken" | "dark"; columns?: 3 | 4 }) {
  return (
    <Section id={id} ariaLabelledby={`${id}-heading`} tone={tone} className={tone === "raised" ? "border-y border-hairline" : ""}>
      <Container>
        <Reveal>
          <SectionHeading id={`${id}-heading`} eyebrow={eyebrow} headline={headline} />
        </Reveal>
        <RevealList className={`mt-12 grid gap-6 md:mt-16 ${columns === 4 ? "sm:grid-cols-2 md:grid-cols-4" : "md:grid-cols-3"}`}>
          {items.map((t) => (
            <RevealItem key={t.title} className={`rounded-hard border p-6 ${tone === "dark" ? "border-plaster/25 bg-ink-raised" : "border-hairline bg-raised"}`}>
              <h3 className="font-sans text-h4 font-medium">{t.title}</h3>
              <p className={`mt-2 text-small ${tone === "dark" ? "text-muted-on-dark" : "text-muted"}`}>{t.body}</p>
            </RevealItem>
          ))}
        </RevealList>
      </Container>
    </Section>
  );
}

export function AlternatingRows({ id, rows }: { id: string; rows: { id: string; eyebrow: string; title: string; body: string; imageId: string; readout?: string }[] }) {
  return (
    <Section id={id} aria-label="Parts of the system" padded={false} className="pb-[var(--section-y)]">
      <Container width="rows" className="space-y-20 md:space-y-28">
        {rows.map((row, i) => (
          <Reveal key={row.id} as="article" className="grid items-center gap-8 md:grid-cols-12" >
            <div className={`md:col-span-6 ${i % 2 === 1 ? "md:order-2 md:col-start-7" : ""}`} id={row.id}>
              <Picture id={row.imageId} alt={`${row.eyebrow}: ${row.title}`} aspect="1/1" sizes="(min-width: 768px) 45vw, 100vw" />
            </div>
            <div className={`md:col-span-5 ${i % 2 === 1 ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}>
              <p className="eyebrow">{row.eyebrow}</p>
              <h2 className="mt-3 text-h2">{row.title}</h2>
              <p className="mt-4 max-w-[46ch] text-body text-muted">{row.body}</p>
              {row.readout ? <p className="readout mt-6 border-t border-hairline pt-3 text-[0.6875rem] uppercase tracking-[0.08em] text-muted">{row.readout}</p> : null}
            </div>
          </Reveal>
        ))}
      </Container>
    </Section>
  );
}

export function StatsBlock({ id, headline, intro, stats, tone = "sunken" }: { id: string; headline: string; intro?: string; stats: Stat[]; tone?: "plaster" | "raised" | "sunken" }) {
  return (
    <Section id={id} ariaLabelledby={`${id}-heading`} tone={tone}>
      <Container>
        <Reveal>
          <SectionHeading id={`${id}-heading`} eyebrow="Verified figures" headline={headline} intro={intro} />
        </Reveal>
        <RevealList className={`mt-12 grid gap-10 md:mt-16 ${stats.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {stats.map((s, i) => (
            <RevealItem key={s.id} className="border-t border-border-strong/40 pt-6">
              <p className="numeral text-ink">{s.value}</p>
              <p className="mt-3 max-w-[30ch] text-body">{s.label}</p>
              <p className="mt-3 text-caption text-muted">
                <sup className="readout mr-1">{i + 1}</sup>
                {s.source}.{" "}
                <a href={s.sourceUrl} className="water-link" target="_blank" rel="noreferrer noopener">
                  Source
                </a>
              </p>
            </RevealItem>
          ))}
        </RevealList>
        <p className="mt-10 max-w-prose text-caption text-muted">These figures describe the industry, not Lienry&rsquo;s results. Lienry Drones is pre-launch and has no customer results to report.</p>
      </Container>
    </Section>
  );
}

export function CtaBlock({ id, eyebrow, headline, body, cta, secondary, tone = "dark", imageId }: { id: string; eyebrow: string; headline: string; body: string; cta: { label: string; href: string }; secondary?: { label: string; href: string }; tone?: "dark" | "plaster" | "sunken"; imageId?: string }) {
  const dark = tone === "dark";
  return (
    <Section id={id} ariaLabelledby={`${id}-heading`} tone={tone}>
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-12">
          <Reveal className={imageId ? "md:col-span-6" : "md:col-span-8"}>
            <SectionHeading id={`${id}-heading`} eyebrow={eyebrow} headline={headline} />
            <p className={`mt-5 max-w-prose text-lead ${dark ? "text-muted-on-dark" : "text-muted"}`}>{body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={cta.href} size="lg" onDark={dark}>
                {cta.label}
              </Button>
              {secondary ? (
                <Button href={secondary.href} size="lg" variant="secondary" onDark={dark}>
                  {secondary.label}
                </Button>
              ) : null}
            </div>
          </Reveal>
          {imageId ? (
            <Reveal className="md:col-span-5 md:col-start-8" delay={0.1}>
              <Picture id={imageId} alt="" aspect="4/3" sizes="(min-width: 768px) 40vw, 100vw" />
            </Reveal>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

export function SpecTable({ id, eyebrow, headline, rows }: { id: string; eyebrow: string; headline: string; rows: readonly (readonly [string, string])[] }) {
  return (
    <Section id={id} ariaLabelledby={`${id}-heading`} tone="raised" className="border-y border-hairline">
      <Container>
        <div className="grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <SectionHeading id={`${id}-heading`} eyebrow={eyebrow} headline={headline} />
          </Reveal>
          <Reveal className="md:col-span-7 md:col-start-6" delay={0.08}>
            <dl className="divide-y divide-hairline border-y border-hairline">
              {rows.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-6">
                  <dt className="readout text-[0.75rem] uppercase tracking-[0.08em] text-muted sm:pt-1">{k}</dt>
                  <dd className="text-body sm:col-span-2">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
