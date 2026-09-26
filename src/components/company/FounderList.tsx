import type { FounderEntry } from "@/content/pages";

/**
 * The founders on /company, as text: the name (h3), 4, the title, 8, the bio. Only `published`
 * entries render, so a founder appears once the owner supplies a name and title, never as a
 * "to come" line. A photograph renders above the name only when the owner supplies a real one;
 * there is never a placeholder box. A real photograph is not a render, so it carries no Concept
 * render caption.
 */
export function FounderList({ people }: { people: readonly FounderEntry[] }) {
  const published = people.filter((p) => p.published);
  if (published.length === 0) return null;
  return (
    <ul className={published.length > 1 ? "grid gap-8 sm:grid-cols-2 sm:gap-6" : "grid gap-8"}>
      {published.map((p) => (
        <li key={p.name}>
          {p.photo ? (
            <img
              src={p.photo.src}
              alt={p.photo.alt}
              width={p.photo.width}
              height={p.photo.height}
              loading="lazy"
              decoding="async"
              className="mb-4 aspect-[4/5] w-full max-w-[16rem] rounded-hard bg-sunken object-cover"
            />
          ) : null}
          <h3 className="text-h3">{p.name}</h3>
          <p className="mt-1 text-small text-muted">{p.title}</p>
          <p className="mt-2 text-body">{p.bio}</p>
        </li>
      ))}
    </ul>
  );
}
