// /privacy copy. Moved verbatim from pages.ts (privacyPage) by the design-pass foundation;
// the /privacy page package owns this module. Conventions: `emphasis` is the trailing phrase of its
// `headline`, images are ImageRef-compatible `{ id, alt, position }` with manifest still ids, and links
// are Action-compatible `{ label, href }`.

export const privacyPage = {
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
