import Link from "next/link";
import { brand, footerColumns } from "@/lib/site";
import { Wordmark } from "@/components/ui/Wordmark";

export function Footer() {
  return (
    <footer className="on-dark bg-ink text-plaster">
      <div className="page-x mx-auto max-w-grid py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Wordmark />
            <p className="mt-6 max-w-[38ch] text-small text-muted-on-dark">{brand.description}</p>
            <p className="mt-4 readout text-[0.75rem] uppercase tracking-[0.08em] text-muted-on-dark">{brand.status}</p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.heading} className="md:col-span-2 md:col-start-auto">
              <h2 className="font-sans text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-muted-on-dark">{col.heading}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-small text-plaster/90 transition-opacity hover:opacity-70">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="md:col-span-3">
            <h2 className="font-sans text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-muted-on-dark">Enquire</h2>
            <ul className="mt-4 space-y-2.5 text-small">
              <li>
                <Link href="/register-interest" className="text-plaster/90 hover:opacity-70">
                  Register interest
                </Link>
              </li>
              <li className="text-muted-on-dark">Sydney, Australia</li>
              <li className="text-muted-on-dark">Contact email to come</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 border-t border-plaster/15 pt-8 md:mt-24">
          <p className="font-display text-[clamp(3rem,8vw,7.5rem)] leading-none tracking-[-0.02em] text-plaster/95">Lienry Drones</p>
          <div className="mt-8 flex flex-col gap-3 text-caption text-muted-on-dark md:flex-row md:items-center md:justify-between">
            <p>© 2026 Lienry Drones. {brand.location}.</p>
            <p>Concept renders are labelled. No customers, results or approvals are claimed.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
