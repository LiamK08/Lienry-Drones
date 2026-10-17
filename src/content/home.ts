// Home page copy, and only the home page's objects (the inner pages' copy is one module per route,
// re-exported by pages.ts). Conventions shared with every content module:
// - `emphasis` is always the trailing phrase of its `headline`; `Headline` sets it in the italic.
// - Images are ImageRef-compatible `{ id, alt, position }`, where `id` is a still in scripts/media/manifest.json.
// - Links are Action-compatible `{ label, href }`.

export const hero = {
  headline: "Clean exteriors. Nobody on site.",
  emphasis: "Nobody on site.",
  support:
    "A resident cleaning drone for the property you own.",
  primary: { label: "Register interest", href: "/register-interest" },
  secondary: { label: "See how it works", href: "#system" },
  videoId: "h1-hero-film" as const,
  posterId: "h0-hero-still" as const,
};

export const propertyStrip = {
  label: "Built for",
  items: [
    { label: "Commercial buildings under 70 m", href: "/commercial" },
    { label: "Apartment buildings", href: "/commercial" },
    { label: "Homes", href: "/homes-and-rentals" },
    { label: "Rental properties", href: "/homes-and-rentals" },
    { label: "Solar farms", href: "/solar" },
  ],
} as const;

/** The three things a buyer chooses between. The third card shows the app panel as a coded fragment, not a render. */
export const productCards = {
  headline: "The right system for your property.",
  intro: "A roof capsule for commercial buildings under 70 metres, or a ground pod for homes, rentals and solar farms. Both run from the desktop software, and the home system adds a phone app.",
  cards: [
    {
      meta: "For buildings under 70 metres",
      title: "Commercial system",
      body: "A weatherproof capsule on the roof, a tether fed from above, and desktop software that runs the whole building.",
      link: { label: "Commercial system", href: "/commercial" },
      image: { id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", position: "50% 50%" },
    },
    {
      meta: "For houses, apartments, rentals and solar farms",
      title: "Home system",
      body: "A waterproof ground pod, a drone that knows each material, and an app that starts the clean wherever you are.",
      link: { label: "Home system", href: "/homes-and-rentals" },
      image: { id: "m3-pod-master", alt: "The Lienry ground pod open beside a garden tap, the home drone inside", position: "35% 50%" },
    },
    {
      meta: "For the home system",
      title: "Phone app",
      body: "Start a clean from another suburb or another country. Choose the areas, and the drone sets the pressure for each material.",
      link: { label: "See the app", href: "/homes-and-rentals#story" },
      fragment: { ariaLabel: "Illustrative phone app, demo data: driveway and solar panels selected, ready to start a clean", note: "Illustrative app interface. Demo data." },
    },
  ],
};

export const places = {
  headline: "Built around your property.",
  emphasis: "your property.",
  intro: "Five kinds of property, one platform. Each card shows which system does the work and opens its page.",
  track: { label: "Property types. Use left and right arrow keys to browse.", prevLabel: "Previous property", nextLabel: "Next property" },
  // Each card's image alt is "{title}: {body}". The renders are 2:3 portraits, so `position` sets the 4:5 crop.
  cards: [
    { id: "p1-tower", title: "Commercial towers", body: "Glass, walls and roofing on buildings under 70 metres, cleaned from a roof capsule.", system: "Commercial system", href: "/commercial", position: "50% 50%" },
    { id: "p2-apartments", title: "Apartment buildings", body: "Facades, glass and common roofing without contractors working at height.", system: "Commercial system", href: "/commercial", position: "50% 50%" },
    { id: "p3-house", title: "Homes", body: "Windows, walls, roofing and the driveway, started from the app.", system: "Home system", href: "/homes-and-rentals", position: "50% 50%" },
    { id: "p4-rental", title: "Rental properties", body: "Ready for the next tenant without booking a cleaner.", system: "Home system", href: "/homes-and-rentals", position: "50% 50%" },
    { id: "p5-solar-farm", title: "Solar farms", body: "Panels cleaned on the interval you set, with pressure matched to the panel.", system: "Home system", href: "/solar", position: "50% 60%" },
  ],
};

export const filmBand = {
  videoId: "c2-commercial-clip" as const,
  stillId: "c1-commercial-hero" as const,
  headline: "The building checks itself.",
  body: "The capsule stays on the roof between cleans. When the scan says the glass needs it, the drone goes out, washes and comes home. Nobody books it. Nobody attends it.",
  cta: { label: "The commercial system", href: "/commercial" },
};

export const visionLetter = {
  headline: "Why we are building Lienry.",
  paragraphs: [
    "Buildings get dirty on a schedule that has nothing to do with when anyone is free to clean them. Owners book contractors, wait, pay, and repeat, and every job puts someone at height.",
    "We are building a drone that lives on the property instead. It maps the building, decides when a clean is due, treats every surface as its own material, and reports back to your phone. Nobody has to be there.",
    "Lienry is at concept stage in Sydney and we are raising our pre-seed round. If you own or manage a building, or you invest in the companies that serve them, we would like to hear from you.",
  ],
  signature: { name: "Liam Kennedy", title: "Founder and CEO, Lienry Drones" },
  image: { id: "co1-company", alt: "A harbour-side street of mid-rise buildings at dawn", position: "50% 50%" },
};

export const safety = {
  headline: "Safety starts with the design.",
  items: [
    { id: "f1-tether", title: "Tether", body: "A water tether connects the drone to its dock for the whole clean, so it always works on a fixed line close to the building." },
    { id: "f2-camera", title: "Obstacle-avoidance camera", body: "A forward camera watches for obstacles and keeps the drone clear of the building and its fixtures." },
    { id: "f3-surface", title: "Onboard surface checks", body: "The drone identifies the material in front of it and checks the surface before it sets the pressure and washes." },
    { id: "f4-dock", title: "Weatherproof dock", body: "Between cleans the drone is sheltered and charged in its weatherproof roof capsule or waterproof ground pod." },
  ],
  note: "Lienry Drones is at concept stage and is not yet operating. We are preparing a pilot program for commercial buildings.",
  track: { label: "Safety details. Use left and right arrow keys to browse.", prevLabel: "Previous detail", nextLabel: "Next detail" },
};

export const closing = {
  headline: "Help shape what comes next.",
  body: "Register interest for your home or rental, book a place in the commercial pilot program, or talk to us about the pre-seed round.",
  imageId: "ho1-homes-hero",
  imageAlt: "The Lienry ground pod beside a house at first light, the drone washing a window",
  imagePosition: "60% 50%",
  buttons: [
    { label: "Register interest", href: "/register-interest?type=homeowner", variant: "primary" },
    { label: "Book a pilot conversation", href: "/register-interest?type=commercial", variant: "secondary" },
    { label: "Investor enquiries", href: "/register-interest?type=investor", variant: "secondary" },
  ],
} as const;
