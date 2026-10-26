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

export const propertyCounts = ["1", "2 to 5", "6 to 20", "More than 20"] as const;

export const enquirySchema = z.object({
  type: z.enum(enquiryTypes),
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  organisation: z.string().trim().max(160).optional().or(z.literal("")),
  propertyCount: z.enum(propertyCounts).optional().or(z.literal("")),
  updates: z.boolean().optional(),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  propertyType: z.enum(propertyTypes).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(2000, "Please keep this under 2,000 characters.").optional().or(z.literal("")),
  // Where it was sent from: the enquiry form (the default) or the fit check's "Email me my result".
  source: z.enum(["form", "fit-check", "booking"]).optional(),
  // The booking card's requested call: its Sydney day and time (one of the offered times), the visitor's
  // own zone, and how they would like the call. The route checks the day is open and builds the reply's
  // readable time and its instant; nothing is booked until a person confirms it.
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  preferredSlot: z.string().regex(/^\d{1,2}:\d{2} (am|pm)$/).optional(),
  timeZone: z.string().trim().max(64).optional(),
  callBy: z.enum(["video", "phone"]).optional(),
  // Honeypot: real users never fill this.
  company: z.string().max(0).optional().or(z.literal("")),
}).superRefine((v, ctx) => {
  if (v.callBy === "phone" && !v.phone) ctx.addIssue({ code: "custom", path: ["phone"], message: "Please enter a phone number for the call." });
  if (!!v.preferredDate !== !!v.preferredSlot) ctx.addIssue({ code: "custom", path: ["preferredDate"], message: "Please pick a day and a time." });
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
