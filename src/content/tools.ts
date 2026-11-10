// The two tool pages: /fit-check and /calculator. Conventions as in every content module. Each page
// closes on the accent panel (`close`), its main ask and a lighter step on to the other tool; a link to
// /register-interest carries the one label of its ?type= (check 24).

export const fitCheckPage = {
  hero: {
    headline: "See whether your building suits a resident drone",
    emphasis: "a resident drone",
    /** Under the h1, over the check (the card has no title of its own): where the questions come from,
     *  how long they take, and that nothing leaves the page unless asked. */
    lead: "Seven questions from the design brief, for one building. It takes a minute, and nothing is sent unless you ask.",
  },
  /** What the check covers and what it is not: a feature row under the check, beside the scan picture. */
  about: {
    headline: "What the fit check tells you",
    paragraphs: [
      "It asks about the seven things the Lienry design brief rests on: the building's height, room for a dock, water and power nearby, what the outside is made of and how you clean it now.",
      "The result is indicative, not a site survey. Lienry is at concept stage and site requirements are still being finalised, so treat it as the start of a conversation.",
    ],
    link: { label: "See the platform", href: "/platform" },
    image: { id: "s4-scan", alt: "The Lienry drone on its tether beside the glass face of an office tower, scanning it", position: "50% 40%" },
  },
  faq: { headline: "Questions about the fit check" },
  close: {
    headline: "Talk your building through with us",
    action: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
    secondary: { label: "Add up what you spend now", href: "/calculator" },
  },
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
  faq: { headline: "Questions about the calculator" },
  close: {
    headline: "Next, see whether your building is a fit",
    action: { label: "Check your building", href: "/fit-check" },
    secondary: { label: "Register interest", href: "/register-interest" },
  },
};
