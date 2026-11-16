"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

/**
 * The logo's link home, in the header and the footer. From any other page it goes home, at the top. On
 * the home page itself it goes back to the top: smoothly, or at once under reduced motion, dropping any
 * #anchor from the address. A click with a modifier key or another button stays the browser's own.
 */
export function HomeLink({ onClick, ...props }: Omit<ComponentProps<typeof Link>, "href">) {
  const pathname = usePathname();
  function click(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (pathname !== "/" || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (window.location.hash) window.history.replaceState(window.history.state, "", "/");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
  }
  return <Link href="/" onClick={click} {...props} />;
}
