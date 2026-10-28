// The two tool pages: /fit-check and /calculator. Conventions as in every content module.

export const fitCheckPage = {
  hero: {
    eyebrow: "Free fit check",
    headline: "See whether your building suits a resident drone",
    emphasis: "a resident drone",
    image: { id: "s4-scan", alt: "The drone holding off the corner of a glass building to scan it", position: "50% 40%" },
  },
  /** The check's opening lines, over the questions. `strong` is set bold in the first. */
  intro: {
    lines: [
      "Seven questions from the design brief, scored as you go. It takes about a minute, and nothing is sent anywhere.",
      "Answer for one building. The result is indicative: site requirements are still being finalised.",
    ],
    strong: "about a minute",
    /** The tag beside the result's buttons. */
    badge: "Nothing is sent anywhere",
  },
  /** What the check covers and what it is not, under the check. */
  about: {
    headline: "What the fit check tells you",
    paragraphs: [
      "It asks about the seven things the Lienry design brief rests on: the building's height, room for a dock, water and power nearby, what the outside is made of and how you clean it now.",
      "The result is indicative, not a site survey. Lienry is at concept stage and site requirements are still being finalised, so treat it as the start of a conversation.",
    ],
    link: { label: "See the platform", href: "/platform" },
  },
  faq: { headline: "Questions about the fit check" },
};

export const calculatorPage = {
  hero: {
    headline: "Add up what outsourced cleaning costs you",
    emphasis: "costs you",
    lead: "Enter your building type, its facade area and what you pay each year. See it over five and ten years.",
  },
  /** The results panel's heading; it also labels the band and the form. */
  head: {
    headline: "Your spend, over five and ten years",
  },
};
