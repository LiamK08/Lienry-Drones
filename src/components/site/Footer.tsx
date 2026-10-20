import Link from "next/link";
import { brand, footer } from "@/lib/site";
import { Mark } from "@/components/ui/Wordmark";

/**
 * The footer: a near-black plate. A tall quiet top, then the logo set large with the tagline in the
 * serif italic under it, four link columns, a hairline and the legal line with the privacy link.
 */
export function Footer() {
  return (
    <footer data-tone="ink" className="on-dark page-x bg-night pb-8 pt-32 text-white md:pt-48">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-4 md:gap-6">
          <Mark className="h-14 w-auto md:h-20" />
          <p aria-hidden="true" className="max-w-none font-display text-[3.5rem] leading-none tracking-[-0.02em] md:text-[6rem]">
            {brand.name.split(" ")[0]}
          </p>
        </div>
        <p className="mt-4 max-w-none font-display text-h3 italic text-white/90">{footer.tagline}</p>
        <nav aria-label="Footer" className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {footer.groups.map((g) => (
            <div key={g.id}>
              <p id={`footer-${g.id}`} className="text-caption text-white/55">
                {g.heading}
              </p>
              <ul aria-labelledby={`footer-${g.id}`} className="mt-3">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-flex min-h-8 items-center text-small text-white/90 transition-[background-color,border-color,color] duration-200 hover:text-white hover:underline hover:underline-offset-4">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-caption text-white/55">{footer.legal}</p>
          <ul className="flex gap-6">
            {footer.legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-caption text-white/55 transition-[background-color,border-color,color] duration-200 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
