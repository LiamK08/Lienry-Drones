import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "tertiary";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-hard font-sans font-medium whitespace-nowrap transition-[background-color,color,border-color] duration-200 ease-instrument select-none";

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-6 text-base",
};

// Primary is always a solid ink fill with plaster text. On dark surfaces a plaster
// hairline gives the button a 3:1 boundary against the surface behind it.
const variants: Record<Variant, { light: string; dark: string }> = {
  primary: {
    light: "bg-ink text-plaster hover:bg-ink-raised",
    dark: "bg-ink text-plaster border border-plaster/50 hover:bg-ink-raised",
  },
  secondary: {
    light: "border border-ink text-ink hover:bg-sunken",
    dark: "border border-plaster/50 text-plaster hover:bg-ink-raised",
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
