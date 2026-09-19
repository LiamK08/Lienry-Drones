"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { nav } from "@/lib/site";
import { useScrolledPast } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";
import { Mark } from "@/components/ui/Wordmark";

/**
 * The header: nav links pinned hard left, the mark centred as the link home, one action hard
 * right. A 72px bar, 13px links in 30px boxes, a 30px button. The full bar needs 1024px: below
 * that the absolutely centred mark would run into the left links, so phones and tablets get the
 * burger. Over the home hero it is transparent
 * and reads white on the hero's own scrim; past 80px it becomes a solid plaster bar with a
 * hairline and ink text. Phones get the mark centred, a hamburger on the right and a full screen menu.
 */
export function Nav() {
  const pathname = usePathname();
  const scrolled = useScrolledPast(80);
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

  const overHero = pathname === "/" && !scrolled;
  const dark = overHero && !open;
  const solid = scrolled && !open;

  return (
    <header
      className={`nav-bar fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] border-b ${
        solid ? "border-hairline bg-plaster" : open ? "border-transparent bg-plaster" : "border-transparent bg-transparent"
      } ${dark ? "on-dark text-white" : "text-ink"}`}
    >
      <nav aria-label="Primary" className="relative flex h-full items-center px-[15px] md:px-6">
        <ul className="-ml-[10px] hidden items-center lg:flex xl:-ml-[15px]">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-[30px] items-center px-[10px] text-[0.8125rem] leading-none transition-opacity duration-200 after:absolute after:inset-x-[10px] after:bottom-[4px] after:h-px after:bg-current after:transition-opacity after:duration-200 hover:after:opacity-60 xl:px-[15px] xl:after:inset-x-[15px] ${
                    active ? "after:opacity-100" : "after:opacity-0"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link href="/" aria-label="Lienry Drones home" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-hard">
          <Mark className="h-7 w-auto" animate />
        </Link>
        <div className="ml-auto flex items-center">
          <div className="hidden lg:block">
            <Button href="/register-interest" size="sm" onDark={dark} arrow>
              Register interest
            </Button>
          </div>
          <button
            type="button"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-hard lg:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M3 8h18M3 16h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            className="fixed inset-x-0 top-[var(--nav-h)] bottom-0 z-40 flex flex-col overflow-y-auto bg-plaster px-[15px] text-ink md:px-6 lg:hidden"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            <ul className="border-t border-hairline">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href} className="border-b border-hairline">
                    <Link href={item.href} onClick={() => setOpen(false)} className="flex items-center justify-between py-4 font-display text-h3" aria-current={active ? "page" : undefined}>
                      <span className={active ? "underline decoration-1 underline-offset-[6px]" : undefined}>{item.label}</span>
                      <svg viewBox="0 0 16 16" className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
                      </svg>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-auto flex flex-col gap-4 pb-8 pt-10">
              <Button href="/register-interest" size="lg" arrow onClick={() => setOpen(false)}>
                Register interest
              </Button>
              <Button href="/register-interest?type=investor" variant="secondary" size="lg" onClick={() => setOpen(false)}>
                Investor enquiries
              </Button>
              <p className="label mt-2 text-muted">Concept stage. Sydney, Australia.</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
