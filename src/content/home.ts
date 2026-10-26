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

/**
 * The fit check: seven yes, partly or no questions drawn from the design brief, scored live out of 100.
 * The three building questions are the site's hard requirements and weigh 20 each; the four about the
 * clean weigh 10 each (3 x 20 + 4 x 10 = 100). A Yes counts its weight in full, a Partly by half. Each
 * question carries the point it raises when it is not a Yes. The three zones split the bar at 40 and 75.
 */
export const fitCheck = {
  eyebrow: "Fit check · 1 minute",
  title: "Is your building a fit?",
  intro: "Seven questions from the design brief. Mark where you stand.",
  groups: [
    {
      label: "The building",
      questions: [
        { id: "height", weight: 20, text: "It is under 70 metres tall", gap: "Taller than 70 metres, or not sure" },
        { id: "dock", weight: 20, text: "There is room on the roof or the ground for a dock", gap: "No clear spot for a dock yet" },
        { id: "supply", weight: 20, text: "Water and power are close to that spot", gap: "Water or power away from the dock" },
      ],
    },
    {
      label: "The clean",
      questions: [
        { id: "surfaces", weight: 10, text: "Most of the exterior is glass, panels, render, roofing or paving", gap: "Surfaces beyond glass, panels, render, roofing or paving" },
        { id: "regular", weight: 10, text: "You pay for exterior cleaning at least once a year", gap: "Exterior cleaned less than once a year" },
        { id: "height-work", weight: 10, text: "You would rather nobody worked at height", gap: "Rope or lift access suits you for now" },
        { id: "remote", weight: 10, text: "You want to start a clean without booking anyone", gap: "Booking a crew suits you for now" },
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
    // The empty panel's callout: the questions sit beside it from 1024 and below it on a phone.
    prompt: { title: { wide: "Start with the seven questions on the left", narrow: "Start with the seven questions below" }, body: "Your score and the points worth a conversation show up here as you go." },
    // The score bar's zones, low to high: each runs from its own `from` to the next zone's.
    zones: [
      { id: "low", from: 0, label: "Worth a conversation" },
      { id: "mid", from: 40, label: "A likely fit" },
      { id: "high", from: 75, label: "A strong fit" },
    ],
    // The verdict once all seven are answered, by score out of 100; before that, the zone's lead line.
    verdicts: [
      { min: 75, zone: "high", title: "A strong fit", lead: "Your building matches the design closely so far.", body: "Your building matches the design closely. Register interest and we will be in touch about the pilot." },
      { min: 40, zone: "mid", title: "A likely fit", lead: "Most of it matches so far.", body: "Most of it matches. The points below are worth a conversation before a pilot." },
      { min: 0, zone: "low", title: "Worth a conversation", lead: "Some of it may not match the design yet.", body: "Some of it may not match the design yet. Tell us about the building and we will say what we can." },
    ],
    gaps: "Worth talking through:",
    clear: "No gaps so far. A pilot conversation covers the rest of the site.",
    primary: { label: "Register interest", href: "/register-interest" },
    secondary: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
    // The home card's primary: the result sent to Lienry with the visitor's name and email, answered by a person.
    restart: "Start again",
    // The phone strip that keeps the score in view while answering, and scrolls back to the result.
    strip: { see: "See my result" },
    send: {
      open: "Send me my result",
      title: "Send me my result",
      body: "We read every one and reply personally with your result and what a pilot would need.",
      submit: "Send my result",
      sending: "Sending",
      back: "Back to my result",
      sent: { title: "Sent. Thank you.", body: "We will reply personally with your result and what a pilot would need." },
      failed: "We could not send it just now. Please try again later, or register interest instead.",
    },
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

/**
 * How a clean runs: five timed steps over one large picture, each with a coded panel that follows the
 * software's one demo building (src/content/software.ts) through the step. `short` is the tab's one word
 * on phones, where the five tabs share one row.
 */
export const how = {
  eyebrow: "How it works",
  headline: "From scan to report, on its own.",
  emphasis: "on its own.",
  intro: "Every clean follows the same five steps, planned on a model of your building.",
  label: "Steps of a clean",
  steps: [
    { id: "scan", n: "01", short: "Scan", who: "The drone", tab: "Scans it", title: "Maps the building first.", body: "Structure and dimensions, before the first clean.", image: { id: "s4-scan", alt: "The drone holding off the corner of a glass building to scan it", position: "50% 40%" } },
    { id: "plan", n: "02", short: "Plan", who: "The software", tab: "Plans it", title: "Every zone gets a plan.", body: "Surface, pressure and route for each part of the building.", image: { id: "s5-software", alt: "A laptop showing the desktop software's shaded 3D building", position: "50% 50%" } },
    { id: "clean", n: "03", short: "Clean", who: "The drone", tab: "Cleans it", title: "Washes with nobody on site.", body: "Water through the tether, two passes per floor.", image: { id: "m1-drone-master", alt: "The Lienry drone washing a glass wall, its spray bar on the pane", position: "50% 50%" } },
    { id: "check", n: "04", short: "Check", who: "The scan", tab: "Checks it", title: "Looks again.", body: "A re-scan shades where debris has built up.", image: { id: "f2-camera", alt: "The drone's sensor strip and scanning sensor, close up", position: "50% 45%" } },
    { id: "report", n: "05", short: "Report", who: "The software", tab: "Reports it", title: "Back to the dock, on record.", body: "What was cleaned, and when the next clean is due.", image: { id: "s6-automation", alt: "The roof capsule open at dawn, the drone above its cradle", position: "50% 40%" } },
  ],
};

/**
 * Three settings, as even white cards in the shape of a story card: the setting's icon and name, a
 * meta line, a statement in the serif (Lienry's own design intent from the brief, never a customer's
 * words), the part that does the work, three figures ruled off at the foot, one note and a link.
 * Commercial and home figures are design intent; solar's are cited in src/content/stats.ts.
 */
// The design-intent figures' note: commercial.ts designFacts holds the same note and figures for check 11.
const designNote = "Design intent. Concept stage.";

export const systems = {
  headline: "Built for the buildings you own.",
  intro: "One platform on a roof, beside a house or along a solar row. Figures are design intent at concept stage, not results.",
  action: { label: "See the platform", href: "/platform" },
  cards: [
    {
      id: "commercial",
      icon: "building",
      name: "Commercial",
      meta: ["Office and apartment buildings", "Under 70 m"],
      statement: "A capsule on the roof feeds the drone from above, and the desktop software runs the whole building.",
      part: { icon: "dock", name: "Roof capsule", line: "Shelters, powers and feeds the drone" },
      figures: [
        { value: "<70", unit: "m", label: "Building height" },
        { value: "2", unit: "days", label: "Re-scan interval" },
        { value: "0", label: "People at height" },
      ],
      note: designNote,
      link: { label: "See the commercial system", href: "/commercial" },
    },
    {
      id: "homes",
      icon: "home",
      name: "Homes and rentals",
      meta: ["Houses and rentals", "Ground pod"],
      statement: "A ground pod powers the drone and feeds it water. You start the clean from your phone.",
      part: { icon: "phone", name: "Phone app", line: "Pick the areas, then start the clean" },
      figures: [
        { value: "5", label: "Surface types" },
        { value: "1", label: "Ground pod" },
        { value: "0", label: "Crews to book" },
      ],
      note: designNote,
      link: { label: "See the home system", href: "/homes-and-rentals" },
    },
    {
      id: "solar",
      icon: "sun",
      name: "Solar",
      meta: ["Rooftop arrays", "Solar farm rows"],
      statement: "Panels are washed at the pressure set for solar glass, on the interval you choose.",
      part: { icon: "sliders", name: "Solar glass setting", line: "Pressure and passes set for panels" },
      // Cited figures from src/content/stats.ts, by id, each with a short label and source name for the card.
      cited: [
        { id: "unsw-soiling", label: "Lost to dust, AU farms studied", source: "Prasad et al." },
        { id: "iea-soiling", label: "Global output lost to soiling", source: "IEA PVPS" },
        { id: "cer-rooftop", label: "Suitable homes with solar", source: "CER" },
      ],
      // The cited note, word for word (check 11 looks for it beside every cited figure).
      note: "These figures describe the industry, not Lienry's results. Lienry Drones is pre-launch and has no customer results to report.",
      link: { label: "See solar", href: "/solar" },
    },
  ],
};

/**
 * The dark band of link cards into the rest of the site. Filters by kind. Lienry has no articles, so
 * where the reference dates each card, `meta` says what the page is.
 */
export const explore = {
  eyebrow: "Explore",
  headline: "Inside the platform",
  link: { label: "See the platform", href: "/platform" },
  filters: ["All", "Systems", "Platform", "Tools", "Company"],
  cards: [
    { kind: "Systems", meta: "Solution page", tag: "Commercial", title: "A capsule on the roof, and nobody on a rope", href: "/commercial", image: { id: "c1-commercial-hero", alt: "The roof capsule on a plant deck at dawn", position: "75% 50%" } },
    { kind: "Systems", meta: "Solution page", tag: "Homes", title: "Homes and rentals, cleaned from your phone", href: "/homes-and-rentals", image: { id: "ho1-homes-hero", alt: "The ground pod beside a house, the drone washing a window", position: "45% 50%" } },
    { kind: "Systems", meta: "Solution page", tag: "Solar", title: "Solar panels at the right pressure", href: "/solar", image: { id: "so2-solar-closeup", alt: "Water beading on a clean solar panel", position: "50% 50%" } },
    { kind: "Platform", meta: "Platform overview", tag: "Platform", title: "Six parts of one platform", href: "/platform", image: { id: "m2-capsule-master", alt: "The roof capsule open, the drone on its cradle", position: "50% 50%" } },
    { kind: "Tools", meta: "Tool · 1 minute", tag: "Fit check", title: "Seven questions: is your building a fit?", href: "/fit-check", image: { id: "p5-solar-farm", alt: "The drone low over a solar farm row", position: "50% 60%" } },
    { kind: "Tools", meta: "Tool · your own figures", tag: "Calculator", title: "What outsourced cleaning adds up to", href: "/calculator", image: { id: "f4-dock", alt: "Rain beading on the closed lid of the roof capsule", position: "50% 50%" } },
    { kind: "Company", meta: "About us", tag: "Company", title: "Why we are building Lienry", href: "/company", image: { id: "co1-company", alt: "A harbour-side street of mid-rise buildings at dawn", position: "50% 50%" } },
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
  formTitle: "Book a call",
  formNote: "Lienry is pre-launch. We reply personally.",
};

/**
 * The booking card beside the questions: pick a weekday and a time for a 20 minute call, then leave
 * your details. Lienry has no booking service, so nothing is booked on the spot: the time travels with
 * the enquiry and a person confirms it by email. Times are Sydney time.
 */
export const booking = {
  who: "Lienry Drones",
  title: "A 20 minute call",
  facts: [
    { icon: "clock", text: "20 minutes" },
    { icon: "video", text: "Video or phone" },
    { icon: "globe", text: "Sydney time" },
  ],
  pick: "Pick a day",
  times: ["9:30 am", "10:30 am", "11:30 am", "1:30 pm", "2:30 pm", "3:30 pm"],
  // Weekdays from tomorrow, up to four weeks out.
  daysAhead: 28,
  skip: "Rather not pick a time? Register interest instead.",
  change: "Change",
  submit: "Request this time",
  note: "Nothing is booked until we confirm it by email.",
  success: (when: string) => ({
    headline: "Request sent.",
    body: `We will confirm ${when} by email. Nothing is booked until we reply.`,
  }),
};
