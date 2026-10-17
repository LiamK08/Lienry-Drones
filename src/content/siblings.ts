// The sibling product cards, moved verbatim from pages.ts (F0.1). Deleted at integration: no page
// built in the design pass shows them.

/** The sibling product cards on /commercial, /homes-and-rentals and /solar. A page never shows its own card. */
export const siblings = {
  headline: "The rest of the platform.",
  intro: "Both systems share one platform: the scan, the desktop software and a clean with nobody on site.",
  link: { label: "See the platform", href: "/platform" },
  cards: {
    commercial: {
      title: "Commercial system",
      body: "A roof capsule for commercial buildings under 70 metres.",
      href: "/commercial",
      image: { id: "c1-commercial-hero", alt: "The Lienry roof capsule on a plant deck at dawn", position: "60% 55%" },
    },
    homes: {
      title: "Home system",
      body: "A ground pod for homes, rentals and solar farms, run from your phone.",
      href: "/homes-and-rentals",
      image: { id: "ho1-homes-hero", alt: "The Lienry ground pod beside a house at first light", position: "60% 50%" },
    },
    solar: {
      title: "Solar",
      body: "Panels cleaned at the right pressure, on the interval you set.",
      href: "/solar",
      image: { id: "so1-solar-hero", alt: "A solar farm row at first light with the Lienry drone low over the panels", position: "50% 50%" },
    },
  },
};
