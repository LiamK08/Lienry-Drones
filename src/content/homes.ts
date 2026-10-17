// /homes-and-rentals copy. Moved verbatim from pages.ts (homesPage) and home.ts (landlordStory, appPanel) by the design-pass foundation;
// the /homes-and-rentals page package owns this module. Conventions: `emphasis` is the trailing phrase of its
// `headline`, images are ImageRef-compatible `{ id, alt, position }` with manifest still ids, and links
// are Action-compatible `{ label, href }`.

export const homesPage = {
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
