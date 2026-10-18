// /solar copy. Conventions shared with every content module: `emphasis` is the trailing phrase of its
// `headline`; images are ImageRef-compatible `{ id, alt, position }` with manifest still ids; links are
// Action-compatible `{ label, href }`. Facts come from docs/SITE-PLAN.md only. Which system serves
// solar farms is not decided, so no copy here names one.

export const solarPage = {
  hero: {
    eyebrow: "solar",
    // Wraps to two lines on phones and, with breakBefore, from 768, in the web font and its fallback
    // alike, so the swap never moves the hero image.
    headline: "Solar, cleaned at the right pressure.",
    emphasis: "the right pressure.",
    lead: "Panels cleaned on the interval you set, with nobody on site.",
    primary: { label: "Register interest", href: "/register-interest" },
    image: { id: "so1-solar-hero", alt: "A solar farm row at first light with the Lienry drone low over the panels", position: "50% 50%" },
  },
  stats: {
    eyebrow: "industry figures",
    headline: "What soiling costs.",
    intro: "Each figure is cited.",
  },
  how: {
    eyebrow: "how it works",
    headline: "Every panel, on your schedule.",
    emphasis: "on your schedule.",
    intro: "From rooftop arrays to solar farm rows.",
    items: [
      {
        key: "rows",
        index: "01",
        title: "Rooftops and rows",
        body: "Rooftop arrays and farm rows, nobody on site.",
        image: { id: "p5-solar-farm", alt: "The drone passing low over a row of solar panels, its tether curving back along the row", position: "50% 60%" },
      },
      {
        key: "panels",
        index: "02",
        title: "A panel is a panel",
        body: "It identifies each material and sets its pressure.",
        image: { id: "y2-story-panels", alt: "The drone over rooftop panels, half the array already clean", position: "50% 45%" },
      },
      {
        key: "interval",
        index: "03",
        title: "Your interval",
        body: "Change how often it checks and cleans in the app.",
        image: { id: "y1-story-before", alt: "A house with dusty rooftop solar panels before its clean, the ground pod closed by the garden tap", position: "50% 40%" },
      },
    ],
  },
  faq: {
    eyebrow: "questions",
    headline: "What solar owners ask first.",
    link: { label: "Register interest", href: "/register-interest" },
  },
  closing: {
    eyebrow: "enquiries",
    headline: "Rooftop or solar farm, tell us.",
    emphasis: "tell us.",
    body: "We are pre-launch and reply personally.",
    primary: { label: "Register interest", href: "/register-interest" },
    image: { id: "so2-solar-closeup", alt: "Water beading on a clean solar panel, the drone soft above it", position: "50% 50%" },
  },
};
