import { propertyStrip } from "@/content/home";

export function PropertyStrip() {
  return (
    <section aria-label="Property types Lienry is built for" className="page-x border-y border-hairline bg-plaster">
      <div className="mx-auto flex max-w-grid flex-col gap-4 py-6 md:flex-row md:items-center md:gap-10">
        <p className="eyebrow shrink-0">{propertyStrip.label}</p>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 md:flex md:flex-1 md:justify-between">
          {propertyStrip.items.map((item) => (
            <li key={item.label} className="text-small text-ink">
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
