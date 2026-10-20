"use client";

import { benefits } from "@/content/home";
import { Icon } from "@/components/blocks/Icon";
import { Band, Container } from "@/components/ui/Band";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";

/**
 * Why Lienry: five tall cards in a row, 4px apart. From 1024 the card under the pointer (or holding
 * focus) widens to about four times the others over 350ms and shows its two-line description; the row
 * keeps its height. Below 1024 the row is a swipe track of single cards with every description shown.
 */
export function ExpandCards() {
  return (
    <Band id="why" tone="plaster" labelledBy="benefits-heading">
      <Container>
        <SectionHead id="benefits-heading" layout="center" eyebrow={benefits.eyebrow} headline={benefits.headline} intro={benefits.intro} />
      </Container>
      <ul
        tabIndex={0}
        aria-label={benefits.headline}
        // Home and End move the phone track to its ends (a focused scroller only scrolls vertically on them).
        onKeyDown={(e) => {
          if (e.key !== "Home" && e.key !== "End") return;
          e.preventDefault();
          e.currentTarget.scrollTo({ left: e.key === "End" ? e.currentTarget.scrollWidth : 0 });
        }}
        className="no-scrollbar -mx-(--page-margin) mt-(--head-gap) flex snap-x snap-mandatory gap-2 overflow-x-auto px-(--page-margin) lg:mx-auto lg:max-w-grid lg:gap-1 lg:overflow-visible lg:px-0">
        {benefits.cards.map((c) => (
          <li
            key={c.title}
            tabIndex={0}
            aria-labelledby={`why-${c.icon}`}
            aria-describedby={`why-${c.icon}-body`}
            className="group relative h-[28rem] w-[80%] shrink-0 snap-start overflow-hidden rounded-card outline-offset-2 sm:w-[46%] lg:h-[31.25rem] lg:w-auto lg:min-w-0 lg:flex-1 lg:transition-[flex-grow] lg:duration-[350ms] lg:ease-settle lg:hover:grow-[4] lg:focus-visible:grow-[4] motion-reduce:transition-none"
          >
            <Picture id={c.image.id} alt={c.image.alt} position={c.image.position} fit="fill" rounded="none" sizes="(min-width: 1024px) 60vw, 80vw" className="absolute inset-0" />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,17,16,0.8)_0%,rgba(18,17,16,0.15)_45%,rgba(18,17,16,0.25)_100%)]" />
            <span className="absolute left-5 top-5 text-white">
              <Icon name={c.icon} />
            </span>
            <div className="absolute inset-x-5 bottom-5 text-white">
              <h3 id={`why-${c.icon}`} className="text-[1.75rem] leading-[1.1] lg:whitespace-nowrap">
                {c.title}
              </h3>
              <p
                id={`why-${c.icon}-body`}
                className="mt-2 max-w-md text-small text-white/85 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:transition-[opacity,max-height] lg:duration-300 lg:group-hover:max-h-20 lg:group-hover:opacity-100 lg:group-focus-visible:max-h-20 lg:group-focus-visible:opacity-100"
              >
                {c.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Band>
  );
}
