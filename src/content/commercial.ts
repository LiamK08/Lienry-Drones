// /commercial copy. Conventions shared with every content module: `emphasis` is the trailing phrase
// of its `headline`; images are ImageRef-compatible `{ id, alt, position }` with manifest still ids;
// links are Action-compatible `{ label, href }`. Facts come from docs/SITE-PLAN.md only: no price,
// saving or comparison is claimed (the calculator adds up the visitor's own figures).

export const commercialPage = {
  hero: {
    eyebrow: "commercial system",
    headline: "Window cleaning that lives on the roof.",
    emphasis: "on the roof.",
    lead: "A roof capsule, a tether fed from above, and desktop software that runs the whole building.",
    primary: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
    secondary: { label: "See the platform", href: "/platform" },
    film: {
      kind: "film" as const,
      videoId: "c2-commercial-clip" as const,
      posterId: "c1-commercial-hero" as const,
      alt: "The Lienry roof capsule on a plant deck at dawn, the drone rising from its cradle",
      name: "commercial film",
      position: "80% 50%",
    },
  },
  steps: {
    eyebrow: "four steps",
    headline: "Four steps, then it runs itself.",
    emphasis: "then it runs itself.",
    intro: "From an empty roof to a building that knows when it needs a clean.",
    track: { label: "Steps. Use left and right arrow keys to browse.", prevLabel: "Previous step", nextLabel: "Next step" },
    items: [
      {
        n: "01",
        title: "Install the capsule",
        body: "The drone lives on the roof, its tether fed from above.",
        image: { id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", position: "50% 50%" },
      },
      {
        n: "02",
        title: "Scan the building",
        body: "It maps the structure and dimensions for the software.",
        image: { id: "s4-scan", alt: "The drone holding off the corner of a glass building to scan it, with no spray", position: "50% 40%" },
      },
      {
        n: "03",
        title: "Set and run",
        body: "The software sets the pressure and tracks the clean live.",
        image: { id: "s5-software", alt: "A laptop on a desk showing the desktop software's shaded 3D building", position: "50% 50%" },
      },
      {
        n: "04",
        title: "Re-scan",
        body: "Every two days it checks whether a clean is needed.",
        image: { id: "s6-automation", alt: "The roof capsule open at dawn, the drone rising from its cradle", position: "50% 40%" },
      },
    ],
  },
  software: {
    eyebrow: "desktop software",
    headline: "The whole building on one screen.",
    emphasis: "on one screen.",
    intro: "A 3D model from the scan, live wash progress and debris shading, on a demo building.",
  },
  cost: {
    eyebrow: "your numbers",
    headline: "Add up what you spend now.",
    emphasis: "what you spend now.",
    intro: "Enter your facade area and yearly cleaning spend for 5 and 10 year totals.",
  },
  faq: {
    eyebrow: "questions",
    headline: "What building owners ask first.",
    link: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
  },
  closing: {
    eyebrow: "pilot program",
    headline: "A small number of buildings, first.",
    emphasis: "buildings, first.",
    body: "We are preparing a pilot for buildings under 70 metres in Sydney.",
    primary: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
    links: [{ label: "Investor enquiries", href: "/register-interest?type=investor" }],
    collage: [
      { id: "p1-tower", alt: "The commercial drone mid-clean on a glass office building, its tether rising to the roof", position: "50% 50%" },
      { id: "f4-dock", alt: "Rain beading on the closed lid of the roof capsule", position: "50% 50%" },
      { id: "f1-tether", alt: "The tether's metal coupling where it enters the underside of the drone", position: "43% 45%" },
    ],
  },
} as const;
