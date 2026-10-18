// /platform copy. Conventions shared with every content module: `emphasis` is the trailing phrase of
// its `headline`; images are ImageRef-compatible `{ id, alt, position }` with manifest still ids; links
// are Action-compatible `{ label, href }`. Facts come from docs/SITE-PLAN.md only.

export const platformPage = {
  hero: {
    eyebrow: "the platform",
    headline: "One platform. Two systems. Six parts.",
    emphasis: "Six parts.",
    lead: "A resident drone that maps the property, then cleans glass, panels, walls, roofing and driveways.",
    primary: { label: "Register interest", href: "/register-interest" },
    secondary: { label: "See the six parts", href: "#parts" },
    image: { id: "h0-hero-still", alt: "The Lienry drone finishing a glass wash at first light", position: "50% 50%" },
  },
  // Each card's anchor is its part id, so the footer's /platform#dock ... #automation links land on it.
  parts: {
    eyebrow: "six parts",
    headline: "How the six parts fit together.",
    emphasis: "fit together.",
    intro: "Each part has one job. Together, nobody needs to be on site.",
    items: [
      {
        key: "dock",
        anchor: "dock",
        index: "01",
        title: "Dock",
        body: "A roof capsule or a ground pod keeps it powered and sheltered.",
        image: { id: "s1-dock", alt: "The roof capsule's lid closing over the drone on a wet roof", position: "50% 55%" },
      },
      {
        key: "tether",
        anchor: "tether",
        index: "02",
        title: "Tether",
        body: "Water comes through the tether, so the drone never carries it.",
        image: { id: "s2-tether", alt: "The drone's tether rising from its fitting past a wet glass facade", position: "50% 60%" },
      },
      {
        key: "drone",
        anchor: "drone",
        index: "03",
        title: "Drone",
        body: "Short, planned routes, with the pressure set for each material.",
        image: { id: "f3-surface", alt: "The drone's spray bar, pad and roller on a pane of glass", position: "50% 50%" },
      },
      {
        key: "scan",
        anchor: "scan",
        index: "04",
        title: "Scan",
        body: "It maps the building's structure and dimensions first.",
        image: { id: "s4-scan", alt: "The drone holding off the corner of a glass building to scan it, with no spray", position: "50% 40%" },
      },
      {
        key: "software",
        anchor: "software",
        index: "05",
        title: "Software",
        body: "A 3D model of the building, live progress and debris shading.",
        image: { id: "s5-software", alt: "A laptop on a desk showing the desktop software's shaded 3D building", position: "50% 50%" },
      },
      {
        key: "automation",
        anchor: "automation",
        index: "06",
        title: "Automation",
        body: "Start a clean from anywhere, or let the re-scan decide.",
        image: { id: "s6-automation", alt: "The roof capsule open at dawn, the drone rising from its cradle", position: "50% 40%" },
      },
    ],
  },
  systems: {
    eyebrow: "two systems",
    headline: "Two systems, one platform.",
    emphasis: "one platform.",
    intro: "The same drone, scan and software, docked on the roof or on the ground.",
    items: [
      {
        key: "commercial",
        title: "Commercial system",
        body: "A roof capsule for buildings under 70 metres, run from the desktop software.",
        href: "/commercial",
        image: { id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", position: "50% 50%" },
      },
      {
        key: "home",
        title: "Home system",
        body: "A ground pod that powers the drone and feeds it water, run from your phone.",
        href: "/homes-and-rentals",
        image: { id: "m3-pod-master", alt: "The Lienry ground pod open beside a garden tap, the home drone inside", position: "35% 50%" },
      },
    ],
  },
  faq: {
    eyebrow: "questions",
    headline: "What people ask first.",
    link: { label: "Register interest", href: "/register-interest" },
  },
  closing: {
    eyebrow: "pre-launch",
    headline: "Be part of the first buildings.",
    emphasis: "the first buildings.",
    body: "Register interest, or book a conversation about the pilot program.",
    primary: { label: "Register interest", href: "/register-interest" },
    links: [{ label: "Book a pilot conversation", href: "/register-interest?type=commercial" }],
    image: { id: "m1-drone-master", alt: "The Lienry drone washing a glass wall, its spray bar, pad and rollers on the pane", position: "50% 50%" },
  },
};
