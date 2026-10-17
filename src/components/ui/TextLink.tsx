import Link from "next/link";
import type { ReactNode } from "react";

export type TextLinkProps = {
  href: string;
  children: ReactNode;
  /** Opens in a new tab, and says so to assistive tech. */
  external?: boolean;
  /** `.link-list` (the footer, the privacy index): the text colour, underlined at 40% at rest. Default `.link`. */
  list?: boolean;
  className?: string;
};

/**
 * A text link in the surface's colours (`.link` or `.link-list` in globals.css). An in-page `#hash`
 * is a native anchor, so fragment navigation moves focus to its target; a route uses next/link.
 */
export function TextLink({ href, children, external = false, list = false, className = "" }: TextLinkProps) {
  const cls = `${list ? "link-list" : "link"} ${className}`;
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer noopener">
        {children}
        <span className="sr-only">, opens in a new tab</span>
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
