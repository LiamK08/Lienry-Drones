import { systemExplainer } from "./home";

export const platformPage = {
  eyebrow: "Platform",
  headline: "One platform. Two systems. Six parts.",
  lead: "Lienry is a single drone platform. It lives on the property, maps it, and cleans glass, solar panels, walls, roofing and driveways on buildings under 70 metres.",
  heroImageId: "h0-hero-still",
  parts: systemExplainer.tabs.map((t) => ({ id: t.id, eyebrow: t.tab, title: t.title, body: t.body, imageId: t.imageId, readout: t.readout })),
  specs: {
    eyebrow: "Specifications",
    headline: "What we can say today.",
    rows: [
      ["Building height", "Under 70 metres"],
      ["Surfaces", "Glass, solar panels, walls, roofing, driveways"],
      ["Commercial dock", "Weatherproof roof capsule, water tether fed from above"],
      ["Home dock", "Waterproof ground pod, power and water through the same tether"],
      ["Scan", "Maps the structure and dimensions of the building before the first clean"],
      ["Re-scan interval", "Every two days on commercial buildings, adjustable in settings"],
      ["Pressure", "Set by the software for each material, adjustable in the app"],
      ["Control", "Desktop software for both systems; personalised mobile app for the home system"],
      ["Status", "Concept stage; pilot program in preparation"],
    ] as const,
  },
};

export const platformFaq = {
  eyebrow: "Questions",
  headline: "What people ask first.",
  items: [
    { q: "Which surfaces does it clean?", a: "Glass, solar panels, walls, roofing and driveways. During a clean the drone identifies each material and adjusts its pressure to suit, and you can change the setting in the app." },
    { q: "How tall a building can it work on?", a: "Buildings under 70 metres. On a commercial building the drone lives in a weatherproof capsule on the roof with its water tether fed from above; on a house or a solar farm it works from a waterproof ground pod." },
    { q: "Where does the water come from?", a: "From the tether. It is fed from above on the roof system and from the ground pod on the home system, so the drone never carries water. A hose-free model is an idea we are exploring for some sites, not a product." },
    { q: "How does it decide when to clean?", a: "On a commercial building it re-scans every two days and decides whether a clean is needed. You can change the interval in settings, and you can start a clean yourself from the app or the desktop software at any time." },
    { q: "Does anyone need to be there?", a: "No. Setup is done once. After that the system runs from the dock, and you can start or watch a clean from anywhere." },
    { q: "Is Lienry operating yet?", a: "Not yet. Lienry Drones is at concept stage in Sydney, raising a pre-seed round and preparing a pilot program for commercial buildings. We do not claim any approvals, customers or results, and we will only ever publish figures we can stand behind." },
    { q: "What does it cost?", a: "We are not publishing prices before the pilot program. Pilot buildings will see them first. The aim is a cheaper long-term alternative to outsourced commercial window cleaning." },
  ],
};

