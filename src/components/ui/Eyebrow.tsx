/**
 * The line above a section heading (`.eyebrow`: an accent dot, then 12px Inter capitals). The heading
 * that follows it gets its 16px from `.eyebrow + :is(h1, h2)`. It is a paragraph, never a heading.
 * Write it in sentence case; the class sets the capitals.
 */
export function Eyebrow({ children, id, className = "" }: { children: string; id?: string; className?: string }) {
  return (
    <p id={id} className={`eyebrow ${className}`}>
      {children}
    </p>
  );
}
