import type { FounderEntry } from "@/content/company";

/**
 * The founders on /company, as text: the name (h3), 8, the title, then the bio when there is one.
 * Only `published` entries render, so a founder appears once the owner supplies a name and title,
 * never as a "to come" line. A photograph renders above the name only when the owner supplies a real
 * one; there is never a placeholder box.
 */
export function FounderList({ people }: { people: readonly FounderEntry[] }) {
  const published = people.filter((p) => p.published);
  if (published.length === 0) return null;
  return (
    <ul className={published.length > 1 ? "grid gap-8 md:grid-cols-2 md:gap-6" : "grid gap-8"}>
      {published.map((p) => (
        <li key={p.name} className="border-t border-rule pt-4">
          {p.photo ? (
            <img
              src={p.photo.src}
              alt={p.photo.alt}
              width={p.photo.width}
              height={p.photo.height}
              loading="lazy"
              decoding="async"
              className="mb-4 aspect-[4/5] w-full max-w-64 rounded-hard object-cover"
            />
          ) : null}
          <h3 className="text-h3">{p.name}</h3>
          <p className="mt-2 text-small text-fg-muted">{p.title}</p>
          {p.bio ? <p className="mt-2 text-body text-fg">{p.bio}</p> : null}
        </li>
      ))}
    </ul>
  );
}
