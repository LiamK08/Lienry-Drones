"use client";

import { useEffect } from "react";

/** Open the FAQ row (a `details` inside `[data-accordion]`) that a fragment names. */
function openRow(hash: string) {
  let id = hash.replace(/^#/, "");
  if (!id) return;
  try {
    id = decodeURIComponent(id);
  } catch {
    // A stray "%" in the address: keep the raw fragment (row ids are plain slugs).
  }
  const row = document.getElementById(id);
  if (row instanceof HTMLDetailsElement && row.closest("[data-accordion]")) row.open = true;
}

/**
 * Opens the FAQ row an address points at (`/platform#faq-safety`): browsers scroll to a closed `details`
 * but leave it shut, so a link to an answer would land on its question alone. A full load is handled
 * before first paint by FaqRows' inline script; this covers arrival by a soft navigation, hash changes,
 * and a click on a link to a row on this page (which fires no hashchange when the address already holds
 * that fragment). The click is caught before the browser scrolls, so it lands on the open row. Renders
 * nothing.
 */
export function FaqHashOpen() {
  useEffect(() => {
    const onHash = () => openRow(window.location.hash);
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      openRow(url.hash);
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
  return null;
}
