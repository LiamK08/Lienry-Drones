import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "tertiary";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-button font-sans font-medium whitespace-nowrap transition-[background-color,color,border-color] duration-200 ease-instrument select-none";

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-6 text-base",
};

const variants: Record<Variant, { light: string; dark: string }> = {
  primary: {
    light: "bg-glass text-plaster shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-glass-deep",
    dark: "bg-glass-on-dark text-ink hover:bg-[#a4dfe8]",
  },
  secondary: {
    light: "border border-border-strong text-ink hover:bg-raised",
    dark: "border border-[rgba(243,239,231,0.32)] text-plaster hover:bg-ink-raised",
  },
  tertiary: {
    light: "text-glass hover:text-glass-deep underline decoration-1 underline-offset-[6px] hover:decoration-2 px-0",
    dark: "text-glass-on-dark underline decoration-1 underline-offset-[6px] hover:decoration-2 px-0",
  },
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  onDark?: boolean;
  className?: string;
  children: ReactNode;
};

type LinkProps = CommonProps & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">;
type ButtonProps = CommonProps & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button(props: LinkProps | ButtonProps) {
  const { variant = "primary", size = "md", onDark = false, className = "", children } = props;
  const cls = `${base} ${variant === "tertiary" ? "h-auto" : sizes[size]} ${variants[variant][onDark ? "dark" : "light"]} ${className}`;
  if ("href" in props && typeof props.href === "string") {
    const { href, variant: _v, size: _s, onDark: _d, className: _c, children: _ch, ...rest } = props;
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  const { variant: _v, size: _s, onDark: _d, className: _c, children: _ch, ...rest } = props as ButtonProps;
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

export function ArrowRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 8h10M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
