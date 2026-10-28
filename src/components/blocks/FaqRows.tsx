import Link from "next/link";
import type { FaqItem } from "@/components/sections/Faq";

/**
 * The site's one FAQ treatment: each question a white card (the card corners and a 1px hairline edge,
 * so it reads on white and on paper alike, no shadow) with a plus in a round disc that turns to a cross
 * as the row opens (the disc fills). Native `details`, so it works without JavaScript and find-in-page
 * reaches closed answers; where the browser can, the answer's height animates open (globals.css, off
 * under reduced motion). The question is 16px medium; the answer body copy (16/1.6, muted) opens with a
 * line, may list labelled points and close with a line, and ends with its link when it has one.
 */
export function FaqRows({ id, items }: { id: string; items: readonly FaqItem[] }) {
  return (
    <div data-accordion="" className="flex flex-col gap-3">
      {items.map((item) => (
        <details key={item.id} id={`${id}-${item.id}`} className="group rounded-card border border-line bg-white">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-3 pl-5 pr-3 text-body font-medium leading-[1.4] text-ink [&::-webkit-details-marker]:hidden">
            <span className="underline decoration-transparent decoration-1 underline-offset-4 transition-[text-decoration-color] duration-200 group-hover:decoration-current motion-reduce:transition-none">{item.q}</span>
            <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-paper transition-[background-color] duration-200 group-open:bg-tint motion-reduce:transition-none">
              <span className="relative size-3.5 text-ink transition-[rotate] duration-200 ease-instrument group-open:rotate-45 motion-reduce:transition-none">
                <span className="absolute left-0 top-1/2 h-[1.5px] w-3.5 -translate-y-1/2 bg-current" />
                <span className="absolute left-1/2 top-0 h-3.5 w-[1.5px] -translate-x-1/2 bg-current" />
              </span>
            </span>
          </summary>
          <FaqAnswer item={item} className="px-5 pb-5 pr-14 text-body leading-[1.6] text-fg-muted" />
        </details>
      ))}
    </div>
  );
}

/** An answer's parts: the opening line, the labelled points, the closing line and the link, at the 68-character measure (max-w-prose). */
export function FaqAnswer({ item, className = "" }: { item: FaqItem; className?: string }) {
  const link = item.link ? (
    <>
      {" "}
      <Link href={item.link.href} className="link inline-block py-1">
        {item.link.label}
      </Link>
    </>
  ) : null;
  const last = item.after ? "after" : item.points?.length ? "points" : "a";
  return (
    <div className={className}>
      <p className="max-w-prose">
        {item.a}
        {last === "a" ? link : null}
      </p>
      {item.points?.length ? (
        <ul className="mt-3 flex max-w-prose list-disc flex-col gap-1.5 pl-[1.125rem] marker:text-muted">
          {item.points.map((pt) => (
            <li key={pt.label}>
              <strong className="font-medium text-ink">{pt.label}:</strong> {pt.text}
            </li>
          ))}
        </ul>
      ) : null}
      {item.after ? (
        <p className="mt-3 max-w-prose">
          {item.after}
          {link}
        </p>
      ) : last === "points" && link ? (
        <p className="mt-3 max-w-prose">{link}</p>
      ) : null}
    </div>
  );
}
