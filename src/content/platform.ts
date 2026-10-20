// /platform copy. Conventions shared with every content module: `emphasis` is the trailing phrase of
// its `headline`; images are `{ id, alt, position }` with manifest still ids; links are
// `{ label, href }`. Facts come from docs/SITE-PLAN.md only.

export const platformPage = {
  hero: {
    eyebrow: "The Lienry platform",
    headline: "One drone platform for every exterior you own",
    emphasis: "every exterior you own",
    lead: "A resident drone, its dock, a tether, a scan and the software that runs it. It maps the property, then cleans glass, panels, walls, roofing and driveways with nobody on site.",
    primary: { label: "Register interest", href: "/register-interest" },
    secondary: { label: "Check your building", href: "/fit-check" },
    image: { id: "h0-hero-still", alt: "The Lienry drone finishing a glass wash at first light", position: "50% 50%" },
  },
  // Each tab panel's id is its part id, so the footer's /platform#dock ... #automation links land on it.
  parts: {
    eyebrow: "How Lienry works",
    headline: "Six parts that work as one",
    items: [
      { id: "dock", tab: "Dock", title: "A home on the property", body: "On a commercial building the drone lives in a weatherproof capsule on the roof. On a house it lives in a waterproof ground pod. Either way it is powered, sheltered and ready.", link: { label: "Compare the systems", href: "#systems" }, image: { id: "s1-dock", alt: "The roof capsule's lid closing over the drone on a wet roof", position: "50% 55%" } },
      { id: "tether", tab: "Tether", title: "Water and power, always connected", body: "A thin tether feeds the drone water for the whole clean. On the roof it is fed from above; from the ground pod it runs from the same line that powers the pod. Nothing is carried, so nothing runs out.", image: { id: "s2-tether", alt: "The drone's tether rising from its fitting past a wet glass facade", position: "50% 60%" } },
      { id: "drone", tab: "Drone", title: "Built to wash, not to fly far", body: "Short, planned routes across glass, solar panels, walls, roofing and driveways, keeping the tether clear and its sensors on the surface in front of it.", link: { label: "See the surfaces", href: "#features" }, image: { id: "f3-surface", alt: "The drone's spray bar, pad and roller on a pane of glass", position: "50% 50%" } },
      { id: "scan", tab: "Scan", title: "It maps the building first", body: "Before the first clean the drone scans the property for its structure and dimensions. On commercial buildings it re-scans every two days and decides whether a clean is needed.", image: { id: "s4-scan", alt: "The drone holding off the corner of a glass building to scan it", position: "50% 40%" } },
      { id: "software", tab: "Software", title: "Everything runs from one screen", body: "The scan uploads to desktop software that sets the pressure and where to wash, shows a 3D model of the building, tracks the wash live and shades built-up\u00a0debris.", link: { label: "Lienry Desktop", href: "/download" }, image: { id: "s5-software", alt: "A laptop showing the desktop software's shaded 3D building", position: "50% 50%" } },
      { id: "automation", tab: "Automation", title: "Nobody has to be there", body: "Once it is set up, the system runs itself. Start a clean from anywhere, or let the re-scan decide. No cleaners to book, no one on site.", link: { label: "Register interest", href: "/register-interest" }, image: { id: "s6-automation", alt: "The roof capsule open at dawn, the drone above its cradle", position: "50% 40%" } },
    ],
  },
  rows: [
    {
      id: "surfaces",
      title: "Every surface, cleaned as its own material",
      paragraphs: ["Glass, solar panels, render, roofing and paving all need different handling. The drone identifies each material as it cleans and sets the pressure to suit; you can change it in the software."],
      link: { label: "See the surfaces it cleans", href: "#faq" },
      image: { id: "m1-drone-master", alt: "The Lienry drone washing a glass wall, its spray bar, pad and rollers on the pane", position: "50% 50%" },
      facts: [
        { title: "Scan first", text: "The structure and dimensions are mapped before any clean." },
        { title: "Pressure by material", text: "Set by the software for each surface, adjustable." },
        { title: "Two passes per floor", text: "The clean moves down the facade in planned passes." },
        { title: "Re-scan", text: "Every two days on commercial buildings, adjustable." },
      ],
    },
    {
      id: "systems",
      eyebrow: "Two systems",
      title: "On the roof, or beside the house",
      paragraphs: ["The commercial system docks in a roof capsule and is fed from above, for buildings under 70 metres. The home system docks in a ground pod that powers the drone and feeds it water."],
      callout: { title: "What both systems share", items: ["The same drone, scan and software", "A tether, so nothing is carried", "A clean with nobody on site"] },
      aspect: "16/9" as const,
      image: { id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", position: "50% 50%" },
    },
    {
      id: "planned",
      eyebrow: "Planned, not guessed",
      title: "Cleaned when the building needs it, not when a crew is free",
      paragraphs: ["Booked cleans happen on a crew's calendar. A resident drone works from the scan instead: it checks the building, finds where debris has built up, and cleans there."],
      checks: ["A re-scan that shades built-up debris", "A clean you can start from anywhere", "A record of what was cleaned and when"],
      link: { label: "Register interest", href: "/register-interest" },
      linkStyle: "primary" as const,
      aspect: "16/9" as const,
      image: { id: "m3-pod-master", alt: "The Lienry ground pod open beside a garden tap, the home drone inside", position: "35% 50%" },
    },
  ],
  statement: { headline: "Every clean is planned on a model of the building, and nobody has to be on site.", action: { label: "Register interest", href: "/register-interest" } },
  close: {
    headline: "See the software that runs it",
    body: "A demo building in the desktop software: the scan, the plan, the wash and the re-scan.",
    action: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
  },
};
