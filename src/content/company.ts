// /company copy. Moved verbatim from pages.ts (companyPage, FounderEntry) by the design-pass foundation;
// the /company page package owns this module. Conventions: `emphasis` is the trailing phrase of its
// `headline`, images are ImageRef-compatible `{ id, alt, position }` with manifest still ids, and links
// are Action-compatible `{ label, href }`.

/** A founder on /company. Only `published` entries render, and `photo` renders only when the owner supplies a real photograph. */
export type FounderEntry = { name: string; title: string; bio: string; photo: null | { src: string; alt: string; width: number; height: number }; published: boolean };

export const companyPage = {
  headline: "Built in Sydney for the buildings people own.",
  emphasis: "for the buildings people own.",
  statement:
    "Lienry Drones is a Sydney company at concept stage. We are building a resident cleaning drone that lives on a property and keeps its exterior clean with nobody on site, and we are raising our pre-seed round to build it.",
  heroImageId: "co1-company",
  heroAlt: "A harbour-side street of mid-rise buildings at dawn",
  founders: {
    headline: "Two founders, one building at a time.",
    // The co-founder stays unpublished, with no name or title, until the owner supplies them.
    people: [
      { name: "Liam Kennedy", title: "Founder and CEO", bio: "Liam leads Lienry Drones from Sydney with a co-founder.", photo: null, published: true },
      { name: "Co-founder", title: "", bio: "", photo: null, published: false },
    ] satisfies FounderEntry[],
  },
  where: {
    headline: "Concept stage, pre-seed, pilot in preparation.",
    body: "Everything on this site describes the design. None of it is in service yet.",
    image: { id: "s6-automation", alt: "The roof capsule open at dawn, the drone rising from its cradle", position: "50% 40%" },
    items: [
      { title: "Concept stage", body: "The platform, the two systems and the software are designed. We are building toward a pilot." },
      { title: "Raising pre-seed", body: "We are raising a pre-seed round to build and pilot the system." },
      { title: "Pilot program", body: "A small number of commercial buildings under 70 metres in Sydney, first." },
      { title: "Sydney, Australia", body: "Designed for Australian buildings, weather and property owners." },
    ],
  },
  values: {
    headline: "Three rules we build by.",
    body: "The rules behind every decision on the platform and on this site.",
    image: { id: "f3-surface", alt: "The drone's spray bar, pad and roller on a pane of glass", position: "50% 50%" },
    items: [
      { title: "Honest by default", body: "We only say what we can stand behind. No invented customers, results or approvals, and every statistic on this site is cited to its source." },
      { title: "Safe by design", body: "The tether, the obstacle-avoidance camera, the onboard surface checks and the weatherproof dock are the design, not add-ons. Safety is not left to supervision." },
      { title: "Built for owners", body: "Every decision is measured against one question: does this make a property easier to own? If it does not, it does not ship." },
    ],
  },
  exploring: {
    eyebrow: "In development",
    headline: "What we are exploring.",
    body: "For some sites we are exploring a hose-free model. It is an idea in development, not a product, and it is not part of the pilot program.",
  },
  investors: {
    headline: "Talk to us about the pre-seed round.",
    body: "If you invest in hardware, property technology or automation, we would like to walk you through the platform, the two systems and the pilot plan.",
    note: "Liam Kennedy, our founder and CEO, replies directly.",
    cta: { label: "Investor enquiries", href: "/register-interest?type=investor" },
    links: [
      { label: "Register interest", href: "/register-interest" },
      { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
    ],
    image: { id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", position: "50% 50%" },
  },
};
