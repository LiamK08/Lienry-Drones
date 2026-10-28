"use client";

import { useEffect, useState } from "react";

/**
 * A legal page's contents: "On this page" over a vertical list on a hairline, shown and sticky from 1024
 * (hidden on phones and tablets, where the sections read straight through). The section in view is
 * marked (aria-current, an accent rule and ink text); above the first heading nothing is marked.
 * Clicking a link uses native fragment navigation, so focus moves to the section's heading. `className`
 * places it on its page's grid.
 */
export function LegalToc({ items, className = "" }: { items: readonly { id: string; title: string }[]; className?: string }) {
  const [current, setCurrent] = useState<string | undefined>(undefined);

  useEffect(() => {
    const targets = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const first = targets[0];
    // The marking zone runs from 20% to 40% of the viewport (the observer's root margins below).
    const aboveFirst = () => !!first && first.getBoundingClientRect().top > window.innerHeight * 0.4;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setCurrent(top.target.id);
        else if (aboveFirst()) setCurrent(undefined);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    // A jump back to the top (Home, a fragment link) can skip the observer, so the scroll also resets.
    const onScroll = () => {
      if (aboveFirst()) setCurrent(undefined);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  return (
    <nav aria-labelledby="toc-heading" className={`hidden lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:block lg:self-start ${className}`}>
      <p id="toc-heading" className="text-small font-medium leading-[1.5] text-fg">
        On this page
      </p>
      <ul className="mt-4 border-l border-line">
        {items.map((i) => {
          const on = i.id === current;
          return (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                aria-current={on ? "location" : undefined}
                className={`-ml-px block border-l-2 py-1.5 pl-4 text-small leading-[1.5] transition-[border-color,color] duration-200 motion-reduce:transition-none ${on ? "border-accent text-fg" : "border-transparent text-fg-muted hover:text-fg"}`}
              >
                {i.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
