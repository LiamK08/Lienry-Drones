// /privacy copy. Moved verbatim from pages.ts (privacyPage) by the design-pass foundation;
// the /privacy page package owns this module. Conventions: `emphasis` is the trailing phrase of its
// `headline`, images are ImageRef-compatible `{ id, alt, position }` with manifest still ids, and links
// are Action-compatible `{ label, href }`.

export type PrivacySection = {
  title: string;
  /** The opening paragraph; the lead-in line when a list follows. */
  body: string;
  /** Optional items under the lead-in, rendered as a lettered list: a, b, c. */
  list?: readonly string[];
  /** Optional paragraph after the list. */
  close?: string;
  /** Optional link: where `label` appears in the section's text (its first place in that line), it links to `href`. */
  link?: { label: string; href: string };
};

export const privacyPage: {
  headline: string;
  updated: string;
  sections: readonly PrivacySection[];
} = {
  headline: "Privacy policy",
  updated: "September 2026",
  sections: [
    {
      title: "Who we are",
      body: "Lienry Drones is a Sydney-based company at concept stage. This policy explains what we collect through this website and how we use it. It should be reviewed by a legal adviser before launch.",
    },
    {
      title: "What we collect",
      body: "When you register interest we collect the details you give us:",
      list: [
        "your name;",
        "your email address;",
        "your phone number, if you provide it;",
        "the type of property you are asking about;",
        "its location;",
        "your message; and",
        "which kind of enquiry you selected.",
      ],
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
      body: "In line with the Australian Privacy Principles, you can ask us:",
      list: ["what we hold about you;", "to correct it; or", "to delete it."],
      close: "Contact us through the enquiry form on the Register interest page.",
      // Check 24: a link to /register-interest reads exactly "Register interest".
      link: { label: "Register interest", href: "/register-interest" },
    },
  ],
};
