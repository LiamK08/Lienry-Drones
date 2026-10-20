"use client";

import { useEffect, useState } from "react";

/**
 * A legal page's contents: a vertical list on a hairline rule, sticky from 1024. The section in view
 * is marked (aria-current and a dark accent rule); clicking a link uses native fragment navigation, so
 * focus moves to the section's heading.
 */
export function LegalToc({ items }: { items: readonly { id: string; title: string }[] }) {
  const [current, setCurrent] = useState(items[0]?.id);

  useEffect(() => {
    const targets = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setCurrent(top.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
      <ul className="border-l border-line">
        {items.map((i) => {
          const on = i.id === current;
          return (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                aria-current={on ? "location" : undefined}
                className={`-ml-px flex min-h-9 items-center border-l-2 py-1 pl-4 text-small transition-[border-color,color] duration-200 ${on ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`}
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
