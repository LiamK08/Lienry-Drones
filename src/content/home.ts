export const hero = {
  eyebrow: "Resident exterior cleaning",
  headline: "Clean exteriors. Nobody on site.",
  support:
    "A resident cleaning drone that lives on your property and washes glass, solar panels, walls, roofing and driveways on buildings under 70 metres. Start a clean from anywhere.",
  primary: { label: "Register interest", href: "/register-interest" },
  secondary: { label: "See how it works", href: "#system" },
  videoId: "h1-hero-film",
  posterId: "h0-hero-still",
};

export const propertyStrip = {
  label: "Built for",
  items: [
    { label: "Commercial buildings under 70 m", icon: "tower" },
    { label: "Apartment buildings", icon: "apartments" },
    { label: "Homes", icon: "house" },
    { label: "Rental properties", icon: "key" },
    { label: "Solar farms", icon: "solar" },
  ],
} as const;

export const systemExplainer = {
  eyebrow: "The system",
  headline: "One drone. Six parts that run themselves.",
  intro: "Lienry is one platform. Every part has one job, and together they clean a building without anyone attending.",
  tabs: [
    {
      id: "dock",
      tab: "Dock",
      title: "A home on the property",
      body: "On a commercial building the drone lives in a weatherproof capsule on the roof. On a house or a solar farm it lives in a waterproof ground pod. Either way it is powered, sheltered and ready.",
      imageId: "s1-dock",
      readout: "Roof capsule or ground pod",
    },
    {
      id: "tether",
      tab: "Tether",
      title: "Water and power, always connected",
      body: "A thin tether feeds the drone water for the whole clean. On the roof it is fed from above; from the ground pod it runs from the same line that powers the pod. Nothing is carried, so nothing runs out.",
      imageId: "s2-tether",
      readout: "Fed from the dock",
    },
    {
      id: "drone",
      tab: "Drone",
      title: "Built to wash, not to fly far",
      body: "The drone flies short, planned routes across glass, solar panels, walls, roofing and driveways, keeping its tether clear and its sensors on the surface in front of it.",
      imageId: "m1-drone-master",
      readout: "Five surfaces",
    },
    {
      id: "scan",
      tab: "Scan",
      title: "It maps the building first",
      body: "Before the first clean the drone scans the property to map its structure and dimensions. On commercial buildings it re-scans every two days and decides whether a clean is needed. You can change the interval in settings.",
      imageId: "s4-scan",
      readout: "Re-scan every 2 days",
    },
    {
      id: "software",
      tab: "Software",
      title: "Everything runs from your desk or your phone",
      body: "The scan uploads to desktop software that runs everything: it sets water pressure and where to wash, shows a 3D model of the building, tracks live wash progress and shades areas of built-up debris. Home owners get a personalised mobile app as well.",
      imageId: "s5-software",
      readout: "3D model, live progress, debris shading",
    },
    {
      id: "automation",
      tab: "Automation",
      title: "Nobody has to be there",
      body: "Once it is set up, the system runs itself. Start a clean from anywhere, or let the re-scan decide. No cleaners to book, no one on site.",
      imageId: "s6-automation",
      readout: "0 people on site",
    },
  ],
};

export const buildingSection = {
  eyebrow: "Software view",
  headline: "The software sees the whole building.",
  body: "Every clean starts from the scan. The model shows what the desktop software tracks: the scan sweep, live wash progress, and the areas where debris has built up.",
  legend: [
    { key: "scanned", label: "Scanned" },
    { key: "washed", label: "Washed" },
    { key: "debris", label: "Debris build-up" },
  ],
  note: "Model is illustrative. The software renders the real building from its scan.",
  videoId: "s5-software-clip",
};

export const twoSystems = {
  eyebrow: "Two systems",
  headline: "One platform, two ways to live on a property.",
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
  eyebrow: "Where it works",
  headline: "Built for the buildings people own.",
  cards: [
    { id: "p1-tower", title: "Commercial towers", body: "Glass, walls and roofing on buildings under 70 metres, cleaned from a roof capsule.", system: "Commercial system" },
    { id: "p2-apartments", title: "Apartment buildings", body: "Facades, glass and common roofing without contractors working at height.", system: "Commercial system" },
    { id: "p3-house", title: "Homes", body: "Windows, walls, roofing and the driveway, started from the app.", system: "Home system" },
    { id: "p4-rental", title: "Rental properties", body: "Ready for the next tenant without booking a cleaner.", system: "Home system" },
    { id: "p5-solar-farm", title: "Solar farms", body: "Panels cleaned on the interval you set, with pressure matched to the panel.", system: "Home system" },
  ],
};

