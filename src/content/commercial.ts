// /commercial copy. Conventions shared with every content module. Facts come from docs/SITE-PLAN.md
// only: no price, saving or comparison is claimed (the calculator adds up the visitor's own figures).

export const commercialPage = {
  hero: {
    eyebrow: "Commercial buildings",
    headline: "Window cleaning that lives on the roof. Nobody on a rope.",
    emphasis: "Nobody on a rope.",
    lead: "A weatherproof capsule on the roof, a tether fed from above, and desktop software that runs the whole building. Designed for office and apartment buildings under 70 metres.",
    primary: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
  },
  strip: { label: "Designed for buildings under 70 metres", items: ["Office towers", "Apartment blocks", "Mixed use", "Strata", "Glass facades", "Rendered walls"] },
  rows: [
    {
      id: "capsule",
      title: "A capsule on the roof that keeps the drone ready between cleans",
      paragraphs: [
        "The drone lives in a weatherproof capsule on the roof. Its water tether is fed from above, so the drone never carries water and never runs out mid-clean.",
        "Between cleans the capsule shelters and powers it. When the scan says a clean is due, it rises, works down the facade and returns.",
      ],
      checks: ["Weatherproof roof capsule", "Tether fed from above", "No water carried by the drone", "Back to the dock after every clean"],
      image: { id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", position: "50% 50%" },
    },
    {
      id: "scan",
      title: "The building is scanned before the first clean, and re-scanned every two days",
      paragraphs: [
        "The drone maps the building's structure and dimensions, and the scan becomes a model in the desktop software. Every clean is planned on that model.",
        "Every two days it re-scans and decides whether a clean is needed. You can change the interval in settings.",
      ],
      checks: ["Structure and dimensions mapped first", "Re-scan every two days, adjustable", "Debris shaded where it has built up", "The re-scan decides when to clean"],
      image: { id: "s4-scan", alt: "The drone holding off the corner of a glass building to scan it", position: "50% 40%" },
    },
    {
      id: "software",
      title: "The whole building, run from the desktop software",
      paragraphs: [
        "The software sets the water pressure and where to wash, then follows the clean live on a 3D model of the building. This is a demo building with demo data.",
      ],
      checks: ["A 3D model from the scan", "Pressure set for each surface", "Live wash progress", "What was cleaned, and when"],
      link: { label: "Lienry Desktop", href: "/download" },
    },
  ],
  safety: {
    eyebrow: "Safety by design",
    headline: "Safety designed in from the dock up",
    aside: "Designed in, not supervised in",
    tags: ["Tether", "Obstacle camera", "Surface checks"],
    image: { id: "f1-tether", alt: "The tether's metal coupling where it enters the underside of the drone", position: "43% 45%" },
    columns: [
      { icon: "tether", title: "Always tethered", text: "Water and power through one line from the dock, for the whole clean." },
      { icon: "camera", title: "Obstacle avoidance", text: "A camera on the drone watches the surface and what is around it." },
      { icon: "doc", title: "Site permissions", text: "We do not claim any approvals. What each site will need is still being finalised." },
    ],
  },
  close: { headline: "A small number of buildings, first. Is yours one of them?", action: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" } },
};

/**
 * The design-intent figures the home settings cards show (src/content/home.ts systems), with the note
 * they carry. check:rules (check 11) reads this export to accept each figure beside its term and note;
 * any other figure must be a cited stat or demo data.
 */
export const designFacts = {
  note: "Design intent. Concept stage.",
  items: [
    { term: "Building height", value: "<70", unit: "m" },
    { term: "Re-scan interval", value: "2", unit: "days" },
    { term: "People at height", value: "0" },
    { term: "Surface types", value: "5" },
    { term: "Ground pod", value: "1" },
    { term: "Crews to book", value: "0" },
  ],
};
