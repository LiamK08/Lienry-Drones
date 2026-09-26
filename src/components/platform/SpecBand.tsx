import { Band, Container } from "@/components/ui/Band";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

export type SpecBandProps = {
  /** The band's id; the heading is `${id}-heading`. */
  id: string;
  /** Never italic. */
  headline: string;
  intro: string;
  /** Key and value pairs, in reading order: nine make the 3x3 sheet. */
  rows: readonly (readonly [string, string])[];
};

/**
 * The specification sheet: the page's one ink band, with the section head (the intro as its
 * aside), 48, then the rows as a grid of 4-column cells, three across from 1024 and stacked below
 * it. Each cell: a 1px plaster/20 rule, 12, the key as a label in muted-on-dark, 8, the value in
 * text-body plaster. Rows sit 12 apart, so the next row's rule sits 12 under the tallest value.
 */
export function SpecBand({ id, headline, intro, rows }: SpecBandProps) {
  return (
    <Band id={id} tone="ink" labelledBy={`${id}-heading`}>
      <Container>
        <SectionHead id={`${id}-heading`} headline={headline} aside={{ intro }} tone="dark" />
        <Reveal className="mt-[var(--gap-head)]">
          <dl className="grid gap-y-3 lg:grid-cols-3 lg:gap-x-6">
            {rows.map(([key, value]) => (
              <div key={key} className="border-t border-plaster/20 pt-3">
                <dt className="label text-muted-on-dark">{key}</dt>
                <dd className="mt-2 text-body text-plaster">{value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </Band>
  );
}
