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
  hero: {
    headline: "Your building, on your desk",
    emphasis: "on your desk",
    lead: "See the 3D scan of your building, set zones and pressure, and watch every wash live.",
  },
  actions: {
    platforms: { mac: "Mac", windows: "Windows" },
    download: "Download for",
    soon: "Coming soon",
    version: "Version",
    /** The availability line under Register interest while neither download is live. */
    status: "Coming soon for Mac and Windows",
    register: { label: "Register interest", href: "/register-interest" },
  },
  features: {
    headline: "What the software does",
    intro: "Every clean is planned on a model of your own building.",
    items: [
      { term: "3D building view", text: "A model of your building from the drone\u2019s scan, to turn and look over from every side." },
      { term: "Zones and pressure", text: "Group surfaces into zones and set the pressure for each, gentle for skylights and standard for glass." },
      { term: "Live wash progress", text: "Watch the clean move across the building, panel by panel, with debris marked where it is found." },
    ],
  },
  faq: {
    headline: "Before you download",
    intro: "Including what is still being finalised.",
    link: { label: "Register interest", href: "/register-interest" },
    items: [
      { id: "drone", q: "Do I need a drone to use it?", a: "Yes. Everything it shows comes from your drone's scan. What signing in needs is still being finalised." },
      { id: "requirements", q: "What does my computer need?", a: "macOS 13 or later on Apple silicon or Intel, or 64-bit Windows 10 or 11." },
      { id: "mobile", q: "Is there a mobile app?", a: "The home system has a mobile app. Its release is still being finalised." },
      { id: "updates", q: "How do updates work?", a: "How Lienry Desktop is updated is still being finalised." },
    ],
  },
};
