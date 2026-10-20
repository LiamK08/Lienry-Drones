/** A quiet centred row under a hero: a small caption, then words set in the serif, muted. */
export function WordStrip({ label, items }: { label: string; items: readonly string[] }) {
  return (
    <section aria-label={label} data-band="for" data-tone="plaster" className="page-x bg-plaster pb-16">
      <div className="mx-auto max-w-5xl border-b border-line pb-16 text-center">
        <p className="mx-auto max-w-none text-label uppercase tracking-[0.08em] text-muted">{label}</p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {items.map((w) => (
            <li key={w} className="font-display text-[1.5rem] text-ink/45">
              {w}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
