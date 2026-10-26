"use client";

import { Suspense, useState, useSyncExternalStore, type ReactNode } from "react";
import { booking } from "@/content/home";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Icon } from "@/components/blocks/Icon";
import { Mark } from "@/components/ui/Wordmark";
import { useMediaQuery } from "@/lib/hooks";
import { BOOKING_ZONE, dayKey, isOpenDay, longDay, placeOf, slotInstant, sydneyToday, timeIn, weekday, type DayKey } from "@/lib/booking";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** How many weeks the calendar shows, from the current week's Monday: enough to hold every open day. */
const WEEKS = 5;

// Today in Sydney and the visitor's own zone, read on the client only: the server renders the calendar
// without dates, so the first paint never disagrees with the visitor's clock or zone.
const noop = () => () => {};
const todayKey = () => sydneyToday();
const zoneKey = () => Intl.DateTimeFormat().resolvedOptions().timeZone || BOOKING_ZONE;

/** A key moved by whole days (calendar arithmetic in UTC, so no zone or daylight change moves it). */
function addDays(k: DayKey, n: number): DayKey {
  const [y, m, d] = k.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return dayKey(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}
const partsOf = (k: DayKey) => k.split("-").map(Number) as [number, number, number];
const monthName = (k: DayKey, style: "long" | "short" = "long") => {
  const [y, m] = partsOf(k);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-AU", { timeZone: "UTC", month: style });
};

/** Moves focus to a step's heading or summary as it opens. */
const focusOnMount = (el: HTMLElement | null) => el?.focus();

/**
 * The booking card beside the questions, in steps like a scheduler's: the call's facts over a calendar
 * of the coming five weeks, Monday first, running on into the next month (weekdays from tomorrow to four
 * weeks out are open, in Sydney; the first day of a month carries its short name), then the open times
 * of the day picked, then the short enquiry step with the chosen time over it. Times are Sydney time;
 * where the visitor's own zone differs, each also reads in theirs. On a phone, picking a day swaps the
 * calendar for that day's times under "All days". The steps share one grid cell, so the card holds the
 * height of its tallest and never jumps; on a phone the details step mounts only when it is reached, so
 * the calendar is not left over a tall blank, and the card grows to it once.
 *
 * Nothing is booked here: the day and time travel with the enquiry (source "booking"), the route checks
 * the day is still open, and a person confirms it by email. "Register interest instead" skips the time.
 */
export function BookingCard() {
  const today = useSyncExternalStore(noop, todayKey, () => "");
  const zone = useSyncExternalStore(noop, zoneKey, () => BOOKING_ZONE);
  const phone = useMediaQuery("(max-width: 47.99rem)");
  const [day, setDay] = useState<DayKey | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [skip, setSkip] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);
  // Once the request is sent the card keeps its confirmation: no way back to change the time.
  const [sent, setSent] = useState(false);

  const elsewhere = zone !== BOOKING_ZONE;
  const local = (d: DayKey, slot: string) => {
    const at = slotInstant(d, slot);
    return at && elsewhere ? `${timeIn(at, zone)} ${booking.yours}` : null;
  };
  const step: "calendar" | "times" | "form" = skip || (day && time) ? "form" : phone && day ? "times" : "calendar";
  const call = day && time ? { date: day, slot: time, timeZone: zone } : undefined;
  const yours = day && time ? local(day, time) : null;
  const when = day && time ? `${longDay(day)} at ${time} Sydney time${yours ? ` (${yours})` : ""}` : "";

  const pickTime = (t: string) => {
    setRejected(null);
    setTime(t);
  };

  return (
    <div className="@container grid">
      {/* The calendar, with the picked day's times under it (on a phone, their own step). */}
      <Step on={step === "calendar"}>
        <Facts elsewhere={elsewhere} zone={zone} />
        <Calendar today={today} day={day} onPick={setDay} />
        {phone ? null : (
          // The times hold their room before a day is picked, so the card keeps its height.
          <div className="mt-5">
            <Times day={day} rejected={rejected} local={local} onPick={pickTime} hidden={!day} />
          </div>
        )}
        <Skip onSkip={() => setSkip(true)} />
      </Step>

      {/* A phone's times step: the day's times under a way back to every day. */}
      <Step on={step === "times"}>
        <button type="button" onClick={() => setDay(null)} className="min-h-6 self-start text-small font-medium text-accent hover:underline hover:underline-offset-4">
          ← {booking.allDays}
        </button>
        {step === "times" && day ? (
          <>
            <p ref={focusOnMount} tabIndex={-1} className="mt-4 text-body font-semibold text-ink focus-visible:outline-none">
              {longDay(day)}
            </p>
            <p aria-live="polite" className="sr-only">{`${booking.times.length} times on ${longDay(day)}`}</p>
            <div className="mt-3">
              <Times day={day} rejected={rejected} local={local} onPick={pickTime} heading={false} />
            </div>
          </>
        ) : null}
      </Step>

      {/* The short enquiry step, with the chosen time over it. From 768 it shares the cell too, so the
          card keeps one height; on a phone it mounts when reached and the card grows to it once. */}
      {phone && step !== "form" ? null : (
      <Step on={step === "form"}>
        {day && time ? (
          <div ref={step === "form" ? focusOnMount : undefined} tabIndex={-1} className="mb-6 flex items-start justify-between gap-4 rounded-card border border-line bg-paper p-4 focus-visible:outline-none">
            <p className="flex items-start gap-3 text-small text-ink">
              <Icon name="clock" className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                <span className="block font-medium">{longDay(day)}</span>
                <span className="block text-muted">
                  {time} Sydney time{yours ? ` · ${yours}` : ""} · 20 minutes
                </span>
              </span>
            </p>
            {sent ? null : (
              <button type="button" onClick={() => setTime(null)} className="min-h-6 shrink-0 text-small font-medium text-accent hover:underline hover:underline-offset-4">
                {booking.change}
              </button>
            )}
          </div>
        ) : sent ? null : (
          <button type="button" onClick={() => setSkip(false)} className="mb-6 min-h-6 self-start text-small font-medium text-accent hover:underline hover:underline-offset-4">
            ← {booking.pick}
          </button>
        )}
        <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
          <EnquiryForm
            variant="booking"
            call={call}
            onSlotRejected={(message) => {
              setRejected(message);
              setTime(null);
            }}
            onSent={() => setSent(true)}
            submitLabel={call ? booking.submit : undefined}
            success={call ? booking.success(when) : undefined}
          />
        </Suspense>
        {call && !sent ? <p className="mt-4 text-caption text-muted">{booking.note}</p> : null}
      </Step>
      )}
    </div>
  );
}

