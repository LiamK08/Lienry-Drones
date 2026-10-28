// The two tool pages: /fit-check and /calculator. Conventions as in every content module.

export const fitCheckPage = {
  hero: {
    eyebrow: "Free fit check",
    headline: "See whether your building suits a resident drone",
    emphasis: "a resident drone",
    /** Under the h1, over the check: what to answer for and what the result is. */
    lead: "Answer for one building. It takes about a minute, and nothing is sent unless you ask for your result.",
  },
  /** What the check covers and what it is not: a feature row under the check, beside the scan picture. */
  about: {
    headline: "What the fit check tells you",
    paragraphs: [
      "It asks about the seven things the Lienry design brief rests on: the building's height, room for a dock, water and power nearby, what the outside is made of and how you clean it now.",
      "The result is indicative, not a site survey. Lienry is at concept stage and site requirements are still being finalised, so treat it as the start of a conversation.",
    ],
    link: { label: "See the platform", href: "/platform" },
    image: { id: "s4-scan", alt: "The drone holding off the corner of a glass building to scan it", position: "50% 40%" },
  },
  faq: { headline: "Questions about the fit check" },
};

export const calculatorPage = {
  hero: {
    eyebrow: "Cost calculator",
    headline: "Add up what outsourced cleaning costs you",
    emphasis: "costs you",
    lead: "Enter your building type, its facade area and what you pay each year. See it over five and ten years.",
    image: { id: "f4-dock", alt: "Rain beading on the closed lid of the roof capsule", position: "50% 50%" },
  },
  head: {
    eyebrow: "Your numbers",
    headline: "Your spend, over five and ten years",
    intro: "It uses only the figures you enter. It is not a Lienry quote or estimate.",
  },
};
