"use client";

import { useEffect, useState } from "react";

/**
 * A legal page's contents: a vertical list on a rule, shown and sticky from 1024 (hidden on phones and
 * tablets, where the sections read straight through). The section in view is marked (aria-current, an
 * accent rule and ink text); above the first heading nothing is marked. Clicking a link uses native
 * fragment navigation, so focus moves to the section's heading.
 */
export function LegalToc({ items }: { items: readonly { id: string; title: string }[] }) {
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
    <nav aria-label="On this page" className="hidden lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:block lg:self-start">
      <ul className="border-l-2 border-border-strong/70">
        {items.map((i) => {
          const on = i.id === current;
          return (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                aria-current={on ? "location" : undefined}
                className={`-ml-0.5 block border-l-2 py-2 pl-5 text-small leading-[1.2] transition-[background-color,border-color,color] duration-200 ${on ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`}
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
