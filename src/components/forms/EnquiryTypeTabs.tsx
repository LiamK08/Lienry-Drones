"use client";

import { useSearchParams } from "next/navigation";
import { createContext, Suspense, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { enquiryTypes, type EnquiryType } from "@/lib/enquiry-schema";
import { registerPage } from "@/content/register";
import { TextLink } from "@/components/ui/TextLink";
import { useIndicator } from "@/components/home/useIndicator";

// The enquirer type, shared by the tabs on /register-interest and the form's "I am a" radios, so
// picking Investor in either place shows Investor in both. The URL's ?type= sets it until someone
// picks; a pick is kept only while the URL's type is the one it was made under, so following a
// link to another ?type= on the same page still wins.

type Picked = { type: EnquiryType; url: EnquiryType | null } | null;
type Shared = { picked: Picked; setPicked: (p: Picked) => void; url: EnquiryType | null; setUrl: (u: EnquiryType | null) => void };

const PickedContext = createContext<Shared | null>(null);

const isEnquiryType = (v: string | null): v is EnquiryType => (enquiryTypes as readonly string[]).includes(v ?? "");

/** Wrap the tabs and the form in this to tie them together. Without it, each keeps its own pick. */
export function EnquiryTypeProvider({ children }: { children: ReactNode }) {
  const [picked, setPicked] = useState<Picked>(null);
  const [url, setUrl] = useState<EnquiryType | null>(null);
  const value = useMemo(() => ({ picked, setPicked, url, setUrl }), [picked, url]);
  return <PickedContext.Provider value={value}>{children}</PickedContext.Provider>;
}

/** The current enquirer type and its setter: the shared pick inside a provider, a local one outside. Reads ?type=, so render it under a Suspense boundary. */
export function useEnquiryType(): [EnquiryType, (t: EnquiryType) => void] {
  const raw = useSearchParams().get("type");
  const fromUrl = isEnquiryType(raw) ? raw : null;
  const shared = useContext(PickedContext);
  const [own, setOwn] = useState<Picked>(null);
  const picked = shared ? shared.picked : own;
  const setPicked = shared ? shared.setPicked : setOwn;
  const type = picked && picked.url === fromUrl ? picked.type : (fromUrl ?? "homeowner");
  return [type, (t) => setPicked({ type: t, url: fromUrl })];
}

/**
 * On /register-interest the tab row follows the form in the tab order but, from 1024, sits beside it,
 * above its end, so Tab from the submit scrolls back up to it. The browser stops that scroll at the
 * page's scroll padding, flush under the fixed bar; a keyboard focus that lands closer than 24px to
 * the bar moves the page down by the difference, so the focused tab is never under it (WCAG 2.4.11).
 */
function clearOfBar(el: HTMLElement) {
  if (!el.matches(":focus-visible")) return;
  const bar = document.querySelector("body > header")?.getBoundingClientRect().bottom ?? 56;
  const short = bar + 24 - el.getBoundingClientRect().top;
  if (short > 0) window.scrollBy({ top: -short, behavior: "instant" });
}

const ID = "enquirer";
const tabId = (t: EnquiryType) => `${ID}-tab-${t}`;
const panelId = (t: EnquiryType) => `${ID}-panel-${t}`;

/**
 * The tab row and its panels. Arrow keys move along the row (and wrap), Home and End jump to the
 * ends, and focus selects. The row is one line on a hairline; where it does not fit (phones) it
 * scrolls sideways from the card's edge, its far edge fading out, and a choice is brought into view
 * inside the row (never by scrolling the page). The chosen tab's underline is one indicator that
 * glides to the next choice (useIndicator, 250ms, none under reduced motion); until it has measured,
 * the chosen tab draws its own, so the choice shows from the first paint. The panels share one grid
 * cell, so the row keeps the tallest panel's height and a change cross-fades instead of jumping; a
 * hidden panel is `invisible`, which also takes it and its link out of the tab order and the
 * accessibility tree.
 */
function TabsView({ type, onSelect }: { type: EnquiryType; onSelect: (t: EnquiryType) => void }) {
  const t = registerPage.types;
  const n = enquiryTypes.length;
  const rowRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  useIndicator(rowRef, enquiryTypes.indexOf(type));

  // Bring the chosen tab wholly into the scrolling row, clear of the page margin and the fade.
  useEffect(() => {
    const sc = scrollerRef.current;
    const el = document.getElementById(tabId(type));
    if (!sc || !el || sc.scrollWidth <= sc.clientWidth) return;
    const s = sc.getBoundingClientRect();
    const e = el.getBoundingClientRect();
    const inset = 20;
    const fade = 32;
    const by = e.left < s.left + inset ? e.left - (s.left + inset) : e.right > s.right - fade ? e.right - (s.right - fade) : 0;
    if (!by) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sc.scrollTo({ left: sc.scrollLeft + by, behavior: reduce ? "auto" : "smooth" });
  }, [type]);

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, i: number) {
    const to = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    onSelect(enquiryTypes[to]);
    document.getElementById(tabId(enquiryTypes[to]))?.focus();
  }

  // data-sweep="form": the tabs choose the form's fields, so the band's height follows them (check 3).
  // The scroller clips what overflows it, so it keeps 4px round the row (taken back from its margins)
  // for the tabs' focus ring; the hairline is drawn at the row's foot, under the gliding underline, and
  // spans what it did before (the card's edges on phones, the column from 768).
  return (
    <div data-sweep="form">
      <div
        ref={scrollerRef}
        className="no-scrollbar -mx-5 -my-1 overflow-x-auto bg-[linear-gradient(var(--color-line),var(--color-line))] bg-[position:0_calc(100%-0.25rem)] bg-[size:100%_1px] bg-no-repeat px-5 py-1 max-md:[mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] md:-mx-1 md:bg-[position:0.25rem_calc(100%-0.25rem)] md:bg-[size:calc(100%-0.5rem)_1px] md:px-1"
      >
        <div ref={rowRef} role="tablist" aria-label={t.label} className="group/ind relative flex w-max gap-6">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-(--iw) translate-x-(--ix) bg-accent opacity-0 group-data-[indicator-ready]/ind:opacity-100 group-data-[indicator-ready]/ind:transition-[translate,width] group-data-[indicator-ready]/ind:duration-[250ms] group-data-[indicator-ready]/ind:ease-instrument motion-reduce:transition-none! forced-colors:forced-color-adjust-none forced-colors:bg-[Highlight]"
          />
          {enquiryTypes.map((k, i) => {
            const on = k === type;
            return (
              <button
                key={k}
                id={tabId(k)}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={panelId(k)}
                tabIndex={on ? 0 : -1}
                data-indicator-item=""
                onClick={() => onSelect(k)}
                onKeyDown={(e) => onKeyDown(e, i)}
                onFocus={(e) => clearOfBar(e.currentTarget)}
                className={`relative inline-flex h-11 shrink-0 cursor-pointer items-center whitespace-nowrap text-small font-medium transition-[color] duration-200 ease-instrument motion-reduce:transition-none ${
                  on ? "text-fg" : "text-fg-muted hover:text-fg"
                }`}
              >
                {t.items[k].tab}
                {/* The chosen tab's own underline, until the gliding one has measured. */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-0 h-0.5 bg-accent forced-colors:forced-color-adjust-none forced-colors:bg-[Highlight] ${on ? "group-data-[indicator-ready]/ind:invisible" : "invisible"}`}
                />
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-5 grid">
        {enquiryTypes.map((k) => {
          const on = k === type;
          return (
            <div
              key={k}
              id={panelId(k)}
              role="tabpanel"
              aria-labelledby={tabId(k)}
              tabIndex={on ? 0 : undefined}
              className={`[grid-area:1/1] transition-[opacity,visibility] duration-200 ease-instrument motion-reduce:transition-none ${on ? "visible opacity-100" : "invisible opacity-0"}`}
            >
              <p className="max-w-[34rem] text-body leading-[1.6] text-fg-muted">{t.items[k].line}</p>
              <p className="mt-1 text-small">
                <TextLink href={t.items[k].link.href} className="inline-flex min-h-11 items-center">{t.items[k].link.label}</TextLink>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Reports the URL's ?type= after hydration. It alone sits under Suspense, so the tabs never remount. */
function UrlType({ onType }: { onType: (t: EnquiryType | null) => void }) {
  const raw = useSearchParams().get("type");
  useEffect(() => onType(isEnquiryType(raw) ? raw : null), [raw, onType]);
  return null;
}

/**
 * The enquirer tabs: the four types from enquiryTypes, each with Lienry's own line (content/register).
 * The server render (homeowner) stays in place through hydration; ?type= then selects its tab, so the
 * panel text is painted once, with the page, rather than swapped in when the script arrives.
 */
export function EnquiryTypeTabs() {
  const shared = useContext(PickedContext);
  const [ownUrl, setOwnUrl] = useState<EnquiryType | null>(null);
  const [ownPicked, setOwnPicked] = useState<Picked>(null);
  const url = shared ? shared.url : ownUrl;
  const setUrl = shared ? shared.setUrl : setOwnUrl;
  const picked = shared ? shared.picked : ownPicked;
  const setPicked = shared ? shared.setPicked : setOwnPicked;
  const type = picked && picked.url === url ? picked.type : (url ?? "homeowner");
  return (
    <>
      <Suspense fallback={null}>
        <UrlType onType={setUrl} />
      </Suspense>
      <TabsView type={type} onSelect={(t) => setPicked({ type: t, url })} />
    </>
  );
}
