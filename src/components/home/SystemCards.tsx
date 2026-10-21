import Link from "next/link";
import { systems } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";
import { SectionHead } from "@/components/ui/SectionHead";
import { Icon } from "@/components/blocks/Icon";

/**
 * The three settings on the accent tint, kept short: a centred head, then three compact white cards,
 * each one link to its solution page. A card holds the setting's icon, its name and one line, with a
 * round arrow that fills with the accent on hover while the card lifts 2px.
 */
export function SystemCards() {
  return (
    <Band id="systems" tone="tint" pad="compact" labelledBy="systems-heading">
      <Container>
        <SectionHead id="systems-heading" layout="center" size="h2s" headline={systems.headline} intro={systems.intro} />
        <ul className="mx-auto mt-10 grid max-w-[75rem] gap-4 md:grid-cols-3 lg:gap-5">
          {systems.cards.map((c) => (
            <li key={c.id}>
              <Link
                href={c.href}
                className="group flex h-full flex-col rounded-card bg-white p-6 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_10px_28px_-16px_rgb(0_0_0/0.14)] transition-[box-shadow,translate] duration-300 ease-instrument hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgb(0_0_0/0.04),0_18px_36px_-16px_rgb(0_0_0/0.2)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span className="flex items-center justify-between">
                  <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-[0.625rem] bg-tint text-accent">
                    <Icon name={c.icon} className="size-5" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex size-8 items-center justify-center rounded-pill border border-line text-ink transition-[background-color,border-color,color] duration-300 ease-instrument group-hover:border-accent group-hover:bg-accent group-hover:text-white motion-reduce:transition-none"
                  >
                    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
                    </svg>
                  </span>
                </span>
                <span className="mt-5 text-[1.125rem] font-semibold leading-tight tracking-[-0.02em] text-ink">{c.name}</span>
                <span className="mt-2 text-small leading-[1.45] text-muted">{c.line}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Band>
  );
}
