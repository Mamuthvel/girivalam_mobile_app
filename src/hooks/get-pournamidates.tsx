import { useEffect, useMemo, useState } from "react";
import {
  daysUntil,
  istToday,
  isoToLocalDate,
  nextIstMidnight,
  pournamiBetween,
  pournamiForYear,
  type PournamiOccurrence,
} from "@/lib/pournami-astro";

/**
 * Pournami Girivalam dates for Tiruvannamalai.
 *
 * Every date is computed at runtime by `src/lib/pournami-astro.ts` — there is no
 * table to extend each year, and the timeline is always centred on today. The
 * engine is checked against the published panchangam by
 * `node --experimental-strip-types scripts/verify-pournami.ts` (39/39 for
 * Dec 2025 – Dec 2028, including 2026's adhika Jyeshtha month).
 *
 * "Today" is always the IST day, so a pilgrim abroad sees the same countdown as
 * one standing at the hill.
 */

export interface PournamiDate extends PournamiOccurrence {
  /**
   * The observance day as a Date at *local* midnight. Formatting it with
   * date-fns prints the intended IST calendar day on any device timezone.
   */
  dateObj: Date;
}

/** How wide a timeline to build around the current year. */
const YEARS_BACK = 2;
const YEARS_AHEAD = 3;

const withDateObj = (occurrence: PournamiOccurrence): PournamiDate => ({
  ...occurrence,
  dateObj: isoToLocalDate(occurrence.date),
});

/** Every Pournami of a calendar year — any year, past or future. */
export function getPournamiForYear(year: number): PournamiDate[] {
  return pournamiForYear(year).map(withDateObj);
}

/**
 * The current IST date, refreshed when IST midnight passes. An installed PWA can
 * stay open for days, and a day count that never ticks over is worse than none.
 */
function useIstToday(): string {
  const [today, setToday] = useState(istToday);

  useEffect(() => {
    let timer = 0;

    const tick = () => {
      setToday(istToday());
      // Re-arm just after the next IST midnight rather than polling.
      timer = window.setTimeout(tick, Math.max(1_000, nextIstMidnight() - Date.now() + 1_000));
    };
    timer = window.setTimeout(tick, Math.max(1_000, nextIstMidnight() - Date.now() + 1_000));

    // Background tabs get their timers throttled, so re-check on return.
    const onVisible = () => {
      if (document.visibilityState === "visible") setToday(istToday());
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return today;
}

export function usePournamiDates() {
  const today = useIstToday();

  return useMemo(() => {
    const year = Number(today.slice(0, 4));
    const dates = pournamiBetween(`${year - YEARS_BACK}-01-01`, `${year + YEARS_AHEAD}-12-31`).map(withDateObj);

    const next = dates.find((item) => item.date >= today) ?? dates[dates.length - 1];

    return {
      dates,
      /** The next (or today's) Pournami, as a local-midnight Date. */
      nextPournami: next.dateObj,
      nextPournamiName: next.name,
      /** The full occurrence, for callers that want `uncertain` or `fullMoonAt`. */
      nextPournamiEntry: next,
      daysUntilPournami: daysUntil(next.date, today),
      /** Today in IST (YYYY-MM-DD). */
      today,
    };
  }, [today]);
}
