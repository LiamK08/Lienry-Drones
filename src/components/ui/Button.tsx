import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "inverse";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-hard font-sans font-medium whitespace-nowrap transition-[background-color,color,border-color] duration-200 ease-instrument select-none";

// sm is the header button: 30px tall with a 13px label, the same relationship to the 13px
// nav links as the reference. md and lg keep a 44px or 48px touch target for page actions.
const sizes: Record<Size, string> = {
  sm: "h-[30px] pl-3.5 pr-3 text-caption leading-none",
  md: "h-11 px-5 text-small",
  lg: "h-12 px-6 text-small",
};

// Tertiary ignores size: it is a text link with a 44px target, so every standalone link can be hit.
const tertiary = "h-auto min-h-11 px-0 text-small underline decoration-1 underline-offset-[6px] hover:decoration-2";

// Three surfaces: light (plaster, raised, sunken), dark (over film, or on an ink band) and accent
// (the glass-deep closing panel).
//
// Primary is always a solid ink fill with white text. Over the hero film it carries a white
// hairline so its edge holds 3:1 against the scrimmed frame. The alpha is 75%, not 60%: the fill
// paints under the border (background-clip is border-box), so the hairline composites over ink
// rather than over the frame. 60% renders rgb(164,163,162) and measures 2.39:1 against the
// brightest possible backdrop; 75% renders rgb(198,198,197) and measures 3.51:1.
//
// Inverse is the primary on ink and on glass-deep: a plaster fill with an ink label (15.1:1), and
// plaster measures 6.24:1 against glass-deep. It is only used on those two surfaces.
//
// Tertiary on glass-deep is white (7.16:1); glass-on-dark would measure only 4.31:1 there.
const variants: Record<Variant, { light: string; dark: string; accent: string }> = {
  primary: {
    light: "bg-ink text-white hover:bg-ink-raised",
    dark: "bg-ink text-white border border-white/75 hover:bg-ink-raised",
    accent: "bg-ink text-white border border-white/75 hover:bg-ink-raised",
  },
  inverse: {
    light: "bg-plaster text-ink hover:bg-raised",
    dark: "bg-plaster text-ink hover:bg-raised",
    accent: "bg-plaster text-ink hover:bg-raised",
  },
  secondary: {
    light: "border border-ink text-ink hover:bg-sunken",
    dark: "border border-white/60 text-white hover:bg-ink-raised",
    accent: "border border-white/60 text-white hover:bg-ink-raised",
  },
  tertiary: {
    light: `${tertiary} text-glass hover:text-glass-deep`,
    dark: `${tertiary} text-glass-on-dark`,
    accent: `${tertiary} text-white`,
  },
};

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
    </svg>
  );
}

type CommonProps = {
  /** Default "primary". Each band has one primary. */
  variant?: Variant;
  /** Default "md". sm is the header only; tertiary ignores it. */
  size?: Size;
  /** Over film or on an ink band. */
  onDark?: boolean;
  /** On the glass-deep closing panel (CtaPanel). */
  onAccent?: boolean;
  /** A small arrow after the label. */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

type LinkProps = CommonProps & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">;
type ButtonProps = CommonProps & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button(props: LinkProps | ButtonProps) {
  const { variant = "primary", size = "md", onDark = false, onAccent = false, arrow = false, className = "", children } = props;
  const surface = onAccent ? "accent" : onDark ? "dark" : "light";
  const cls = `${base} ${variant === "tertiary" ? "" : sizes[size]} ${variants[variant][surface]} ${className}`;
  const content = (
    <>
      {children}
      {arrow ? <Arrow /> : null}
    </>
  );
  if ("href" in props && typeof props.href === "string") {
    const { href, variant: _v, size: _s, onDark: _d, onAccent: _o, arrow: _a, className: _c, children: _ch, ...rest } = props;
    return (
      <Link href={href} className={cls} {...rest}>
        {content}
      </Link>
    );
  }
  const { variant: _v, size: _s, onDark: _d, onAccent: _o, arrow: _a, className: _c, children: _ch, ...rest } = props as ButtonProps;
  return (
    <button type="button" className={cls} {...rest}>
      {content}
    </button>
  );
}
