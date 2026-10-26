import Link from "next/link";
import type { FaqItem } from "@/components/sections/Faq";

/**
 * The questions as white rounded rows, each with a plus in a round disc that turns to a cross as the
 * row opens (the disc fills). Native `details`, so it works without JavaScript and find-in-page reaches
 * closed answers; where the browser can, the answer's height animates open (globals.css, off under
 * reduced motion). An answer opens with a line, may list labelled points and close with a line, and
 * ends with its link when it has one.
 */
export function FaqRows({ id, items }: { id: string; items: readonly FaqItem[] }) {
  return (
    <div data-accordion="" className="flex flex-col gap-3">
      {items.map((item) => (
        <details key={item.id} id={`${id}-${item.id}`} className="group rounded-[0.75rem] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.07)]">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-6 py-2 pl-4 pr-2 text-body leading-[1.3] text-ink [&::-webkit-details-marker]:hidden">
            <span className="group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{item.q}</span>
            <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-pill transition-[background-color] duration-300 group-open:bg-paper motion-reduce:transition-none">
              <span className="relative size-4 text-ink transition-[rotate,color] duration-300 ease-instrument group-open:rotate-45 group-open:text-muted motion-reduce:transition-none">
                <span className="absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 bg-current" />
                <span className="absolute left-1/2 top-0 h-4 w-[1.5px] -translate-x-1/2 bg-current" />
              </span>
            </span>
          </summary>
          <FaqAnswer item={item} className="px-4 pb-4 pr-6 text-small leading-[1.45] text-ink/85" />
        </details>
      ))}
    </div>
  );
}

/** An answer's parts: the opening line, the labelled points, the closing line and the link, at a wider measure than body copy. */
export function FaqAnswer({ item, className = "" }: { item: FaqItem; className?: string }) {
  const link = item.link ? (
    <>
      {" "}
      <Link href={item.link.href} className="inline-block py-1 text-link underline decoration-1 underline-offset-4 hover:text-link-hover hover:decoration-2">
        {item.link.label}
      </Link>
    </>
  ) : null;
  const last = item.after ? "after" : item.points?.length ? "points" : "a";
  return (
    <div className={className}>
      <p className="max-w-[62ch]">
        {item.a}
        {last === "a" ? link : null}
      </p>
      {item.points?.length ? (
        <ul className="mt-2 flex max-w-[62ch] list-disc flex-col gap-1 pl-[1.125rem] marker:text-muted">
          {item.points.map((pt) => (
            <li key={pt.label}>
              <strong className="font-medium text-ink">{pt.label}:</strong> {pt.text}
            </li>
          ))}
        </ul>
      ) : null}
      {item.after ? (
        <p className="mt-2 max-w-[62ch]">
          {item.after}
          {link}
        </p>
      ) : last === "points" && link ? (
        <p className="mt-2 max-w-[62ch]">{link}</p>
      ) : null}
    </div>
  );
}
