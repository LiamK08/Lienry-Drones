import { systemExplainer } from "./home";

// Inner page copy. The conventions in home.ts apply: `emphasis` is the trailing phrase of its `headline`,
// images are ImageRef-compatible `{ id, alt, position }` with manifest still ids, and links are `{ label, href }`.

/** A founder on /company. Only `published` entries render, and `photo` renders only when the owner supplies a real photograph. */
export type FounderEntry = { name: string; title: string; bio: string; photo: null | { src: string; alt: string; width: number; height: number }; published: boolean };

/** Ids of the seven platform questions. Each page shows the subset `faqSets` names, in that order. */
export type FaqId = "surfaces" | "height" | "water" | "decide" | "attend" | "operating" | "cost";

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
    ],
    link: { label: "Register interest", href: "/register-interest" },
  },
} satisfies Record<PartId, PartFacts>;

export const platformPage = {
  eyebrow: "Platform",
  headline: "One platform. Two systems. Six parts.",
  emphasis: "Six parts.",
  lead: "Lienry is a single drone platform. It lives on the property, maps it, and cleans glass, solar panels, walls, roofing and driveways on buildings under 70 metres.",
  heroImageId: "h0-hero-still",
  heroAlt: "The Lienry drone finishing a glass wash at first light",
  actions: {
    primary: { label: "Register interest", href: "/register-interest" },
    secondary: { label: "See the six parts", href: "#parts" },
  },
  parts: systemExplainer.tabs.map((t) => ({ id: t.id, eyebrow: t.tab, title: t.title, body: t.body, imageId: t.imageId, readout: t.readout })),
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
    eyebrow: "Specifications",
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

export const platformFaq = {
  eyebrow: "Questions",
  headline: "What people ask first.",
  intro: "Straight answers, including what we cannot claim yet.",
  link: { label: "Register interest", href: "/register-interest" },
  items: [
    { id: "surfaces", q: "Which surfaces does it clean?", a: "Glass, solar panels, walls, roofing and driveways. During a clean the drone identifies each material and adjusts its pressure to suit, and you can change the setting in the app." },
    { id: "height", q: "How tall a building can it work on?", a: "Buildings under 70 metres. On a commercial building the drone lives in a weatherproof capsule on the roof with its water tether fed from above; on a house or a solar farm it works from a waterproof ground pod." },
    { id: "water", q: "Where does the water come from?", a: "From the tether. It is fed from above on the roof system and from the ground pod on the home system, so the drone never carries water." },
    { id: "decide", q: "How does it decide when to clean?", a: "On a commercial building it re-scans every two days and decides whether a clean is needed. You can change the interval in settings, and you can start a clean yourself from the app or the desktop software at any time." },
    { id: "attend", q: "Does anyone need to be there?", a: "No. Setup is done once. After that the system runs from the dock, and you can start or watch a clean from anywhere." },
    { id: "operating", q: "Is Lienry operating yet?", a: "Not yet. Lienry Drones is at concept stage in Sydney, raising a pre-seed round and preparing a pilot program for commercial buildings. We do not claim any approvals, customers or results, and we will only ever publish figures we can stand behind." },
    { id: "cost", q: "What does it cost?", a: "We are not publishing prices before the pilot program. Pilot buildings will see them first. The aim is a cheaper long-term alternative to outsourced commercial window cleaning." },
  ] satisfies { id: FaqId; q: string; a: string }[],
};

/** The home FAQ's link to the full set of questions on /platform. */
export const homeFaqLink = { label: "All questions", href: "/platform#faq" };

/** The platform questions each page shows, in display order. */
export const faqSets = {
  home: ["water", "height", "attend", "operating", "cost"],
  platform: ["surfaces", "height", "water", "decide", "attend", "operating", "cost"],
  commercial: ["height", "water", "decide", "attend", "operating", "cost"],
  homes: ["surfaces", "water", "attend", "operating", "cost"],
  solar: ["surfaces", "decide", "water", "operating", "cost"],
} as const satisfies Record<"home" | "platform" | "commercial" | "homes" | "solar", readonly FaqId[]>;

export const commercialPage = {
  eyebrow: "Commercial system",
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
    eyebrow: "How it works",
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
    eyebrow: "The software",
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
    eyebrow: "Over time",
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
    eyebrow: "Pilot program",
    headline: "A small number of buildings, first.",
    body: "We are preparing a pilot program for commercial buildings under 70 metres in Sydney. If you own or manage one, book a conversation and we will walk you through what the pilot involves.",
    cta: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
    links: [{ label: "Investor enquiries", href: "/register-interest?type=investor" }],
    image: { id: "h0-hero-still", alt: "The Lienry drone washing a glass curtain wall, its tether rising to the roof", position: "50% 50%" },
  },
};

