// The one bank of questions and answers. Every page's FAQ is a set of ids from this bank, so an answer
// reads the same wherever it appears. Final in the design-pass foundation: page packages pick a set,
// they never edit an answer. Each answer runs to two lines at 1440, and every claim is in
// docs/SITE-PLAN.md or is marked "still being finalised".
import type { Action } from "@/lib/types";

export type FaqId = "surfaces" | "height" | "safety" | "weather" | "water" | "roof" | "approvals" | "app" | "pilot" | "cost";

export type FaqEntry = { id: FaqId; q: string; a: string; link?: Action };

export const faqIntro = "Straight answers, including what is still being finalised.";

export const faqItems: readonly FaqEntry[] = [
  { id: "surfaces", q: "Which surfaces does it clean?", a: "Glass, solar panels, walls, roofing and driveways. The drone sets its pressure for each material." },
  { id: "height", q: "How tall a building can it clean?", a: "The commercial system is designed for buildings under 70 metres, working from a capsule on the roof." },
  { id: "safety", q: "How is it kept safe?", a: "It works on a tether, with an obstacle-avoidance camera and onboard surface checks. Fail-safes are still being finalised." },
  { id: "weather", q: "What happens in bad weather?", a: "Between cleans it shelters in a weatherproof capsule or waterproof pod. Its weather limits are still being finalised." },
  { id: "water", q: "How much water does it use?", a: "On the roof system the tether is fed from above. Water use per clean is still being finalised." },
  { id: "roof", q: "Does it need rooftop access?", a: "On commercial buildings it lives in a capsule on the roof. What the roof needs is still being finalised." },
  { id: "approvals", q: "What permissions will it need?", a: "We do not claim any approvals. Lienry is at concept stage, and what each site will need is still being finalised." },
  { id: "app", q: "What does the app do?", a: "On the home system the app starts a clean from anywhere and picks the areas. Its release is still being finalised." },
  {
    id: "pilot",
    q: "How does the pilot program work?",
    a: "We are preparing a pilot program for commercial buildings under 70 metres. Dates and terms are still being finalised.",
    link: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
  },
  { id: "cost", q: "What will it cost?", a: "Pricing is still being finalised. We are not publishing prices before the pilot program." },
];

/** The questions each page shows, in display order. */
export const faqSets = {
  home: ["safety", "weather", "water", "roof", "approvals", "app", "pilot"],
  platform: ["surfaces", "height", "safety", "weather", "water", "roof", "approvals", "app", "pilot", "cost"],
  commercial: ["roof", "safety", "weather", "water", "approvals", "pilot", "cost"],
  homes: ["app", "safety", "weather", "water", "approvals", "cost"],
  solar: ["surfaces", "weather", "water", "approvals"],
} as const satisfies Record<"home" | "platform" | "commercial" | "homes" | "solar", readonly FaqId[]>;

/** A page's questions from the bank, in its set's order. */
export const faqFor = (set: keyof typeof faqSets): FaqEntry[] => faqSets[set].map((id) => faqItems.find((i) => i.id === id)!);

/** @deprecated compat for unrebuilt pages; deleted at integration. */
export const platformFaq = { headline: "What people ask first.", intro: faqIntro, link: { label: "Register interest", href: "/register-interest" }, items: faqItems };

/** @deprecated deleted at integration. */
export const homeFaqLink = { label: "All questions", href: "/platform#faq" };
