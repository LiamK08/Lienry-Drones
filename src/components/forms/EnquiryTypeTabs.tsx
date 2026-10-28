"use client";

import { useSearchParams } from "next/navigation";
import { createContext, Suspense, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { enquiryTypes, type EnquiryType } from "@/lib/enquiry-schema";
import { registerPage } from "@/content/register";
import { TextLink } from "@/components/ui/TextLink";

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

const ID = "enquirer";
const tabId = (t: EnquiryType) => `${ID}-tab-${t}`;
const panelId = (t: EnquiryType) => `${ID}-panel-${t}`;

/**
 * The tab row and its panels. Arrow keys move along the row (and wrap), Home and End jump to the
 * ends, and focus selects. The row is one line on a hairline that scrolls sideways where it does not
 * fit (phones), its far edge fading out. Each tab draws its own underline, so the chosen one shows
 * from the first paint; on a change the new underline glides over from the old one (250ms, none under
 * reduced motion). The panels share one grid cell, so the row keeps the tallest panel's height and a
 * change cross-fades instead of jumping; a hidden panel is `invisible`, which also takes it and its
 * link out of the tab order and the accessibility tree.
 */
function TabsView({ type, onSelect }: { type: EnquiryType; onSelect: (t: EnquiryType) => void }) {
  const t = registerPage.types;
  const n = enquiryTypes.length;
  const rowRef = useRef<HTMLDivElement>(null);
  const last = useRef<{ type: EnquiryType; left: number; width: number } | null>(null);

  // The glide: the new underline starts where the old one was drawn and eases into its own place.
  useLayoutEffect(() => {
    const line = rowRef.current?.querySelector<HTMLElement>(`#${tabId(type)} [data-underline]`);
    if (!line) return;
    const r = line.getBoundingClientRect();
    const prev = last.current;
    last.current = { type, left: r.left, width: r.width };
    if (!prev || prev.type === type || !r.width || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    line.animate([{ transform: `translateX(${prev.left - r.left}px) scaleX(${prev.width / r.width})` }, { transform: "none" }], { duration: 250, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
  }, [type]);

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, i: number) {
    const to = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    onSelect(enquiryTypes[to]);
    document.getElementById(tabId(enquiryTypes[to]))?.focus();
  }

  // data-sweep="form": the tabs choose the form's fields, so the band's height follows them (check 3).
  return (
    <div data-sweep="form">
      <div
        ref={rowRef}
        role="tablist"
        aria-label={t.label}
        className="no-scrollbar -mx-5 flex gap-6 overflow-x-auto px-5 shadow-[inset_0_-1px_0_var(--color-line)] max-md:[mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] md:mx-0 md:px-0"
      >
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
              onClick={() => onSelect(k)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`relative inline-flex h-11 shrink-0 cursor-pointer items-center whitespace-nowrap text-small font-medium transition-[color] duration-200 ease-instrument motion-reduce:transition-none ${
                on ? "text-fg" : "text-fg-muted hover:text-fg"
              }`}
            >
              {t.items[k].tab}
              <span
                aria-hidden="true"
                data-underline=""
                className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent forced-colors:forced-color-adjust-none forced-colors:bg-[Highlight] ${on ? "" : "invisible"}`}
              />
            </button>
          );
        })}
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
              <p className="mt-3 text-small">
                <TextLink href={t.items[k].link.href} className="inline-block py-1">{t.items[k].link.label}</TextLink>
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
