// /download copy. Moved verbatim from pages.ts (downloadPage) by the design-pass foundation;
// the /download page package owns this module. Conventions: `emphasis` is the trailing phrase of its
// `headline`, images are ImageRef-compatible `{ id, alt, position }` with manifest still ids, and links
// are Action-compatible `{ label, href }`.

/**
 * /download: Lienry Desktop for Mac and Windows. Whether the buttons are live, the installer URLs and
 * the version live in src/lib/download.ts, and the tab title with the others in src/lib/site.ts; this
 * is the copy around them.
 */
export const downloadPage = {
  meta: {
    description: {
      soon: "Lienry Desktop is coming soon for Mac and Windows. See the 3D scan of your building, set cleaning zones and surface pressure, and watch every wash as it happens.",
      live: "Download Lienry Desktop for Mac and Windows. See the 3D scan of your building, set cleaning zones and surface pressure, and watch every wash as it happens.",
    },
  },
  headline: "Your building, on your desk.",
  emphasis: "on your desk.",
  lead: "In Lienry Desktop you see the 3D scan of your building, set the cleaning zones and the pressure for each surface, and watch every wash as it happens.",
  actions: {
    platforms: { mac: "Mac", windows: "Windows" },
    download: "Download for",
    soon: "Coming soon",
    version: "Version",
    register: { label: "Register interest", href: "/register-interest" },
  },
  features: {
    headline: "What the software does.",
    intro: "Every clean is planned and followed on a model of your own building, made from the drone's scan.",
    items: [
      { term: "3D building view", text: "Your building as a 3D model, made from the drone's scan of its structure and dimensions." },
      { term: "Cleaning zones and surface pressure", text: "Group the building into zones and set the pressure for each surface, from glass to solar panels." },
      { term: "Live wash progress", text: "Watch the clean move across the building as it happens, and see what is left to wash." },
    ],
  },
  requirements: {
    headline: "System requirements.",
    intro: "What your computer needs to run Lienry Desktop, and what you need to sign in.",
    rows: [
      ["Mac", "macOS 13 or later, on Apple silicon or Intel"],
      ["Windows", "Windows 10 or 11, 64-bit"],
      ["Signing in", "Requires a Lienry drone and an active software plan"],
    ] as const,
  },
  faq: {
    headline: "Before you download.",
    intro: "Straight answers about Lienry Desktop, including what is not ready yet.",
    link: { label: "Register interest", href: "/register-interest" },
    items: [
      {
        id: "drone",
        q: "Do I need a drone to use it?",
        a: "Yes. Signing in requires a Lienry drone and an active software plan, because everything the software shows comes from your drone's scan of your building.",
      },
      {
        id: "mobile",
        q: "Is there a mobile app?",
        a: "An iPhone app is coming later. Until then, Lienry Desktop on a Mac or Windows computer is where you plan a clean and watch it happen.",
      },
      {
        id: "updates",
        q: "How do updates work?",
        a: "Lienry Desktop updates itself. When a new version is ready it installs automatically, so you only need to download it once.",
      },
    ],
  },
};
