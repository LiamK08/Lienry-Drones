// Call-booking dates and times, shared by the booking card and the enquiry route. The offered times are
// Sydney wall times; an instant is worked out through Intl (the zone's own offset on that day), never by
// adding milliseconds, so a daylight-saving change never moves a slot.

export const BOOKING_ZONE = "Australia/Sydney";

export type DayKey = string; // "2026-10-27"

/** A date's calendar day as a key, from its parts. */
export const dayKey = (y: number, m: number, d: number): DayKey => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** The parts of an instant's wall time in a zone. */
function partsIn(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-AU", { timeZone, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { y: get("year"), m: get("month"), d: get("day"), h: get("hour") % 24, min: get("minute") };
}

/** An instant's calendar day in a zone, as a key. */
export const dayIn = (instant: Date, timeZone: string): DayKey => {
  const p = partsIn(instant, timeZone);
  return dayKey(p.y, p.m, p.d);
};

/** Today in Sydney, as a key. */
export const sydneyToday = (now = new Date()): DayKey => dayIn(now, BOOKING_ZONE);

/** "10:30 am" as 24-hour hours and minutes. */
export function parseSlot(slot: string) {
  const m = /^(\d{1,2}):(\d{2}) (am|pm)$/.exec(slot);
  if (!m) return null;
  const h = (Number(m[1]) % 12) + (m[3] === "pm" ? 12 : 0);
  return { h, min: Number(m[2]) };
}

/** The instant of a Sydney wall time on a day (two passes settle the zone's offset, even across a change). */
export function slotInstant(day: DayKey, slot: string): Date | null {
  const t = parseSlot(slot);
  const [y, mo, d] = day.split("-").map(Number);
  if (!t || !y || !mo || !d) return null;
  const want = Date.UTC(y, mo - 1, d, t.h, t.min);
  let guess = want;
  for (let i = 0; i < 2; i++) {
    const p = partsIn(new Date(guess), BOOKING_ZONE);
    guess += want - Date.UTC(p.y, p.m - 1, p.d, p.h, p.min);
  }
  return new Date(guess);
}

/** Whole days from one key to another (calendar days, no time of day). */
export function daysBetween(from: DayKey, to: DayKey) {
  const [a, b] = [from, to].map((k) => {
    const [y, m, d] = k.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  });
  return Math.round((b - a) / 86_400_000);
}

/** The weekday of a key, 0 Sunday to 6 Saturday. */
export const weekday = (k: DayKey) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

/** Whether a day is open for a call: a weekday from tomorrow to `daysAhead` days out, in Sydney. */
export function isOpenDay(day: DayKey, today: DayKey, daysAhead: number) {
  const ahead = daysBetween(today, day);
  const wd = weekday(day);
  return ahead >= 1 && ahead <= daysAhead && wd !== 0 && wd !== 6;
}

/** An instant's time of day in a zone, as "7:30 am". */
export const timeIn = (instant: Date, timeZone: string) =>
  instant.toLocaleTimeString("en-AU", { timeZone, hour: "numeric", minute: "2-digit", hour12: true }).replace(/ |\s/g, " ").toLowerCase();

/** A day key read as "Tuesday 27 October". */
export const longDay = (k: DayKey) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-AU", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });
};

/** A day key's weekday read short, as "Mon". */
export const shortWeekday = (k: DayKey) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-AU", { timeZone: "UTC", weekday: "short" });
};

/** A zone's place name, e.g. "Perth" for Australia/Perth. */
export const placeOf = (timeZone: string) => timeZone.split("/").pop()?.replace(/_/g, " ") ?? timeZone;
