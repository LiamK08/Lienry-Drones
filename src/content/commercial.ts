// /commercial copy. Moved verbatim from pages.ts (commercialPage) and home.ts (designFacts) by the design-pass foundation;
// the /commercial page package owns this module. Conventions: `emphasis` is the trailing phrase of its
// `headline`, images are ImageRef-compatible `{ id, alt, position }` with manifest still ids, and links
// are Action-compatible `{ label, href }`.

export const commercialPage = {
  headline: "Window cleaning that lives on the roof.",
  emphasis: "on the roof.",
  lead: "A weatherproof capsule on the roof, a tether fed from above, and desktop software that runs the whole building. Lienry is a cheaper long-term alternative to outsourced commercial window cleaning.",
  heroImageId: "c1-commercial-hero" as const,
  heroVideoId: "c2-commercial-clip" as const,
  heroAlt: "The Lienry roof capsule on a plant deck at dawn, the drone rising from its cradle",
  actions: {
    primary: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
    secondary: { label: "See the platform", href: "/platform" },
  },
  steps: {
    headline: "Four steps, then it runs itself.",
    emphasis: "then it runs itself.",
    intro: "From an empty roof to a building that decides when it needs a clean.",
    tabsLabel: "Steps",
    items: [
      {
        n: "01",
        id: "install",
        tab: "Install",
        label: "Step 01",
        title: "Install the capsule",
        body: "The drone lives in a weatherproof capsule on the roof. Its water tether is fed from above, so the drone never carries water.",
        facts: [
          { term: "Dock", text: "Weatherproof roof capsule" },
          { term: "Water", text: "Tether fed from above" },
          { term: "Carried water", text: "None" },
        ],
        image: { id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", position: "50% 50%" },
      },
      {
        n: "02",
        id: "scan",
        tab: "Scan",
        label: "Step 02",
        title: "Scan the building",
        body: "The drone scans the building to map its structure and dimensions. The scan uploads to the desktop software.",
        facts: [
          { term: "Scan", text: "Structure and dimensions of the building" },
          { term: "Output", text: "A model in the desktop software" },
          { term: "When", text: "Before the first clean" },
        ],
        image: { id: "s4-scan", alt: "The drone holding off the corner of a glass building to scan it, with no spray", position: "50% 40%" },
      },
      {
        n: "03",
        id: "run",
        tab: "Run",
        label: "Step 03",
        title: "Set and run",
        body: "The software sets the water pressure and where to wash, then tracks the clean live on a 3D model of the building.",
        facts: [
          { term: "Pressure", text: "Set by the software for each material" },
          { term: "Route", text: "Planned on the model of the building" },
          { term: "Tracking", text: "Live progress on a 3D model of the building" },
        ],
        image: { id: "s5-software", alt: "A laptop on a desk showing the desktop software's shaded 3D building", position: "50% 50%" },
      },
      {
        n: "04",
        id: "rescan",
        tab: "Re-scan",
        label: "Step 04",
        title: "Re-scan every two days",
        body: "The drone re-scans the building every two days and decides whether a clean is needed. Change the interval in settings whenever you like.",
        facts: [
          { term: "Re-scan interval", text: "Every two days, adjustable in settings" },
          { term: "Decision", text: "The re-scan decides whether a clean is needed" },
          { term: "People on site", text: "None during a clean" },
        ],
        image: { id: "s6-automation", alt: "The roof capsule open at dawn, the drone rising from its cradle", position: "50% 40%" },
      },
    ],
  },
  software: {
    headline: "What the desktop software shows.",
    tiles: [
      { title: "A 3D model of your building", body: "Built from the scan, so every clean is planned on the real structure." },
      { title: "Live wash progress", body: "Watch the clean move across the facade as it happens." },
      { title: "Debris shading", body: "Areas of built-up debris are shaded so you can see where the next clean is needed." },
    ],
  },
  byDesign: {
    headline: "Designed around three numbers.",
    intro: "Design intent for the pilot, not results.",
  },
  cost: {
    headline: "Why it costs less over time.",
    body: "Instead of paying for each visit from an outsourced crew, the drone lives on the building and cleans when the scan says it should. We are not publishing prices before the pilot program; we will share them with pilot buildings first.",
    points: [
      "No crews to book for each visit",
      "No access equipment to arrange at height",
      "No waiting for a slot: the re-scan decides when a clean is due",
      "The building is planned, tracked and reported in one place",
    ],
    image: { id: "s1-dock", alt: "The Lienry roof capsule lid closing on a wet roof", position: "50% 55%" },
  },
  pilot: {
    headline: "A small number of buildings, first.",
    body: "We are preparing a pilot program for commercial buildings under 70 metres in Sydney. If you own or manage one, book a conversation and we will walk you through what the pilot involves.",
    cta: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
    links: [{ label: "Investor enquiries", href: "/register-interest?type=investor" }],
    image: { id: "h0-hero-still", alt: "The Lienry drone washing a glass curtain wall, its tether rising to the roof", position: "50% 50%" },
  },
};

/** Design intent, not results or statistics: every figure here renders under "Design intent. Concept stage." */
export const designFacts = {
  label: "By design",
  note: "Design intent. Concept stage.",
  lead: "Three numbers the commercial system is designed around. They are design intent, not results: Lienry is at concept stage and nothing is in service yet.",
  items: [
    { term: "Re-scan interval", value: "2", unit: "days", text: "between re-scans on commercial buildings, and you can change it" },
    { term: "People on site", value: "0", text: "during a clean" },
    { term: "Building height", value: "<70", unit: "m", text: "the commercial system is designed for buildings under 70 metres" },
  ],
};