export const filmBand = {
  videoId: "c2-commercial-clip",
  stillId: "c1-commercial-hero",
  eyebrow: "Every two days",
  headline: "The building checks itself.",
  body: "On a commercial building the drone re-scans every two days and decides whether a clean is needed. Nobody books it. Nobody attends it.",
  cta: { label: "The commercial system", href: "/commercial" },
};

export const landlordStory = {
  eyebrow: "How it feels",
  headline: "Between tenants, from another country.",
  intro: "You own a rental in Sydney and live overseas. The driveway and the solar panels need a clean before the next tenant moves in.",
  beats: [
    { title: "Open the app.", body: "Your property is already mapped. The app shows every surface the drone can reach.", imageId: "y1-story-before", app: "map" },
    { title: "Select the driveway and the solar panels.", body: "Choose only what needs cleaning. The drone sets the pressure for each material.", imageId: "y1-story-before", app: "select" },
    { title: "Tap start.", body: "The pod powers the drone, the tether feeds it water, and the clean begins.", imageId: "y2-story-panels", app: "start" },
    { title: "The drone cleans while nobody is there.", body: "No cleaners to book, no outsourcing cost, no one on site.", imageId: "y3-story-driveway", app: "progress" },
    { title: "Ready for the next tenant, sooner.", body: "You get the progress on your phone from wherever you are.", imageId: "y5-story-done", app: "done" },
  ],
};

export const counters = {
  eyebrow: "By design",
  items: [
    { value: 2, suffix: "", unit: "days", label: "between re-scans on commercial buildings, and you can change it" },
    { value: 0, suffix: "", unit: "people", label: "on site during a clean" },
    { value: 70, suffix: "", unit: "m", label: "maximum building height" },
    { value: 5, suffix: "", unit: "surfaces", label: "glass, solar panels, walls, roofing and driveways" },
    { value: 2, suffix: "", unit: "systems", label: "on one drone platform" },
  ],
};

export const visionLetter = {
  eyebrow: "From the founder",
  headline: "Why we are building Lienry.",
  paragraphs: [
    "Buildings get dirty on a schedule that has nothing to do with when anyone is free to clean them. Owners book contractors, wait, pay, and repeat, and every job puts someone at height.",
    "We are building a drone that lives on the property instead. It maps the building, decides when a clean is due, treats every surface as its own material, and reports back to your phone. Nobody has to be there.",
    "Lienry is at concept stage in Sydney and we are raising our pre-seed round. If you own or manage a building, or you invest in the companies that serve them, we would like to hear from you.",
  ],
  signature: { name: "Liam Kennedy", title: "Founder and CEO, Lienry Drones" },
  cofounder: { name: "Co-founder", title: "Name and title to come" },
};

export const safety = {
  eyebrow: "Safety by design",
  headline: "Safe by design, not by supervision.",
  items: [
    { id: "f1-tether", title: "Tether", body: "A water tether connects the drone to its dock for the whole clean, so it always works on a fixed line close to the building." },
    { id: "f2-camera", title: "Obstacle-avoidance camera", body: "A forward camera watches for obstacles and keeps the drone clear of the building and its fixtures." },
    { id: "f3-surface", title: "Onboard surface checks", body: "The drone identifies the material in front of it and checks the surface before it sets the pressure and washes." },
    { id: "f4-dock", title: "Weatherproof dock", body: "Between cleans the drone is sheltered and charged in its weatherproof roof capsule or waterproof ground pod." },
  ],
  note: "Lienry Drones is at concept stage and is not yet operating. We are preparing a pilot program for commercial buildings.",
};

export const closing = {
  headline: "Be first on the roof.",
  body: "Register interest for your home or rental, book a place in the commercial pilot program, or talk to us about the pre-seed round.",
  imageId: "m3-pod-master",
  buttons: [
    { label: "Register interest", href: "/register-interest?type=homeowner", variant: "primary" },
    { label: "Book a pilot for commercial buildings", href: "/register-interest?type=commercial", variant: "secondary" },
    { label: "Investor enquiries", href: "/register-interest?type=investor", variant: "secondary" },
  ],
} as const;
