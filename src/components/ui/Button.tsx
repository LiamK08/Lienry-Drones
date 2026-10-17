import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "tertiary";
export type ButtonSize = "md" | "lg" | "sm";

// The one state system (docs spec B6). Every colour is a role token, so a button takes its look from
// the surface it sits on: on plaster the primary is an ink fill with a white label (17.36:1) that
// hovers to ink-hover (11.60:1, a 1.50:1 step); on ink it is a plaster fill with an ink label that
// hovers to plaster-hover (10.35:1, a 1.46:1 step); over film (.on-film) it is an ink fill with a
// white/75 edge (3.51:1 on the brightest frame). Pressed moves 1px down; transitions are 200ms.
const motion = "transition-[background-color,color,border-color,text-decoration-thickness,translate] duration-200 ease-instrument motion-reduce:transition-none";
const press = "active:translate-y-px motion-reduce:active:translate-y-0";
const base = `group/btn inline-flex items-center justify-center gap-2 rounded-hard font-sans font-medium whitespace-nowrap select-none ${motion} ${press}`;

// md and lg keep a 44px or 48px target. sm exists only for the frozen header button.
const sizes = { md: "h-11 px-6 text-small", lg: "h-12 px-6 text-small" } as const;

const variants: Record<ButtonVariant, string> = {
  primary: "border border-action-edge bg-action text-action-fg hover:bg-action-hover",
  secondary: "border border-fg text-fg hover:bg-fg hover:text-surface",
  // A text link with a 44px target; it ignores size.
  tertiary: "min-h-11 px-0 text-small text-link underline decoration-1 underline-offset-4 hover:text-link-hover hover:decoration-2",
};

// Not available yet (the /download buttons before release): aria-disabled rather than disabled, so the
// control stays in the tab order and announces its state. It gives up its fill or underline for a
// muted label on a control edge, and ignores hover and press.
const off: Record<ButtonVariant, string> = {
  primary:
    "aria-disabled:cursor-default aria-disabled:border-control aria-disabled:bg-transparent aria-disabled:text-fg-muted aria-disabled:hover:bg-transparent aria-disabled:active:translate-y-0 disabled:cursor-default disabled:border-control disabled:bg-transparent disabled:text-fg-muted disabled:active:translate-y-0",
  secondary:
    "aria-disabled:cursor-default aria-disabled:border-control aria-disabled:text-fg-muted aria-disabled:hover:bg-transparent aria-disabled:hover:text-fg-muted aria-disabled:active:translate-y-0 disabled:cursor-default disabled:border-control disabled:text-fg-muted",
  tertiary: "aria-disabled:cursor-default aria-disabled:text-fg-muted aria-disabled:no-underline aria-disabled:hover:text-fg-muted aria-disabled:active:translate-y-0",
};

// The frozen header (lead decision 12): today's class strings, byte for byte, plus the approved
// pressed state (F12: 1px down, the translate transition). Only Nav.tsx passes `frozen`. The
// spacing lint (check 31b) skips lines marked frozen-header.
const FROZEN = {
  base: "inline-flex items-center justify-center gap-2 rounded-hard font-sans font-medium whitespace-nowrap transition-[background-color,color,border-color,translate] duration-200 ease-instrument select-none active:translate-y-px motion-reduce:active:translate-y-0", // frozen-header
  sizes: { sm: "h-[30px] pl-3.5 pr-3 text-caption leading-none", md: "h-11 px-5 text-small", lg: "h-12 px-6 text-small" }, // frozen-header
  primaryLight: "bg-ink text-white hover:bg-ink-raised aria-disabled:cursor-default aria-disabled:border aria-disabled:border-border-strong aria-disabled:bg-transparent aria-disabled:text-muted aria-disabled:hover:bg-transparent", // frozen-header
  primaryDark: "bg-ink text-white border border-white/75 hover:bg-ink-raised", // frozen-header
  secondaryLight: "border border-ink text-ink hover:bg-sunken", // frozen-header
} as const;

function Arrow({ frozen }: { frozen: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={
        frozen
          ? "h-3.5 w-3.5 shrink-0"
          : "h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-instrument group-hover/btn:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/btn:translate-x-0"
      }
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
    </svg>
  );
}

type CommonProps = {
  /** Default "primary". Each band has one primary. */
  variant?: ButtonVariant;
  /** Default "md". "sm" only with `frozen` (the header); tertiary ignores size. */
  size?: ButtonSize;
  /** The header and phone menu only: today's header classes (plus the pressed state), no data-button. */
  frozen?: boolean;
  /** With `frozen` only: the header over the home film. */
  onDark?: boolean;
  /** A small arrow after the label; it moves 4px on hover. */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonOwnKeys = "href" | "className" | "children";
export type ButtonLinkProps = CommonProps & { href: string } & Omit<ComponentPropsWithoutRef<"a">, ButtonOwnKeys>;
export type ButtonButtonProps = CommonProps & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, ButtonOwnKeys>;
export type ButtonProps = ButtonLinkProps | ButtonButtonProps;

/**
 * The site's one button: primary, secondary or tertiary, as a link (`href`) or a `<button>`
 * (type "button" unless given). Root carries `data-button={variant}` for the checks.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", frozen = false, onDark = false, arrow = false, className = "", children } = props;
  const cls = frozen
    ? `${FROZEN.base} ${FROZEN.sizes[size]} ${variant === "secondary" ? FROZEN.secondaryLight : onDark ? FROZEN.primaryDark : FROZEN.primaryLight} ${className}`
    : `${base} ${variant === "tertiary" ? "" : sizes[size === "sm" ? "md" : size]} ${variants[variant]} ${off[variant]} ${className}`;
  const data = frozen ? undefined : variant;
  const content = (
    <>
      {children}
      {arrow ? <Arrow frozen={frozen} /> : null}
    </>
  );
  if ("href" in props && typeof props.href === "string") {
    const { href, variant: _v, size: _s, frozen: _f, onDark: _d, arrow: _a, className: _c, children: _ch, ...rest } = props;
    // In-page anchors use a native link: next/link scrolls to the target but leaves focus on the link,
    // so keyboard and screen-reader users never reach the section. Native fragment navigation moves
    // the focus start point to the target. A file download is native too: next/link would treat the
    // installer as a route and prefetch it.
    if (href.startsWith("#") || rest.download !== undefined) {
      return (
        <a href={href} className={cls} data-button={data} {...rest}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} data-button={data} {...rest}>
        {content}
      </Link>
    );
  }
  const { variant: _v, size: _s, frozen: _f, onDark: _d, arrow: _a, className: _c, children: _ch, ...rest } = props as ButtonButtonProps;
  return (
    <button type="button" className={cls} data-button={data} {...rest}>
      {content}
    </button>
  );
}
