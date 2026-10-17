// /platform copy. Moved verbatim from pages.ts (platformPage) and home.ts (systemExplainer, twoSystems) by the design-pass foundation;
// the /platform page package owns this module. Conventions: `emphasis` is the trailing phrase of its
// `headline`, images are ImageRef-compatible `{ id, alt, position }` with manifest still ids, and links
// are Action-compatible `{ label, href }`.

type PartId = "dock" | "tether" | "drone" | "scan" | "software" | "automation";
type PartFacts = { facts: { term: string; text: string }[]; link?: { label: string; href: string } };

// Specification lines and links for each part's panel in the /platform switcher, keyed by `systemExplainer.tabs[].id`.
// Typed as a string record so a tab id indexes it directly; `satisfies` still requires all six parts.
const partFacts: Record<string, PartFacts> = {
  dock: {
    facts: [
      { term: "Commercial dock", text: "Weatherproof roof capsule, water tether fed from above" },
      { term: "Home dock", text: "Waterproof ground pod, power and water through the same tether" },
    ],
    link: { label: "Compare the two systems", href: "#commercial-system" },
  },
  tether: {
    facts: [
      { term: "Water", text: "Fed through the tether for the whole clean" },
      { term: "Carried water", text: "None. The drone never carries water." },
      { term: "Home system", text: "Fed from the ground pod, on the same line that powers it" },
    ],
  },
  drone: {
    facts: [
      { term: "Surfaces", text: "Glass, solar panels, walls, roofing, driveways" },
      { term: "Pressure", text: "Set by the software for each material, adjustable in the app" },
      { term: "Routes", text: "Short and planned, with the tether kept clear" },
    ],
  },
  scan: {
    facts: [
      { term: "Scan", text: "Maps the structure and dimensions of the building before the first clean" },
      { term: "Re-scan interval", text: "Every two days on commercial buildings, adjustable in settings" },
    ],
    link: { label: "The commercial system", href: "/commercial" },
  },
  software: {
    facts: [
      { term: "Control", text: "Desktop software for both systems; personalised mobile app for the home system" },
      { term: "Shows", text: "A 3D model of the building, live wash progress and debris shading" },
    ],
    link: { label: "See the software working", href: "#demo" },
  },
  automation: {
    facts: [
      { term: "People on site", text: "None during a clean" },
      { term: "Starting a clean", text: "From the app or the desktop software, from anywhere" },
      { term: "Status", text: "Concept stage; pilot program in preparation" },
    ],
    link: { label: "Register interest", href: "/register-interest" },
  },
} satisfies Record<PartId, PartFacts>;

