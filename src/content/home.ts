// Home page copy, and only the home page's objects (the inner pages' copy is one module per route).
// Conventions shared with every content module:
// - `emphasis` is always the trailing phrase of its `headline`; `Headline` sets it in the italic.
// - Images are `{ id, alt, position }`, where `id` is a still in scripts/media/manifest.json.
// - Links are `{ label, href }`.
// - Facts come from docs/SITE-PLAN.md only. Nothing here claims a customer, result, price, saving or
//   approval. Figures are design intent (marked as such) or cited in src/content/stats.ts.

export const hero = {
  headline: "Clean exteriors. Nobody on site.",
  emphasis: "Nobody on site.",
  support: "A cleaning drone that lives on your property, maps it, and washes glass, panels, walls, roofing and driveways.",
  primary: { label: "See how it works", href: "#how" },
  secondary: { label: "Check your building", href: "#fit-check" },
  videoId: "h1-hero-film" as const,
  posterId: "h0-hero-still" as const,
};

/** The slow strip of words under the hero: what the system is designed for. */
export const strip = {
  label: "Designed for",
  // Not customers or partners: the kinds of property and surface the system is designed for, set as marks.
  items: [
    { label: "Glass facades", icon: "building" },
    { label: "Solar panels", icon: "sun" },
    { label: "Rendered walls", icon: "layers" },
    { label: "Metal roofing", icon: "home" },
    { label: "Driveways", icon: "grid" },
    { label: "Office towers", icon: "building" },
    { label: "Apartment blocks", icon: "apartments" },
    { label: "Rental homes", icon: "key" },
    { label: "Solar farms", icon: "sun" },
  ],
};

export const why = {
  eyebrow: "Why it matters",
  headline: "Clean glass shouldn't need someone on a rope.",
  intro: "Lienry is a drone that lives on the property and cleans its exterior on a schedule, with nobody working at height.",
};

/** The fit check: seven yes, partly or no questions drawn from the design brief, scored live. */
export const fitCheck = {
  eyebrow: "Fit check · 1 minute",
  title: "Is your building a fit?",
  intro: "Seven questions from the design brief. Mark where you stand.",
  groups: [
    {
      label: "The building",
      questions: [
        { id: "height", text: "It is under 70 metres tall" },
        { id: "dock", text: "There is room on the roof or the ground for a dock" },
        { id: "supply", text: "Water and power are close to that spot" },
      ],
    },
    {
      label: "The clean",
      questions: [
        { id: "surfaces", text: "Most of the exterior is glass, panels, render, roofing or paving" },
        { id: "regular", text: "You pay for exterior cleaning at least once a year" },
        { id: "height-work", text: "You would rather nobody worked at height" },
        { id: "remote", text: "You want to start a clean without booking anyone" },
      ],
    },
  ],
  answers: [
    { id: "yes", label: "Yes", score: 1 },
    { id: "partly", label: "Partly", score: 0.5 },
    { id: "no", label: "No", score: 0 },
  ],
  panel: {
    label: "Your fit",
    answered: "{n} of 7 answered",
    empty: "Your result appears here as you answer.",
    verdicts: [
      { min: 6, title: "A strong fit", body: "Your building matches the design closely. Register interest and we will be in touch about the pilot." },
      { min: 4, title: "A likely fit", body: "Most of it matches. The points below are worth a conversation before a pilot." },
      { min: 0, title: "Worth a conversation", body: "Some of it may not match the design yet. Tell us about the building and we will say what we can." },
    ],
    gaps: "Worth discussing",
    primary: { label: "Register interest", href: "/register-interest" },
    secondary: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
    note: "Indicative only, from the design brief. Site requirements are still being finalised.",
  },
};

