"use client";

import { useEffect, useRef, useState } from "react";
import { places } from "@/content/home";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";

export function PlacesCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setActive(items.indexOf(best.target as HTMLElement));
      },
      { root: track, threshold: [0.6, 0.9] },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const scrollTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const el = track.children[i] as HTMLElement | undefined;
    if (el) track.scrollTo({ left: el.offsetLeft - 16, behavior: "smooth" });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") scrollTo(Math.min(places.cards.length - 1, active + 1));
    if (e.key === "ArrowLeft") scrollTo(Math.max(0, active - 1));
  };

  const arrow = "inline-flex h-11 w-11 items-center justify-center rounded-hard border border-ink text-ink transition-colors hover:bg-sunken";

  return (
    <Section id="places" ariaLabelledby="places-heading" tone="sunken" className="overflow-hidden">
      <Container>
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading id="places-heading" eyebrow={places.eyebrow} headline={places.headline} />
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous card" onClick={() => scrollTo(Math.max(0, active - 1))} className={arrow}>
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13.5 8h-10M7.5 3.5 3 8l4.5 4.5" />
              </svg>
            </button>
            <button type="button" aria-label="Next card" onClick={() => scrollTo(Math.min(places.cards.length - 1, active + 1))} className={arrow}>
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 8h10M8.5 3.5 13 8l-4.5 4.5" />
              </svg>
            </button>
          </div>
        </Reveal>
      </Container>
      <div className="mt-10 md:mt-14">
        <ul
          ref={trackRef}
          tabIndex={0}
          onKeyDown={onKey}
          aria-label="Places Lienry works. Use the arrow keys to move between cards."
          className="no-scrollbar mx-[calc(-1*var(--page-margin))] flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-[var(--page-margin)] px-[var(--page-margin)] pb-2 md:gap-6"
          style={{ scrollPaddingLeft: "var(--page-margin)" }}
        >
          {places.cards.map((card, i) => (
            <li key={card.id} className="w-[72vw] shrink-0 snap-start sm:w-[46vw] md:w-[30vw] lg:w-[22rem]" aria-current={i === active ? "true" : undefined}>
              <article className="flex h-full flex-col">
                <Picture id={card.id} alt={`${card.title}: ${card.body}`} aspect="2/3" sizes="(min-width: 1024px) 22rem, (min-width: 768px) 30vw, 72vw" />
                <div className="mt-4 flex flex-1 flex-col">
                  <p className="label text-muted">{card.system}</p>
                  <h3 className="mt-2 text-h3">{card.title}</h3>
                  <p className="mt-2 text-small text-muted">{card.body}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
        <Container className="mt-6 flex items-center gap-2">
          {places.cards.map((c, i) => (
            <button
              key={c.id}
              type="button"
              aria-label={`Go to ${c.title}`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => scrollTo(i)}
              className={`h-0.5 w-8 transition-colors duration-300 ${i === active ? "bg-ink" : "bg-border-strong/50 hover:bg-border-strong"}`}
            />
          ))}
        </Container>
      </div>
    </Section>
  );
}
