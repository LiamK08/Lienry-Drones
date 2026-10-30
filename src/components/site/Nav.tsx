"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { menus, navAbout } from "@/lib/site";
import { useScrolledPast } from "@/lib/hooks";
import { Mark } from "@/components/ui/Wordmark";
import { MenuPanel } from "@/components/site/MenuPanel";
import { MenuTile } from "@/components/site/MenuTile";

type MenuId = string;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={`size-3 transition-transform duration-200 ease-instrument motion-reduce:transition-none ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4.5 6 7.5l3-3" />
    </svg>
  );
}

/** The logo: the mark and the name, as the link home. Hovered or focused, the mark builds as in the intro. */
function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Lienry Drones home" data-mark-host="" className={`flex items-center gap-2 rounded-hard ${className}`}>
      <Mark className="h-6 w-auto" build />
      <span aria-hidden="true" className="font-display text-[1.375rem] leading-none tracking-[-0.01em]">
        Lienry
      </span>
    </Link>
  );
}

// At the top of a page that opens on a dark hero (today only the home film) the bar joins the hero, in
// white: clear over the film, and over a painted ground in that ground's own top colour, so it is
// seamless and the focus ring is read against a solid colour. On the server the ground comes from the
// address, so only a route whose first band is dark belongs here (the about page's hero is the pale
// tint, so its bar is the white veil from the first paint); in the browser it comes from the page's
// first band (its data-tone and paint), so a hero that changes ground takes the bar with it, and a light
// one sends the bar back to white. A new page replaces <main> (PageTransition keys it by the path),
// which the observer sees before the next paint.
const CLEAR_TOP: Readonly<Record<string, string>> = { "/": "transparent" };
const DARK_TONES = new Set(["film", "ink", "night"]);
function subscribeMain(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.body, { childList: true });
  return () => observer.disconnect();
}
/** The first band's top colour when it is dark ("transparent" over film), or "" when it is light. */
function heroGround(): string {
  const band = document.querySelector("#main [data-tone]");
  const tone = band?.getAttribute("data-tone") ?? "";
  if (!band || !DARK_TONES.has(tone)) return "";
  if (tone === "film") return "transparent";
  const cs = getComputedStyle(band);
  if (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent") return cs.backgroundColor;
  return cs.backgroundImage.match(/(?:rgba?|color)\([^)]*\)/)?.[0] ?? "transparent";
}

/**
 * The header: the logo left and the menus centred (Platform, Solutions and Resources open a panel of
 * links on hover or click; About is a plain link). It carries no action pills (the owner's call, 21
 * October): Lienry Desktop sits in Resources, and every page closes on its own Register interest.
 * Over the home film it is clear with white text; anywhere else it is a soft white veil at the top of
 * the page and, once scrolled, a white bar with a hairline. The logo sits on
 * the page's rail (the Container's left edge: 20px on phones, 24px from 768, centred past 1440). Below
 * 1024 the bar holds the logo and the burger, which drops a short white sheet under the bar with the four
 * sections (each opens its links in place) over the dimmed page; a tap outside or Escape closes it. It
 * sits outside <main>, so it holds still while a new page fades in under it (PageTransition.tsx).
 */
export function Nav() {
  const pathname = usePathname();
  const scrolled = useScrolledPast(40);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuId | null>(null);
  const [sub, setSub] = useState<MenuId | null>(null);
  const reduce = useReducedMotion();
  const panelId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const ground = useSyncExternalStore(subscribeMain, heroGround, () => CLEAR_TOP[pathname] ?? "");
  // A new page closes every menu (a Back press with the phone sheet open included). Adjusted while
  // rendering, as PageTransition marks its <main>, so it lands in the commit that brings the new <main>:
  // the sheet is never left modal over a page it did not make inert.
  const [shownPath, setShownPath] = useState(pathname);
  if (pathname !== shownPath) {
    setShownPath(pathname);
    setOpen(false);
    setMenu(null);
    setSub(null);
  }
  // The open panel as last committed, for the hover handler below.
  const menuNow = useRef<MenuId | null>(null);
  useEffect(() => {
    menuNow.current = menu;
  }, [menu]);

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

  const overHero = pathname in CLEAR_TOP && ground !== "" && !scrolled && !open && !menu;
  // Elsewhere, at the top of the page the bar is a soft white veil with no rule; once scrolled, solid.
  const atTop = !scrolled && !open && !menu;
  // A panel the pointer has just opened stays open when its button is then clicked (the click that
  // usually follows the hover, however soon); otherwise a click toggles the panel.
  const hoverOpened = useRef<{ id: MenuId; at: number } | null>(null);
  const hoverOpen = (id: MenuId, at = 0) => {
    window.clearTimeout(closeTimer.current);
    if (menuNow.current !== id) hoverOpened.current = { id, at };
    setMenu(id);
  };
  const clickMenu = (id: MenuId, at: number) => {
    const opened = hoverOpened.current;
    hoverOpened.current = null;
    if (opened?.id === id && at - opened.at < 800) setMenu(id);
    else setMenu((v) => (v === id ? null : id));
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
      style={overHero ? { backgroundColor: ground } : undefined}
      className={`fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] border-b transition-[background-color,border-color,color] duration-200 ease-instrument motion-reduce:transition-none ${
        overHero ? "on-dark border-transparent text-white" : atTop ? "border-transparent bg-white/70 text-ink backdrop-blur-md" : "border-line bg-white text-ink"
      }`}
    >
      {/* The rail: the Container's 87rem inside the page margin, so the logo starts where the page's content does. */}
      <nav aria-label="Primary" className="relative mx-auto flex h-full max-w-[calc(var(--container-grid)+2*var(--page-margin))] items-center px-(--page-margin)" onMouseLeave={hoverClose}>
        <Logo />
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {menus.map((m) => (
            <li key={m.id} onMouseEnter={(e) => hoverOpen(m.id, e.timeStamp)}>
              <button
                type="button"
                aria-expanded={menu === m.id}
                aria-controls={`menu-${m.id}`}
                onClick={(e) => clickMenu(m.id, e.timeStamp)}
                className={`flex h-8 items-center gap-1.5 rounded-[0.5rem] px-3 text-small transition-[background-color,opacity] duration-200 ${
                  menu === m.id ? (overHero ? "bg-white/15" : "bg-ink/[0.06]") : "hover:opacity-70"
                }`}
              >
                {m.label}
                <Chevron open={menu === m.id} />
              </button>
            </li>
          ))}
          <li onMouseEnter={hoverClose}>
            <Link href={navAbout.href} aria-current={pathname === navAbout.href ? "page" : undefined} className="flex h-8 items-center rounded-pill px-3 text-small transition-opacity duration-200 hover:opacity-70">
              {navAbout.label}
            </Link>
          </li>
        </ul>
        <div className="ml-auto flex items-center lg:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            className="-mr-3 inline-flex h-11 w-11 items-center justify-center rounded-pill lg:hidden"
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

        {/* The desktop panel under the bar, one menu at a time: the one floating layer with a shadow. */}
        <AnimatePresence>
          {active ? (
            <motion.div
              key={active.id}
              id={`menu-${active.id}`}
              onMouseEnter={() => hoverOpen(active.id)}
              className="absolute left-1/2 top-[calc(var(--nav-h)-0.5rem)] hidden w-[min(62.5rem,calc(100vw-3rem))] -translate-x-1/2 rounded-panel border border-line bg-white p-5 text-ink shadow-[0_24px_60px_-28px_rgb(17_26_34/0.3)] lg:block"
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
          <>
            {/* The page stays in view under the sheet, dimmed so it reads as behind the menu; a tap on it closes the menu. */}
            <motion.button
              key="scrim"
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-x-0 bottom-0 top-[var(--nav-h)] z-30 cursor-default bg-night/40 lg:hidden"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            />
            <motion.div
              key="sheet"
              id={panelId}
              className="absolute inset-x-0 top-[var(--nav-h)] z-40 max-h-[calc(100svh-var(--nav-h))] overflow-y-auto border-b border-line bg-white px-(--page-margin) pb-6 pt-2 text-ink shadow-[0_24px_40px_-24px_rgb(17_26_34/0.25)] lg:hidden"
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              <ul>
                {menus.map((m) => {
                  const expanded = sub === m.id;
                  const links = m.groups.flatMap((g) => g.links).filter((l, i, all) => all.findIndex((x) => x.href === l.href) === i);
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={`m-${m.id}`}
                        onClick={() => setSub((v) => (v === m.id ? null : m.id))}
                        className={`flex h-12 w-full items-center justify-between text-[0.9375rem] font-medium transition-[color] duration-200 ${expanded ? "text-muted" : "text-ink"}`}
                      >
                        {m.label}
                        <Chevron open={expanded} />
                      </button>
                      {expanded ? (
                        <ul id={`m-${m.id}`} className="pb-2">
                          {links.map((l) => (
                            <li key={`${l.href}-${l.label}`}>
                              <Link href={l.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-[0.625rem] py-2 pr-2">
                                <MenuTile name={l.icon} size="phone" />
                                <span className="text-small text-ink">{l.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
                <li>
                  <Link href={navAbout.href} onClick={() => setOpen(false)} aria-current={pathname === navAbout.href ? "page" : undefined} className="flex h-12 items-center text-[0.9375rem] font-medium">
                    {navAbout.label}
                  </Link>
                </li>
              </ul>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