/** Five tall cards that widen on hover. Icons are drawn in ExpandCards. */
export const benefits = {
  eyebrow: "Why Lienry",
  headline: "What changes when the drone lives on site.",
  intro: "Five things a resident system does that a booked crew cannot.",
  cards: [
    {
      icon: "shield",
      title: "Nobody at height",
      body: "The drone works on a tether from its dock, so nobody goes up on a rope or a lift.",
      image: { id: "p1-tower", alt: "The commercial drone mid-clean on a glass office building, its tether rising to the roof", position: "50% 40%" },
    },
    {
      icon: "repeat",
      title: "Cleaner, more often",
      body: "On commercial buildings it re-scans every two days and cleans when the scan says so.",
      image: { id: "p2-apartments", alt: "The drone washing the balcony glass of an apartment building", position: "50% 40%" },
    },
    {
      icon: "sliders",
      title: "The right pressure",
      body: "Glass, panels, render, roofing and paving each get the pressure they need.",
      image: { id: "p3-house", alt: "The home drone washing the front windows of a suburban house", position: "50% 40%" },
    },
    {
      icon: "phone",
      title: "Started from\u00a0anywhere",
      body: "On the home system, start a clean from the app wherever you are.",
      image: { id: "p4-rental", alt: "The home drone over rooftop solar panels on a rental townhouse", position: "50% 40%" },
    },
    {
      icon: "record",
      title: "Every clean on record",
      body: "The desktop software shows what was cleaned, when, and what is due next.",
      image: { id: "y2-story-panels", alt: "The drone washing rooftop solar panels, half the array clean and wet", position: "50% 45%" },
    },
  ],
};

/** How a clean runs: five timed steps over one large picture. */
export const how = {
  eyebrow: "How it works",
  headline: "From scan to report, on its own.",
  emphasis: "on its own.",
  intro: "Every clean follows the same five steps, planned on a model of your building.",
  label: "Steps of a clean",
  steps: [
    { id: "scan", n: "01", who: "The drone", tab: "Scans it", title: "Maps the building first.", body: "Structure and dimensions, before the first clean.", image: { id: "s4-scan", alt: "The drone holding off the corner of a glass building to scan it", position: "50% 40%" } },
    { id: "plan", n: "02", who: "The software", tab: "Plans it", title: "Every zone gets a plan.", body: "Surface, pressure and route for each part of the building.", image: { id: "s5-software", alt: "A laptop showing the desktop software's shaded 3D building", position: "50% 50%" } },
    { id: "clean", n: "03", who: "The drone", tab: "Cleans it", title: "Washes with nobody on site.", body: "Water through the tether, two passes per floor.", image: { id: "m1-drone-master", alt: "The Lienry drone washing a glass wall, its spray bar on the pane", position: "50% 50%" } },
    { id: "check", n: "04", who: "The scan", tab: "Checks it", title: "Looks again.", body: "A re-scan shades where debris has built up.", image: { id: "f2-camera", alt: "The drone's sensor strip and scanning sensor, close up", position: "50% 45%" } },
    { id: "report", n: "05", who: "The software", tab: "Reports it", title: "Back to the dock, on record.", body: "What was cleaned, and when the next clean is due.", image: { id: "s6-automation", alt: "The roof capsule open at dawn, the drone above its cradle", position: "50% 40%" } },
  ],
};