export const homesPage = {
  eyebrow: "Home system",
  headline: "Your property, cleaned from anywhere.",
  emphasis: "from anywhere.",
  lead: "A waterproof ground pod, a drone that knows each material, and an app that starts the clean wherever you are. For houses, apartments, rental properties and solar farms.",
  heroImageId: "ho1-homes-hero",
  heroAlt: "The Lienry ground pod beside a house at first light, the drone washing a window",
  // The render is 21:9 and the split hero shows it at 16:9: the crop position for that frame (C4 section 1).
  heroPosition: "60% 50%",
  actions: {
    primary: { label: "Register interest", href: "/register-interest?type=homeowner" },
    secondary: { label: "I own rentals", href: "/register-interest?type=landlord" },
  },
  steps: {
    eyebrow: "How it works",
    headline: "Set up once. Start from anywhere.",
    intro: "Four steps from a new pod to a clean you start from your phone.",
    track: { label: "Setup steps. Use left and right arrow keys to browse.", prevLabel: "Previous step", nextLabel: "Next step" },
    items: [
      {
        n: "01",
        title: "The pod goes in",
        body: "A waterproof ground pod powers the drone and feeds it water through the tether.",
        image: { id: "m3-pod-master", alt: "The ground pod open beside a garden tap", position: "30% 50%" },
      },
      {
        n: "02",
        title: "The property is mapped",
        body: "A detailed scan maps the property so the drone knows every surface it can reach.",
        image: { id: "p3-house", alt: "The home drone washing the front windows of a suburban house", position: "50% 50%" },
      },
      {
        n: "03",
        title: "Choose what to clean",
        body: "Pick the surfaces in your personalised app. The drone identifies each material and adjusts its pressure; you can change it if you want to.",
        image: { id: "p4-rental", alt: "The home drone over rooftop solar panels on a rental townhouse", position: "50% 40%" },
      },
      {
        n: "04",
        title: "Start from anywhere",
        body: "Tap start from wherever you are and follow the progress on your phone or the desktop software.",
        image: { id: "p5-solar-farm", alt: "The home drone low over a solar farm row, its tether running back to the pod", position: "50% 60%" },
      },
    ],
  },
  app: {
    eyebrow: "The app",
    headline: "Made for the way you own property.",
    items: [
      { title: "Start a clean remotely", body: "From another suburb or another country." },
      { title: "Choose the areas", body: "The driveway before an inspection, the panels after a dusty week." },
      { title: "Pressure by material", body: "Glass, panels, render, roofing and concrete each get the pressure they should." },
      { title: "Desktop software too", body: "The same control on a bigger screen, with the scan and the progress side by side." },
    ],
  },
  statsHeadline: "Why it matters in Australia.",
  statsIntro: "Two cited figures about the homes the system is designed for.",
  statsAction: { label: "I own rentals", href: "/register-interest?type=landlord" },
  close: {
    headline: "Tell us about your property.",
    body: "Homes, apartments, rental properties and solar farms. We are pre-launch and reply personally.",
    primary: { label: "Register interest", href: "/register-interest?type=homeowner" },
    links: [{ label: "I own rentals", href: "/register-interest?type=landlord" }],
    image: { id: "so2-solar-closeup", alt: "Water beading on a clean solar panel", position: "50% 50%" },
  },
};