export const commercialPage = {
  eyebrow: "Commercial system",
  headline: "Window cleaning that lives on the roof.",
  lead: "A weatherproof capsule on the roof, a tether fed from above, and desktop software that runs the whole building. Lienry is a cheaper long-term alternative to outsourced commercial window cleaning.",
  heroImageId: "c1-commercial-hero",
  heroVideoId: "c2-commercial-clip",
  steps: {
    eyebrow: "How it works",
    headline: "Four steps, then it runs itself.",
    items: [
      { n: "01", title: "Install the capsule", body: "The drone lives in a weatherproof capsule on the roof. Its water tether is fed from above, so the drone never carries water." },
      { n: "02", title: "Scan the building", body: "The drone scans the building to map its structure and dimensions. The scan uploads to the desktop software." },
      { n: "03", title: "Set and run", body: "The software sets the water pressure and where to wash, then tracks the clean live on a 3D model of the building." },
      { n: "04", title: "Re-scan every two days", body: "The drone re-scans the building every two days and decides whether a clean is needed. Change the interval in settings whenever you like." },
    ],
  },
  software: {
    eyebrow: "The software",
    headline: "What the desktop software shows.",
    tiles: [
      { title: "A 3D model of your building", body: "Built from the scan, so every clean is planned on the real structure." },
      { title: "Live wash progress", body: "Watch the clean move across the facade as it happens." },
      { title: "Debris shading", body: "Areas of built-up debris are shaded so you can see where the next clean is needed." },
    ],
  },
  cost: {
    eyebrow: "Over time",
    headline: "Why it costs less over time.",
    body: "Instead of paying for each visit from an outsourced crew, the drone lives on the building and cleans when the scan says it should. We are not publishing prices before the pilot program; we will share them with pilot buildings first.",
  },
  pilot: {
    eyebrow: "Pilot program",
    headline: "A small number of buildings, first.",
    body: "We are preparing a pilot program for commercial buildings under 70 metres in Sydney. If you own or manage one, book a conversation and we will walk you through what the pilot involves.",
    cta: { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
  },
};

export const homesPage = {
  eyebrow: "Home system",
  headline: "Your property, cleaned from anywhere.",
  lead: "A waterproof ground pod, a drone that knows each material, and an app that starts the clean wherever you are. For houses, apartments, rental properties and solar farms.",
  heroImageId: "ho1-homes-hero",
  steps: {
    eyebrow: "How it works",
    headline: "Set up once. Start from anywhere.",
    items: [
      { n: "01", title: "The pod goes in", body: "A waterproof ground pod powers the drone and feeds it water through the tether." },
      { n: "02", title: "The property is mapped", body: "A detailed scan maps the property so the drone knows every surface it can reach." },
      { n: "03", title: "Choose what to clean", body: "Pick the surfaces in your personalised app. The drone identifies each material and adjusts its pressure; you can change it if you want to." },
      { n: "04", title: "Start from anywhere", body: "Tap start from wherever you are and follow the progress on your phone or the desktop software." },
    ],
  },
  app: {
    eyebrow: "The app",
    headline: "Made for the way you own property.",
    items: [
      { title: "Start a clean remotely", body: "From another suburb or another country." },
      { title: "Choose the areas", body: "The driveway before an inspection, the panels after a dusty week." },
      { title: "Pressure by material", body: "Glass, panels, render, roofing and concrete each get the pressure they should." },
      { title: "Desktop software too", body: "The same control on a bigger screen, with the scan and the progress side by side." },
    ],
  },
  statsHeadline: "Why it matters in Australia.",
};

export const solarPage = {
  eyebrow: "Solar",
  headline: "Panels that stay at full output.",
  lead: "Dust and grime cost solar owners real energy. Lienry treats a panel as its own material, sets the pressure to match, and cleans on the interval you choose.",
  heroImageId: "so1-solar-hero",
  closeImageId: "so2-solar-closeup",
  statsHeadline: "What soiling costs.",
  statsIntro: "These figures are from peer-reviewed and international sources; each is cited. They describe the problem, not Lienry's results.",
  how: {
    eyebrow: "How Lienry cleans panels",
    headline: "The right pressure, on your schedule.",
    items: [
      { title: "It knows a panel is a panel", body: "During a clean the drone identifies each material it is cleaning and adjusts its pressure to suit." },
      { title: "Roofs and farms", body: "Rooftop solar is cleaned by the home system from a ground pod. Solar farms use the same pod and tether." },
      { title: "Your interval", body: "Set how often the drone should check and clean, and change it in the app whenever conditions change." },
    ],
  },
};

export const companyPage = {
  eyebrow: "Company",
  headline: "Built in Sydney for the buildings people own.",
  statement:
    "Lienry Drones is a Sydney company at concept stage. We are building a resident cleaning drone that lives on a property and keeps its exterior clean with nobody on site, and we are raising our pre-seed round to build it.",
  founders: {
    eyebrow: "Founders",
    headline: "Two founders, one building at a time.",
    people: [
      { name: "Liam Kennedy", title: "Founder and CEO", photo: null, bio: "Liam leads Lienry Drones from Sydney. Photo to come." },
      { name: "Co-founder", title: "Title to come", photo: null, bio: "Name, title and photo to come." },
    ],
  },
  where: {
    eyebrow: "Where we are",
    headline: "Concept stage, pre-seed, pilot in preparation.",
    items: [
      { title: "Concept stage", body: "The platform, the two systems and the software are designed. We are building toward a pilot." },
      { title: "Raising pre-seed", body: "We are raising a pre-seed round to build and pilot the system." },
      { title: "Pilot program", body: "A small number of commercial buildings under 70 metres in Sydney, first." },
      { title: "Sydney, Australia", body: "Designed for Australian buildings, weather and property owners." },
    ],
  },
  values: {
    eyebrow: "How we work",
    headline: "Three rules we build by.",
    items: [
      { title: "Honest by default", body: "We only say what we can stand behind. No invented customers, results or approvals, and every statistic on this site is cited to its source." },
      { title: "Safe by design", body: "The tether, the obstacle-avoidance camera, the onboard surface checks and the weatherproof dock are the design, not add-ons. Safety is not left to supervision." },
      { title: "Built for owners", body: "Every decision is measured against one question: does this make a property easier to own? If it does not, it does not ship." },
    ],
  },
  exploring: {
    eyebrow: "In development",
    headline: "What we are exploring.",
    body: "For some sites we are exploring a hose-free model. It is an idea in development, not a product, and it is not part of the pilot program.",
  },
  investors: {
    eyebrow: "Investors",
    headline: "Talk to us about the pre-seed round.",
    body: "If you invest in hardware, property technology or automation, we would like to walk you through the platform, the two systems and the pilot plan.",
    cta: { label: "Investor enquiries", href: "/register-interest?type=investor" },
  },
};

export const registerPage = {
  eyebrow: "Register interest",
  headline: "Tell us about your property.",
  lead: "Whether you own a home, manage a building, hold rentals or invest, we would like to hear from you. Lienry is pre-launch, and we reply personally.",
  success: {
    headline: "Thanks, we have your details.",
    body: "We will be in touch as the pilot program takes shape. If you asked about the pre-seed round, Liam will reply directly.",
  },
};

export const privacyPage = {
  eyebrow: "Privacy",
  headline: "Privacy policy.",
  updated: "September 2026",
  sections: [
    {
      title: "Who we are",
      body: "Lienry Drones is a Sydney-based company at concept stage. This policy explains what we collect through this website and how we use it. It should be reviewed by a legal adviser before launch.",
    },
    {
      title: "What we collect",
      body: "When you register interest we collect the details you give us: your name, email address, phone number if you provide it, the type of property you are asking about, its location, your message, and which kind of enquiry you selected.",
    },
    {
      title: "How we use it",
      body: "We use your details to reply to your enquiry, to keep you informed about the pilot program and the product, and to understand which kinds of properties people are asking about. We do not sell your details and we do not share them with advertisers.",
    },
    {
      title: "Where it is stored",
      body: "Enquiries are sent to the email address or service we nominate for handling them. We keep them only as long as we need them to respond to you and to run the pilot program.",
    },
    {
      title: "Cookies and analytics",
      body: "This site does not set advertising cookies. If we add privacy-respecting analytics we will update this policy.",
    },
    {
      title: "Your rights",
      body: "You can ask us what we hold about you, ask us to correct it, or ask us to delete it, in line with the Australian Privacy Principles. Contact us using the details on the Company page.",
    },
  ],
};