/** One step of the card: all share the grid's one cell, and a step not shown is invisible and inert. */
function Step({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <div inert={!on} aria-hidden={!on || undefined} className={`flex flex-col [grid-area:1/1] ${on ? "" : "invisible"}`}>
      {children}
    </div>
  );
}

/** The call's facts: who, what, and the zone the times are in (and that they show in yours too). */
function Facts({ elsewhere, zone }: { elsewhere: boolean; zone: string }) {
  return (
    <>
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-pill bg-accent text-white">
          <Mark className="h-4 w-auto" />
        </span>
        <p className="text-small text-muted">{booking.who}</p>
      </div>
      <p className="mt-3 text-[1.25rem] font-semibold leading-tight tracking-[-0.02em] text-ink">{booking.title}</p>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {booking.facts.map((f) => (
          <li key={f.text} className="flex items-center gap-2 text-small text-muted">
            <Icon name={f.icon} className="size-4 text-ink" />
            {f.icon === "globe" && elsewhere ? `${f.text}, shown in ${placeOf(zone)} time too` : f.text}
          </li>
        ))}
      </ul>
    </>
  );
}

/** The five weeks from this week's Monday, with the open days as buttons. */
function Calendar({ today, day, onPick }: { today: DayKey; day: DayKey | null; onPick: (d: DayKey) => void }) {
  const start = today ? addDays(today, -((weekday(today) + 6) % 7)) : null;
  const cells = start ? Array.from({ length: WEEKS * 7 }, (_, i) => addDays(start, i)) : Array.from({ length: WEEKS * 7 }, () => null);
  const end = start ? addDays(start, WEEKS * 7 - 1) : null;
  const span = start && end ? (partsOf(start)[1] === partsOf(end)[1] ? `${monthName(start)} ${partsOf(start)[0]}` : `${monthName(start)} – ${monthName(end)} ${partsOf(end)[0]}`) : booking.pick;
  return (
    <div className="mt-6 border-t border-line pt-5">
      <p id="booking-month" className="text-body font-semibold text-ink">
        {span}
      </p>
      <div role="group" aria-labelledby="booking-month" className="mt-3 grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} aria-hidden="true" className="pb-1 text-caption text-muted">
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={i} aria-hidden="true" className="aspect-square" />;
          const can = !!today && isOpenDay(d, today, booking.daysAhead);
          const on = day === d;
          const isToday = d === today;
          // The first of a month after the first cell carries the month's short name on a small tag.
          const turn = partsOf(d)[2] === 1 && i > 0 ? monthName(d, "short") : null;
          const label = turn ? <span className="absolute left-1 top-1 rounded-hard bg-paper px-1 text-[0.6875rem] font-medium leading-tight text-ink">{turn}</span> : null;
          if (!can) {
            return (
              <span key={i} aria-hidden="true" className="relative flex aspect-square items-center justify-center text-small text-muted">
                {label}
                {partsOf(d)[2]}
                {isToday ? <span className="absolute bottom-1.5 size-1 rounded-pill bg-accent" /> : null}
              </span>
            );
          }
          return (
            <button
              key={i}
              type="button"
              aria-pressed={on}
              aria-label={longDay(d)}
              onClick={() => onPick(d)}
              className={`relative flex aspect-square items-center justify-center rounded-[0.5rem] text-small font-semibold transition-[background-color,color,box-shadow] duration-200 motion-reduce:transition-none ${on ? "bg-accent text-white" : "bg-tint text-ink hover:ring-[1.5px] hover:ring-accent"}`}
            >
              {label}
              {partsOf(d)[2]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A day's six times, each with the visitor's own time under it when their zone differs. */
function Times({ day, rejected, local, onPick, hidden = false, heading = true }: { day: DayKey | null; rejected: string | null; local: (d: DayKey, slot: string) => string | null; onPick: (t: string) => void; hidden?: boolean; heading?: boolean }) {
  return (
    <div className={hidden ? "invisible" : ""} aria-hidden={hidden || undefined} inert={hidden}>
      {rejected ? (
        <p role="alert" className="mb-3 text-small text-error">
          {rejected}
        </p>
      ) : null}
      {heading ? <p className="text-small font-medium text-ink">{day ? longDay(day) : booking.pick}</p> : null}
      <ul aria-label={day ? `Times on ${longDay(day)}` : booking.pick} className={`${heading ? "mt-3" : ""} grid grid-cols-2 gap-2 @[22rem]:grid-cols-3`}>
        {booking.times.map((t) => {
          const yours = day ? local(day, t) : null;
          return (
            <li key={t}>
              <button
                type="button"
                onClick={() => onPick(t)}
                className="flex min-h-10 w-full flex-col items-center justify-center rounded-pill border border-line px-2 py-1.5 text-small leading-tight text-ink transition-[background-color,border-color,color] duration-200 hover:border-accent hover:text-accent"
              >
                {t}
                {yours ? <span className="text-caption text-muted">{yours}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Skip({ onSkip }: { onSkip: () => void }) {
  return (
    <button type="button" onClick={onSkip} className="mt-6 min-h-6 self-start text-left text-small font-medium text-accent hover:underline hover:underline-offset-4">
      {booking.skip}
    </button>
  );
}
