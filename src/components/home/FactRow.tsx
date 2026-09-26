import { designFacts } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";

/**
 * The findings row attached under the film band: three design facts, labelled as design intent,
 * in the slot where a reference site shows customer results. Nothing counts up.
 *
 * From 1024: the label, lead and note in columns 1-4, and the three facts side by side in 5-12,
 * each a hairline, 16, the term, 8, the numeral with its unit on the baseline, 12, the text.
 * Below 1024: the label, lead and note, then one row per fact: the numeral on the left, the term
 * and text stacked on the right and centred on it as a pair.
 */
export function FactRow() {
  return (
    <Band id="by-design" tone="plaster" pad="attached" ariaLabel={designFacts.label}>
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-x-6">
          <div data-col className="lg:col-span-4">
            <p className="label text-muted">{designFacts.label}</p>
            <p className="mt-3 text-lead text-ink">{designFacts.lead}</p>
            <p className="mt-4 text-caption text-muted">{designFacts.note}</p>
          </div>
          <dl data-col className="lg:col-span-8 lg:grid lg:grid-cols-3 lg:gap-x-6">
            {designFacts.items.map((fact) => (
              <div
                key={fact.term}
                className="grid grid-cols-[8rem_minmax(0,1fr)] gap-x-4 border-t border-hairline py-4 last:pb-0 lg:block lg:pb-0"
              >
                <dt className="col-start-2 row-start-1 self-end text-caption text-muted">{fact.term}</dt>
                <dd className="col-start-1 row-span-2 row-start-1 flex items-baseline gap-2 self-center lg:mt-2">
                  <span className="numeral">{fact.value}</span>
                  {fact.unit ? <span className="text-small text-muted">{fact.unit}</span> : null}
                </dd>
                <dd className="col-start-2 row-start-2 mt-1 self-start text-caption text-muted lg:mt-3">{fact.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </Band>
  );
}
