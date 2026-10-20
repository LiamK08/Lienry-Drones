"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { menus, navAbout, navUtility } from "@/lib/site";
import { useScrolledPast } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";
import { Mark } from "@/components/ui/Wordmark";
import { MenuPanel } from "@/components/site/MenuPanel";

type MenuId = string;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={`size-3 transition-transform duration-200 ease-instrument motion-reduce:transition-none ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4.5 6 7.5l3-3" />
    </svg>
  );
}

/** The logo: the mark and the name, as the link home. */
function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Lienry Drones home" className={`flex items-center gap-2 rounded-hard ${className}`}>
      <Mark className="h-6 w-auto" />
      <span aria-hidden="true" className="font-display text-[1.375rem] leading-none tracking-[-0.01em]">
        Lienry
      </span>
    </Link>
  );
}

/**
 * The header: the logo left, the menus centred (Platform, Solutions and Resources open a panel of
 * links on hover or click; About is a plain link), and on the right a white Download pill beside the
 * Register interest pill. Over the home film it is transparent with white text; anywhere else, or
 * once scrolled, it is a white bar with a hairline. Below 1024 a burger opens a full-screen menu.
 */
export function Nav() {
  const pathname = usePathname();
  const scrolled = useScrolledPast(40);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuId | null>(null);
  const reduce = useReducedMotion();
  const panelId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  // Close a desktop panel on Escape or a click outside the header.
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    const onDown = (e: PointerEvent) => !headerRef.current?.contains(e.target as Node) && setMenu(null);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [menu]);

  // The phone menu: Escape closes it, Tab stays inside, and the page behind is inert and still.
  useEffect(() => {
    if (!open) return;
    const focusables = () => Array.from(headerRef.current?.querySelectorAll<HTMLElement>("a[href],button:not([disabled])") ?? []).filter((el) => el.getClientRects().length > 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
      if (e.key === "Tab") {
        const items = focusables();
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const behind = [document.getElementById("main"), document.querySelector("footer"), document.querySelector('a[href="#main"]')].filter(Boolean) as HTMLElement[];
    behind.forEach((el) => el.setAttribute("inert", ""));
    const wide = window.matchMedia("(min-width: 64rem)");
    const onWide = () => wide.matches && setOpen(false);
    onWide();
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      behind.forEach((el) => el.removeAttribute("inert"));
      root.style.overflow = prevOverflow;
    };
  }, [open]);

  const overHero = pathname === "/" && !scrolled && !open && !menu;
  const hoverOpen = (id: MenuId) => {
    window.clearTimeout(closeTimer.current);
    setMenu(id);
  };
  const hoverClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMenu(null), 160);
  };
  const active = menus.find((m) => m.id === menu);

  return (
    <header
      ref={headerRef}
      role={open ? "dialog" : undefined}
      aria-modal={open ? true : undefined}
      aria-label={open ? "Menu" : undefined}
      className={`fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] border-b transition-[background-color,border-color,color] duration-200 ease-instrument motion-reduce:transition-none ${
        overHero ? "on-dark border-transparent bg-transparent text-white" : "border-line bg-white text-ink"
      }`}
    >
      <nav aria-label="Primary" className="relative mx-auto flex h-full max-w-grid items-center px-4 md:px-6" onMouseLeave={hoverClose}>
        <Logo />
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {menus.map((m) => (
            <li key={m.id} onMouseEnter={() => hoverOpen(m.id)}>
              <button
                type="button"
                aria-expanded={menu === m.id}
                aria-controls={`menu-${m.id}`}
                onClick={() => setMenu((v) => (v === m.id ? null : m.id))}
                className={`flex h-9 items-center gap-1.5 rounded-[0.5rem] px-3 text-small transition-[background-color,opacity] duration-200 ${
                  menu === m.id ? (overHero ? "bg-white/15" : "bg-ink/[0.06]") : "hover:opacity-70"
                }`}
              >
                {m.label}
                <Chevron open={menu === m.id} />
              </button>
            </li>
          ))}
          <li onMouseEnter={hoverClose}>
            <Link href={navAbout.href} aria-current={pathname === navAbout.href ? "page" : undefined} className="flex h-9 items-center rounded-pill px-3 text-small transition-opacity duration-200 hover:opacity-70">
              {navAbout.label}
            </Link>
          </li>
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <Button href={navUtility.href} variant="secondary" size="sm">
              {navUtility.label}
            </Button>
            <Button href="/register-interest" size="sm">
              Register interest
            </Button>
          </div>
          <button
            ref={menuButtonRef}
            type="button"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-pill lg:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /> : <path d="M3 8h18M3 16h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
            </svg>
          </button>
        </div>

        {/* The desktop panel under the bar, one menu at a time. */}
        <AnimatePresence>
          {active ? (
            <motion.div
              key={active.id}
              id={`menu-${active.id}`}
              onMouseEnter={() => hoverOpen(active.id)}
              className="absolute left-1/2 top-[calc(var(--nav-h)-0.5rem)] hidden w-[min(62.5rem,calc(100vw-3rem))] -translate-x-1/2 rounded-[0.75rem] border border-line bg-white p-5 text-ink shadow-[0_24px_60px_-28px_rgb(0_0_0/0.3)] lg:block"
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
              <MenuPanel groups={active.groups} feature={active.feature} onPick={() => setMenu(null)} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            className="fixed inset-x-0 bottom-0 top-[var(--nav-h)] z-40 flex flex-col overflow-y-auto bg-white px-4 pb-8 text-ink md:px-6 lg:hidden"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
          >
            {menus.map((m) => (
              <div key={m.id} className="border-b border-line py-6">
                <p className="eyebrow">{m.label}</p>
                <ul className="mt-3">
                  {m.groups.flatMap((g) => g.links).filter((l, i, all) => all.findIndex((x) => x.href === l.href) === i).map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center text-body">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <Link href={navAbout.href} onClick={() => setOpen(false)} className="flex min-h-14 items-center border-b border-line text-body">
              {navAbout.label}
            </Link>
            <div className="mt-8 flex flex-col gap-3">
              <Button href="/register-interest" size="lg" arrow onClick={() => setOpen(false)}>
                Register interest
              </Button>
              <Button href={navUtility.href} variant="secondary" size="lg" onClick={() => setOpen(false)}>
                {navUtility.label}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
