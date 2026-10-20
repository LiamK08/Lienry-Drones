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
      image: { id: "p3-house", alt: "The home drone washing the front windows of a suburban house", position: "50% 45%" },
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

/** The app, told as five beats of one clean. A beat's `app` is the state the app panel shows with it. */
export const landlordStory = {
  headline: "Your property. Wherever you are.",
  intro: "You own a rental in Sydney and live overseas. It needs a clean before the next tenant.",
  beats: [
    { title: "Open the app.", body: "The property is already mapped, every surface in reach.", imageId: "y1-story-before", app: "map" },
    { title: "Choose the areas.", body: "Only the driveway and the panels. The drone sets each pressure.", imageId: "y1-story-before", app: "select" },
    { title: "Tap start.", body: "The pod powers the drone and the tether feeds it water.", imageId: "y2-story-panels", app: "start" },
    { title: "It cleans. Nobody is there.", body: "No cleaners to book and no one on site.", imageId: "y3-story-driveway", app: "progress" },
    { title: "Ready for the next tenant.", body: "The progress reaches your phone, wherever you are.", imageId: "y5-story-done", app: "done" },
  ],
  alts: {
    "y1-story-before": "A rental house before its clean, the ground pod closed beside the garden tap",
    "y2-story-panels": "The drone washing the rooftop solar panels, half the array clean and wet",
    "y3-story-driveway": "The drone washing the concrete driveway of the rental house",
    "y5-story-done": "The rental house after its clean, the ground pod open by the garden tap",
  } as Record<string, string>,
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
