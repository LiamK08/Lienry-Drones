import { Container } from "@/components/ui/Band";
import { TextLink } from "@/components/ui/TextLink";
import { brand, footer } from "@/lib/site";

/**
 * The site footer: an ink band, so every page (which ends on plaster) closes on a change of tone.
 *
 * From 1024 on the 12-column rail: the statement (an h2 at the H2 step) and the status line in
 * columns 1-4, and the four link groups in 5-12, each 212px wide at 1440, under lowercase eyebrows.
 * Below 768 the groups form an open two-by-two grid (no disclosures), four across from 768. Every
 * link is a 44px row. Then the wordmark at the display step, 32, a rule, 24 and the legal line.
 * The top padding is the section padding (`--section-y`).
 */
export function Footer() {
  return (
    <footer data-tone="ink" className="on-dark page-x bg-ink pb-6 pt-(--section-y) text-plaster md:pb-8">
      <Container>
        <div className="lg:grid-12">
          <div className="lg:col-span-4">
            <h2 className="text-h2">
              {footer.statement[0]}
              <br />
              {footer.statement[1]}
            </h2>
            <p className="mt-6 text-small text-fg-muted">{brand.status}</p>
          </div>
          <nav aria-label="Footer" className="mt-10 grid grid-cols-2 gap-x-(--gutter) gap-y-10 md:grid-cols-4 lg:col-span-8 lg:col-start-5 lg:mt-0">
            {footer.groups.map((g) => (
              <div key={g.id}>
                <p id={`footer-${g.id}`} className="eyebrow">
                  {g.heading}
                </p>
                <ul aria-labelledby={`footer-${g.id}`} className="mt-4">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <TextLink href={l.href} list className="inline-flex min-h-11 items-center text-body">
                        {l.label}
                      </TextLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <p aria-hidden="true" className="mt-20 max-w-none font-display text-display leading-none lg:mt-32">
          {brand.name}
        </p>
        <div className="mt-8 border-t border-rule pt-6">
          <p className="text-caption text-fg-muted">{footer.legal}</p>
        </div>
      </Container>
    </footer>
  );
}
