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

export const nav = [
  { href: "/platform", label: "Platform" },
  { href: "/commercial", label: "Commercial" },
  { href: "/homes-and-rentals", label: "Homes and Rentals" },
  { href: "/solar", label: "Solar" },
  { href: "/company", label: "Company" },
] as const;

export const footerColumns = [
  {
    heading: "Platform",
    links: [
      { href: "/platform#dock", label: "Dock" },
      { href: "/platform#tether", label: "Tether" },
      { href: "/platform#drone", label: "Drone" },
      { href: "/platform#scan", label: "Scan" },
      { href: "/platform#software", label: "Software" },
      { href: "/platform#automation", label: "Automation" },
    ],
  },
  {
    heading: "Systems",
    links: [
      { href: "/commercial", label: "Commercial system" },
      { href: "/homes-and-rentals", label: "Home system" },
      { href: "/solar", label: "Solar" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/company", label: "About Lienry" },
      { href: "/register-interest", label: "Register interest" },
      { href: "/register-interest?type=commercial", label: "Book a pilot conversation" },
      { href: "/register-interest?type=investor", label: "Investor enquiries" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
] as const;
