"use client";

import { Suspense, useState, useSyncExternalStore } from "react";
import { booking } from "@/content/home";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Icon } from "@/components/blocks/Icon";
import { Mark } from "@/components/ui/Wordmark";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** How many weeks the calendar shows, from the current week's Monday: enough to hold every open day. */
const WEEKS = 5;

// Today as the visitor's own calendar date (y-m-d), read on the client only: the server renders the
// calendar without dates, so the first paint never disagrees with the visitor's clock.
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
const noop = () => () => {};
const fromKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};
// Calendar arithmetic on dates, not milliseconds, so a daylight-saving change never moves a day.
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
/** Moves focus to the chosen time's summary as the form step opens. */
const focusOnMount = (el: HTMLDivElement | null) => el?.focus();
const long = (d: Date) => d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });
const monthName = (d: Date) => d.toLocaleDateString("en-AU", { month: "long" });

/**
 * The booking card beside the questions, in three steps like a scheduler's: the call's facts over a
 * calendar of the coming five weeks, Monday first, running on into the next month (weekdays from
 * tomorrow, four weeks out, are the open days; the first day of a month carries its short name), then
 * the open times of the day picked, then the enquiry form with the chosen time over it. Nothing is
 * booked here: the time travels with the enquiry (source "booking") and a person confirms it by email.
 * "Register interest instead" skips to the form without a time.
 */
export function BookingCard() {
  const key = useSyncExternalStore(noop, todayKey, () => "");
  const today = key ? fromKey(key) : null;
  const [day, setDay] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [skip, setSkip] = useState(false);

  const last = today ? addDays(today, booking.daysAhead) : null;
  const open = (d: Date) => !!today && !!last && d > today && d <= last && d.getDay() !== 0 && d.getDay() !== 6;
  const start = today ? addDays(today, -((today.getDay() + 6) % 7)) : null;
  const cells = start ? Array.from({ length: WEEKS * 7 }, (_, i) => addDays(start, i)) : Array.from({ length: WEEKS * 7 }, () => null);
  const end = start ? addDays(start, WEEKS * 7 - 1) : null;
  const span =
    start && end
      ? start.getMonth() === end.getMonth()
        ? `${monthName(start)} ${start.getFullYear()}`
        : `${monthName(start)} – ${monthName(end)} ${end.getFullYear()}`
      : booking.pick;
  const when = day && time ? `${long(day)} at ${time}, Sydney time` : "";

  if (skip || (day && time)) {
    return (
      <div>
        {day && time ? (
          <div ref={focusOnMount} tabIndex={-1} className="mb-6 flex items-start justify-between gap-4 rounded-card border border-line bg-paper p-4 focus-visible:outline-none">
            <p className="flex items-start gap-3 text-small text-ink">
              <Icon name="clock" className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                <span className="block font-medium">{long(day)}</span>
                <span className="block text-muted">{time}, Sydney time · 20 minutes</span>
              </span>
            </p>
            <button type="button" onClick={() => setTime(null)} className="min-h-6 shrink-0 text-small font-medium text-accent hover:underline hover:underline-offset-4">
              {booking.change}
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setSkip(false)} className="mb-6 min-h-6 text-small font-medium text-accent hover:underline hover:underline-offset-4">
            ← {booking.pick}
          </button>
        )}
        <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
          {when ? <EnquiryForm preferredTime={when} submitLabel={booking.submit} success={booking.success(when)} /> : <EnquiryForm />}
        </Suspense>
        {when ? <p className="mt-4 text-caption text-muted">{booking.note}</p> : null}
      </div>
    );
  }

  return (
    <div className="@container">
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
            {f.text}
          </li>
        ))}
      </ul>

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
            if (!d) return <span key={i} aria-hidden="true" className="h-11" />;
            const can = open(d);
            const on = !!day && sameDay(d, day);
            const isToday = !!today && sameDay(d, today);
            // The first of a month after the first row carries the month's short name.
            const turn = d.getDate() === 1 && i > 0 ? d.toLocaleDateString("en-AU", { month: "short" }) : null;
            const label = turn ? <span className="absolute left-1.5 top-1 text-[0.6875rem] font-medium leading-none">{turn}</span> : null;
            if (!can) {
              return (
                <span key={i} aria-hidden="true" className="relative flex h-11 items-center justify-center text-small text-muted">
                  {label}
                  {d.getDate()}
                  {isToday ? <span className="absolute bottom-1 size-1 rounded-pill bg-accent" /> : null}
                </span>
              );
            }
            return (
              <button
                key={i}
                type="button"
                aria-pressed={on}
                aria-label={long(d)}
                onClick={() => setDay(d)}
                className={`relative flex h-11 items-center justify-center rounded-[0.625rem] text-small font-semibold transition-[background-color,color] duration-200 motion-reduce:transition-none ${on ? "bg-accent text-white" : "bg-tint text-ink hover:bg-[#d5e7ea]"}`}
              >
                {label}
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {day ? (
        <div className="mt-5">
          <p id="booking-times" className="text-small font-medium text-ink">
            {long(day)}
          </p>
          <ul aria-labelledby="booking-times" className="mt-3 grid grid-cols-2 gap-2 @[22rem]:grid-cols-3">
            {booking.times.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => setTime(t)}
                  className="flex h-10 w-full items-center justify-center rounded-pill border border-line text-small text-ink transition-[background-color,border-color,color] duration-200 hover:border-accent hover:text-accent"
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button type="button" onClick={() => setSkip(true)} className="mt-6 min-h-6 text-left text-small font-medium text-accent hover:underline hover:underline-offset-4">
        {booking.skip}
      </button>
    </div>
  );
}
