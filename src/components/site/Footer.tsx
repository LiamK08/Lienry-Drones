import Link from "next/link";
import { brand, footerColumns } from "@/lib/site";
import { Wordmark } from "@/components/ui/Wordmark";

export function Footer() {
  return (
    <footer className="on-dark bg-ink text-plaster">
      {/* page-x outside the rail, so the footer starts on the same left edge as every Section. */}
      <div className="page-x py-16 md:py-24">
        <div className="mx-auto max-w-grid">
          <div className="grid gap-12 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-5">
              <Wordmark />
              <p className="mt-6 max-w-[38ch] text-small text-muted-on-dark">
                {brand.description}
              </p>
              <p className="mt-4 text-caption text-muted-on-dark">
                {brand.status}
              </p>
            </div>
            {footerColumns.map((col) => (
              <div
                key={col.heading}
                className="md:col-span-2 md:col-start-auto"
              >
                {/* A label, not a heading: the label style is uppercase and no heading on this site is. */}
                <p
                  id={`foot-${col.heading}`}
                  className="label text-muted-on-dark"
                >
                  {col.heading}
                </p>
                <ul
                  aria-labelledby={`foot-${col.heading}`}
                  className="mt-4 space-y-2.5"
                >
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-small text-plaster/90 transition-opacity hover:opacity-70"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="md:col-span-3">
              <p id="foot-enquire" className="label text-muted-on-dark">
                Enquire
              </p>
              <ul
                aria-labelledby="foot-enquire"
                className="mt-4 space-y-2.5 text-small"
              >
                <li>
                  <Link
                    href="/register-interest"
                    className="text-plaster/90 hover:opacity-70"
                  >
                    Register interest
                  </Link>
                </li>
                <li className="text-muted-on-dark">Sydney, Australia</li>
                <li className="text-muted-on-dark">Contact email to come</li>
              </ul>
            </div>
          </div>
          <div className="mt-16 border-t border-plaster/15 pt-8 md:mt-24">
            <p className="font-display text-display text-plaster/95">
              Lienry Drones
            </p>
            <div className="mt-8 flex flex-col gap-3 text-caption text-muted-on-dark md:flex-row md:items-center md:justify-between">
              <p>© 2026 Lienry Drones. {brand.location}.</p>
              <p>No customers, results or approvals are claimed.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