export const solarPage = {
  eyebrow: "Solar",
  headline: "A cleaner surface for solar.",
  emphasis: "for solar.",
  lead: "Dust and grime cost solar owners real energy. Lienry treats a panel as its own material, sets the pressure to match, and cleans on the interval you choose.",
  heroImageId: "so1-solar-hero",
  heroAlt: "A solar farm row at first light with the Lienry drone low over the panels",
  actions: {
    primary: { label: "Register interest", href: "/register-interest?type=homeowner" },
    secondary: { label: "See the home system", href: "/homes-and-rentals" },
  },
  closeImageId: "so2-solar-closeup",
  statsHeadline: "What soiling costs.",
  statsIntro: "These figures are from peer-reviewed and international sources; each is cited.",
  how: {
    eyebrow: "How Lienry cleans panels",
    headline: "The right pressure, on your schedule.",
    emphasis: "on your schedule.",
    intro: "The home system cleans rooftop panels and solar farm rows from the same ground pod.",
    tabsLabel: "How the home system cleans panels",
    items: [
      {
        id: "panels",
        tab: "Panels",
        label: "01 · Panels",
        title: "It knows a panel is a panel",
        body: "During a clean the drone identifies each material it is cleaning and adjusts its pressure to suit.",
        facts: [
          { term: "Material", text: "Identified during the clean" },
          { term: "Pressure", text: "Set for solar glass, adjustable in the app" },
          { term: "Water", text: "Fed through the tether, so the drone never carries it" },
        ],
        image: { id: "so2-solar-closeup", alt: "Water beading on a solar panel", position: "50% 50%" },
      },
      {
        id: "roofs-and-farms",
        tab: "Roofs and farms",
        label: "02 · Roofs and farms",
        title: "Roofs and farms",
        body: "Rooftop solar is cleaned by the home system from a ground pod. Solar farms use the same pod and tether.",
        facts: [
          { term: "Rooftops", text: "The home system, working from a ground pod" },
          { term: "Solar farms", text: "The same pod and tether" },
          { term: "People on site", text: "None during a clean" },
        ],
        image: { id: "p5-solar-farm", alt: "The home drone passing low over a row of solar panels", position: "50% 60%" },
      },
      {
        id: "interval",
        tab: "Your interval",
        label: "03 · Your interval",
        title: "Your interval",
        body: "Set how often the drone should check and clean, and change it in the app whenever conditions change.",
        facts: [
          { term: "Interval", text: "How often the drone checks and cleans" },
          { term: "Changes", text: "Adjust it in the app whenever conditions change" },
          { term: "Start", text: "Start a clean yourself from the app, from anywhere" },
        ],
        image: { id: "y2-story-panels", alt: "The home drone over rooftop panels, half the array already clean", position: "50% 45%" },
      },
    ],
  },
  close: {
    headline: "Rooftop or solar farm, tell us about it.",
    body: "We are pre-launch. Register interest and we will let you know as the pilot program takes shape.",
    primary: { label: "Register interest", href: "/register-interest?type=homeowner" },
    links: [{ label: "See the home system", href: "/homes-and-rentals" }],
    image: { id: "m3-pod-master", alt: "The Lienry ground pod open beside a garden tap, the home drone inside", position: "35% 50%" },
  },
};

/** The sibling product cards on /commercial, /homes-and-rentals and /solar. A page never shows its own card. */
export const siblings = {
  headline: "The rest of the platform.",
  intro: "Both systems share one platform: the scan, the desktop software and a clean with nobody on site.",
  link: { label: "See the platform", href: "/platform" },
  cards: {
    commercial: {
      title: "Commercial system",
      body: "A roof capsule for commercial buildings under 70 metres.",
      href: "/commercial",
      image: { id: "c1-commercial-hero", alt: "The Lienry roof capsule on a plant deck at dawn", position: "60% 55%" },
    },
    homes: {
      title: "Home system",
      body: "A ground pod for homes, rentals and solar farms, run from your phone.",
      href: "/homes-and-rentals",
      image: { id: "ho1-homes-hero", alt: "The Lienry ground pod beside a house at first light", position: "60% 50%" },
    },
    solar: {
      title: "Solar",
      body: "Panels cleaned at the right pressure, on the interval you set.",
      href: "/solar",
      image: { id: "so1-solar-hero", alt: "A solar farm row at first light with the Lienry drone low over the panels", position: "50% 50%" },
    },
  },
};

