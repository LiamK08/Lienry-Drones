import type { Metadata } from "next";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lienrydrones.com").replace(/\/$/, "");

export const brand = {
  name: "Lienry Drones",
  short: "Lienry",
  tagline: "Clean exteriors. Nobody on site.",
  description:
    "Lienry Drones makes a resident cleaning drone that lives on a property and keeps its exterior clean with nobody on site. Glass, solar panels, walls, roofing and driveways on buildings under 70 metres.",
  location: "Sydney, Australia",
  status: "Concept stage. Raising pre-seed. Pilot program in preparation.",
};

/**
 * Every route's tab title: what the page is, then the brand, as in "Download Lienry Desktop | Lienry
 * Drones". Each page sets its title with `pageMetadata`, so the format cannot drift; the layout's plain
 * brand name is only the fallback for anything else. scripts/check-rules.mjs (E2 check 22) reads them here.
 */
export const pageTitles = {
  "/": "Resident cleaning drones for buildings and homes",
  "/platform": "How the platform works",
  "/commercial": "Window cleaning for commercial buildings",
  "/homes-and-rentals": "Exterior cleaning for homes and rentals",
  "/solar": "Solar panel cleaning",
  "/company": "About the company",
  "/download": "Download Lienry Desktop",
  "/register-interest": "Register interest",
  "/privacy": "Privacy policy",
  "/fit-check": "Is your building a fit?",
  "/calculator": "What outsourced cleaning costs",
} as const;

export type Route = keyof typeof pageTitles;

/** The tab title of `route`: "{what the page is} | Lienry Drones". */
export function pageTitle(route: Route): string {
  return `${pageTitles[route]} | ${brand.name}`;
}

/**
 * The Open Graph fields every route shares. A page that sets its own `openGraph` replaces the
 * layout's whole object (Next merges metadata shallowly), so it spreads these back in.
 */
export const openGraphBase = {
  type: "website" as const,
  siteName: brand.name,
  locale: "en_AU",
  images: [{ url: "/og.png", width: 1200, height: 630, alt: "Lienry Drones. Clean exteriors. Nobody on site." }],
};

/**
 * A page's metadata: its tab title, its description, a canonical link to its own address, and the
 * card a shared link shows, which carries the page's own address, its title without the brand (the
 * card names the site beside it) and the same description. The X card copies the Open Graph fields;
 * the layout sets only its size. Every page sets its metadata with this, so none can fall back to the
 * home page's address or words. scripts/check-rules.mjs (E2 check 22) checks the result.
 */
export function pageMetadata(route: Route, description: string): Metadata {
  return {
    title: pageTitle(route),
    description,
    alternates: { canonical: route },
    openGraph: { ...openGraphBase, url: route, title: pageTitles[route], description },
  };
}

/** One entry in a header menu: a title and a one-line description. */
export type MenuLink = { href: string; label: string; note: string };

/**
 * The header's menus. Platform, Solutions and Resources open panels; About is a plain link. Every
 * enquiry label is the one label that route has everywhere.
 */
export const menus = [
  {
    id: "platform",
    label: "Platform",
    links: [
      { href: "/platform", label: "Platform overview", note: "One drone platform, six parts." },
      { href: "/platform#dock", label: "Dock", note: "A roof capsule or a ground pod." },
      { href: "/platform#tether", label: "Tether", note: "Water and power, always connected." },
      { href: "/platform#scan", label: "Scan", note: "The building mapped before any clean." },
      { href: "/platform#software", label: "Software", note: "A 3D model, live progress, debris shading." },
      { href: "/download", label: "Lienry Desktop", note: "The desktop software for Mac and Windows." },
    ],
  },
  {
    id: "solutions",
    label: "Solutions",
    links: [
      { href: "/commercial", label: "Commercial buildings", note: "A roof capsule for buildings under 70 metres." },
      { href: "/homes-and-rentals", label: "Homes and rentals", note: "A ground pod, started from your phone." },
      { href: "/solar", label: "Solar", note: "Panels at the right pressure, on your interval." },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    links: [
      { href: "/fit-check", label: "Fit check", note: "Seven questions: is your building a fit?" },
      { href: "/calculator", label: "Cost calculator", note: "What outsourced cleaning adds up to." },
      { href: "/platform#faq", label: "Questions", note: "Straight answers, including what is undecided." },
    ],
  },
] as const satisfies readonly { id: string; label: string; links: readonly MenuLink[] }[];

/** The header's plain link after the menus. */
export const navAbout = { href: "/company", label: "About" } as const;

/** @deprecated The old flat list, kept for the phone menu's order and the sitemap. */
export const nav = [
  { href: "/platform", label: "Platform" },
  { href: "/commercial", label: "Commercial" },
  { href: "/homes-and-rentals", label: "Homes and Rentals" },
  { href: "/solar", label: "Solar" },
  { href: "/company", label: "Company" },
] as const;

/** The header's white pill, beside Register interest. */
export const navUtility = { href: "/download", label: "Download" } as const;

/**
 * The footer (src/components/site/Footer.tsx): the statement, four groups of links under lowercase
 * eyebrows, and the legal line. Every enquiry label is the one label that route has everywhere.
 */
export const footer = {
  tagline: "Resident exterior cleaning",
  groups: [
    {
      id: "platform",
      heading: "Platform",
      links: [
        { href: "/platform", label: "Overview" },
        { href: "/platform#dock", label: "Dock" },
        { href: "/platform#tether", label: "Tether" },
        { href: "/platform#drone", label: "Drone" },
        { href: "/platform#scan", label: "Scan" },
        { href: "/platform#software", label: "Software" },
        { href: "/platform#automation", label: "Automation" },
      ],
    },
    {
      id: "solutions",
      heading: "Solutions",
      links: [
        { href: "/commercial", label: "Commercial buildings" },
        { href: "/homes-and-rentals", label: "Homes and rentals" },
        { href: "/solar", label: "Solar" },
        { href: "/download", label: "Lienry Desktop" },
      ],
    },
    {
      id: "resources",
      heading: "Resources",
      links: [
        { href: "/fit-check", label: "Fit check" },
        { href: "/calculator", label: "Cost calculator" },
        { href: "/register-interest?type=commercial", label: "Book a pilot conversation" },
        { href: "/register-interest?type=landlord", label: "I own rentals" },
      ],
    },
    {
      id: "company",
      heading: "Company",
      links: [
        { href: "/company", label: "About" },
        { href: "/register-interest", label: "Register interest" },
        { href: "/register-interest?type=investor", label: "Investor enquiries" },
      ],
    },
  ],
  legal: "© 2026 Lienry Drones. Sydney, Australia.",
  legalLinks: [{ href: "/privacy", label: "Privacy policy" }],
} as const;
