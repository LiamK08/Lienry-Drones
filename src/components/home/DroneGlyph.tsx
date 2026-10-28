/**
 * The quadcopter from above that the intro flies and the step stage's wash puck carries: four rotors
 * on crossed arms around the body. Decorative; it takes the colour of its text.
 */
export function DroneGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-7 -7 14 14" aria-hidden="true" className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        <path d="M-4 -4 4 4M-4 4 4 -4" />
        <circle cx="-4" cy="-4" r="2.4" />
        <circle cx="4" cy="-4" r="2.4" />
        <circle cx="-4" cy="4" r="2.4" />
        <circle cx="4" cy="4" r="2.4" />
      </g>
      <rect x="-1.6" y="-1.6" width="3.2" height="3.2" fill="currentColor" />
    </svg>
  );
}
