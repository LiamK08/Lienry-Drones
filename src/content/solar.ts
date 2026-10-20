// /solar copy. Conventions shared with every content module. Facts come from docs/SITE-PLAN.md only.
// Which system serves solar farms is not decided, so no copy here names one.

export const solarPage = {
  hero: {
    eyebrow: "Solar",
    headline: "Dust costs solar owners energy. Clean panels on your schedule.",
    emphasis: "Clean panels on your schedule.",
    lead: "Lienry treats a panel as its own material, sets the pressure for solar glass, and cleans on the interval you choose, from rooftop arrays to solar farm rows.",
    primary: { label: "Register interest", href: "/register-interest" },
  },
  strip: { label: "Designed for solar", items: ["Rooftop arrays", "Solar farm rows", "Commercial roofs", "Rental rooftops"] },
  stats: {
    eyebrow: "Industry figures",
    headline: "What soiling costs",
    emphasis: "costs",
    intro: "Three figures from peer-reviewed and international sources, each cited.",
    image: { id: "so1-solar-hero", alt: "The drone washing a row of ground-mounted solar panels in the morning mist, its tether running back to a reel on a concrete pad", position: "60% 55%" },
  },
  rows: [
    {
      id: "panels",
      title: "It knows a panel is a panel",
      paragraphs: ["During a clean the drone identifies each material it is cleaning and adjusts its pressure to suit. Water comes through the tether, so the drone never carries it."],
      checks: ["Material identified during the clean", "Pressure set for solar glass", "Adjustable in the app"],
      image: { id: "y2-story-panels", alt: "The drone over rooftop panels, half the array already clean", position: "50% 45%" },
    },
    {
      id: "rows",
      title: "Rooftop arrays and solar farm rows",
      paragraphs: ["From a home's roof to a row of ground-mounted panels, the clean runs with nobody on site."],
      checks: ["Rooftops and ground-mounted rows", "Nobody on site during a clean", "Start a clean yourself from the app"],
      image: { id: "p5-solar-farm", alt: "The drone passing low over a row of solar panels, its tether curving back along the row", position: "50% 60%" },
    },
    {
      id: "interval",
      title: "Your interval, changed whenever conditions change",
      paragraphs: ["Set how often the drone should check and clean, and change it in the app after a dusty week or a run of rain."],
      checks: ["How often it checks and cleans", "Change it whenever you like", "A record of each clean"],
      image: { id: "so2-solar-closeup", alt: "Water beading on a clean solar panel, the drone soft above it", position: "50% 50%" },
    },
  ],
  close: { headline: "Rooftop or solar farm, tell us about it.", action: { label: "Register interest", href: "/register-interest" } },
};
