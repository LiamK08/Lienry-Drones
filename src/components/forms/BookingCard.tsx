"use client";

import { Fragment, Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { booking } from "@/content/home";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Icon } from "@/components/blocks/Icon";
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

/**
 * A Sydney time as a zone's clock reads it, or null where it reads the same (the zone keeps Sydney's
 * clock that day). On another calendar day there the day goes with it: short on the time buttons
 * ("3:30 pm Mon"), in full in the summary and the confirmation ("3:30 pm Monday 26 October").
 */
function readingIn(zone: string, d: DayKey, slot: string, full = false) {
  const at = slotInstant(d, slot);
  if (!at) return null;
  const t = timeIn(at, zone);
  const k = dayIn(at, zone);
  if (k === d && t === slot) return null;
  return `${t}${k === d ? "" : ` ${full ? longDay(k) : shortWeekday(k)}`}`;
}

/** Moves focus to a step's heading or summary as it opens. */
const focusOnMount = (el: HTMLElement | null) => el?.focus();

/**
 * The booking card beside the questions, in steps like a scheduler's (its title sits in the card's body,
 * FaqForm): the call's facts over a calendar of the coming five weeks, Monday first, running on into the
 * next month (weekdays from tomorrow to four weeks out are open, in Sydney; where a month turns, its short
 * name stands as muted text over the first day's column), then the day's times (shown muted under "Pick a
 * day" until one is picked, so the card holds no blank), then the short enquiry step with the chosen time
 * over it, in three lines. One selection state throughout: the accent edge on the pale tint, for the day
 * and for the chosen call method; fields are white with the control edge. Times are Sydney time;
 * where the visitor's clock reads them differently, each also reads in theirs, with their own day when it
 * falls on another (a Monday evening in London for a Tuesday morning in Sydney). On a phone, picking a
 * day swaps the calendar for that day's times under "All days". The steps share one grid cell; the
 * details step leaves the flow while another step shows (on a phone it also mounts only once first
 * reached), so the calendar is never left over a tall blank, the card grows only when the visitor opens
 * the details, and what was typed survives a change of time.
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
  // The route's line when the day asked for has closed; it stays over the calendar while another day is
  // found and clears as the calendar step closes, so it never moves the calendar under the pointer.
  const [rejected, setRejected] = useState<string | null>(null);
  // While a request is out, the ways back hold still, so the confirmation always names what was sent.
  const [sending, setSending] = useState(false);
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

  const local = (d: DayKey, slot: string, full = false) => readingIn(zone, d, slot, full);
  // Whether the facts say the times show in the visitor's zone too: if any open day reads differently,
  // worked out once over the whole window, so the line never changes as days are picked (Brisbane
  // matches Sydney until Sydney's daylight saving starts). Clocks change at night, so a day's first
  // time stands for all six.
  const elsewhere = useMemo(
    () => !!today && Array.from({ length: booking.daysAhead }, (_, i) => addDays(today, i + 1)).some((d) => isOpenDay(d, today, booking.daysAhead) && readingIn(zone, d, booking.times[0]) !== null),
    [today, zone],
  );
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
    // On a phone a day opens its own step, so the line can go now; elsewhere it waits for a time.
    if (phone) setRejected(null);
    setDay(d);
  };
  const pickTime = (t: string) => {
    setRejected(null);
    setReached(true);
    setTime(t);
  };

  return (
    // White fields inside the card (the surface's field fill), and the form's chosen call method in the
    // card's one selection state: the accent edge on the tint, as the picked day.
    <div className="@container grid [--s-field:var(--color-white)] [&_label:has(input[type=radio]:checked)]:border-accent [&_label:has(input[type=radio]:checked)]:bg-tint [&_input[type=radio]]:accent-accent">
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
          // Before a day is picked the times show muted (inert) under "Pick a day", so the card keeps its
          // height with nothing blank in it.
          <div className="mt-6">
            <Times day={day} local={local} onPick={pickTime} preview={!day} />
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
            {local(day, booking.times[0]) ? <p className="mt-1 text-small text-muted">{shownIn(zone)}</p> : null}
            <p aria-live="polite" className="sr-only">{`${booking.times.length} times on ${longDay(day)}`}</p>
            <div className="mt-3">
              <Times day={day} local={local} onPick={pickTime} heading={false} />
            </div>
          </>
        ) : null}
      </Step>

      {/* The short enquiry step, with the chosen time over it. It is out of the flow while another step
          shows, so the calendar holds no blank under it, and it keeps what was typed; on a phone it also
          mounts only when first reached. */}
      {phone && !reached ? null : (
      <Step on={step === "form"} collapse>
        {day && time ? (
          <div ref={step === "form" ? focusOnMount : undefined} tabIndex={-1} className="mb-6 flex items-start justify-between gap-4 rounded-card bg-tint p-4 focus-visible:outline-none">
            {/* The chosen call in three lines: the day, the Sydney time, and the visitor's own where it differs. */}
            <p className="flex items-start gap-3 text-small leading-[1.5] text-ink">
              <Icon name="clock" className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                <span className="block font-medium">{longDay(day)}</span>
                <span className="block text-muted">{time} Sydney time</span>
                {yours ? <span className="block text-muted">{yours}</span> : null}
              </span>
            </p>
            {sent ? null : (
              <button
                type="button"
                disabled={sending}
                onClick={() => {
                  setTime(null);
                  // On a phone the day's times open with their heading focused; elsewhere, the calendar.
                  if (!phone) setFocusTo("calendar");
                }}
                className="min-h-6 shrink-0 text-small font-medium text-accent enabled:hover:underline enabled:hover:underline-offset-4 disabled:text-muted"
              >
                {booking.change}
              </button>
            )}
          </div>
        ) : sent ? null : (
          <button
            ref={formStartRef}
            type="button"
            disabled={sending}
            onClick={() => {
              setSkip(false);
              setFocusTo("calendar");
            }}
            className="mb-6 min-h-6 self-start text-small font-medium text-accent enabled:hover:underline enabled:hover:underline-offset-4 disabled:text-muted"
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
            onSending={setSending}
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

/** The call's facts under the card's title: how long, how, and the zone the times are in (and that they show in yours too). */
function Facts({ elsewhere, zone }: { elsewhere: boolean; zone: string }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
      {booking.facts.map((f) => (
        <li key={f.text} className="flex items-center gap-2 text-small text-muted">
          <Icon name={f.icon} className="size-4 text-ink" />
          {f.icon === "globe" && elsewhere ? shownIn(zone) : f.text}
        </li>
      ))}
    </ul>
  );
}

// A day's round cell, as wide as its column allows up to 44px.
const dayCell = "relative mx-auto flex aspect-square w-full max-w-11 items-center justify-center rounded-pill text-small";

/**
 * The five weeks from this week's Monday, with the open days as buttons: a hairline ring at rest, the
 * accent edge on the tint once picked. Where a month turns after the first cell, a short row over that
 * week names the new month, in muted text over its first day's column.
 */
function Calendar({ today, day, onPick, monthRef }: { today: DayKey; day: DayKey | null; onPick: (d: DayKey) => void; monthRef: RefObject<HTMLParagraphElement | null> }) {
  const start = today ? addDays(today, -((weekday(today) + 6) % 7)) : null;
  const cells = start ? Array.from({ length: WEEKS * 7 }, (_, i) => addDays(start, i)) : Array.from({ length: WEEKS * 7 }, () => null);
  const end = start ? addDays(start, WEEKS * 7 - 1) : null;
  const span = start && end ? (partsOf(start)[1] === partsOf(end)[1] ? `${monthName(start)} ${partsOf(start)[0]}` : `${monthName(start)} – ${monthName(end)} ${partsOf(end)[0]}`) : booking.pick;
  const weeks = Array.from({ length: WEEKS }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  return (
    <div className="mt-5 border-t border-line pt-5">
      <p ref={monthRef} id="booking-month" tabIndex={-1} className="text-body font-semibold text-ink focus-visible:outline-none">
        {span}
      </p>
      <div role="group" aria-labelledby="booking-month" className="mt-3 grid grid-cols-7 gap-x-1 gap-y-1.5 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} aria-hidden="true" className="pb-1 text-caption text-muted">
            {w}
          </span>
        ))}
        {weeks.map((week, wi) => {
          const turn = week.findIndex((d, di) => !!d && partsOf(d)[2] === 1 && wi * 7 + di > 0);
          const turnDay = turn >= 0 ? week[turn] : null;
          return (
            <Fragment key={wi}>
              {turnDay ? (
                <span aria-hidden="true" className="col-span-7 grid grid-cols-7 gap-x-1">
                  <span style={{ gridColumnStart: turn + 1 }} className="text-caption font-medium leading-none text-muted">
                    {monthName(turnDay, "short")}
                  </span>
                </span>
              ) : null}
              {week.map((d, di) => {
                const i = wi * 7 + di;
                if (!d) return <span key={i} aria-hidden="true" className={dayCell} />;
                const can = !!today && isOpenDay(d, today, booking.daysAhead);
                const on = day === d;
                const isToday = d === today;
                if (!can) {
                  return (
                    <span key={i} aria-hidden="true" className={`${dayCell} text-muted`}>
                      {partsOf(d)[2]}
                      {isToday ? <span className="absolute bottom-1 size-1 rounded-pill bg-accent" /> : null}
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
                    className={`${dayCell} border transition-[background-color,border-color,color] duration-200 motion-reduce:transition-none forced-colors:border-[ButtonBorder] ${
                      on ? "border-accent bg-tint font-semibold text-accent ring-1 ring-inset ring-accent forced-colors:border-[Highlight] forced-colors:ring-0" : "border-line bg-white font-medium text-ink hover:border-accent hover:text-accent"
                    }`}
                  >
                    {partsOf(d)[2]}
                  </button>
                );
              })}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

/**
 * A day's six times, each with the visitor's own reading under it where it differs (the zone line above
 * says whose). Its name reads in full: "9:30 am Sydney time, 3:30 pm Mon your time". As a preview (no
 * day picked yet) the six show muted with a dashed edge under "Pick a day", inert and hidden from
 * assistive technology, so the card shows what comes next instead of holding a blank.
 */
function Times({ day, local, onPick, preview = false, heading = true }: { day: DayKey | null; local: (d: DayKey, slot: string) => string | null; onPick: (t: string) => void; preview?: boolean; heading?: boolean }) {
  return (
    <div aria-hidden={preview || undefined} inert={preview}>
      {heading ? <p className="text-small font-medium text-ink">{day ? longDay(day) : booking.pick}</p> : null}
      <ul aria-label={day ? `Times on ${longDay(day)}` : booking.pick} className={`${heading ? "mt-3" : ""} grid grid-cols-2 gap-2 @[22rem]:grid-cols-3`}>
        {booking.times.map((t) => {
          const yours = day ? local(day, t) : null;
          return (
            <li key={t}>
              <button
                type="button"
                onClick={() => onPick(t)}
                className={`flex min-h-10 w-full flex-col items-center justify-center rounded-pill border px-2 py-1.5 text-small leading-tight transition-[background-color,border-color,color] duration-200 motion-reduce:transition-none ${
                  preview ? "border-dashed border-hairline text-muted" : "border-line bg-white text-ink hover:border-accent hover:text-accent"
                }`}
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
