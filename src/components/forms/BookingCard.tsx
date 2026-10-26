"use client";

import { Suspense, useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { booking } from "@/content/home";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Icon } from "@/components/blocks/Icon";
import { Mark } from "@/components/ui/Wordmark";
import { useMediaQuery } from "@/lib/hooks";
import { BOOKING_ZONE, dayIn, dayKey, isOpenDay, longDay, placeOf, shortWeekday, slotInstant, sydneyToday, timeIn, weekday, type DayKey } from "@/lib/booking";

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
 * where the visitor's clock reads them differently, each also reads in theirs, with their own day when it
 * falls on another (a Monday evening in London for a Tuesday morning in Sydney). On a phone, picking a
 * day swaps the calendar for that day's times under "All days". The steps share one grid cell, so the
 * card holds the height of its tallest and never jumps; on a phone the details step mounts when it is
 * first reached and is then taken out of the flow while another step shows, so the calendar is not left
 * over a tall blank and what was typed survives a change of time.
 *
 * Nothing is booked here: the day and time travel with the enquiry (source "booking"), the route checks
 * the day is still open, and a person confirms it by email. If the day has closed meanwhile (it turned
 * today while the card was open), the card goes back to the calendar with the route's line over it.
 * "Register interest instead" skips the time.
 */
export function BookingCard() {
  const today = useSyncExternalStore(noop, todayKey, () => "");
  const zone = useSyncExternalStore(noop, zoneKey, () => BOOKING_ZONE);
  const phone = useMediaQuery("(max-width: 47.99rem)");
  const [day, setDay] = useState<DayKey | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [skip, setSkip] = useState(false);
  // The route's line when the day asked for has closed; cleared once another day is picked.
  const [rejected, setRejected] = useState<string | null>(null);
  // Once the request is sent the card keeps its confirmation: no way back to change the time.
  const [sent, setSent] = useState(false);
  // On a phone the details step mounts when first reached and then stays, so a change of time keeps
  // what was typed (it is set by the buttons that open it).
  const [reached, setReached] = useState(false);
  // Where focus goes once a step opens from a button in the step that closes (it turns inert).
  const focusTo = useRef<"calendar" | "form" | "rejected" | null>(null);
  const setFocusTo = (to: "calendar" | "form" | "rejected") => {
    focusTo.current = to;
  };
  const monthRef = useRef<HTMLParagraphElement>(null);
  const formStartRef = useRef<HTMLButtonElement>(null);
  const rejectedRef = useRef<HTMLParagraphElement>(null);

  // A Sydney time as the visitor's clock reads it, or null where it reads the same (their zone keeps
  // Sydney's clock that day). On another calendar day there the day goes with it: short on the time
  // buttons ("3:30 pm Mon"), in full in the summary and the confirmation.
  const local = (d: DayKey, slot: string, full = false) => {
    const at = slotInstant(d, slot);
    if (!at) return null;
    const t = timeIn(at, zone);
    const k = dayIn(at, zone);
    if (k === d && t === slot) return null;
    return `${t}${k === d ? "" : ` ${full ? longDay(k) : shortWeekday(k)}`}`;
  };
  // Whether the facts say the times show in the visitor's zone too: the day picked, or else tomorrow.
  const shown = day ?? (today ? addDays(today, 1) : null);
  const elsewhere = !!shown && booking.times.some((t) => local(shown, t) !== null);
  const step: "calendar" | "times" | "form" = skip || (day && time) ? "form" : phone && day ? "times" : "calendar";
  const call = day && time ? { date: day, slot: time, timeZone: zone } : undefined;
  const reading = day && time ? local(day, time, true) : null;
  const yours = reading ? `${reading} ${booking.yours}` : null;
  const when = day && time ? `${longDay(day)} at ${time} Sydney time${yours ? ` (${yours})` : ""}` : "";

  // After React has lifted `inert` from the step that opened, focus its first line.
  useEffect(() => {
    const to = focusTo.current;
    if (!to) return;
    focusTo.current = null;
    (to === "calendar" ? monthRef.current : to === "rejected" ? rejectedRef.current : formStartRef.current)?.focus();
  }, [step]);

  const pickDay = (d: DayKey | null) => {
    setRejected(null);
    setDay(d);
  };
  const pickTime = (t: string) => {
    setReached(true);
    setTime(t);
  };

  return (
    <div className="@container grid">
      {/* The calendar, with the picked day's times under it (on a phone, their own step). */}
      <Step on={step === "calendar"}>
        <Facts elsewhere={elsewhere} zone={zone} />
        {rejected ? (
          <p ref={rejectedRef} tabIndex={-1} className="mt-5 text-small font-medium text-error focus-visible:outline-none">
            {rejected}
          </p>
        ) : null}
        <Calendar today={today} day={day} onPick={pickDay} monthRef={monthRef} />
        {phone ? null : (
          // The times hold their room before a day is picked, so the card keeps its height.
          <div className="mt-5">
            <Times day={day} local={local} onPick={pickTime} hidden={!day} />
          </div>
        )}
        <Skip
          onSkip={() => {
            setRejected(null);
            setReached(true);
            setSkip(true);
            setFocusTo("form");
          }}
        />
      </Step>

      {/* A phone's times step: the day's times under a way back to every day. */}
      <Step on={step === "times"}>
        <button
          type="button"
          onClick={() => {
            pickDay(null);
            setFocusTo("calendar");
          }}
          className="min-h-6 self-start text-small font-medium text-accent hover:underline hover:underline-offset-4"
        >
          ← {booking.allDays}
        </button>
        {step === "times" && day ? (
          <>
            <p ref={focusOnMount} tabIndex={-1} className="mt-4 text-body font-semibold text-ink focus-visible:outline-none">
              {longDay(day)}
            </p>
            {elsewhere ? <p className="mt-1 text-small text-muted">{shownIn(zone)}</p> : null}
            <p aria-live="polite" className="sr-only">{`${booking.times.length} times on ${longDay(day)}`}</p>
            <div className="mt-3">
              <Times day={day} local={local} onPick={pickTime} heading={false} />
            </div>
          </>
        ) : null}
      </Step>

      {/* The short enquiry step, with the chosen time over it. From 768 it shares the cell too, so the
          card keeps one height; on a phone it mounts when first reached (the card grows to it once) and
          is then out of the flow while another step shows, keeping what was typed. */}
      {phone && !reached ? null : (
      <Step on={step === "form"} collapse={phone}>
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
              <button
                type="button"
                onClick={() => {
                  setTime(null);
                  // On a phone the day's times open with their heading focused; elsewhere, the calendar.
                  if (!phone) setFocusTo("calendar");
                }}
                className="min-h-6 shrink-0 text-small font-medium text-accent hover:underline hover:underline-offset-4"
              >
                {booking.change}
              </button>
            )}
          </div>
        ) : sent ? null : (
          <button
            ref={formStartRef}
            type="button"
            onClick={() => {
              setSkip(false);
              setFocusTo("calendar");
            }}
            className="mb-6 min-h-6 self-start text-small font-medium text-accent hover:underline hover:underline-offset-4"
          >
            ← {booking.pick}
          </button>
        )}
        <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
          <EnquiryForm
            variant="booking"
            call={call}
            callFields={!skip}
            onSlotRejected={(message) => {
              // The route refuses only a day that has closed (the card offers only open times), so
              // every time on it would be refused too: back to the calendar, with the line over it.
              setRejected(message);
              setTime(null);
              setDay(null);
              setFocusTo("rejected");
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

/**
 * One step of the card: all share the grid's one cell, and a step not shown is invisible and inert.
 * With `collapse` a step not shown also leaves the flow (display none), so it holds no room.
 */
function Step({ on, collapse = false, children }: { on: boolean; collapse?: boolean; children: ReactNode }) {
  return (
    <div inert={!on} aria-hidden={!on || undefined} className={`flex-col [grid-area:1/1] ${on ? "flex" : collapse ? "hidden" : "invisible flex"}`}>
      {children}
    </div>
  );
}

/** The zone line where the visitor's clock differs: "Sydney time, shown in London time too". */
const shownIn = (zone: string) => `${booking.facts.find((f) => f.icon === "globe")?.text}, shown in ${placeOf(zone)} time too`;

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
            {f.icon === "globe" && elsewhere ? shownIn(zone) : f.text}
          </li>
        ))}
      </ul>
    </>
  );
}

