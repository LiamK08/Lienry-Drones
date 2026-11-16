import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "glass";
export type ButtonSize = "md" | "lg" | "sm";

// The site's one button system. Pills; every colour is a role token, so a button takes its look from the
// surface it sits on.
//   Variants: the primary is the accent fill with a white label (6.99:1); the secondary is a white pill
//   with an ink label and a hairline edge; glass is the secondary on a coloured panel (no hairline: the
//   panel is its edge), never translucent; the tertiary is a text link.
//   Badge: with `arrow`, a pill leads with one round arrow badge. One treatment per fill: on the accent
//   primary a white badge with an accent arrow; on every white pill (secondary, glass) the accent badge
//   with a white arrow. A tertiary link takes a plain arrow after its label.
//   Flood: a badge pill (md and lg) answers the pointer, keyboard focus or its card's hover by letting the
//   badge's colour grow from the badge's circle until it covers the pill (450ms in, 300ms back), while the
//   label rolls to a second copy in the flooded colour and the arrow leaves as a second one follows it
//   in. It ends as: the primary white with an accent label and its accent edge (so it still reads on a
//   white band); a white pill in the accent with a white label; glass in the accent's hover step inside
//   its white edge. The states and the layer are in globals.css (the pill's flood). A pill without a
//   badge only changes colour (the primary darkens, the secondary's edge turns ink) and rolls its label;
//   an sm badge slides its arrow 2px.
//   Sizes: md (42px) for every call to action on a page, with the badge where it leads on to another
//   page; lg (48px) only for a form's submit; sm (32px) only inside app UI (a menu, a tool's own
//   controls), never as a page's call to action.
// Pressed moves 1px down.
const motion = "transition-[background-color,color,border-color,text-decoration-thickness,translate] duration-200 ease-instrument motion-reduce:transition-none";
const press = "active:translate-y-px motion-reduce:active:translate-y-0";
const shape = "group/btn inline-flex items-center justify-center gap-2 rounded-pill font-sans font-medium whitespace-nowrap select-none";
const base = `${shape} ${motion} ${press}`;
// A flood pill: its colours, their timing and its stacking come from [data-flood] in globals.css.
const floodBase = `${shape} border ${press}`;

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

// Inside a whole-card link (ButtonFace) the card is the pointer's target: a card that names itself
// `group/card` drives the face's roll, badge, arrow and press with its own hover, keyboard focus and press.
const cardRollOut = "group-hover/card:-translate-y-full group-focus-visible/card:-translate-y-full motion-reduce:group-hover/card:translate-y-0 motion-reduce:group-focus-visible/card:translate-y-0";
const cardRollIn = "group-hover/card:translate-y-0 group-focus-visible/card:translate-y-0";
const cardPress = "group-active/card:translate-y-px motion-reduce:group-active/card:translate-y-0";

/**
 * The round badge a pill leads with: white with an accent arrow on the accent primary (inverted, it turns
 * accent as the pill turns white), the accent with a white arrow on a white pill (deepening on hover).
 */
