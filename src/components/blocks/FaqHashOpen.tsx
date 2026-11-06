"use client";

import { useEffect } from "react";

/**
 * Opens the FAQ row an address points at (`/platform#faq-safety`): browsers scroll to a closed `details`
 * but leave it shut, so a link to an answer would land on its question alone. Runs on arrival and on
 * every hash change; renders nothing.
 */
export function FaqHashOpen() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const row = document.getElementById(id);
      if (row instanceof HTMLDetailsElement && row.closest("[data-accordion]")) row.open = true;
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return null;
}
