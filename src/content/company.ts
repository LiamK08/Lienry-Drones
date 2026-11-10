// /company copy. Conventions shared with every content module: `emphasis` is the trailing phrase of
// its `headline`; images are ImageRef-compatible `{ id, alt, position }` with manifest still ids; links
// are Action-compatible `{ label, href }`. Facts come from docs/SITE-PLAN.md only.

/** A founder on /company. Only `published` entries render, and `photo` renders only when the owner supplies a real photograph. */
export type FounderEntry = { name: string; title: string; bio: string; photo: null | { src: string; alt: string; width: number; height: number }; published: boolean };

/** Where a stage of the plan stands. "exploring" is an idea off the main line, never part of the plan's sequence. */
export type PlanPhase = "done" | "now" | "next" | "planned" | "exploring";

/** A stage of the plan: no dates and no amounts, and every line is already said elsewhere on the site. */
export type PlanStage = { id: string; title: string; line: string; phase: PlanPhase; tag: string };

export const companyPage = {
  hero: {
    // A no-break space keeps "people own" together, so the italic line never ends on one word.
    headline: "Built in Sydney, for the buildings people own",
    emphasis: "for the buildings people own",
    lead: "A small team designing a cleaning drone that stays on the property, so the exterior stays clean and nobody climbs up to do it.",
    images: [
      { id: "p1-tower", alt: "", position: "50% 40%" },
      { id: "s1-dock", alt: "", position: "50% 55%" },
      { id: "p3-house", alt: "", position: "50% 45%" },
      { id: "f2-camera", alt: "", position: "50% 45%" },
      { id: "p5-solar-farm", alt: "", position: "50% 60%" },
      { id: "m2-capsule-master", alt: "", position: "0% 50%" },
    ],
  },
  // The story, as one pale panel: where the company stands, three framed pictures, the plan, and how we work.
  story: {
    headline: "From the drawing board to a Sydney roof",
    emphasis: "to a Sydney roof",
    where: "Everything on this site describes the design, and none of it is in service yet. The platform, both systems and the software are designed. We are raising a pre-seed round to build the system and run a pilot with a small number of commercial buildings under 70 metres in Sydney.",
    // Framed once each on the page (the bubble hero's are decorative). Below 768 the first is left out.
    pictures: [
      { id: "s6-automation", alt: "The Lienry dock open beside a building, the drone rising above it on its tether", position: "50% 40%" },
      { id: "co1-company", alt: "The Lienry drone washing the glass of an office tower, seen from the street", position: "52% 50%" },
      { id: "m1-drone-master", alt: "The Lienry drone washing a glass wall", position: "55% 50%" },
    ],
    values: {
      lead: "How we work.",
      // Cut to what Liam's statement just below does not already say (its closing sentence carries the rest).
      text: "We design safety in rather than leaving it to supervision.",
    },
  },
  // The plan, as a ruler of stems (PlanTimeline). It opens on the stage marked "now".
  plan: {
    label: "Where Lienry is, and what comes next",
    stages: [
      { id: "designed", title: "Designed", line: "The platform, both systems and the software are designed.", phase: "done", tag: "Done" },
      { id: "pre-seed", title: "Pre-seed", line: "We are raising a pre-seed round to build the system.", phase: "now", tag: "Now" },
      { id: "build", title: "Build", line: "The system itself: the drone, its dock, the tether and the software.", phase: "next", tag: "Next" },
      { id: "pilot", title: "Sydney pilot", line: "A small number of commercial buildings under 70 metres.", phase: "planned", tag: "Planned" },
      { id: "hose-free", title: "Hose-free model", line: "An idea in development for some sites, not part of the pilot.", phase: "exploring", tag: "Exploring" },
    ] satisfies PlanStage[],
  },
  // The three rules. The page shows them as the story's closing line, but scripts/check-rules.mjs still
  // reads them: check 11 allows "approvals" inside Honest by default.
  values: {
    items: [
      { title: "Honest by default", body: "No invented customers, results or approvals, and every statistic is cited." },
      { title: "Safe by design", body: "The tether, camera and surface checks are the design, not add-ons." },
      { title: "Built for owners", body: "If it does not make a property easier to own, it does not ship." },
    ],
  },
  // Liam's vision statement, in the words he approved on 7 November 2026: the first two sentences as the
  // display line, the third under it, then his name and title. Over the home hero's still, darkened.
  vision: {
    label: "A note from our founder",
    lead: "Exterior cleaning still means a crew, a rope and a date weeks away.",
    line: "We are building Lienry so a property can look after its own exterior: a drone that lives on site, cleans from a model of the building, and keeps people off ropes.",
    close: "We say only what we can stand behind, and every decision is measured against one question: does this make a property easier to own?",
    name: "Liam Kennedy",
    title: "Founder and CEO",
    image: { id: "h0-hero-still", alt: "", position: "62% 45%" },
  },
  // The pre-seed round, centred: who leads the company, three facts from the round's own paragraph (what
  // it funds, who we want to hear from, what we share), then the investor action. No amounts, no backers.
  round: {
    headline: "Raising our pre-seed round",
    lead: "Liam Kennedy, our founder and CEO, leads Lienry Drones from Sydney with a co-founder.",
    // Each fact's glyph is one of the menus' tiles (MenuTile).
    facts: [
      { glyph: "chart", title: "What the round funds", text: "Building the system and running the Sydney pilot." },
      { glyph: "building", title: "Who we want to hear from", text: "Investors in hardware, property technology or automation." },
      { glyph: "layers", title: "What we share", text: "A walkthrough of the platform and the pilot plan." },
    ] as const,
    action: { label: "Investor enquiries", href: "/register-interest?type=investor" },
  },
  founders: {
    // The co-founder stays unpublished, with no name or title, until the owner supplies them.
    people: [
      { name: "Liam Kennedy", title: "Founder and CEO", bio: "", photo: null, published: true },
      { name: "Co-founder", title: "", bio: "", photo: null, published: false },
    ] satisfies FounderEntry[],
  },
  close: {
    headline: "Own a building that could use this? We would like to hear about it.",
    action: { label: "Register interest", href: "/register-interest" },
    secondary: { label: "Check your building", href: "/fit-check" },
  },
  /** Under the pre-seed round's action. */
  media: "For media enquiries, use the enquiry form and we will reply directly.",
};
