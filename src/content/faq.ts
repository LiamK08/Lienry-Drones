// The one bank of questions and answers. Every page's FAQ is a set of ids from this bank, so an answer
// reads the same wherever it appears: page packages pick a set, they never edit an answer. Since 26
// October an answer may open with a line, list labelled points and close with a line, as the
// reference's do. Every claim is in docs/SITE-PLAN.md or the site's own content, or is marked "still
// being finalised".
import type { Action } from "@/lib/types";
import type { FaqPoint } from "@/components/sections/Faq";

export type FaqId = "surfaces" | "height" | "safety" | "weather" | "water" | "roof" | "approvals" | "app" | "pilot" | "cost";

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
      { label: "Where it lives", text: "a weatherproof capsule on the roof" },
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
  { id: "weather", q: "What happens in bad weather?", a: "Between cleans it shelters in a weatherproof capsule or waterproof pod. Its weather limits are still being finalised." },
  { id: "water", q: "How much water does it use?", a: "On the roof system the tether is fed from above. Water use per clean is still being finalised." },
  { id: "roof", q: "Does it need rooftop access?", a: "On commercial buildings it lives in a capsule on the roof. What the roof needs is still being finalised." },
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
      { label: "What runs", text: "the roof capsule, its tether and the desktop software" },
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
];

/** The questions each page shows, in display order. */
export const faqSets = {
  home: ["safety", "weather", "water", "roof", "approvals", "app", "pilot"],
  platform: ["surfaces", "height", "safety", "weather", "water", "roof", "approvals", "app", "pilot", "cost"],
  commercial: ["roof", "safety", "weather", "water", "approvals", "pilot", "cost"],
  homes: ["app", "safety", "weather", "water", "approvals", "cost"],
  solar: ["surfaces", "weather", "water", "approvals"],
  fitCheck: ["height", "roof", "surfaces", "pilot"],
} as const satisfies Record<"home" | "platform" | "commercial" | "homes" | "solar" | "fitCheck", readonly FaqId[]>;

/** A page's questions from the bank, in its set's order. */
export const faqFor = (set: keyof typeof faqSets): FaqEntry[] => faqSets[set].map((id) => faqItems.find((i) => i.id === id)!);

/** The home FAQ's link to the full set on /platform. */
export const homeFaqLink = { label: "All questions", href: "/platform#faq" };
