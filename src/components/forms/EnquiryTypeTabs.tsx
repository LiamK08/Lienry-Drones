"use client";

import { useSearchParams } from "next/navigation";
import { createContext, Suspense, useContext, useMemo, useState, type ReactNode } from "react";
import { enquiryTypes, type EnquiryType } from "@/lib/enquiry-schema";
import { registerPage } from "@/content/register";
import { TextLink } from "@/components/ui/TextLink";

// The enquirer type, shared by the tabs on /register-interest and the form's "I am a" radios, so
// picking Investor in either place shows Investor in both. The URL's ?type= sets it until someone
// picks; a pick is kept only while the URL's type is the one it was made under, so following a
// link to another ?type= on the same page still wins.

type Picked = { type: EnquiryType; url: EnquiryType | null } | null;
type Shared = { picked: Picked; setPicked: (p: Picked) => void };

const PickedContext = createContext<Shared | null>(null);

const isEnquiryType = (v: string | null): v is EnquiryType => (enquiryTypes as readonly string[]).includes(v ?? "");

/** Wrap the tabs and the form in this to tie them together. Without it, each keeps its own pick. */
export function EnquiryTypeProvider({ children }: { children: ReactNode }) {
  const [picked, setPicked] = useState<Picked>(null);
  const value = useMemo(() => ({ picked, setPicked }), [picked]);
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
 * ends, and focus selects. The panels share one grid cell, so the row keeps the tallest panel's
 * height and a change cross-fades instead of jumping; a hidden panel is `invisible`, which also takes
 * it and its link out of the tab order and the accessibility tree.
 */
function TabsView({ type, onSelect }: { type: EnquiryType; onSelect: (t: EnquiryType) => void }) {
  const t = registerPage.types;
  const n = enquiryTypes.length;

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, i: number) {
    const to = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    onSelect(enquiryTypes[to]);
    document.getElementById(tabId(enquiryTypes[to]))?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label={t.label} className="grid grid-cols-2 justify-items-center gap-y-[11px] md:grid-cols-4">
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
              className={`relative inline-flex h-[26px] cursor-pointer items-center px-0.5 text-[0.875rem] font-medium leading-none transition-[background-color,border-color,color] duration-200 ease-instrument motion-reduce:transition-none ${
                on ? "text-fg" : "text-fg-muted hover:text-fg"
              }`}
            >
              {t.items[k].tab}
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 bottom-0 h-0.5 origin-center bg-accent transition-transform duration-300 ease-settle motion-reduce:transition-none ${on ? "scale-x-100" : "scale-x-0"}`}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-4 grid">
        {enquiryTypes.map((k) => {
          const on = k === type;
          return (
            <div
              key={k}
              id={panelId(k)}
              role="tabpanel"
              aria-labelledby={tabId(k)}
              tabIndex={on ? 0 : undefined}
              className={`[grid-area:1/1] text-center transition-[opacity,visibility] duration-200 ease-instrument motion-reduce:transition-none ${on ? "visible opacity-100" : "invisible opacity-0"}`}
            >
              <p className="mx-auto max-w-[36.5rem] font-display text-[1.0625rem] leading-[1.35] text-fg/80">{t.items[k].line}</p>
              <p className="mx-auto mt-3 text-small">
                <TextLink href={t.items[k].link.href} className="inline-block py-1">{t.items[k].link.label}</TextLink>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveTabs() {
  const [type, setType] = useEnquiryType();
  return <TabsView type={type} onSelect={setType} />;
}

const noop = () => {};

/** The enquirer tabs: the four types from enquiryTypes, each with Lienry's own line (content/register). */
export function EnquiryTypeTabs() {
  return (
    <Suspense fallback={<TabsView type="homeowner" onSelect={noop} />}>
      <LiveTabs />
    </Suspense>
  );
}
