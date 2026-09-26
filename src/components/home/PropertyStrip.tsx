import Link from "next/link";
import { propertyStrip } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";

/**
 * The quiet row under the hero, in the slot where both references put their customer logos: the
 * property types Lienry is built for, each a link to its system's page. From 1024 it is one 72px
 * row (14px padding around 44px targets): the label in columns 1-2 and the five links spread across
 * columns 3-12. Below 1024 the label sits over a grid of 44px links, where the longest name takes
 * the whole first row so no name wraps and no cell is left empty.
 */
export function PropertyStrip() {
  return (
    <Band tone="plaster" pad="none" ariaLabel="Property types Lienry is built for" className="py-4 lg:py-3.5">
      <Container className="grid gap-3 lg:grid-cols-12 lg:items-center lg:gap-x-6">
        <p className="label text-muted lg:col-span-2">{propertyStrip.label}</p>
        <ul className="grid grid-cols-2 gap-x-4 md:grid-cols-3 md:gap-x-6 lg:col-span-10 lg:flex lg:justify-between">
          {propertyStrip.items.map((item) => (
            <li key={item.label} className="max-lg:first:col-span-2">
              <Link
                href={item.href}
                className="inline-flex min-h-11 items-center text-body text-ink decoration-1 underline-offset-4 hover:underline focus-visible:underline"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Band>
  );
}
