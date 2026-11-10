// /homes-and-rentals copy. Conventions shared with every content module: `emphasis` is the trailing
// phrase of its `headline`; images are ImageRef-compatible `{ id, alt, position }` with manifest still
// ids; links are Action-compatible `{ label, href }`. Facts come from docs/SITE-PLAN.md only.

export const homesPage = {
  hero: {
    eyebrow: "Homes and rentals",
    headline: "Your property, cleaned from anywhere. Even from overseas.",
    emphasis: "Even from overseas.",
    lead: "A waterproof dock that powers the drone and feeds it water, a drone that knows each material, and an app that starts the clean wherever you are. For houses, townhouses and rentals.",
    primary: { label: "Register interest", href: "/register-interest?type=homeowner" },
    secondary: { label: "Check your property", href: "/fit-check" },
  },
  strip: { label: "Designed for the exterior of a home", items: ["Windows", "Solar panels", "Rendered walls", "Roofing", "Driveways", "Rentals"] },
  // Each row is a chapter band (tint, white, then the app on tint and the figures on white). A row's
  // `panel` is a still Demo-data card over its picture, on the side away from the subject. The portrait
  // rental is framed 3:2 from 1024, with its own crop there that keeps the drone above the card.
  rows: [
    {
      id: "pod",
      title: "A dock that powers the drone and feeds it water",
      paragraphs: ["The dock sits beside the house, near the garden tap. It shelters the drone between cleans and runs power and water through the same tether."],
      checks: ["Waterproof dock", "Power and water through one tether", "Shelter between cleans"],
      image: { id: "m3-pod-master", alt: "The Lienry dock open on a garden patio near the tap, the drone inside", position: "35% 50%" },
      panel: { id: "ground-pod" as const, corner: "end" as const },
    },
    {
      id: "materials",
      title: "Each surface gets the pressure it needs",
      paragraphs: [
        "The property is mapped first, so the drone knows every surface it can reach. As it cleans it identifies each material and adjusts its pressure, and you can change it in the app.",
      ],
      checks: ["A detailed scan of the property", "Glass, panels, render, roofing and paving", "Pressure you can adjust"],
      image: { id: "p4-rental", alt: "The Lienry drone washing the rooftop solar panels of a brick terrace", position: "50% 28%", positionMd: "50% 10%" },
      panel: { id: "right-pressure" as const, corner: "start" as const },
    },
  ],
  stats: {
    headline: "Why it matters in Australia",
    intro: "Two cited figures about the homes it is designed for.",
    action: { label: "I own rentals", href: "/register-interest?type=landlord" },
  },
  // The night panel: what is designed in, as four fact tiles (the honest stand-in for badges).
  safety: {
    headline: "No ladders, and nobody walking the roof",
    emphasis: "nobody walking the roof",
    aside: "No ladders, no lifts, no crews to book.",
    action: { label: "How the dock works", href: "/platform#dock" },
    tiles: [
      { icon: "person", title: "Nobody at height", text: "No one climbs a ladder or walks the roof, and a camera on the drone watches the surface." },
      { icon: "phone", title: "Started from the app", text: "Pick the areas and start the clean from wherever you are." },
      { icon: "dock", title: "Dock", text: "It shelters the drone and feeds it power and water on one tether." },
      { icon: "doc", title: "Site permissions", text: "We do not claim any approvals. What each site will need is still being finalised." },
    ],
  },
  close: {
    headline: "Tell us about your property and we will reply personally",
    action: { label: "Register interest", href: "/register-interest?type=homeowner" },
    secondary: { label: "Check your property", href: "/fit-check" },
  },
};

/**
 * The app row: the story's steps beside the interactive app panel, and the picture beside the panel.
 * The picture follows the demo: before a clean, each chosen area while the drone washes it, then after.
 */
export const landlordStory = {
  headline: "Your property, wherever you are",
  emphasis: "wherever you are",
  intro: "You own a rental in Sydney and live overseas. It needs a clean before the next tenant.",
  steps: ["Choose the areas to clean", "Tap start, wherever you are", "Watch each area clean in turn", "See the house after the clean"],
  pictures: {
    before: { id: "y1-story-before", alt: "The house before its clean, the Lienry dock on the patio near the garden tap, its lids closed over the drone", chip: "Before the clean", position: "50% 78%" },
    driveway: { id: "y3-story-driveway", alt: "The Lienry drone washing the brick path in front of the house", chip: "Washing the driveway", position: "50% 50%" },
    panels: { id: "y2-story-panels", alt: "The Lienry drone washing solar panels on a metal roof, the washed half of the array wet and dark", chip: "Washing the solar panels", position: "50% 50%" },
    windows: { id: "p3-house", alt: "The Lienry drone washing the bay window of a house", chip: "Washing the windows", position: "50% 50%" },
    after: { id: "y5-story-done", alt: "The house after its clean, the Lienry dock open on the patio, the drone back inside", chip: "After the clean", position: "50% 78%" },
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
