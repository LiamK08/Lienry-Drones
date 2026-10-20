import Link from "next/link";
import type { FaqItem } from "@/components/sections/Faq";

/**
 * The questions as white rounded rows with a plus that turns to a minus. Native `details`, so it works
 * without JavaScript and find-in-page reaches closed answers. An answer with a link ends with it.
 */
export function FaqRows({ id, items }: { id: string; items: readonly FaqItem[] }) {
  return (
    <div data-accordion="" className="flex flex-col gap-3">
      {items.map((item) => (
        <details key={item.id} id={`${id}-${item.id}`} className="group rounded-[0.5rem] border border-black/[0.04] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-6 px-4 py-3 text-body leading-[1.3] text-ink [&::-webkit-details-marker]:hidden">
            <span className="group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{item.q}</span>
            <span aria-hidden="true" className="relative size-3.5 shrink-0 text-ink">
              <span className="absolute left-0 top-1/2 h-[1.5px] w-3.5 -translate-y-1/2 bg-current" />
              <span className="absolute left-1/2 top-0 h-3.5 w-[1.5px] -translate-x-1/2 bg-current transition-[rotate] duration-200 group-open:rotate-90 motion-reduce:transition-none" />
            </span>
          </summary>
          <p className="px-4 pb-4 text-small leading-[1.4] text-muted">
            {item.a}
            {item.link ? (
              <>
                {" "}
                <Link href={item.link.href} className="inline-block py-1 text-link underline decoration-1 underline-offset-4 hover:text-link-hover hover:decoration-2">
                  {item.link.label}
                </Link>
              </>
            ) : null}
          </p>
        </details>
      ))}
    </div>
  );
}
