import { propertyStrip } from "@/content/home";

const icons: Record<string, React.ReactNode> = {
  tower: <path d="M7 21V5l5-2 5 2v16M10 9h1M13 9h1M10 13h1M13 13h1M10 17h1M13 17h1M4 21h16" />,
  apartments: <path d="M4 21V8l4-2 4 2v13M12 21V11l4-2 4 2v10M7 11h1M7 15h1M15 14h1M15 18h1M2 21h20" />,
  house: <path d="M4 11 12 4l8 7M6 10v11h12V10M10 21v-6h4v6" />,
  key: <path d="M14 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm-4 8-7 7v3h3v-2h2v-2h2l1-1M14 8h.01" />,
  solar: <path d="M3 17 6 7h12l3 10H3ZM9 7l-1 10M15 7l1 10M4.5 12h15M12 19v2M8 21h8" />,
};

export function PropertyStrip() {
  return (
    <section aria-label="Property types Lienry is built for" className="page-x border-y border-hairline bg-plaster">
      <div className="mx-auto flex max-w-grid flex-col gap-4 py-6 md:flex-row md:items-center md:gap-10">
        <p className="eyebrow shrink-0">{propertyStrip.label}</p>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 md:flex md:flex-1 md:justify-between">
          {propertyStrip.items.map((item) => (
            <li key={item.label} className="flex items-center gap-2.5 text-small text-ink">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-glass" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {icons[item.icon]}
              </svg>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
