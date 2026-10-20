"use client";

import { useEffect, useState } from "react";
import type { Action, ImageRef } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";

export type Pillar = { id: string; tab: string; title: string; body: string; link?: Action; image: ImageRef };

/**
 * The parts of the platform as underlined text tabs over one panel: a rounded picture on the left and
 * the part's title, a line and a small pill on the right. Each panel's id is its part id, so a link
 * such as /platform#tether selects that tab and scrolls the band into view.
 */
export function PillarTabs({ id, eyebrow, headline, items }: { id: string; eyebrow: string; headline: string; items: readonly Pillar[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sync = () => {
      const i = items.findIndex((p) => `#${p.id}` === window.location.hash);
      if (i < 0) return;
      setActive(i);
      document.getElementById(`${id}-heading`)?.scrollIntoView({ block: "start" });
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [id, items]);

  return (
    <Band id={id} tone="plaster" labelledBy={`${id}-heading`}>
      <Container>
        <SectionHead id={`${id}-heading`} layout="center" eyebrow={eyebrow} headline={headline} className="scroll-mt-24" />
        <div role="tablist" aria-label={headline} className="no-scrollbar mx-auto mt-10 flex max-w-4xl gap-6 overflow-x-auto border-b border-line md:justify-center">
          {items.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`${id}-tab-${p.id}`}
              aria-selected={i === active}
              aria-controls={p.id}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                const last = items.length - 1;
                const next = e.key === "ArrowRight" ? (i + 1) % items.length : e.key === "ArrowLeft" ? (i + last) % items.length : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
                if (next < 0) return;
                e.preventDefault();
                setActive(next);
                document.getElementById(`${id}-tab-${items[next].id}`)?.focus();
              }}
              className={`-mb-px shrink-0 border-b-2 pb-3 text-small transition-[background-color,border-color,color] duration-200 ${i === active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
            >
              {p.tab}
            </button>
          ))}
        </div>
        {items.map((p, i) => (
          <div key={p.id} id={p.id} role="tabpanel" aria-labelledby={`${id}-tab-${p.id}`} hidden={i !== active} className="mx-auto mt-12 max-w-4xl">
            <div className="grid items-center gap-10 md:grid-cols-[0.8fr_1fr] md:gap-14">
              <Picture id={p.image.id} alt={p.image.alt} position={p.image.position} aspect="1/1" rounded="card" sizes="(min-width: 1024px) 380px, 100vw" />
              <div>
                <h3 className="text-[2rem] leading-tight">{p.title}</h3>
                <p className="mt-4 text-small text-fg-muted">{p.body}</p>
                {p.link ? (
                  <Button href={p.link.href} variant="secondary" size="sm" className="mt-6">
                    {p.link.label}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </Container>
    </Band>
  );
}