export const companyPage = {
  eyebrow: "Company",
  headline: "Built in Sydney for the buildings people own.",
  emphasis: "for the buildings people own.",
  statement:
    "Lienry Drones is a Sydney company at concept stage. We are building a resident cleaning drone that lives on a property and keeps its exterior clean with nobody on site, and we are raising our pre-seed round to build it.",
  heroImageId: "co1-company",
  heroAlt: "A harbour-side street of mid-rise buildings at dawn",
  founders: {
    eyebrow: "Founders",
    headline: "Two founders, one building at a time.",
    // The co-founder stays unpublished, with no name or title, until the owner supplies them.
    people: [
      { name: "Liam Kennedy", title: "Founder and CEO", bio: "Liam leads Lienry Drones from Sydney with his co-founder.", photo: null, published: true },
      { name: "Co-founder", title: "", bio: "", photo: null, published: false },
    ] satisfies FounderEntry[],
  },
  where: {
    eyebrow: "Where we are",
    headline: "Concept stage, pre-seed, pilot in preparation.",
    body: "Everything on this site describes the design. None of it is in service yet.",
    image: { id: "s6-automation", alt: "The roof capsule open at dawn, the drone rising from its cradle", position: "50% 40%" },
    items: [
      { title: "Concept stage", body: "The platform, the two systems and the software are designed. We are building toward a pilot." },
      { title: "Raising pre-seed", body: "We are raising a pre-seed round to build and pilot the system." },
      { title: "Pilot program", body: "A small number of commercial buildings under 70 metres in Sydney, first." },
      { title: "Sydney, Australia", body: "Designed for Australian buildings, weather and property owners." },
    ],
  },
  values: {
    eyebrow: "How we work",
    headline: "Three rules we build by.",
    body: "The rules behind every decision on the platform and on this site.",
    image: { id: "f3-surface", alt: "The drone's spray bar, pad and roller on a pane of glass", position: "50% 50%" },
    items: [
      { title: "Honest by default", body: "We only say what we can stand behind. No invented customers, results or approvals, and every statistic on this site is cited to its source." },
      { title: "Safe by design", body: "The tether, the obstacle-avoidance camera, the onboard surface checks and the weatherproof dock are the design, not add-ons. Safety is not left to supervision." },
      { title: "Built for owners", body: "Every decision is measured against one question: does this make a property easier to own? If it does not, it does not ship." },
    ],
  },
  exploring: {
    eyebrow: "In development",
    headline: "What we are exploring.",
    body: "For some sites we are exploring a hose-free model. It is an idea in development, not a product, and it is not part of the pilot program.",
  },
  investors: {
    eyebrow: "Investors",
    headline: "Talk to us about the pre-seed round.",
    body: "If you invest in hardware, property technology or automation, we would like to walk you through the platform, the two systems and the pilot plan.",
    note: "Liam Kennedy, our founder and CEO, replies directly.",
    cta: { label: "Investor enquiries", href: "/register-interest?type=investor" },
    links: [
      { label: "Register interest", href: "/register-interest" },
      { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
    ],
    image: { id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", position: "50% 50%" },
  },
};

export const registerPage = {
  eyebrow: "Register interest",
  headline: "Tell us about your property.",
  lead: "Whether you own a home, manage a building, hold rentals or invest, we would like to hear from you. Lienry is pre-launch, and we reply personally.",
  image: { id: "h0-hero-still", alt: "The Lienry drone washing a glass curtain wall, its tether rising to the roof", position: "60% 50%" },
  success: {
    headline: "Thanks, we have your details.",
    body: "We will be in touch as the pilot program takes shape. If you asked about the pre-seed round, Liam will reply directly.",
  },
};

export const privacyPage = {
  eyebrow: "Privacy",
  headline: "Privacy policy.",
  updated: "September 2026",
  sections: [
    {
      title: "Who we are",
      body: "Lienry Drones is a Sydney-based company at concept stage. This policy explains what we collect through this website and how we use it. It should be reviewed by a legal adviser before launch.",
    },
    {
      title: "What we collect",
      body: "When you register interest we collect the details you give us: your name, email address, phone number if you provide it, the type of property you are asking about, its location, your message, and which kind of enquiry you selected.",
    },
    {
      title: "How we use it",
      body: "We use your details to reply to your enquiry, to keep you informed about the pilot program and the product, and to understand which kinds of properties people are asking about. We do not sell your details and we do not share them with advertisers.",
    },
    {
      title: "Where it is stored",
      body: "Enquiries are sent to the email address or service we nominate for handling them. We keep them only as long as we need them to respond to you and to run the pilot program.",
    },
    {
      title: "Cookies and analytics",
      body: "This site does not set advertising cookies. If we add privacy-respecting analytics we will update this policy.",
    },
    {
      title: "Your rights",
      body: "You can ask us what we hold about you, ask us to correct it, or ask us to delete it, in line with the Australian Privacy Principles. Contact us using the details on the Company page.",
    },
  ],
};
