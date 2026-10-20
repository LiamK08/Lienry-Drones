// /register-interest copy. Conventions shared with every content module.

export const registerPage = {
  eyebrow: "Register interest",
  headline: "Tell us about your property",
  emphasis: "your property",
  lead: "Homes, commercial buildings, rentals or investment. Lienry is pre-launch, and every enquiry gets a personal reply.",
  checks: ["Commercial buildings under 70 metres: a pilot in Sydney is being prepared", "Homes and rentals: the home system and its app", "Investors: we are raising a pre-seed round"],
  /** The left card: one tab per enquirer type (keys match enquiryTypes), each with Lienry's own line
   *  about what a reply covers and a link into the page that describes it. No customers or quotes. */
  types: {
    label: "Who is asking",
    items: {
      homeowner: {
        tab: "Homeowners",
        line: "Tell us about your house. We reply ourselves with what the home system is designed to clean, and keep you posted as it takes shape.",
        link: { label: "The home system", href: "/homes-and-rentals" },
      },
      landlord: {
        tab: "Landlords",
        line: "Own rentals, nearby or from overseas? We explain how the ground pod and the app are designed to clean a property between tenants with nobody on site.",
        link: { label: "Homes and rentals", href: "/homes-and-rentals" },
      },
      commercial: {
        tab: "Commercial",
        line: "We are preparing a pilot with a small number of commercial buildings under 70 metres in Sydney. If yours could be one, we set up a conversation.",
        link: { label: "The commercial system", href: "/commercial" },
      },
      investor: {
        tab: "Investors",
        line: "We are raising a pre-seed round to build the system and run the Sydney pilot. Liam, our founder, replies to investor enquiries himself.",
        link: { label: "About the company", href: "/company" },
      },
    },
  },
  next: {
    title: "What happens next",
    steps: [
      { n: "1", text: "We read every enquiry ourselves." },
      { n: "2", text: "We reply with what we can say about your property today." },
      { n: "3", text: "If it suits the pilot, we set up a conversation." },
    ],
  },
  success: {
    headline: "Thanks, we have your details.",
    body: "We will be in touch as the pilot program takes shape. If you asked about the pre-seed round, Liam will reply directly.",
  },
};