export const platformPage = {
  headline: "One platform. Two systems. Six parts.",
  emphasis: "Six parts.",
  lead: "Lienry is a single drone platform. It lives on the property, maps it, and cleans glass, solar panels, walls, roofing and driveways on buildings under 70 metres.",
  heroImageId: "h0-hero-still",
  heroAlt: "The Lienry drone finishing a glass wash at first light",
  actions: {
    primary: { label: "Register interest", href: "/register-interest" },
    secondary: { label: "See the six parts", href: "#parts" },
  },
  partsSection: { headline: "How the six parts fit together.", emphasis: "fit together.", tabsLabel: "The six parts" },
  partFacts,
  rows: {
    commercial: {
      title: "Commercial system",
      body: "A roof capsule for buildings under 70 metres. The drone lives on the roof, fed from above, and the whole building runs from the desktop software.",
      link: { label: "The commercial system", href: "/commercial" },
      image: { id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", position: "50% 50%" },
    },
    home: {
      title: "Home system",
      body: "A ground pod for homes, rentals and solar farms. The pod powers the drone and feeds it water, and you start a clean from your phone wherever you are.",
      link: { label: "The home system", href: "/homes-and-rentals" },
      image: { id: "m3-pod-master", alt: "The Lienry ground pod open beside a garden tap, the home drone inside", position: "35% 50%" },
    },
  },
  specs: {
    headline: "What we can say today.",
    intro: "Design intent at concept stage. None of it has been tested in service yet.",
    rows: [
      ["Building height", "Under 70 metres"],
      ["Surfaces", "Glass, solar panels, walls, roofing, driveways"],
      ["Commercial dock", "Weatherproof roof capsule, water tether fed from above"],
      ["Home dock", "Waterproof ground pod, power and water through the same tether"],
      ["Scan", "Maps the structure and dimensions of the building before the first clean"],
      ["Re-scan interval", "Every two days on commercial buildings, adjustable in settings"],
      ["Pressure", "Set by the software for each material, adjustable in the app"],
      ["Control", "Desktop software for both systems; personalised mobile app for the home system"],
      ["Status", "Concept stage; pilot program in preparation"],
    ] as const,
  },
  close: {
    headline: "Be part of the first buildings.",
    body: "Register interest for your property, or book a conversation about the commercial pilot program.",
    primary: { label: "Register interest", href: "/register-interest" },
    secondary: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
  },
};

export const systemExplainer = {
  headline: "Designed to stay. Built to clean.",
  emphasis: "Built to clean.",
  intro: "One resident platform for glass, solar panels, walls, roofing and driveways. Explore the six parts of the system.",
  link: { label: "Explore the platform", href: "/platform" },
  tabs: [
    {
      id: "dock",
      tab: "Dock",
      title: "A home on the property",
      body: "On a commercial building the drone lives in a weatherproof capsule on the roof. On a house or a solar farm it lives in a waterproof ground pod. Either way it is powered, sheltered and ready.",
      imageId: "s1-dock",
      alt: "The roof capsule's lid closing over the drone on a wet roof",
      position: "50% 55%",
      readout: "Roof capsule or ground pod",
    },
    {
      id: "tether",
      tab: "Tether",
      title: "Water and power, always connected",
      body: "A thin tether feeds the drone water for the whole clean. On the roof it is fed from above; from the ground pod it runs from the same line that powers the pod. Nothing is carried, so nothing runs out.",
      imageId: "s2-tether",
      alt: "The drone's tether rising from its fitting past a wet glass facade",
      position: "50% 60%",
      readout: "Fed from the dock",
    },
    {
      id: "drone",
      tab: "Drone",
      title: "Built to wash, not to fly far",
      body: "The drone flies short, planned routes across glass, solar panels, walls, roofing and driveways, keeping its tether clear and its sensors on the surface in front of it.",
      imageId: "m1-drone-master",
      alt: "The Lienry drone washing a glass wall, its spray bar, pad and rollers on the pane",
      position: "50% 50%",
      readout: "Five surfaces",
    },
    {
      id: "scan",
      tab: "Scan",
      title: "It maps the building first",
      body: "Before the first clean the drone scans the property to map its structure and dimensions. On commercial buildings it re-scans every two days and decides whether a clean is needed. You can change the interval in settings.",
      imageId: "s4-scan",
      alt: "The drone holding off the corner of a glass building to scan it, with no spray",
      position: "50% 40%",
      readout: "Structure and dimensions, mapped first",
    },
    {
      id: "software",
      tab: "Software",
      title: "Everything runs from your desk or your phone",
      body: "The scan uploads to desktop software that runs everything: it sets water pressure and where to wash, shows a 3D model of the building, tracks live wash progress and shades areas of built-up debris. Home owners get a personalised mobile app as well.",
      imageId: "s5-software",
      alt: "A laptop on a desk showing the desktop software's shaded 3D building",
      position: "50% 50%",
      readout: "3D model, live progress, debris shading",
    },
    {
      id: "automation",
      tab: "Automation",
      title: "Nobody has to be there",
      body: "Once it is set up, the system runs itself. Start a clean from anywhere, or let the re-scan decide. No cleaners to book, no one on site.",
      imageId: "s6-automation",
      alt: "The roof capsule open at dawn, the drone rising from its cradle",
      position: "50% 40%",
      readout: "Start a clean from anywhere",
    },
  ],
};

export const twoSystems = {
  headline: "The right system for your property.",
  systems: [
    {
      id: "commercial",
      name: "Commercial system",
      subtitle: "For buildings under 70 metres",
      imageId: "m2-capsule-master",
      points: [
        "Weatherproof roof capsule, tether fed from above",
        "Scan uploads to desktop software that runs everything",
        "Re-scans every two days and decides if a clean is needed",
        "A cheaper long-term alternative to outsourced window cleaning",
      ],
      href: "/commercial",
      cta: "Commercial system",
    },
    {
      id: "home",
      name: "Home system",
      subtitle: "For houses, apartments, rentals and solar farms",
      imageId: "m3-pod-master",
      points: [
        "Waterproof ground pod powers the drone and feeds it water",
        "Identifies each material and adjusts its pressure",
        "Personalised mobile app and desktop software",
        "Start a clean remotely from anywhere",
      ],
      href: "/homes-and-rentals",
      cta: "Home system",
    },
  ],
};