function Badge({ variant, size, invert = false, card = false }: { variant: ButtonVariant; size: ButtonSize; invert?: boolean; card?: boolean }) {
  const fade = "transition-[background-color,color] duration-200 motion-reduce:transition-none";
  const tone =
    variant === "primary"
      ? `bg-white text-accent ${invert ? `${fade} group-hover/btn:bg-accent group-hover/btn:text-white` : ""}`
      : `bg-accent text-white ${fade} group-hover/btn:bg-accent-hover group-aria-disabled/btn:bg-muted${card ? " group-hover/card:bg-accent-hover group-focus-visible/card:bg-accent-hover" : ""}`;
  const dim = size === "sm" ? "size-6" : size === "md" ? "size-[2.125rem]" : "size-9";
  const slide = card ? " group-hover/card:translate-x-0.5 group-focus-visible/card:translate-x-0.5 motion-reduce:group-hover/card:translate-x-0 motion-reduce:group-focus-visible/card:translate-x-0" : "";
  return (
    <span aria-hidden="true" className={`flex ${dim} shrink-0 items-center justify-center rounded-pill ${tone}`}>
      <svg
        viewBox="0 0 16 16"
        className={`size-3.5 transition-transform duration-200 ease-instrument group-hover/btn:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover/btn:translate-x-0${slide}`}
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

// The flood's own parts (a badge pill at md or lg). Each reads --lit, which globals.css sets to 1 on the
// pill while it is hovered or focused (or its card is), so one state drives the layer, the roll and the
// arrows. Under reduced motion nothing slides: the second arrow and the second label are not rendered.
const swap = "[grid-area:1/1] size-3.5 transition-[translate] duration-300 ease-instrument motion-reduce:transition-none";

/**
 * A flood pill's badge: no disc of its own (the flood layer, clipped to this circle at rest, is the
 * disc), and two arrows in one clipped cell: the first leaves to the right as the second follows it in
 * from the left (28px, twice the arrow's width).
 */
function FloodBadge({ size }: { size: ButtonSize }) {
  const arrow = (cls: string) => (
    <svg viewBox="0 0 16 16" className={`${swap} ${cls}`} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {arrowPath}
    </svg>
  );
  return (
    <span aria-hidden="true" className={`grid ${size === "lg" ? "size-9" : "size-[2.125rem]"} shrink-0 place-items-center overflow-hidden rounded-pill text-(color:--pill-arrow)`}>
      {arrow("translate-x-[calc(var(--lit)_*_200%)] motion-reduce:translate-x-0")}
      {arrow("translate-x-[calc((var(--lit)_-_1)_*_200%)] motion-reduce:hidden")}
    </span>
  );
}

function Arrow({ card = false }: { card?: boolean }) {
  const slide = card ? " group-hover/card:translate-x-1 group-focus-visible/card:translate-x-1 motion-reduce:group-hover/card:translate-x-0 motion-reduce:group-focus-visible/card:translate-x-0" : "";
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-instrument group-hover/btn:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/btn:translate-x-0${slide}`}
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

// Pills roll their label up on hover: two copies in one clipped grid cell, the second (aria-hidden)
// waiting a line below. Nothing is positioned, so contrast tools read the label against the pill.
const roll = "[grid-area:1/1] flex items-center justify-center gap-2 transition-transform duration-300 ease-instrument motion-reduce:transition-none";

function Label({ card = false, flood = false, children }: { card?: boolean; flood?: boolean; children: ReactNode }) {
  // A flood pill: the first copy keeps the pill's own colour (it turns only once it has rolled out of
  // sight); the second waits below in the flooded colour, so the roll lands in it.
  if (flood) {
    return (
      <span className="[display:inline-grid] overflow-hidden">
        <span className={`${roll} translate-y-[calc(var(--lit)_*_-100%)] motion-reduce:translate-y-0`}>{children}</span>
        <span aria-hidden="true" className={`${roll} translate-y-[calc((1_-_var(--lit))_*_100%)] text-(color:--pill-fg-on) motion-reduce:hidden`}>
          {children}
        </span>
      </span>
    );
  }
  return (
    <span className="[display:inline-grid] overflow-hidden">
      <span className={`${roll} group-hover/btn:-translate-y-full motion-reduce:group-hover/btn:translate-y-0${card ? ` ${cardRollOut}` : ""}`}>{children}</span>
      <span aria-hidden="true" className={`${roll} translate-y-full group-hover/btn:translate-y-0 motion-reduce:hidden${card ? ` ${cardRollIn}` : ""}`}>
        {children}
      </span>
    </span>
  );
}

// The layer that floods a badge pill, under its badge and label (globals.css, the pill's flood).
const floodLayer = <span aria-hidden="true" className="pill-flood" />;

/**
 * A pill's face without its element: Button's look, sizes, badge and label roll on a `<span>`, for a card
 * whose whole surface is the link (so no interactive element is nested). The card names itself
 * `group/card`: its hover and keyboard focus roll the label and its press moves the face 1px down, as a
 * pointer on the pill itself would. With `arrow` (md, lg) the face floods as Button does, on the card's
 * hover and focus. Without it, colour changes are the card's to give, through `className` (e.g.
 * `group-hover/card:border-ink group-hover/card:bg-ink group-hover/card:text-white`, with the same under
 * `group-focus-visible/card:`). Carries `data-button={variant}` for the checks.
 */
export function ButtonFace({ variant = "secondary", size = "md", arrow = false, className = "", children }: { variant?: ButtonVariant; size?: ButtonSize; arrow?: boolean; className?: string; children: ReactNode }) {
  const badge = arrow && variant !== "tertiary";
  const flood = badge && size !== "sm";
  const cls = flood
    ? `${floodBase} ${cardPress} ${sizes[size]} ${pad.badge[size]} ${className}`
    : `${base} ${cardPress} ${variant === "tertiary" ? "" : `${sizes[size]} ${pad[badge ? "badge" : "plain"][size]}`} ${variants[variant]} ${className}`;
  return (
    <span className={cls} data-button={variant} data-flood={flood ? size : undefined}>
      {flood ? floodLayer : null}
      {flood ? <FloodBadge size={size} /> : badge ? <Badge variant={variant} size={size} card /> : null}
      {variant === "tertiary" ? children : <Label card flood={flood}>{children}</Label>}
      {arrow && variant === "tertiary" ? <Arrow card /> : null}
    </span>
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
  /** A primary without a badge on a near-black panel: the pill turns white with an accent label on hover.
   *  A badge pill floods white on every surface, so it ignores this. */
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
  // A badge pill at md or lg floods; its colours and states are globals.css's ([data-flood]).
  const flood = badge && size !== "sm";
  // Inverted, the pill's own hover darkening gives way to the white turn (one hover background, no tie).
  const look = invert && variant === "primary" ? `${variants.primary.replace("hover:bg-action-hover", "")} hover:border-white hover:bg-white hover:text-accent` : variants[variant];
  const cls = flood
    ? `${floodBase} ${sizes[size]} ${pad.badge[size]} ${off[variant]} ${className}`
    : `${base} ${variant === "tertiary" ? "" : `${sizes[size]} ${pad[badge ? "badge" : "plain"][size]}`} ${look} ${off[variant]} ${className}`;
  const label = variant === "tertiary" ? children : <Label flood={flood}>{children}</Label>;
  const content = (
    <>
      {flood ? floodLayer : null}
      {flood ? <FloodBadge size={size} /> : badge ? <Badge variant={variant} size={size} invert={invert} /> : null}
      {label}
      {arrow && variant === "tertiary" ? <Arrow /> : null}
    </>
  );
  // The flood reads the pill's size for the badge's circle.
  const mark = { "data-button": variant, "data-flood": flood ? size : undefined };
  if ("href" in props && typeof props.href === "string") {
    const { href, variant: _v, size: _s, frozen: _f, onDark: _d, arrow: _a, invert: _i, className: _c, children: _ch, ...rest } = props;
    // In-page anchors use a native link: next/link scrolls to the target but leaves focus on the link,
    // so keyboard and screen-reader users never reach the section. Native fragment navigation moves
    // the focus start point to the target. A file download is native too: next/link would treat the
    // installer as a route and prefetch it.
    if (href.startsWith("#") || rest.download !== undefined) {
      return (
        <a href={href} className={cls} {...mark} {...rest}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...mark} {...rest}>
        {content}
      </Link>
    );
  }
  const { variant: _v, size: _s, frozen: _f, onDark: _d, arrow: _a, invert: _i, className: _c, children: _ch, ...rest } = props as ButtonButtonProps;
  return (
    <button type="button" className={cls} {...mark} {...rest}>
      {content}
    </button>
  );
}
