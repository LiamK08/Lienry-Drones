"use client";

import { useEffect } from "react";

// On a full load at a row's address, open that row before first paint (so the answer is open when the
// page scrolls to it, and nothing below it moves afterwards) and mark it, so the mount below leaves a row
// the visitor has closed since then alone. A stray "%" keeps the raw fragment.
const OPEN_FROM_HASH =
  'try{var s=document.currentScript,p=s&&s.parentNode,h=location.hash.slice(1);if(h&&p){try{h=decodeURIComponent(h)}catch(e){}var d=document.getElementById(h);if(d&&d.tagName==="DETAILS"&&p.contains(d)){d.open=true;d.setAttribute("data-hash-open","")}}}catch(e){}';

/** The FAQ row (a `details` inside `[data-accordion]`) that a fragment names, if any. */
function rowFor(hash: string): HTMLDetailsElement | null {
  let id = hash.replace(/^#/, "");
  if (!id) return null;
  try {
    id = decodeURIComponent(id);
  } catch {
    // A stray "%" in the address: keep the raw fragment (row ids are plain slugs).
  }
  const row = document.getElementById(id);
  return row instanceof HTMLDetailsElement && row.closest("[data-accordion]") ? row : null;
}

/**
 * Opens the FAQ row an address points at (`/platform#faq-safety`): browsers scroll to a closed `details`
 * but leave it shut, so a link to an answer would land on its question alone. Rendered after the rows,
 * inside the accordion. A full load is handled before first paint by its inline script (React never runs
 * a script it renders on the client, so there it is inert text/plain). The effect covers arrival by a soft
 * navigation, hash changes, and a click on a link to a row on this page (which fires no hashchange when
 * the address already holds that fragment); the click is caught before the browser scrolls, so it lands
 * on the open row.
 */
export function FaqHashOpen() {
  useEffect(() => {
    const open = (hash: string) => {
      const row = rowFor(hash);
      if (row) row.open = true;
    };
    const arrived = rowFor(window.location.hash);
    if (arrived?.hasAttribute("data-hash-open")) arrived.removeAttribute("data-hash-open");
    else if (arrived) arrived.open = true;
    const onHash = () => open(window.location.hash);
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      open(url.hash);
    };
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
  return <script type={typeof window === "undefined" ? "text/javascript" : "text/plain"} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: OPEN_FROM_HASH }} />;
}
