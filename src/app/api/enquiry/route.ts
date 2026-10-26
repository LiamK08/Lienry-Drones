import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/enquiry-schema";
import { siteUrl } from "@/lib/site";
import { booking } from "@/content/home";
import { BOOKING_ZONE, isOpenDay, longDay, slotInstant, sydneyToday } from "@/lib/booking";

// Stub: validates the enquiry and forwards it to ENQUIRY_WEBHOOK_URL when set,
// otherwise returns an unavailable response so nobody is told an enquiry was delivered.

const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(key: string) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + 10 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 8;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Validation failed", issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })) }, { status: 422 });
  }
  if (parsed.data.company) {
    // Honeypot filled: pretend success without doing anything.
    return NextResponse.json({ ok: true });
  }

  // A requested call: the day must be open (a weekday from tomorrow to the card's last day, in Sydney)
  // and the time one the card offers. The reply then has the readable time and the instant to confirm.
  let call: { preferredTime: string; preferredStart: string } | null = null;
  if (parsed.data.preferredDate && parsed.data.preferredSlot) {
    const { preferredDate: day, preferredSlot: slot } = parsed.data;
    const start = slotInstant(day, slot);
    if (!start || !(booking.times as readonly string[]).includes(slot) || !isOpenDay(day, sydneyToday(), booking.daysAhead)) {
      return NextResponse.json({ ok: false, error: "Validation failed", issues: [{ path: ["preferredDate"], message: booking.closed }] }, { status: 422 });
    }
    call = { preferredTime: `${longDay(day)}, ${slot} Sydney time`, preferredStart: start.toISOString() };
  }

  const source = parsed.data.source === "fit-check" ? `${siteUrl}/#fit-check` : parsed.data.source === "booking" ? `${siteUrl}/#faq` : `${siteUrl}/register-interest`;
  const enquiry = { ...parsed.data, ...call, bookingZone: call ? BOOKING_ZONE : undefined, company: undefined, receivedAt: new Date().toISOString(), source };
  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(enquiry) });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    } catch (err) {
      console.error("Enquiry webhook failed", err);
      return NextResponse.json({ ok: false, error: "Delivery failed" }, { status: 502 });
    }
  } else {
    return NextResponse.json({ ok: false, error: "Registration is temporarily unavailable. Please try again later." }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
