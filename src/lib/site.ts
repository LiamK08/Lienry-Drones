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
/** One link in a header panel: its icon (src/components/blocks/Icon.tsx), title and one-line note. */
export type MenuLink = { href: string; label: string; note: string; icon: string };

/** A column of a header panel: a heading, the tile tone for its icons, and its links (in 1 or 2 columns). */
export type MenuGroup = { heading: string; tone: "teal" | "sand" | "green"; cols?: 1 | 2; muted?: boolean; links: readonly MenuLink[] };

/** The dark card that opens the Resources panel: an eyebrow, a title, three links with tags, and a pill. */
export type MenuFeature = { eyebrow: string; title: string; items: readonly { href: string; tag: string; label: string }[]; action: { href: string; label: string } };

/**
 * The header's menus. Platform, Solutions and Resources open wide panels of grouped links; About is a
 * plain link. Every enquiry label is the one label that route has everywhere.
 */
export const menus: readonly { id: string; label: string; groups: readonly MenuGroup[]; feature?: MenuFeature }[] = [
  {
    id: "platform",
    label: "Platform",
    groups: [
      {
        heading: "Hardware",
        tone: "teal",
        links: [
          { href: "/platform#dock", label: "Dock", note: "A weatherproof roof capsule or a waterproof ground pod.", icon: "dock" },
          { href: "/platform#tether", label: "Tether", note: "Water and power through one line, for the whole clean.", icon: "tether" },
          { href: "/platform#drone", label: "Drone", note: "Short, planned routes across five kinds of surface.", icon: "drone" },
        ],
      },
      {
        heading: "Intelligence",
        tone: "sand",
        links: [
          { href: "/platform#scan", label: "Scan", note: "The structure and dimensions, mapped before any clean.", icon: "scan" },
          { href: "/platform#software", label: "Software", note: "A 3D model, live wash progress and debris shading.", icon: "layers" },
          { href: "/platform#automation", label: "Automation", note: "Start a clean from anywhere, or let the re-scan decide.", icon: "repeat" },
        ],
      },
      {
        heading: "Get started",
        tone: "green",
        links: [
          { href: "/platform", label: "Platform overview", note: "How the six parts work as one.", icon: "grid" },
          { href: "/download", label: "Lienry Desktop", note: "The desktop software for Mac and Windows.", icon: "download" },
          { href: "/fit-check", label: "Fit check", note: "Seven questions on whether your building suits it.", icon: "check" },
        ],
      },
    ],
  },
  {
    id: "solutions",
    label: "Solutions",
    groups: [
      {
        heading: "By property",
        tone: "teal",
        cols: 2,
        muted: true,
        links: [
          { href: "/commercial", label: "Office buildings", note: "Glass and render under 70 metres", icon: "building" },
          { href: "/commercial", label: "Apartment blocks", note: "Facades and balcony glass", icon: "apartments" },
          { href: "/homes-and-rentals", label: "Homes", note: "Windows, walls, roofing, driveways", icon: "home" },
          { href: "/homes-and-rentals", label: "Rental properties", note: "Cleaned between tenants, from anywhere", icon: "key" },
          { href: "/solar", label: "Solar", note: "Rooftop arrays and solar farm rows", icon: "sun" },
        ],
      },
      {
        heading: "By role",
        tone: "green",
        cols: 2,
        muted: true,
        links: [
          { href: "/commercial", label: "Facility managers", note: "One system for the whole building", icon: "person" },
          { href: "/commercial", label: "Strata and owners", note: "Nobody at height on your facade", icon: "shield" },
          { href: "/homes-and-rentals", label: "Homeowners", note: "Started from the app", icon: "phone" },
          { href: "/company", label: "Investors", note: "We are raising a pre-seed round", icon: "chart" },
        ],
      },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    feature: {
      eyebrow: "Inside Lienry",
      title: "Where the platform is up to",
      items: [
        { href: "/company", tag: "Company", label: "Concept stage, raising pre-seed, with a pilot next" },
        { href: "/platform", tag: "Platform", label: "Six parts that work as one, on a roof or beside a house" },
        { href: "/download", tag: "Software", label: "Lienry Desktop, for Mac and Windows" },
      ],
      action: { href: "/company", label: "About Lienry" },
    },
    groups: [
      {
        heading: "Tools",
        tone: "teal",
        muted: true,
        links: [
          { href: "/fit-check", label: "Fit check", note: "Seven questions from the design brief, scored as you go.", icon: "check" },
          { href: "/calculator", label: "Cost calculator", note: "What outsourced cleaning adds up to over 5 and 10 years.", icon: "calculator" },
        ],
      },
      {
        heading: "Learn",
        tone: "sand",
        muted: true,
        links: [
          { href: "/platform#faq", label: "Questions", note: "Straight answers, including what is undecided.", icon: "question" },
          { href: "/#how", label: "How a clean works", note: "Scan, plan, clean, check and report.", icon: "repeat" },
          { href: "/#safety", label: "Safety by design", note: "The tether, camera, checks and dock.", icon: "shield" },
        ],
      },
    ],
  },
];

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
