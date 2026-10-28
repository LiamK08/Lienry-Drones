import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "glass";
export type ButtonSize = "md" | "lg" | "sm";

// The site's one button system. Pills; every colour is a role token, so a button takes its look from the
// surface it sits on.
//   Variants: the primary is the accent fill with a white label (6.99:1) that hovers darker; the
//   secondary is a white pill with an ink label and a hairline edge that turns ink on hover; glass is the
//   secondary on a coloured panel (no hairline: the panel is its edge), never translucent; the tertiary
//   is a text link.
//   Badge: with `arrow`, a pill leads with one round arrow badge that slides 2px on hover. One treatment
//   per fill: on the accent primary a white badge with an accent arrow; on every white pill (secondary,
//   glass) the accent badge with a white arrow. A tertiary link takes a plain arrow after its label.
//   Sizes: md (42px) for every call to action on a page, with the badge where it leads on to another
//   page; lg (48px) only for a form's submit; sm (32px) only inside app UI (a menu, a tool's own
//   controls), never as a page's call to action.
// Pressed moves 1px down.
const motion = "transition-[background-color,color,border-color,text-decoration-thickness,translate] duration-200 ease-instrument motion-reduce:transition-none";
const press = "active:translate-y-px motion-reduce:active:translate-y-0";
const base = `group/btn inline-flex items-center justify-center gap-2 rounded-pill font-sans font-medium whitespace-nowrap select-none ${motion} ${press}`;

const sizes = { sm: "h-8 text-caption", md: "h-[2.625rem] text-small", lg: "h-12 text-[0.9375rem]" } as const;
const pad = { plain: { sm: "px-4", md: "px-5", lg: "px-6" }, badge: { sm: "pl-1 pr-4", md: "pl-1 pr-4", lg: "pl-1.5 pr-6" } } as const;

const variants: Record<ButtonVariant, string> = {
  primary: "border border-action-edge bg-action text-action-fg hover:bg-action-hover",
  secondary: "border border-edge bg-white text-ink hover:border-ink",
  // On a coloured panel (the accent closing panel): the white pill, so it stands off the panel (an ink
  // label 16:1 on white), where a translucent one would sink into it.
  glass: "border border-white bg-white text-ink hover:border-tint hover:bg-tint",
  // A text link with a 44px target; it ignores size.
  tertiary: "min-h-11 px-0 text-small text-link underline decoration-1 underline-offset-4 hover:text-link-hover hover:decoration-2",
};

// Not available yet (the /download buttons before release): aria-disabled rather than disabled, so the
// control stays in the tab order and announces its state.
const off: Record<ButtonVariant, string> = {
  primary:
    "aria-disabled:cursor-default aria-disabled:border-control aria-disabled:bg-transparent aria-disabled:text-fg-muted aria-disabled:hover:bg-transparent aria-disabled:active:translate-y-0 disabled:cursor-default disabled:border-control disabled:bg-transparent disabled:text-fg-muted disabled:active:translate-y-0",
  secondary:
    "aria-disabled:cursor-default aria-disabled:text-ink/60 aria-disabled:hover:border-edge aria-disabled:active:translate-y-0 disabled:cursor-default disabled:text-ink/60",
  tertiary: "aria-disabled:cursor-default aria-disabled:text-fg-muted aria-disabled:no-underline aria-disabled:hover:text-fg-muted aria-disabled:active:translate-y-0",
  glass: "aria-disabled:cursor-default aria-disabled:opacity-60",
};

const arrowPath = <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />;

/**
 * The round badge a pill leads with: white with an accent arrow on the accent primary (inverted, it turns
 * accent as the pill turns white), the accent with a white arrow on a white pill (deepening on hover).
 */
