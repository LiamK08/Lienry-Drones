import Link from "next/link";
import type { FaqItem } from "@/components/sections/Faq";
import { FaqHashOpen } from "@/components/blocks/FaqHashOpen";

// On a full load at a row's address, open that row before first paint, so the answer is open when the
// page scrolls to it and nothing below it moves afterwards. A stray "%" keeps the raw fragment.
const OPEN_FROM_HASH =
  'try{var s=document.currentScript,p=s&&s.parentNode,h=location.hash.slice(1);if(h&&p){try{h=decodeURIComponent(h)}catch(e){}var d=document.getElementById(h);if(d&&d.tagName==="DETAILS"&&p.contains(d))d.open=true}}catch(e){}';

/**
 * The site's one FAQ treatment: hairline rows, no cards. Each question is a display line (PT Serif, 20px,
 * 18 below 768) with a 16px chevron at its right that turns over as the row opens; a hairline runs above
 * the first row and under every row, and darkens to the strong border while its question is hovered.
 * Native `details`, so it works without JavaScript and find-in-page reaches closed answers; where the
 * browser can, the answer's height animates open (globals.css, off under reduced motion). The answer is
 * body copy (16/1.6, muted) at the prose measure: it opens with a line, may list labelled points and close
 * with a line, and ends with its link when it has one. An address that names a row opens it (FaqHashOpen).
 */
export function FaqRows({ id, items }: { id: string; items: readonly FaqItem[] }) {
  return (
    <div data-accordion="">
      <FaqHashOpen />
      {items.map((item, i) => (
        <details
          key={item.id}
          id={`${id}-${item.id}`}
          suppressHydrationWarning
          className={`group border-b border-line transition-[border-color] duration-200 ease-instrument [@media(hover:hover)]:has-[>summary:hover]:border-b-border-strong motion-reduce:transition-none ${i === 0 ? "border-t" : ""}`}
        >
          <summary className="group/q flex cursor-pointer list-none items-center justify-between gap-6 py-[1.375rem] [&::-webkit-details-marker]:hidden">
            <span className="font-display text-[1.125rem] leading-[1.3] tracking-[-0.01em] text-ink underline decoration-transparent decoration-1 underline-offset-4 transition-[text-decoration-color] duration-200 group-hover/q:decoration-current motion-reduce:transition-none md:text-[1.25rem]">
              {item.q}
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="size-4 shrink-0 text-ink transition-[rotate] duration-200 ease-instrument group-open:rotate-180 motion-reduce:transition-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3.5 6 8 10.5 12.5 6" />
            </svg>
          </summary>
          <FaqAnswer item={item} className="pb-6 pr-10 text-body leading-[1.6] text-fg-muted" />
        </details>
      ))}
      {/* Server-rendered only: React never runs a script it renders on the client (FaqHashOpen covers soft
          navigations). */}
      <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: OPEN_FROM_HASH }} />
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
