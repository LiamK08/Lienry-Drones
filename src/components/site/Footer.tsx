import Link from "next/link";
import { brand, footerColumns } from "@/lib/site";

export function Footer() {
  return (
    <footer className="page-x border-t border-hairline bg-sunken text-ink">
      <div className="mx-auto max-w-grid pb-8 pt-16 md:pt-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="max-w-[24ch] font-display text-h3">Resident cleaning.<br />Designed in Sydney.</p>
            <p className="mt-5 max-w-[34ch] text-small text-muted">{brand.status}</p>
          </div>
          {footerColumns.map(col => (
            <div key={col.heading} className="hidden md:col-span-2 md:block">
              <p id={`footer-${col.heading}`} className="label text-muted">{col.heading}</p>
              <ul aria-labelledby={`footer-${col.heading}`} className="mt-5 space-y-3">
                {col.links.map(link => <li key={link.href}><Link className="text-small hover:underline underline-offset-4" href={link.href}>{link.label}</Link></li>)}
              </ul>
            </div>
          ))}
          <div className="md:hidden">
            {footerColumns.map(col => <details key={col.heading} className="group border-t border-border-strong/40 last:border-b">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-small [&::-webkit-details-marker]:hidden">{col.heading}<span aria-hidden="true" className="group-open:hidden">+</span><span aria-hidden="true" className="hidden group-open:inline">−</span></summary>
              <ul className="space-y-1 pb-5">{col.links.map(link => <li key={link.href}><Link className="inline-flex min-h-11 items-center text-small text-muted hover:underline" href={link.href}>{link.label}</Link></li>)}</ul>
            </details>)}
          </div>
        </div>
        <p className="my-12 max-w-none font-display text-[clamp(4rem,12vw,11rem)] leading-none tracking-[-0.04em] md:mb-16 md:mt-24">Lienry Drones</p>
        <div className="flex flex-col gap-3 border-t border-border-strong/40 pt-6 text-caption text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Lienry Drones. Sydney, Australia.</p>
          <p>In development. <Link href="/privacy" className="ml-4 underline underline-offset-4">Privacy</Link></p>
        </div>
      </div>
    </footer>
  );
}
