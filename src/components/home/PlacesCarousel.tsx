"use client";

import { useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { places } from "@/content/home";
import { Container, Section } from "@/components/ui/Section";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";

export function PlacesCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const [position, setPosition] = useState({ start: true, end: false });
  const move = (direction: number) => {
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return;
    track.scrollBy({ left: direction * (first.offsetWidth + 24), behavior: reduce ? "instant" : "smooth" });
  };
  return (
    <Section id="places" ariaLabelledby="places-heading" tone="sunken">
      <Container>
        <Reveal className="flex items-end justify-between gap-6">
          <h2 id="places-heading" className="max-w-[18ch] text-h2">{places.headline}</h2>
          <div className="flex shrink-0 gap-2">
            {[-1, 1].map(direction => <button key={direction} type="button" aria-label={direction < 0 ? "Previous property" : "Next property"} disabled={direction < 0 ? position.start : position.end} onClick={() => move(direction)} className="flex h-11 w-11 items-center justify-center rounded-hard border border-border-strong text-ink hover:bg-plaster disabled:opacity-40 disabled:cursor-default"><span aria-hidden="true">{direction < 0 ? "←" : "→"}</span></button>)}
          </div>
        </Reveal>
        <ul ref={trackRef} tabIndex={0} aria-label="Property types. Use left and right arrow keys to browse." onKeyDown={e => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); move(e.key === "ArrowLeft" ? -1 : 1); } }} onScroll={() => { const t = trackRef.current; if (t) setPosition({ start: t.scrollLeft < 2, end: t.scrollLeft + t.clientWidth >= t.scrollWidth - 2 }); }} className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 md:mt-16">
          {places.cards.map(card => <li key={card.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-3rem)/3)]">
            <Picture id={card.id} alt={`${card.title}: ${card.body}`} aspect="4/5" sizes="(min-width: 1024px) 32vw, (min-width: 640px) 46vw, 82vw" />
            <div className="mt-5 border-t border-border-strong/40 pt-5">
              <p className="text-caption text-muted">{card.system}</p>
              <h3 className="mt-2 text-h3">{card.title}</h3>
              <p className="mt-3 max-w-[34ch] text-small text-muted">{card.body}</p>
            </div>
          </li>)}
        </ul>
      </Container>
    </Section>
  );
}
