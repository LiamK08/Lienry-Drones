// Home page copy, and only the home page's objects (the inner pages' copy is one module per route,
// re-exported by pages.ts). Conventions shared with every content module:
// - `emphasis` is always the trailing phrase of its `headline`; `Headline` sets it in the italic.
// - Images are ImageRef-compatible `{ id, alt, position }`, where `id` is a still in scripts/media/manifest.json.
// - Links are Action-compatible `{ label, href }`.
// - Facts come from docs/SITE-PLAN.md only. Nothing here claims a customer, result, price, saving or approval.

import type { FlowStep } from "@/components/ui/StepTabs";
import type { StepId } from "@/content/software";

export const hero = {
  headline: "Clean exteriors. Nobody on site.",
  emphasis: "Nobody on site.",
  support: "A resident cleaning drone for the property you own.",
  primary: { label: "Register interest", href: "/register-interest" },
  videoId: "h1-hero-film" as const,
  posterId: "h0-hero-still" as const,
};

/**
 * Four reasons, each a whole-card link with a 4:5 still. Card 1 plays the commercial clip on hover or
 * focus (its first and last frame is the still, so the handover is seamless); the others are stills
 * until a clip exists for them.
 */
export const benefits = {
  eyebrow: "by design",
  headline: "Designed to stay. Built to clean.",
  emphasis: "Built to clean.",
  intro: "A resident drone for glass, solar panels, walls, roofing and driveways on buildings under 70 metres.",
  cards: [
    {
      id: "c1-commercial-hero",
      title: "Lives on the roof",
      body: "A weatherproof capsule keeps the drone on the building between cleans.",
      href: "/commercial",
      position: "73% 50%",
      alt: "The roof capsule open on an office roof at first light, the drone rising above its cradle",
      clip: { videoId: "c2-commercial-clip" as const },
    },
    {
      id: "f1-tether",
      title: "Nobody at height",
      body: "A tether, an obstacle-avoidance camera and onboard surface checks are built in.",
      href: "/platform#tether",
      position: "43% 45%",
      alt: "The tether's metal coupling where it enters the underside of the drone",
      clip: null,
    },
    {
      id: "y2-story-panels",
      title: "Each surface, its own pressure",
      body: "It identifies each material and adjusts its pressure to suit.",
      href: "/platform#drone",
      position: "50% 45%",
      alt: "The drone washing rooftop solar panels, half the array clean and wet",
      clip: null,
    },
    {
      id: "ho1-homes-hero",
      title: "Start it from anywhere",
      body: "On the home system, start a clean from the app wherever you are.",
      href: "/homes-and-rentals",
      position: "48% 50%",
      alt: "The drone washing a window at the side of a house, its tether running down to the ground pod",
      clip: null,
    },
  ],
};

/** The five steps of a clean, each driving a preset of the coded software window on a demo building. */
export type FlowStepId = "scan" | "plan" | "clean" | "check" | "report";

export const flow = {
  eyebrow: "how it works",
  headline: "Every clean starts from the scan.",
  intro: "Select a step to see it in the desktop software, on a demo building.",
  label: "Steps of a clean",
  steps: [
    { id: "scan", number: "01", tab: "Scan", line: "The drone maps the building's structure and dimensions." },
    { id: "plan", number: "02", tab: "Plan", line: "Each zone gets its own surface, preset and pressure." },
    { id: "clean", number: "03", tab: "Clean", line: "The clean moves down the facade, two passes per floor." },
    { id: "check", number: "04", tab: "Check", line: "A re-scan shades the areas where debris has built up." },
    { id: "report", number: "05", tab: "Report", line: "The software shows what was cleaned and when the next clean is due." },
  ] satisfies readonly FlowStep<FlowStepId>[],
  /** The window preset each step applies. */
  presets: { scan: "map", plan: "plan", clean: "clean", check: "rescan", report: "report" } satisfies Record<FlowStepId, StepId>,
};

export const cost = {
  eyebrow: "your numbers",
  headline: "Your cleaning spend, added up.",
  intro: "See what outsourced exterior cleaning costs you over 5 and 10 years.",
};

export const places = {
  eyebrow: "where it works",
  headline: "Built around your property.",
  emphasis: "your property.",
  intro: "Five kinds of property, one platform.",
  track: { label: "Property types. Use left and right arrow keys to browse.", prevLabel: "Previous property", nextLabel: "Next property" },
  // Full 2:3 portraits. The order keeps the ground-pod stills with the open lid (p3, p4) out of view
  // of the one with the closed lid (p5) at three across.
  cards: [
    { id: "p3-house", title: "Homes", body: "Windows, walls, roofing and the driveway, started from the app.", href: "/homes-and-rentals" },
    { id: "p4-rental", title: "Rental properties", body: "A clean before the next tenant, started from anywhere.", href: "/homes-and-rentals" },
    { id: "p1-tower", title: "Commercial towers", body: "Glass, walls and roofing under 70 metres, from a roof capsule.", href: "/commercial" },
    { id: "p2-apartments", title: "Apartment buildings", body: "Facades and balcony glass with nobody working at height.", href: "/commercial" },
    { id: "p5-solar-farm", title: "Solar farms", body: "Panels cleaned on the interval you set.", href: "/solar" },
  ],
};

/** The founder's letter, set in the serif at the H3 step (`.letter`). */
export const visionLetter = {
  eyebrow: "from the founder",
  headline: "Why we are building Lienry.",
  paragraphs: [
    "Buildings get dirty on their own schedule, not when someone is free to clean them.",
    "So we are building a drone that lives on the property and keeps its exterior clean.",
    "It maps the building, treats each surface as its own material, and nobody has to be there.",
    "We are at concept stage in Sydney and raising our pre-seed round. We would like to hear from you.",
  ],
  signature: { name: "Liam Kennedy", title: "Founder and CEO" },
  link: { label: "About Lienry", href: "/company" },
};

export const faqHead = {
  eyebrow: "questions",
  headline: "What people ask first.",
};

export const closing = {
  eyebrow: "get involved",
  headline: "Help shape what comes next.",
  emphasis: "what comes next.",
  body: "Lienry is pre-launch. Tell us about your property.",
  primary: { label: "Register interest", href: "/register-interest" },
  links: [
    { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
    { label: "Investor enquiries", href: "/register-interest?type=investor" },
  ],
  collage: [
    { id: "y5-story-done", alt: "A rental house after its clean, the ground pod open by the garden tap", position: "50% 55%" },
    { id: "f4-dock", alt: "Rain beading on the closed lid of the roof capsule", position: "50% 50%" },
    { id: "f2-camera", alt: "The drone's sensor strip and scanning sensor, close up", position: "50% 45%" },
  ],
} as const;