/** The five weeks from this week's Monday, with the open days as buttons. */
function Calendar({ today, day, onPick, monthRef }: { today: DayKey; day: DayKey | null; onPick: (d: DayKey) => void; monthRef: RefObject<HTMLParagraphElement | null> }) {
  const start = today ? addDays(today, -((weekday(today) + 6) % 7)) : null;
  const cells = start ? Array.from({ length: WEEKS * 7 }, (_, i) => addDays(start, i)) : Array.from({ length: WEEKS * 7 }, () => null);
  const end = start ? addDays(start, WEEKS * 7 - 1) : null;
  const span = start && end ? (partsOf(start)[1] === partsOf(end)[1] ? `${monthName(start)} ${partsOf(start)[0]}` : `${monthName(start)} – ${monthName(end)} ${partsOf(end)[0]}`) : booking.pick;
  return (
    <div className="mt-6 border-t border-line pt-5">
      <p ref={monthRef} id="booking-month" tabIndex={-1} className="text-body font-semibold text-ink focus-visible:outline-none">
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

/**
 * A day's six times, each with the visitor's own reading under it where it differs (the zone line above
 * says whose). Its name reads in full: "9:30 am Sydney time, 3:30 pm Mon your time".
 */
function Times({ day, local, onPick, hidden = false, heading = true }: { day: DayKey | null; local: (d: DayKey, slot: string) => string | null; onPick: (t: string) => void; hidden?: boolean; heading?: boolean }) {
  return (
    <div className={hidden ? "invisible" : ""} aria-hidden={hidden || undefined} inert={hidden}>
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
                {yours ? (
                  <>
                    <span className="sr-only"> Sydney time, </span>
                    <span className="text-caption text-muted">
                      {yours}
                      <span className="sr-only"> {booking.yours}</span>
                    </span>
                  </>
                ) : null}
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
