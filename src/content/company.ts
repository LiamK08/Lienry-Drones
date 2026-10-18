// /company copy. Conventions shared with every content module: `emphasis` is the trailing phrase of
// its `headline`; images are ImageRef-compatible `{ id, alt, position }` with manifest still ids; links
// are Action-compatible `{ label, href }`. Facts come from docs/SITE-PLAN.md only.

/** A founder on /company. Only `published` entries render, and `photo` renders only when the owner supplies a real photograph. */
export type FounderEntry = { name: string; title: string; bio: string; photo: null | { src: string; alt: string; width: number; height: number }; published: boolean };

export const companyPage = {
  hero: {
    eyebrow: "company",
    headline: "Built in Sydney for property owners.",
    emphasis: "for property owners.",
    lead: "A Sydney company at concept stage, building a resident cleaning drone and raising a pre-seed round.",
    image: { id: "co1-company", alt: "A harbour-side street of mid-rise buildings at dawn", position: "50% 50%" },
  },
  where: {
    eyebrow: "where we are",
    headline: "Concept stage, pre-seed, pilot next.",
    body: "Everything on this site describes the design. None of it is in service yet.",
    image: { id: "s6-automation", alt: "The roof capsule open at dawn, the drone rising from its cradle", position: "50% 40%" },
    items: [
      { title: "Concept stage", body: "The platform, both systems and the software are designed." },
      { title: "Raising pre-seed", body: "To build the system and run the pilot." },
      { title: "Pilot program", body: "Commercial buildings under 70 metres in Sydney, first." },
    ],
  },
  values: {
    eyebrow: "how we work",
    headline: "Three rules we build by.",
    body: "Behind every decision on the platform and on this site.",
    image: { id: "f3-surface", alt: "The drone's spray bar, pad and roller on a pane of glass", position: "50% 50%" },
    items: [
      { title: "Honest by default", body: "No invented customers, results or approvals, and every statistic is cited." },
      { title: "Safe by design", body: "The tether, camera and surface checks are the design, not add-ons." },
      { title: "Built for owners", body: "If it does not make a property easier to own, it does not ship." },
    ],
  },
  founders: {
    eyebrow: "founders",
    headline: "Who is building it.",
    intro: "Liam leads Lienry Drones from Sydney with a co-founder.",
    // The co-founder stays unpublished, with no name or title, until the owner supplies them.
    people: [
      { name: "Liam Kennedy", title: "Founder and CEO", bio: "", photo: null, published: true },
      { name: "Co-founder", title: "", bio: "", photo: null, published: false },
    ] satisfies FounderEntry[],
    exploring: { title: "In development", body: "A hose-free model for some sites. An idea, not a product, and not part of the pilot." },
  },
  closing: {
    eyebrow: "investors",
    headline: "Talk to us about the pre-seed round.",
    emphasis: "the pre-seed round.",
    body: "Liam Kennedy, our founder and CEO, replies directly.",
    primary: { label: "Investor enquiries", href: "/register-interest?type=investor" },
    links: [{ label: "Book a pilot conversation", href: "/register-interest?type=commercial" }],
    image: { id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", position: "50% 50%" },
  },
};
