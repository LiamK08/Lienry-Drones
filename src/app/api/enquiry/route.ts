import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/enquiry-schema";

// Stub: validates the enquiry and forwards it to ENQUIRY_WEBHOOK_URL when set,
// otherwise logs it on the server. Swap in an email service or CRM here.

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

  const enquiry = { ...parsed.data, company: undefined, receivedAt: new Date().toISOString(), source: "lienry.com/register-interest" };
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
    console.info("Enquiry received (no ENQUIRY_WEBHOOK_URL set)", enquiry);
  }
  return NextResponse.json({ ok: true });
}
