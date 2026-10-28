// /company copy. Conventions shared with every content module: `emphasis` is the trailing phrase of
// its `headline`; images are ImageRef-compatible `{ id, alt, position }` with manifest still ids; links
// are Action-compatible `{ label, href }`. Facts come from docs/SITE-PLAN.md only.

/**
 * Which side a story row's text takes from 1024, on the page's 12 columns: "textLeft" (text in 1-5,
 * the picture in 7-12) or "imageLeft" (the picture in 1-6, the text in 8-12). Below 1024 every row is
 * text, then picture.
 */
export type StoryRowLayout = "textLeft" | "imageLeft";

/** A founder on /company. Only `published` entries render, and `photo` renders only when the owner supplies a real photograph. */
export type FounderEntry = { name: string; title: string; bio: string; photo: null | { src: string; alt: string; width: number; height: number }; published: boolean };

export const companyPage = {
  hero: {
    headline: "Built in Sydney, for the buildings people own",
    emphasis: "for the buildings people own",
    lead: "A small team designing a cleaning drone that stays on the property, so the exterior stays clean and nobody climbs up to do it.",
    images: [
      { id: "p1-tower", alt: "", position: "50% 40%" },
      { id: "s1-dock", alt: "", position: "50% 55%" },
      { id: "p3-house", alt: "", position: "50% 45%" },
      { id: "f2-camera", alt: "", position: "50% 45%" },
      { id: "p5-solar-farm", alt: "", position: "50% 60%" },
      { id: "m2-capsule-master", alt: "", position: "50% 50%" },
    ],
  },
  rows: [
    {
      id: "why",
      layout: "textLeft" as StoryRowLayout,
      title: "We think cleaning a building\u2019s exterior shouldn\u2019t need anyone at\u00a0height",
      paragraphs: ["Lienry Drones is a Sydney company at concept stage. We are building a resident cleaning drone that lives on a property and keeps its exterior clean with nobody on site. We start with the buildings people own: offices, apartments, homes and rentals."],
      image: { id: "co1-company", alt: "A harbour-side street of mid-rise buildings at dawn", position: "50% 50%" },
    },
    {
      id: "where",
      layout: "imageLeft" as StoryRowLayout,
      title: "Where we are",
      paragraphs: ["Everything on this site describes the design, and none of it is in service yet. The platform, both systems and the software are designed. We are raising a pre-seed round to build the system and run a pilot with a small number of commercial buildings under 70 metres in Sydney."],
      image: { id: "s6-automation", alt: "The roof capsule open at dawn, the drone above its cradle", position: "50% 40%" },
    },
    {
      id: "values",
      layout: "textLeft" as StoryRowLayout,
      title: "How we work",
      paragraphs: ["We say only what we can stand behind, and we design safety in rather than leaving it to supervision. Every decision is measured against one question: does this make a property easier to own?"],
      image: { id: "f3-surface", alt: "The drone's spray bar, pad and roller on a pane of glass", position: "50% 50%" },
    },
    {
      id: "next",
      layout: "imageLeft" as StoryRowLayout,
      title: "What we are exploring",
      paragraphs: ["For some sites we are exploring a hose-free model. It is an idea in development, not a product, and it is not part of the pilot program."],
      image: { id: "m1-drone-master", alt: "The Lienry drone washing a glass wall", position: "50% 50%" },
    },
  ],
  // The three rules. The page no longer shows them as a band (the "How we work" row says the same in
  // one paragraph), but scripts/check-rules.mjs still reads them: check 11 allows "approvals" inside
  // Honest by default.
  values: {
    items: [
      { title: "Honest by default", body: "No invented customers, results or approvals, and every statistic is cited." },
      { title: "Safe by design", body: "The tether, camera and surface checks are the design, not add-ons." },
      { title: "Built for owners", body: "If it does not make a property easier to own, it does not ship." },
    ],
  },
  founders: {
    headline: "Raising our pre-seed round",
    body: "Liam Kennedy, our founder and CEO, leads Lienry Drones from Sydney with a co-founder. If you invest in hardware, property technology or automation, we would like to walk you through the platform and the pilot plan.",
    action: { label: "Investor enquiries", href: "/register-interest?type=investor" },
    // The co-founder stays unpublished, with no name or title, until the owner supplies them.
    people: [
      { name: "Liam Kennedy", title: "Founder and CEO", bio: "", photo: null, published: true },
      { name: "Co-founder", title: "", bio: "", photo: null, published: false },
    ] satisfies FounderEntry[],
  },
  close: { headline: "Own a building that could use this? We would like to hear about it.", action: { label: "Register interest", href: "/register-interest" } },
  /** Under the pre-seed round's action. */
  media: "For media enquiries, use the enquiry form and we will reply directly.",
};
