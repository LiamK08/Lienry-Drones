// /solar copy. Moved verbatim from pages.ts (solarPage) by the design-pass foundation;
// the /solar page package owns this module. Conventions: `emphasis` is the trailing phrase of its
// `headline`, images are ImageRef-compatible `{ id, alt, position }` with manifest still ids, and links
// are Action-compatible `{ label, href }`.

export const solarPage = {
  headline: "A cleaner surface for solar.",
  emphasis: "for solar.",
  lead: "Dust and grime cost solar owners real energy. Lienry treats a panel as its own material, sets the pressure to match, and cleans on the interval you choose.",
  heroImageId: "so1-solar-hero",
  heroAlt: "A solar farm row at first light with the Lienry drone low over the panels",
  actions: {
    primary: { label: "Register interest", href: "/register-interest?type=homeowner" },
    secondary: { label: "See the home system", href: "/homes-and-rentals" },
  },
  statsHeadline: "What soiling costs.",
  statsIntro: "These figures are from peer-reviewed and international sources; each is cited.",
  how: {
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
