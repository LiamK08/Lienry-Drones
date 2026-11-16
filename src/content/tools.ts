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
  /** What the check covers and what it is not: three cards under the check, each over a small coded
   *  picture drawn from the check's own parts (the example result is tagged as one). */
  about: {
    headline: "What the fit check tells you",
    emphasis: "tells you",
    cards: [
      {
        id: "questions",
        title: "Seven questions, one score",
        body: "It asks about the seven things the Lienry design brief rests on: the building's height, room for a dock, water and power nearby, what the outside is made of and how you clean it now.",
      },
      {
        id: "points",
        title: "The points to talk through",
        body: "Every No and every Partly comes back as a point worth a conversation, the building's first.",
        // A made-up set of answers, scored by the check's own sums (74, "A likely fit", two points).
        example: { tag: "Example", answers: { height: "yes", dock: "partly", supply: "yes", surfaces: "yes", regular: "no", "height-work": "yes", remote: "yes" } },
      },
      {
        id: "indicative",
        title: "Indicative, not a site survey",
        body: "Lienry is at concept stage and site requirements are still being finalised, so treat the result as the start of a conversation.",
        needs: ["Under 70 metres tall", "Room for a dock, on the roof or the ground", "Water and power close to the dock"],
      },
    ],
    link: { label: "See the platform", href: "/platform" },
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
