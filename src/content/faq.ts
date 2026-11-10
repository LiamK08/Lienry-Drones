// The one bank of questions and answers. Every page's FAQ is a set of ids from this bank, so an answer
// reads the same wherever it appears: page packages pick a set, they never edit an answer. Since 26
// October an answer may open with a line, list labelled points and close with a line, as the
// reference's do. Every claim is in docs/SITE-PLAN.md or the site's own content, or is marked "still
// being finalised".
import type { Action } from "@/lib/types";
import type { FaqPoint } from "@/components/sections/Faq";

export type FaqId = "surfaces" | "height" | "safety" | "weather" | "water" | "roof" | "approvals" | "app" | "pilot" | "cost" | "score" | "result" | "calc-how" | "calc-data";

export type FaqEntry = { id: FaqId; q: string; a: string; points?: readonly FaqPoint[]; after?: string; link?: Action };

export const faqIntro = "Straight answers, including what is still being finalised.";

export const faqItems: readonly FaqEntry[] = [
  {
    id: "surfaces",
    q: "Which surfaces does it clean?",
    a: "Five kinds of exterior, each at the pressure set for it:",
    points: [
      { label: "Glass", text: "facades, windows and roof glazing" },
      { label: "Solar panels", text: "rooftop arrays and solar farm rows, at the pressure set for solar glass" },
      { label: "Walls", text: "render and other wall finishes" },
      { label: "Roofing", text: "metal roofing among them" },
      { label: "Driveways", text: "on the home system, chosen in the app" },
    ],
    after: "The drone sets its pressure for each material before it washes.",
  },
  {
    id: "height",
    q: "How tall a building can it clean?",
    a: "The commercial system is designed for buildings under 70 metres:",
    points: [
      { label: "Where it lives", text: "a weatherproof dock on the roof" },
      { label: "How it reaches the facade", text: "on a tether fed from above, so it never carries water" },
      { label: "How often it looks", text: "a re-scan every two days, which you can change" },
    ],
  },
  {
    id: "safety",
    q: "How is it kept safe?",
    a: "It is designed so nobody works at height:",
    points: [
      { label: "Tether", text: "water and power stay connected, so nothing is carried" },
      { label: "Obstacle camera", text: "avoidance built into the drone" },
      { label: "Surface checks", text: "onboard, on every pass" },
      { label: "Weatherproof dock", text: "shelter between cleans" },
    ],
    after: "Fail-safes are still being finalised.",
  },
  { id: "weather", q: "What happens in bad weather?", a: "Between cleans it shelters in its weatherproof dock. Its weather limits are still being finalised." },
  { id: "water", q: "How much water does it use?", a: "On the roof system the tether is fed from above. Water use per clean is still being finalised." },
  { id: "roof", q: "Does it need rooftop access?", a: "On commercial buildings it lives in a dock on the roof. What the roof needs is still being finalised." },
  { id: "approvals", q: "What permissions will it need?", a: "We do not claim any approvals. Lienry is at concept stage, and what each site will need is still being finalised." },
  {
    id: "app",
    q: "What does the app do?",
    a: "On the home system the app runs the clean:",
    points: [
      { label: "Start a clean", text: "from anywhere, with nobody booked" },
      { label: "Choose the areas", text: "the driveway, the solar panels, the windows, or all three" },
      { label: "Follow it", text: "each area as it is washed, then the house after" },
    ],
    after: "Its release is still being finalised.",
  },
  {
    id: "pilot",
    q: "How does the pilot program work?",
    a: "We are preparing a pilot program for commercial buildings under 70 metres:",
    points: [
      { label: "Who it is for", text: "building owners and facilities managers in Sydney" },
      { label: "What runs", text: "the roof dock, its tether and the desktop software" },
      { label: "The first step", text: "a conversation about your building" },
    ],
    after: "Dates and terms are still being finalised.",
    link: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
  },
  {
    id: "cost",
    q: "What will it cost?",
    a: "Pricing is still being finalised. We are not publishing prices before the pilot program.",
    link: { label: "Add up what outsourced cleaning costs you now", href: "/calculator" },
  },
  // The two tools explain themselves. Each answer restates the tool's own logic (FitCheck.tsx's weights
  // and capOf; src/lib/calculator.ts) or its own copy, and nothing more.
  {
    id: "score",
    q: "How is the score worked out?",
    a: "Your seven answers make a score out of 100, weighted as the design brief is:",
    points: [
      { label: "The building", text: "height, a dock, and water and power count 20 each" },
      { label: "The clean", text: "the other four questions count 10 each" },
      { label: "Yes and Partly", text: "a Yes counts in full and a Partly counts half" },
      { label: "A No on the building", text: "keeps the score under 40, and a Partly there keeps it under 75, because the design needs all three" },
    ],
    after: "It is indicative, from the design brief, and not a site survey.",
  },
  {
    id: "result",
    q: "What happens if I ask for my result?",
    a: "Nothing is sent until you ask. Then your answers and your score come to us with your name and email, and we read every one and reply personally with your result and what a pilot would need.",
  },
  {
    id: "calc-how",
    q: "How are the totals worked out?",
    a: "Only from the figures you enter, rounded to whole dollars:",
    points: [
      { label: "Year one", text: "what you pay now" },
      { label: "Each later year", text: "the year before, raised by your yearly increase" },
      { label: "Over 5 and 10 years", text: "those years added up" },
      { label: "Per m² each year", text: "one year of your spend over your facade or panel area" },
    ],
  },
  {
    id: "calc-data",
    q: "Does anything I type leave this page?",
    a: "No. The calculator works in your browser, and it does not send or store your figures.",
  },
];

/** The questions each page shows, in display order. */
export const faqSets = {
  home: ["safety", "weather", "water", "roof", "approvals", "app", "pilot"],
  platform: ["surfaces", "height", "safety", "weather", "water", "roof", "approvals", "app", "pilot", "cost"],
  commercial: ["roof", "safety", "weather", "water", "approvals", "pilot", "cost"],
  homes: ["app", "safety", "weather", "water", "approvals", "cost"],
  solar: ["surfaces", "weather", "water", "approvals"],
  fitCheck: ["score", "result", "height", "roof", "surfaces", "pilot"],
  calculator: ["calc-how", "calc-data", "cost", "pilot"],
} as const satisfies Record<"home" | "platform" | "commercial" | "homes" | "solar" | "fitCheck" | "calculator", readonly FaqId[]>;

/**
 * A page's questions from the bank, in its set's order. Given the page's own path (`here`), an answer
 * drops a link to that page (the cost answer's link on /calculator), so no answer links to where it is.
 */
export const faqFor = (set: keyof typeof faqSets, here?: string): FaqEntry[] =>
  faqSets[set].map((id) => {
    const item = faqItems.find((i) => i.id === id)!;
    return here && item.link?.href === here ? { ...item, link: undefined } : item;
  });

/** The tool pages' link on to the platform's own set of questions. */
export const homeFaqLink = { label: "More questions", href: "/platform#faq" };
