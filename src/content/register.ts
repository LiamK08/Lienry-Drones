// /register-interest copy. Moved verbatim from pages.ts (registerPage) by the design-pass foundation;
// the /register-interest page package owns this module. Conventions: `emphasis` is the trailing phrase of its
// `headline`, images are ImageRef-compatible `{ id, alt, position }` with manifest still ids, and links
// are Action-compatible `{ label, href }`.

export const registerPage = {
  headline: "Tell us about your property.",
  lead: "Whether you own a home, manage a building, hold rentals or invest, we would like to hear from you. Lienry is pre-launch, and we reply personally.",
  image: { id: "h0-hero-still", alt: "The Lienry drone washing a glass curtain wall, its tether rising to the roof", position: "60% 50%" },
  success: {
    headline: "Thanks, we have your details.",
    body: "We will be in touch as the pilot program takes shape. If you asked about the pre-seed round, Liam will reply directly.",
  },
};
