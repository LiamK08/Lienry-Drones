import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "tertiary";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-hard font-sans font-medium whitespace-nowrap transition-[background-color,color,border-color] duration-200 ease-instrument select-none";

// sm is the header button: 30px tall with a 13px label, the same relationship to the 13px
// nav links as the reference. md and lg keep a 44px or 48px touch target for page actions.
const sizes: Record<Size, string> = {
  sm: "h-[30px] pl-3.5 pr-3 text-[0.8125rem] leading-none",
  md: "h-11 px-5 text-small",
  lg: "h-12 px-6 text-small",
};

// Primary is always a solid ink fill with white text. Over the hero film a 60% white hairline
// gives the button a 3:1 boundary against the scrimmed frame behind it.
const variants: Record<Variant, { light: string; dark: string }> = {
  primary: {
    light: "bg-ink text-white hover:bg-ink-raised",
    dark: "bg-ink text-white border border-white/60 hover:bg-ink-raised",
  },
  secondary: {
    light: "border border-ink text-ink hover:bg-sunken",
    dark: "border border-white/60 text-white hover:bg-ink-raised",
  },
  tertiary: {
    light: "text-glass hover:text-glass-deep underline decoration-1 underline-offset-[6px] hover:decoration-2 px-0",
    dark: "text-glass-on-dark underline decoration-1 underline-offset-[6px] hover:decoration-2 px-0",
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
  variant?: Variant;
  size?: Size;
  onDark?: boolean;
  /** A small arrow after the label. */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

type LinkProps = CommonProps & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">;
type ButtonProps = CommonProps & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button(props: LinkProps | ButtonProps) {
  const { variant = "primary", size = "md", onDark = false, arrow = false, className = "", children } = props;
  const cls = `${base} ${variant === "tertiary" ? "h-auto" : sizes[size]} ${variants[variant][onDark ? "dark" : "light"]} ${className}`;
  const content = (
    <>
      {children}
      {arrow ? <Arrow /> : null}
    </>
  );
  if ("href" in props && typeof props.href === "string") {
    const { href, variant: _v, size: _s, onDark: _d, arrow: _a, className: _c, children: _ch, ...rest } = props;
    return (
      <Link href={href} className={cls} {...rest}>
        {content}
      </Link>
    );
  }
  const { variant: _v, size: _s, onDark: _d, arrow: _a, className: _c, children: _ch, ...rest } = props as ButtonProps;
  return (
    <button type="button" className={cls} {...rest}>
      {content}
    </button>
  );
}
