// /solar copy. Conventions shared with every content module. Facts come from docs/SITE-PLAN.md only.
// Which system serves solar farms is not decided, so no copy here names one.

export const solarPage = {
  hero: {
    eyebrow: "Solar",
    headline: "Dust costs solar owners energy. Clean panels on your schedule.",
    emphasis: "Clean panels on your schedule.",
    lead: "Lienry treats a panel as its own material, sets the pressure for solar glass, and cleans on the interval you choose, from rooftop arrays to solar farm rows.",
    primary: { label: "Register interest", href: "/register-interest" },
    secondary: { label: "Check your site", href: "/fit-check" },
  },
  strip: { label: "Designed for solar", items: ["Rooftop arrays", "Solar farm rows", "Commercial roofs", "Rental rooftops"] },
  // The cited figures on the night panel, with the cited note.
  stats: {
    headline: "What soiling costs",
    intro: "Three figures from peer-reviewed and international sources, each cited.",
  },
  // Each row is a chapter band (tint, white, tint). A row's `panel` is a still Demo-data card over its
  // picture, on the side away from the drone. The portrait pictures are framed 3:2 from 1024, with their
  // own crop there that keeps the drone above the card.
  rows: [
    {
      id: "panels",
      title: "It knows a panel is a panel",
      paragraphs: ["During a clean the drone identifies each material it is cleaning and adjusts its pressure to suit. Water comes through the tether, so the drone never carries it."],
      checks: ["Material identified during the clean", "Pressure set for solar glass", "Adjustable in the app"],
      image: { id: "y2-story-panels", alt: "The drone over rooftop panels, half the array already clean", position: "50% 50%", positionMd: "50% 45%" },
      panel: { id: "right-pressure" as const, corner: "end" as const, solarFirst: true },
    },
    {
      id: "software",
      title: "Every row planned, washed and tracked",
      paragraphs: [
        "The scan becomes a model of the array in the software. It sets the pressure for solar glass, plans two passes along each row and follows the wash live, with soiling shaded where it has built up. This is a demo array with demo data.",
      ],
      checks: ["A model of every row from the scan", "Pressure set for solar glass", "Live wash progress, row by row", "Soiling shaded where it has built up"],
      link: { label: "The software", href: "/platform#software" },
    },
    {
      id: "rows",
      title: "Rooftop arrays and solar farm rows, on your interval",
      emphasis: "on your interval",
      paragraphs: [
        "From a home's roof to a row of ground-mounted panels, the clean runs with nobody on site.",
        "Set how often the drone should check and clean, and change it in the app after a dusty week or a run of rain.",
      ],
      checks: ["Rooftops and ground-mounted rows", "Nobody on site during a clean", "How often it checks and cleans, changed whenever you like", "A record of each clean"],
      image: { id: "p5-solar-farm", alt: "The drone washing a row of solar panels, its tether dropping into the aisle", position: "50% 50%", positionMd: "50% 60%" },
      panel: { id: "row-schedule" as const, corner: "start" as const },
    },
  ],
  close: {
    headline: "Rooftop or solar farm, tell us about it",
    action: { label: "Register interest", href: "/register-interest" },
    secondary: { label: "Check your site", href: "/fit-check" },
  },
};
