import { z } from "zod";

export const enquiryTypes = ["homeowner", "landlord", "commercial", "investor"] as const;
export type EnquiryType = (typeof enquiryTypes)[number];

export const enquiryTypeLabels: Record<EnquiryType, string> = {
  homeowner: "Homeowner",
  landlord: "Landlord or property investor",
  commercial: "Commercial building pilot",
  investor: "Investor",
};

export const propertyTypes = [
  "House",
  "Apartment",
  "Rental property",
  "Apartment building",
  "Commercial building",
  "Solar farm",
  "Other",
] as const;

export const enquirySchema = z.object({
  type: z.enum(enquiryTypes),
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  propertyType: z.enum(propertyTypes).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  // Honeypot: real users never fill this.
  company: z.string().max(0).optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
