/** Lowercase, one to three words: "how it works", "pre-launch", "we’re". Check 10 uses the same pattern. */
const EYEBROW = /^[a-z0-9]+(?:[ '’&-][a-z0-9]+){0,2}$/;

/**
 * The line above a section heading (`.eyebrow`: Inter 14px, weight 500, the surface's muted colour).
 * The heading that follows it gets its 16px from `.eyebrow + :is(h1, h2)`. It is a paragraph, never a
 * heading, and never uppercase.
 */
export function Eyebrow({ children, id }: { children: string; id?: string }) {
  if (process.env.NODE_ENV !== "production" && !EYEBROW.test(children)) throw new Error(`Eyebrow "${children}": lowercase, 1 to 3 words`);
  return (
    <p id={id} className="eyebrow">
      {children}
    </p>
  );
}
