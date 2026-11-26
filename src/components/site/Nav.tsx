"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { featureLink, menus, navAbout } from "@/lib/site";
import { useScrolledPast, useShowsBelowHeader } from "@/lib/hooks";
import { Wordmark } from "@/components/ui/Wordmark";
import { HomeLink } from "@/components/site/HomeLink";
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

/** The logo, as the link home (back to the top on the home page). Hovered or focused, its letters build as in the intro. */
function Logo({ className = "", onClick }: { className?: string; onClick?: () => void }) {
  return (
    <HomeLink aria-label="Lienry Drones home" data-mark-host="" onClick={onClick} className={`flex items-center rounded-hard ${className}`}>
      <Wordmark className="h-7 w-auto" build />
    </HomeLink>
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
 * The open panel's frame: it holds the height of the menu inside and eases it (260ms) when another menu
 * takes its place, so moving between menus reads as one card resizing. The height is set on the node
 * as the content is measured, outside React; the first one lands on a frame with no height yet, so the
 * panel opens at its size without easing. At once under reduced motion.
 */
function PanelFrame({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = frame.current;
    const inside = content.current;
    if (!box || !inside) return;
    const fit = new ResizeObserver(() => {
      box.style.height = `${inside.offsetHeight}px`;
    });
    fit.observe(inside);
    return () => fit.disconnect();
  }, []);
  return (
    <div ref={frame} className="transition-[height] duration-[260ms] ease-settle motion-reduce:transition-none">
      <div ref={content} className="relative">
        {children}
      </div>
    </div>
  );
}

/**
 * One menu's content inside the frame, under the id its button controls. The menu it replaces lifts out
 * of the flow and fades over it (120ms) while it fades in, rising 4px (160ms), so the frame takes the
 * new menu's height from the first frame. A leaving menu gives up its id and takes no pointer.
 */
function PanelBody({ id, reduce, children }: { id: MenuId; reduce: boolean; children: ReactNode }) {
  const present = useIsPresent();
  return (
    <motion.div
      id={present ? `menu-${id}` : undefined}
      aria-hidden={present ? undefined : true}
      className={`p-5 ${present ? "" : "pointer-events-none absolute inset-x-0 top-0"}`}
      initial={reduce ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.16, delay: reduce ? 0 : 0.06, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.12, ease: [0.4, 0, 1, 1] } }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The header: the logo left and the menus centred (Platform, Solutions and Resources open a panel of
 * links on hover or click; About is a plain link). It carries no action pills (the owner's call, 21
 * October): Lienry Desktop sits in Resources, and every page closes on its own Register interest.
 * Over the home film it is clear with white text for as long as the film shows under it, on a scrim of
 * its own that travels with it (.bar-scrim), and turns white as the film leaves; anywhere else it is a
 * soft white veil at the top of the page and, once scrolled, a white bar with a hairline. A link takes a
 * ground on hover and keyboard focus, the one an open menu's button rests on. The logo sits on
 * the bar's own wide rail (87rem: 20px in on phones, 24px from 768, centred past 1440), wider than the
 * content's 75rem rail, as the reference's bar is. An open
 * panel dims the page under it; one panel serves the three menus, resizing between them. Below 1024 the bar holds the logo and the burger, which drops a
 * short white sheet under the bar with the four sections as 56px rows on hairlines (each opens in place on
 * the tint, by height: its groups under their heads, then its panel's feature as a text link) over the dimmed page;
 * a tap outside or Escape closes it. It
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
  const openTimer = useRef<number | undefined>(undefined);
  const ground = useSyncExternalStore(subscribeMain, heroGround, () => CLEAR_TOP[pathname] ?? "");
  // Over film the bar stays clear until the film has left it: while the first band still shows below
  // the bar's foot. (A painted dark ground keeps the 40px rule: the bar wears that ground's top colour.)
  const filmBelow = useShowsBelowHeader("#main [data-tone]", pathname in CLEAR_TOP);
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Focus inside the panel goes back to the button that opened it, or it would be left on nothing.
      const header = headerRef.current;
      if (header?.querySelector("[data-menu-panel]")?.contains(document.activeElement)) header.querySelector<HTMLElement>(`[aria-controls="menu-${menu}"]`)?.focus();
      setMenu(null);
    };
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
    // A group that is closing is still drawn for a moment, but inert: its links are out of the round.
    const focusables = () => Array.from(headerRef.current?.querySelectorAll<HTMLElement>("a[href],button:not([disabled])") ?? []).filter((el) => el.getClientRects().length > 0 && !el.closest("[inert]"));
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

  // The desktop scrim under an open panel, from its opening until it has faded out: meanwhile the bar
  // keeps off the veil, whose backdrop filter would make the header the scrim's containing block.
  const [dimmed, setDimmed] = useState(false);
  if (menu && !dimmed) setDimmed(true);
  const overFilm = ground === "transparent";
  const overHero = pathname in CLEAR_TOP && ground !== "" && (overFilm ? filmBelow : !scrolled) && !open && !menu;
  // Elsewhere, at the top of the page the bar is a soft white veil with no rule; once scrolled, solid.
  const atTop = !scrolled && !open && !menu && !dimmed;
  // A panel the pointer has just opened stays open when its button is then clicked (the click that
  // usually follows the hover, however soon); otherwise a click toggles the panel.
  const hoverOpened = useRef<{ id: MenuId; at: number } | null>(null);
  // With no panel open the pointer rests 80ms on a button before its panel opens, so a pointer crossing
  // the bar opens nothing; with one open, the next opens at once.
  const hoverOpen = (id: MenuId, at = 0) => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(openTimer.current);
    if (menuNow.current !== id) hoverOpened.current = { id, at };
    if (menuNow.current === null) openTimer.current = window.setTimeout(() => setMenu(id), 80);
    else setMenu(id);
  };
  const clickMenu = (id: MenuId, at: number) => {
    const opened = hoverOpened.current;
    hoverOpened.current = null;
    if (opened?.id === id && at - opened.at < 800) setMenu(id);
    else setMenu((v) => (v === id ? null : id));
  };
  const hoverClose = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMenu(null), 160);
  };
  const active = menus.find((m) => m.id === menu);
  // A bar link's ground on hover and keyboard focus, the one an open menu's button rests on: a wash of
  // ink on the white bar. Over the film it is a near-white chip with the label in ink, which holds over
  // whatever passes behind it, the headline included (scripts/contrast-hero.mjs). Only the ground eases:
  // a label that eased its own colour would trail the bar's when the bar changes.
  const barLink = `flex h-8 items-center rounded-[0.5rem] px-3 text-small transition-[background-color] duration-200 ease-instrument motion-reduce:transition-none ${
    overHero ? "hover:bg-white/90 hover:text-ink focus-visible:bg-white/90 focus-visible:text-ink" : "hover:bg-ink/[0.06] focus-visible:bg-ink/[0.06]"
  }`;

  return (
    <header
      ref={headerRef}
      onBlur={(e) => {
        // Keyboard focus that moves on past the header closes a desktop panel behind it.
        if (menu && e.relatedTarget instanceof Node && !e.currentTarget.contains(e.relatedTarget)) setMenu(null);
      }}
      role={open ? "dialog" : undefined}
      aria-modal={open ? true : undefined}
      aria-label={open ? "Menu" : undefined}
      style={overHero ? { backgroundColor: ground } : undefined}
      className={`fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] border-b transition-[background-color,border-color,color] duration-200 ease-instrument motion-reduce:transition-none ${
        overHero ? "on-dark border-transparent text-white" : atTop ? "border-transparent bg-white/70 text-ink backdrop-blur-md" : "border-line bg-white text-ink"
      }`}
    >
      {/* The bar's scrim over the film: the ground the logo and the links are read on, on the bar itself
          so it holds while the film scrolls beneath (no blur: see below). It fades with the bar's switch. */}
      {pathname in CLEAR_TOP ? (
        <div
          aria-hidden="true"
          data-bar-scrim=""
          className={`bar-scrim pointer-events-none absolute inset-x-0 top-0 transition-opacity duration-200 ease-instrument motion-reduce:transition-none ${overHero && overFilm ? "opacity-100" : "opacity-0"}`}
        />
      ) : null}
      {/* From 1024, while a panel is open, the page under the bar dims, so the panel reads as the one layer
          (opacity only: in over 180ms, out over 140ms, at once under reduced motion). No blur: over the
          playing film a backdrop blur halved the frame rate in the software renderer. It exists
          only with a panel open, so the intro and the film are untouched. A press on it closes the panel
          (the document's listener leaves presses inside the header alone); the pointer moving onto it
          leaves the nav, whose hover close still applies. Painted before the nav, so the panel is over it. */}
      <AnimatePresence onExitComplete={() => setDimmed(false)}>
        {active ? (
          <motion.div
            key="dim"
            aria-hidden="true"
            data-menu-scrim=""
            onPointerDown={() => setMenu(null)}
            className="fixed inset-x-0 bottom-0 top-[var(--nav-h)] hidden bg-night/20 lg:block"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: "none", transition: { duration: reduce ? 0 : 0.14, ease: [0.4, 0, 1, 1] } }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          />
        ) : null}
      </AnimatePresence>
      {/* The bar's own rail, wider than the content's: 87rem (--container-wide) inside the page margin, so the
          logo and the menus hold their places while the pages read on the 75rem content rail. */}
      <nav aria-label="Primary" className="relative mx-auto flex h-full max-w-[calc(var(--container-wide)+2*var(--page-margin))] items-center px-(--page-margin)" onMouseLeave={hoverClose}>
        {/* On the home page the logo goes back to the top, so it closes whatever menu is open on its way. */}
        <Logo
          onClick={() => {
            setOpen(false);
            setMenu(null);
          }}
        />
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {menus.map((m) => (
            <li key={m.id} onMouseEnter={(e) => hoverOpen(m.id, e.timeStamp)} onMouseLeave={() => window.clearTimeout(openTimer.current)}>
              <button
                type="button"
                aria-expanded={menu === m.id}
                aria-controls={`menu-${m.id}`}
                onClick={(e) => clickMenu(m.id, e.timeStamp)}
                className={`gap-1.5 ${barLink} ${menu === m.id ? "bg-ink/[0.06]" : ""}`}
              >
                {m.label}
                <Chevron open={menu === m.id} />
              </button>
            </li>
          ))}
          <li onMouseEnter={hoverClose}>
            <Link href={navAbout.href} aria-current={pathname === navAbout.href ? "page" : undefined} className={barLink}>
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

        {/* The desktop panel under the bar: the one floating layer with a shadow, and one shell for the
            three menus. It fades in and out as a whole; between menus it stays, its frame easing to the
            new menu's height while the contents cross-fade (PanelFrame, PanelBody). */}
        <AnimatePresence>
          {active ? (
            <motion.div
              key="panel"
              data-menu-panel=""
              onMouseEnter={() => hoverOpen(active.id)}
              className="absolute left-1/2 top-[calc(var(--nav-h)-0.5rem)] hidden w-[min(62.5rem,calc(100vw-3rem))] -translate-x-1/2 overflow-hidden rounded-panel border border-line bg-white text-ink shadow-[0_24px_60px_-28px_rgb(17_26_34/0.3)] lg:block"
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
              <PanelFrame>
                <AnimatePresence initial={false}>
                  <PanelBody key={active.id} id={active.id} reduce={!!reduce}>
                    <MenuPanel groups={active.groups} feature={active.feature} onPick={() => setMenu(null)} />
                  </PanelBody>
                </AnimatePresence>
              </PanelFrame>
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
              className="absolute inset-x-0 top-[var(--nav-h)] z-40 max-h-[calc(100svh-var(--nav-h))] overflow-y-auto border-b border-line bg-white px-(--page-margin) pb-3 pt-1 text-ink shadow-[0_24px_40px_-24px_rgb(17_26_34/0.25)] lg:hidden"
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Each section a 56px row on a hairline that runs edge to edge. The open one sits on the
                  tint with its groups under their heads, as the desktop panel has them, and ends on the
                  panel's feature as a text link. No pills. A section's body stays in the sheet and opens
                  and closes by height ([data-menu-group] in globals.css); closed it is not drawn, and
                  inert from the moment it starts to close. */}
              <ul>
                {menus.map((m) => {
                  const expanded = sub === m.id;
                  const end = featureLink(m.feature);
                  return (
                    <li key={m.id} className={`-mx-(--page-margin) border-b border-line px-(--page-margin) transition-[background-color] duration-200 motion-reduce:transition-none ${expanded ? "bg-tint" : ""}`}>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={`m-${m.id}`}
                        onClick={() => setSub((v) => (v === m.id ? null : m.id))}
                        className="flex h-14 w-full items-center justify-between text-[1.0625rem] font-medium text-ink"
                      >
                        {m.label}
                        <Chevron open={expanded} />
                      </button>
                      <div id={`m-${m.id}`} data-menu-group="" data-open={expanded ? "" : undefined} inert={!expanded}>
                        <div className="pb-3">
                          {m.groups.map((g) => (
                            <div key={g.heading} className="mt-2 first:mt-0">
                              <p className="py-1 text-caption font-medium text-muted">{g.heading}</p>
                              <ul>
                                {g.links.map((l) => (
                                  <li key={`${l.href}-${l.label}`}>
                                    <Link href={l.href} onClick={() => setOpen(false)} className="flex h-13 items-center gap-3 rounded-[0.625rem] pr-2">
                                      <MenuTile name={l.icon} size="phone" />
                                      <span className="text-[0.9375rem] text-ink">{l.label}</span>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          <Link href={end.href} onClick={() => setOpen(false)} className="group/end mt-2 inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-medium text-accent">
                            {end.label}
                            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 transition-transform duration-200 ease-instrument group-hover/end:translate-x-0.5 motion-reduce:transition-none" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
                <li>
                  <Link href={navAbout.href} onClick={() => setOpen(false)} aria-current={pathname === navAbout.href ? "page" : undefined} className="flex h-14 items-center text-[1.0625rem] font-medium">
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
