// Home page copy. Conventions shared with pages.ts:
// - `emphasis` is always the trailing phrase of its `headline`; `Headline` sets it in the italic.
// - Images are ImageRef-compatible `{ id, alt, position }`, where `id` is a still in scripts/media/manifest.json.
// - Links are Action-compatible `{ label, href }`.

export const hero = {
  headline: "Clean exteriors. Nobody on site.",
  emphasis: "Nobody on site.",
  support:
    "A resident cleaning drone for the property you own.",
  primary: { label: "Register interest", href: "/register-interest" },
  secondary: { label: "See how it works", href: "#system" },
  videoId: "h1-hero-film" as const,
  posterId: "h0-hero-still" as const,
};

export const propertyStrip = {
  label: "Built for",
  items: [
    { label: "Commercial buildings under 70 m", href: "/commercial" },
    { label: "Apartment buildings", href: "/commercial" },
    { label: "Homes", href: "/homes-and-rentals" },
    { label: "Rental properties", href: "/homes-and-rentals" },
    { label: "Solar farms", href: "/solar" },
  ],
} as const;

/** The three things a buyer chooses between. The third card shows the app panel as a coded fragment, not a render. */
export const productCards = {
  headline: "The right system for your property.",
  intro: "A roof capsule for commercial buildings under 70 metres, or a ground pod for homes, rentals and solar farms. Both run from the desktop software, and the home system adds a phone app.",
  cards: [
    {
      meta: "For buildings under 70 metres",
      title: "Commercial system",
      body: "A weatherproof capsule on the roof, a tether fed from above, and desktop software that runs the whole building.",
      link: { label: "Commercial system", href: "/commercial" },
      image: { id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", position: "50% 50%" },
    },
    {
      meta: "For houses, apartments, rentals and solar farms",
      title: "Home system",
      body: "A waterproof ground pod, a drone that knows each material, and an app that starts the clean wherever you are.",
      link: { label: "Home system", href: "/homes-and-rentals" },
      image: { id: "m3-pod-master", alt: "The Lienry ground pod open beside a garden tap, the home drone inside", position: "35% 50%" },
    },
    {
      meta: "For the home system",
      title: "Phone app",
      body: "Start a clean from another suburb or another country. Choose the areas, and the drone sets the pressure for each material.",
      link: { label: "See the app", href: "/homes-and-rentals#story" },
      fragment: { ariaLabel: "Illustrative phone app, demo data: driveway and solar panels selected, ready to start a clean", note: "Illustrative app interface. Demo data." },
    },
  ],
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

export const places = {
  headline: "Built around your property.",
  emphasis: "your property.",
  intro: "Five kinds of property, one platform. Each card shows which system does the work and opens its page.",
  track: { label: "Property types. Use left and right arrow keys to browse.", prevLabel: "Previous property", nextLabel: "Next property" },
  // Each card's image alt is "{title}: {body}". The renders are 2:3 portraits, so `position` sets the 4:5 crop.
  cards: [
    { id: "p1-tower", title: "Commercial towers", body: "Glass, walls and roofing on buildings under 70 metres, cleaned from a roof capsule.", system: "Commercial system", href: "/commercial", position: "50% 50%" },
    { id: "p2-apartments", title: "Apartment buildings", body: "Facades, glass and common roofing without contractors working at height.", system: "Commercial system", href: "/commercial", position: "50% 50%" },
    { id: "p3-house", title: "Homes", body: "Windows, walls, roofing and the driveway, started from the app.", system: "Home system", href: "/homes-and-rentals", position: "50% 50%" },
    { id: "p4-rental", title: "Rental properties", body: "Ready for the next tenant without booking a cleaner.", system: "Home system", href: "/homes-and-rentals", position: "50% 50%" },
    { id: "p5-solar-farm", title: "Solar farms", body: "Panels cleaned on the interval you set, with pressure matched to the panel.", system: "Home system", href: "/solar", position: "50% 60%" },
  ],
};

export const filmBand = {
  videoId: "c2-commercial-clip" as const,
  stillId: "c1-commercial-hero" as const,
  headline: "The building checks itself.",
  body: "The capsule stays on the roof between cleans. When the scan says the glass needs it, the drone goes out, washes and comes home. Nobody books it. Nobody attends it.",
  cta: { label: "The commercial system", href: "/commercial" },
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

export const landlordStory = {
  headline: "Your property. Wherever you are.",
  emphasis: "Wherever you are.",
  intro: "You own a rental in Sydney and live overseas. The driveway and the solar panels need a clean before the next tenant moves in.",
  beats: [
    { title: "Open the app.", body: "Your property is already mapped. The app shows every surface the drone can reach.", imageId: "y1-story-before", app: "map" },
    { title: "Select the driveway and the solar panels.", body: "Choose only what needs cleaning. The drone sets the pressure for each material.", imageId: "y1-story-before", app: "select" },
    { title: "Tap start.", body: "The pod powers the drone, the tether feeds it water, and the clean begins.", imageId: "y2-story-panels", app: "start" },
    { title: "The drone cleans while nobody is there.", body: "No cleaners to book, no outsourcing cost, no one on site.", imageId: "y3-story-driveway", app: "progress" },
    { title: "Ready for the next tenant, sooner.", body: "You get the progress on your phone from wherever you are.", imageId: "y5-story-done", app: "done" },
  ],
};

/** Strings for the illustrative app panel. Demo data: nothing here is a real property or a real clean. */
export const appPanel = {
  property: "Rental, Sydney",
  prompt: "Choose the areas for this clean",
  rows: ["Driveway", "Solar panels", "Windows"],
  rowState: { select: "Selected", start: "Starting", progress: ["31%", "64%"], done: "Complete" },
  buttons: { map: "Choose surfaces", select: "Start clean", start: "See progress", progress: "See the finished clean", done: "Start again" },
  status: { map: "Choose the areas for this clean.", select: "Driveway and solar panels selected.", start: "Clean started.", progress: "Cleaning in progress: driveway 31%, solar panels 64%.", done: "Clean complete." },
  note: "Illustrative app interface.",
};


export const visionLetter = {
  headline: "Why we are building Lienry.",
  paragraphs: [
    "Buildings get dirty on a schedule that has nothing to do with when anyone is free to clean them. Owners book contractors, wait, pay, and repeat, and every job puts someone at height.",
    "We are building a drone that lives on the property instead. It maps the building, decides when a clean is due, treats every surface as its own material, and reports back to your phone. Nobody has to be there.",
    "Lienry is at concept stage in Sydney and we are raising our pre-seed round. If you own or manage a building, or you invest in the companies that serve them, we would like to hear from you.",
  ],
  signature: { name: "Liam Kennedy", title: "Founder and CEO, Lienry Drones" },
  image: { id: "co1-company", alt: "A harbour-side street of mid-rise buildings at dawn", position: "50% 50%" },
};

export const safety = {
  headline: "Safety starts with the design.",
  items: [
    { id: "f1-tether", title: "Tether", body: "A water tether connects the drone to its dock for the whole clean, so it always works on a fixed line close to the building." },
    { id: "f2-camera", title: "Obstacle-avoidance camera", body: "A forward camera watches for obstacles and keeps the drone clear of the building and its fixtures." },
    { id: "f3-surface", title: "Onboard surface checks", body: "The drone identifies the material in front of it and checks the surface before it sets the pressure and washes." },
    { id: "f4-dock", title: "Weatherproof dock", body: "Between cleans the drone is sheltered and charged in its weatherproof roof capsule or waterproof ground pod." },
  ],
  note: "Lienry Drones is at concept stage and is not yet operating. We are preparing a pilot program for commercial buildings.",
  track: { label: "Safety details. Use left and right arrow keys to browse.", prevLabel: "Previous detail", nextLabel: "Next detail" },
};

export const closing = {
  headline: "Help shape what comes next.",
  body: "Register interest for your home or rental, book a place in the commercial pilot program, or talk to us about the pre-seed round.",
  imageId: "ho1-homes-hero",
  imageAlt: "The Lienry ground pod beside a house at first light, the drone washing a window",
  imagePosition: "60% 50%",
  buttons: [
    { label: "Register interest", href: "/register-interest?type=homeowner", variant: "primary" },
    { label: "Book a pilot conversation", href: "/register-interest?type=commercial", variant: "secondary" },
    { label: "Investor enquiries", href: "/register-interest?type=investor", variant: "secondary" },
  ],
} as const;
