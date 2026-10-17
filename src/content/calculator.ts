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
} as const;
