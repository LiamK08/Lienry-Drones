"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Page transitions: moving to another page of the site brings the new page in with a fade, rising 8px,
 * over 220ms (globals.css "Page transitions"), so a click reads as one product moving rather than a
 * reload. The header and footer sit outside <main>, so the header holds perfectly still.
 *
 * <main> is keyed by the path, so each page arrives in a fresh <main> and its entrance plays once. Only a
 * navigation inside the site marks it: the first page of a visit (a hard load, and with it the home
 * intro) renders unmarked, and an in-page anchor or a new query keeps the path, so neither animates.
 * Nothing waits on it: the new page is in the DOM, laid out and taking input from the first frame (an
 * opacity and transform animation moves nothing in the layout). None under reduced motion.
 *
 * Why not the View Transitions API (React's <ViewTransition>): it holds the new page back until the old
 * one is captured, a frame or two on a fast machine but 330 to 540ms on the checks' headless runs (against
 * 20 to 35ms without it), which fails check 45's tap and would make a slow phone feel slower.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The page this visit opened on, until the first navigation inside the site; adjusted while rendering
  // (React's pattern for state that follows a prop), so the new <main> is marked in the same commit.
  const [shown, setShown] = useState(pathname);
  const [moved, setMoved] = useState(false);
  if (pathname !== shown) {
    setShown(pathname);
    setMoved(true);
  }
  return (
    <main id="main" key={pathname} data-page-enter={moved ? "" : undefined}>
      {children}
    </main>
  );
}
