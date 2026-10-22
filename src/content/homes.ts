// /homes-and-rentals copy. Conventions shared with every content module: `emphasis` is the trailing
// phrase of its `headline`; images are ImageRef-compatible `{ id, alt, position }` with manifest still
// ids; links are Action-compatible `{ label, href }`. Facts come from docs/SITE-PLAN.md only.

export const homesPage = {
  hero: {
    eyebrow: "Homes and rentals",
    headline: "Your property, cleaned from anywhere. Even from overseas.",
    emphasis: "Even from overseas.",
    lead: "A waterproof ground pod that powers the drone and feeds it water, a drone that knows each material, and an app that starts the clean wherever you are. For houses, townhouses and rentals.",
    primary: { label: "Register interest", href: "/register-interest?type=homeowner" },
  },
  strip: { label: "Designed for the exterior of a home", items: ["Windows", "Solar panels", "Rendered walls", "Roofing", "Driveways", "Rentals"] },
  rows: [
    {
      id: "pod",
      title: "A ground pod that powers the drone and feeds it water",
      paragraphs: [
        "The pod sits beside the house, near the garden tap. It shelters the drone between cleans and runs power and water through the same tether.",
        "Nothing is carried, so the drone never stops halfway to refill.",
      ],
      checks: ["Waterproof ground pod", "Power and water through one tether", "Shelter between cleans"],
      image: { id: "m3-pod-master", alt: "The Lienry ground pod open beside a garden tap, the home drone inside", position: "35% 50%" },
    },
    {
      id: "materials",
      title: "Each surface gets the pressure it needs",
      paragraphs: [
        "The property is mapped first, so the drone knows every surface it can reach. As it cleans it identifies each material and adjusts its pressure, and you can change it in the app.",
      ],
      checks: ["A detailed scan of the property", "Glass, panels, render, roofing and paving", "Pressure you can adjust"],
      image: { id: "p4-rental", alt: "The home drone washing the rooftop solar panels of a brick rental townhouse, the ground pod by the side fence", position: "50% 32%" },
    },
  ],
  stats: {
    headline: "Why it matters in Australia",
    intro: "Two cited figures about the homes it is designed for.",
    action: { label: "I own rentals", href: "/register-interest?type=landlord" },
  },
  safety: {
    eyebrow: "Safety by design",
    headline: "No ladders, and nobody walking the roof.",
    emphasis: "nobody walking the roof.",
    aside: "No ladders, no lifts, no crews to book",
    tags: ["Tether", "Camera", "Ground pod"],
    image: { id: "ho1-homes-hero", alt: "The Lienry ground pod beside a house at first light, the drone washing a window", position: "42% 55%" },
    columns: [
      { icon: "person", title: "Nobody at height", text: "No one climbs a ladder or walks the roof to clean it." },
      { icon: "phone", title: "Started from the app", text: "Pick the areas and start the clean from wherever you are." },
      { icon: "doc", title: "Site permissions", text: "We do not claim any approvals. What each site will need is still being finalised." },
    ],
  },
  close: { headline: "Tell us about your property. We reply personally.", action: { label: "Register interest", href: "/register-interest?type=homeowner" } },
};

/**
 * The app row: the story's steps beside the interactive app panel, and the picture beside the panel.
 * The picture follows the demo: before a clean, each chosen area while the drone washes it, then after.
 */
export const landlordStory = {
  headline: "Your property. Wherever you are.",
  intro: "You own a rental in Sydney and live overseas. It needs a clean before the next tenant.",
  steps: ["Choose the areas to clean.", "Tap start, wherever you are.", "Watch each area clean in turn.", "See the house after the clean."],
  pictures: {
    before: { id: "y1-story-before", alt: "A rental house before its clean, the ground pod closed beside the garden tap", chip: "Before the clean" },
    driveway: { id: "y3-story-driveway", alt: "The drone washing the concrete driveway of the rental house", chip: "Washing the driveway" },
    panels: { id: "y2-story-panels", alt: "The drone washing the rooftop solar panels, half the array clean and wet", chip: "Washing the solar panels" },
    windows: { id: "p3-house", alt: "The home drone washing the front windows of a house", chip: "Washing the windows" },
    after: { id: "y5-story-done", alt: "The rental house after its clean, the ground pod open by the garden tap", chip: "After the clean" },
  },
};

/**
 * Strings for the illustrative app panel. Demo data: nothing here is a real property or a real clean.
 * `{areas}`, `{area}`, `{i}` and `{n}` are filled in by the panel.
 */
export const appPanel = {
  property: "Rental, Sydney",
  prompt: "Choose the areas to clean",
  areas: [
    { id: "driveway", name: "Driveway", phrase: "the driveway" },
    { id: "panels", name: "Solar panels", phrase: "the solar panels" },
    { id: "windows", name: "Windows", phrase: "the windows" },
  ],
  rowState: { complete: "Complete", skipped: "Not in this clean" },
  buttons: { start: "Start clean", running: "Cleaning…", again: "Clean again", choose: "Choose again" },
  line: {
    none: "Choose at least one area to start.",
    chosen: "Ready to clean {areas}.",
    running: "Cleaning {area}, {i} of {n}.",
    done: "Clean complete for {areas}.",
  },
  live: { started: "Clean started for {areas}.", areaDone: "{area} complete." },
  note: "Illustrative app interface.",
} as const;
