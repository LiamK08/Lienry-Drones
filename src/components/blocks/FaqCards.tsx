import Link from "next/link";
import type { FaqItem } from "@/components/sections/Faq";

/**
 * The questions as open cards in one column: a serif heading, then a paper card per question with
 * its answer always shown (no toggle, no reveal). An answer with a link ends with it. The band and
 * the column width belong to the page (/fit-check sets them).
 */
export function FaqCards({ id, headline, items, className = "" }: { id: string; headline: string; items: readonly FaqItem[]; className?: string }) {
  return (
    <div className={className}>
      <h2 id={`${id}-heading`} className="text-[1.875rem] leading-[1.1] tracking-[-0.02em] text-ink md:text-[2rem]">
        {headline}
      </h2>
      <ul className="mt-8 flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.id} id={`${id}-${item.id}`} className="rounded-card bg-paper p-6 shadow-[0_0_0_1px_rgb(0_0_0/0.03),0_0_8px_rgb(0_0_0/0.04)]">
            <h3 className="text-[1.25rem] leading-[1.2] tracking-[-0.01em] text-ink">{item.q}</h3>
            <p className="mt-3 max-w-none text-body leading-[1.3] text-ink [font-feature-settings:'cv11']">
              {item.a}
              {item.link ? (
                <>
                  {" "}
                  <Link href={item.link.href} className="link inline-block py-1">
                    {item.link.label}
                  </Link>
                </>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