function Badge({ variant, size, invert = false }: { variant: ButtonVariant; size: ButtonSize; invert?: boolean }) {
  const fade = "transition-[background-color,color] duration-200 motion-reduce:transition-none";
  const tone =
    variant === "primary"
      ? `bg-white text-accent ${invert ? `${fade} group-hover/btn:bg-accent group-hover/btn:text-white` : ""}`
      : `bg-accent text-white ${fade} group-hover/btn:bg-accent-hover group-aria-disabled/btn:bg-muted`;
  const dim = size === "sm" ? "size-6" : size === "md" ? "size-[2.125rem]" : "size-9";
  return (
    <span aria-hidden="true" className={`flex ${dim} shrink-0 items-center justify-center rounded-pill ${tone}`}>
      <svg
        viewBox="0 0 16 16"
        className="size-3.5 transition-transform duration-200 ease-instrument group-hover/btn:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover/btn:translate-x-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {arrowPath}
      </svg>
    </span>
  );
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-instrument group-hover/btn:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/btn:translate-x-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {arrowPath}
    </svg>
  );
}

type CommonProps = {
  /** Default "primary". Each band has one primary. */
  variant?: ButtonVariant;
  /** Default "md". Tertiary ignores size. */
  size?: ButtonSize;
  /** @deprecated Ignored: the header uses the same pills. */
  frozen?: boolean;
  /** @deprecated Ignored. */
  onDark?: boolean;
  /** Primary and secondary: a round arrow badge before the label. Tertiary: an arrow after it. */
  arrow?: boolean;
  /** Primary on a near-black panel: the pill turns white with an accent label on hover, the badge accent. */
  invert?: boolean;
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
  const { variant = "primary", size = "md", arrow = false, invert = false, className = "", children } = props;
  const badge = arrow && variant !== "tertiary";
  // Inverted, the pill's own hover darkening gives way to the white turn (one hover background, no tie).
  const look = invert && variant === "primary" ? `${variants.primary.replace("hover:bg-action-hover", "")} hover:border-white hover:bg-white hover:text-accent` : variants[variant];
  const cls = `${base} ${variant === "tertiary" ? "" : `${sizes[size]} ${pad[badge ? "badge" : "plain"][size]}`} ${look} ${off[variant]} ${className}`;
  // Pills roll their label up on hover: two copies in one clipped grid cell, the second (aria-hidden)
  // waiting a line below. Nothing is positioned, so contrast tools read the label against the pill.
  const roll = "[grid-area:1/1] flex items-center justify-center gap-2 transition-transform duration-300 ease-instrument motion-reduce:transition-none";
  const label =
    variant === "tertiary" ? (
      children
    ) : (
      <span className="[display:inline-grid] overflow-hidden">
        <span className={`${roll} group-hover/btn:-translate-y-full motion-reduce:group-hover/btn:translate-y-0`}>{children}</span>
        <span aria-hidden="true" className={`${roll} translate-y-full group-hover/btn:translate-y-0 motion-reduce:hidden`}>
          {children}
        </span>
      </span>
    );
  const content = (
    <>
      {badge ? <Badge variant={variant} size={size} invert={invert} /> : null}
      {label}
      {arrow && variant === "tertiary" ? <Arrow /> : null}
    </>
  );
  if ("href" in props && typeof props.href === "string") {
    const { href, variant: _v, size: _s, frozen: _f, onDark: _d, arrow: _a, invert: _i, className: _c, children: _ch, ...rest } = props;
    // In-page anchors use a native link: next/link scrolls to the target but leaves focus on the link,
    // so keyboard and screen-reader users never reach the section. Native fragment navigation moves
    // the focus start point to the target. A file download is native too: next/link would treat the
    // installer as a route and prefetch it.
    if (href.startsWith("#") || rest.download !== undefined) {
      return (
        <a href={href} className={cls} data-button={variant} {...rest}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} data-button={variant} {...rest}>
        {content}
      </Link>
    );
  }
  const { variant: _v, size: _s, frozen: _f, onDark: _d, arrow: _a, invert: _i, className: _c, children: _ch, ...rest } = props as ButtonButtonProps;
  return (
    <button type="button" className={cls} data-button={variant} {...rest}>
      {content}
    </button>
  );
}