/** Three settings, each a card with design figures (or cited figures, for solar). */
export const systems = {
  eyebrow: "Three settings",
  headline: "Built for the buildings you own.",
  intro: "One platform on a roof, beside a house or along a solar row. Figures are design intent at concept stage, not results.",
  link: { label: "See the platform", href: "/platform" },
  // Each card's statement is Lienry's own design intent, attributed to the design brief: these are not
  // testimonials, and the figures are design intent (commercial, homes) or cited (solar).
  source: { name: "Lienry design brief", role: "Concept stage, not a result" },
  cards: [
    {
      id: "commercial",
      name: "Commercial",
      sub: "Office and apartment buildings · Roof capsule",
      statement: "A capsule on the roof feeds the drone from above, and the desktop software runs the whole building.",
      figures: [
        { value: "<70 m", label: "Building height" },
        { value: "2 days", label: "Re-scan interval" },
        { value: "0", label: "People at height" },
      ],
      link: { label: "The commercial system", href: "/commercial" },
    },
    {
      id: "homes",
      name: "Homes and rentals",
      sub: "Houses, townhouses and rentals · Ground pod",
      statement: "A ground pod powers the drone and feeds it water. You start the clean from your phone.",
      figures: [
        { value: "5", label: "Surface types" },
        { value: "1", label: "Ground pod" },
        { value: "0", label: "Crews to book" },
      ],
      link: { label: "The home system", href: "/homes-and-rentals" },
    },
    {
      id: "solar",
      name: "Solar",
      sub: "Rooftop arrays and solar farm rows · Cited figures",
      statement: "Panels are cleaned at the pressure set for solar glass, on the interval you choose.",
      // Cited figures from src/content/stats.ts, by id.
      cited: ["unsw-soiling", "iea-soiling", "cer-rooftop"],
      link: { label: "Solar", href: "/solar" },
    },
  ],
};

/** The dark band of link cards into the rest of the site. Filters by kind. */
export const explore = {
  eyebrow: "Explore",
  headline: "Inside the platform",
  link: { label: "See the platform", href: "/platform" },
  filters: ["All", "Systems", "Platform", "Tools", "Company"],
  cards: [
    { kind: "Systems", tag: "Commercial", title: "A capsule on the roof, and nobody on a rope", href: "/commercial", image: { id: "c1-commercial-hero", alt: "The roof capsule on a plant deck at dawn", position: "75% 50%" } },
    { kind: "Systems", tag: "Homes", title: "Homes and rentals, cleaned from your phone", href: "/homes-and-rentals", image: { id: "ho1-homes-hero", alt: "The ground pod beside a house, the drone washing a window", position: "45% 50%" } },
    { kind: "Systems", tag: "Solar", title: "Solar panels at the right pressure", href: "/solar", image: { id: "so2-solar-closeup", alt: "Water beading on a clean solar panel", position: "50% 50%" } },
    { kind: "Platform", tag: "Platform", title: "Six parts of one platform", href: "/platform", image: { id: "m2-capsule-master", alt: "The roof capsule open, the drone on its cradle", position: "50% 50%" } },
    { kind: "Tools", tag: "Fit check", title: "Seven questions: is your building a fit?", href: "/fit-check", image: { id: "p5-solar-farm", alt: "The drone low over a solar farm row", position: "50% 60%" } },
    { kind: "Tools", tag: "Calculator", title: "What outsourced cleaning adds up to", href: "/calculator", image: { id: "f4-dock", alt: "Rain beading on the closed lid of the roof capsule", position: "50% 50%" } },
    { kind: "Company", tag: "Company", title: "Why we are building Lienry", href: "/company", image: { id: "co1-company", alt: "A harbour-side street of mid-rise buildings at dawn", position: "50% 50%" } },
  ],
};

/** The black panel: what a safety or facilities team asks first. */
export const safety = {
  eyebrow: "Safety by design",
  headline: "Built so nobody works at height.",
  body: "The safety questions owners and facilities managers raise, answered up front.",
  link: { label: "Read about the tether", href: "/platform#tether" },
  tiles: [
    { icon: "tether", title: "Tether", note: "Water and power, always connected" },
    { icon: "camera", title: "Obstacle camera", note: "Avoidance built into the drone" },
    { icon: "check", title: "Surface checks", note: "Onboard, on every pass" },
    { icon: "dock", title: "Weatherproof dock", note: "Shelter between cleans" },
    { icon: "person", title: "Nobody at height", note: "No rope access, no lift" },
    { icon: "doc", title: "Site permissions", note: "Still being finalised" },
  ],
};

export const faq = {
  eyebrow: "Got questions?",
  headline: "Frequently asked questions",
  emphasis: "questions",
  formTitle: "Register interest",
  formNote: "Lienry is pre-launch. We reply personally.",
};
