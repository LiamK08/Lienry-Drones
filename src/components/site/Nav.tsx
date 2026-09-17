"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { nav } from "@/lib/site";
import { useScrollBits } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";

export function Nav() {
  const pathname = usePathname();
  const bits = useScrollBits();
  const scrolled = (bits & 1) === 1;
  const overHero = pathname === "/" && (bits & 2) === 2;
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const dark = overHero && !open;
  const surface = scrolled && !overHero ? "bg-raised/85 backdrop-blur-md border-b border-hairline" : "bg-transparent border-b border-transparent";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${surface} ${dark ? "text-plaster on-dark" : "text-ink"}`}>
      <nav aria-label="Primary" className="page-x mx-auto flex h-[var(--nav-h)] max-w-grid items-center justify-between gap-6">
        <Link href="/" className="rounded-sm" aria-label="Lienry Drones home">
          <Wordmark />
        </Link>
        <ul className="hidden items-center gap-7 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-[0.9375rem] font-medium transition-opacity hover:opacity-100 ${active ? "opacity-100 underline decoration-1 underline-offset-[8px]" : "opacity-75"}`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <Button href="/register-interest" onDark={dark}>
              Register interest
            </Button>
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-button md:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            className="page-x fixed inset-x-0 top-[var(--nav-h)] bottom-0 z-40 flex flex-col bg-plaster text-ink md:hidden"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            <ul className="mt-6 flex flex-col divide-y divide-hairline border-y border-hairline">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => setOpen(false)} className="block py-4 font-display text-h3" aria-current={pathname === item.href ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3">
              <Button href="/register-interest" size="lg" onClick={() => setOpen(false)}>
                Register interest
              </Button>
              <Button href="/register-interest?type=investor" variant="secondary" size="lg" onClick={() => setOpen(false)}>
                Investor enquiries
              </Button>
            </div>
            <p className="mt-auto mb-8 text-caption text-muted">Concept stage. Sydney, Australia.</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
