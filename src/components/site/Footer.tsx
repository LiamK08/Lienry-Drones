import Link from "next/link";
import { Container } from "@/components/ui/Band";
import { brand, footerColumns } from "@/lib/site";

/**
 * The site footer: a compact sunken band under a hairline, on the same 1,392px rail as the page.
 *
 * From 1280: the tagline (an h2 on the H3 step) in columns 1-5 with the status line pinned to the
 * foot of the row, so both columns end on one line; the three link columns in 7-12, two grid
 * columns each, under muted label heads, 14px links 12px apart. From 1024 to 1279 the split is
 * 1-4 and 5-12, so no link wraps. Then 48, the wordmark on the display step, 32, a rule, 16 and
 * the legal row. Padding 64 top, 32 bottom.
 *
 * Below 1024 it stacks. From 768 the link columns stay open, three across; below 768 they fold
 * into native details groups (56px summaries, 44px links) that work without JavaScript.
 * Padding 48 top, 24 bottom below 768.
 */
export function Footer() {
  return (
    <footer data-tone="sunken" className="page-x border-t border-hairline bg-sunken pb-6 pt-12 text-ink md:pb-8 md:pt-16">
      <Container>
        <div className="grid gap-y-8 md:gap-y-10 lg:grid-cols-12 lg:gap-x-6">
          <div data-col className="flex flex-col gap-4 lg:col-span-4 lg:justify-between xl:col-span-5">
            <h2 className="text-h3">
              Resident cleaning.
              <br />
              Designed in Sydney.
            </h2>
            <p className="text-small text-muted">{brand.status}</p>
          </div>
          <nav data-col aria-label="Footer" className="lg:col-span-8 lg:col-start-5 xl:col-span-6 xl:col-start-7">
            <div className="hidden md:grid md:grid-cols-3 md:gap-x-6">
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <p id={`footer-${col.heading}`} className="label text-muted">
                    {col.heading}
                  </p>
                  <ul aria-labelledby={`footer-${col.heading}`} className="mt-4 space-y-3 text-small">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link className="inline-block underline-offset-4 hover:underline" href={link.href}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="md:hidden">
              {footerColumns.map((col) => (
                <details key={col.heading} className="group border-t border-border-strong/40 last:border-b">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-small [&::-webkit-details-marker]:hidden">
                    {col.heading}
                    <span aria-hidden="true" className="group-open:hidden">
                      +
                    </span>
                    <span aria-hidden="true" className="hidden group-open:inline">
                      −
                    </span>
                  </summary>
                  <ul className="space-y-1 pb-5">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link className="inline-flex min-h-11 items-center text-small text-muted hover:underline" href={link.href}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </nav>
        </div>
        {/* The legal row's rule is the wordmark's bottom border, 32px under it and 16px over the row. */}
        <p aria-hidden="true" className="mt-10 max-w-none border-b border-border-strong/40 pb-8 font-display text-display leading-none md:mt-12">
          {brand.name}
        </p>
        <div className="flex flex-col gap-3 pt-4 text-caption text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 {brand.name}. {brand.location}.
          </p>
          <p>
            In development.{" "}
            <Link href="/privacy" className="ml-4 underline underline-offset-4">
              Privacy
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}
