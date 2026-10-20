// The cost calculator's words (src/components/sections/CostCalculator.tsx; the arithmetic is in
// src/lib/calculator.ts). It adds up the visitor's own figures only: no Lienry price, saving, ROI or
// comparison, and "price" never appears. Final in the design-pass foundation.

export const calculatorCopy = {
  fields: {
    type: { label: "Building type", placeholder: "Choose a type" },
    area: { label: "Facade area (m²)", labelSolar: "Panel area (m²)", error: "Enter the area as a whole number of square metres, from 1 to 1,000,000." },
    spend: { label: "Outsourced cleaning per year (AUD)", prefix: "$", error: "Enter what you pay each year in whole dollars, from 1 to 10,000,000." },
    rise: { label: "Yearly increase (%)", help: "Optional. Your own estimate.", defaultValue: "0", error: "Enter a percentage from 0 to 20." },
  },
  outputs: { five: "Over 5 years", ten: "Over 10 years", perArea: "Per m² each year", empty: "–", emptySr: "Not calculated yet", underOne: "Under $1" },
  status: { five: "Over 5 years, {five}.", ten: "Over 10 years, {ten}.", perArea: "{perArea} per square metre each year." },
  note: "Uses only the figures you enter. Not a Lienry quote or estimate.",
  /** The follow-on link under the results, by building type ("" before one is chosen). */
  routes: {
    "": { label: "Register interest", href: "/register-interest" },
    House: { label: "Register interest", href: "/register-interest?type=homeowner" },
    Apartment: { label: "Register interest", href: "/register-interest?type=homeowner" },
    "Rental property": { label: "I own rentals", href: "/register-interest?type=landlord" },
    "Apartment building": { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
    "Commercial building": { label: "Book a pilot conversation", href: "/register-interest?type=commercial" },
    "Solar farm": { label: "Register interest", href: "/register-interest" },
    Other: { label: "Register interest", href: "/register-interest" },
  },
  /** The listing layout on /calculator: each result as a card (its line and meta under the label),
   *  then a note card and the follow-on card. Lienry's own words; the figures are the visitor's own. */
  listing: {
    results: {
      five: { line: "Five years of what you pay now, rising by your yearly increase.", meta: "From your spend and increase" },
      ten: { line: "The same sum, carried on to ten years.", meta: "From your spend and increase" },
      perArea: { line: "One year of your spend, spread over your facade area.", meta: "From your spend and area" },
    },
    note: { panel: "Your figures, added up", title: "About these sums", meta: "Rounded to whole dollars" },
    route: { line: "Lienry is pre-launch. Tell us about your property and we reply ourselves.", meta: "Homes, rentals and commercial buildings" },
  },
} as const;

/** /calculator's featured row under the page title (src/app/calculator/page.tsx). The picture and
 *  the page title stay in calculatorPage (src/content/tools.ts). */
export const calculatorFeature = {
  title: "A decade of cleaning bills, added up",
  note: "Have three figures ready: your facade area, your yearly spend and any yearly increase.",
  meta: "Your figures stay on this page. Nothing is sent or stored.",
  action: { label: "Open the calculator", href: "#cost" },
} as const;
