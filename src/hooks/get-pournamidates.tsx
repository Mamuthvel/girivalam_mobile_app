import { useMemo } from "react";

export interface PournamiEntry {
  /** IST observance date in YYYY-MM-DD (the night Girivalam is walked). */
  date: string;
  /** Traditional Purnima name. */
  name: string;
  /** True when the entry is astronomically computed (fallback), not panchangam-verified. */
  computed?: boolean;
}

/**
 * Authoritative Pournami (full moon) Girivalam dates for Tiruvannamalai, verified
 * against the panchangam (drikpanchang.com, geo: Tiruvannamalai).
 *
 * Keep extending this list once a year to stay exact. Anything AFTER the last
 * entry here is auto-computed astronomically (see `computeFullMoonsAfter`) so the
 * calendar and countdown never break — but a computed date can differ from the
 * observed Pournami by up to a day, so verified entries always take precedence.
 */
export const POURNAMI_DATES: PournamiEntry[] = [
  // 2025
  { date: "2025-12-04", name: "Margashirsha Purnima" },

  // 2026
  { date: "2026-01-03", name: "Pausha Purnima" },
  { date: "2026-02-01", name: "Magha Purnima" },
  { date: "2026-03-03", name: "Phalguna Purnima" },
  { date: "2026-04-01", name: "Chaitra Purnima" },
  { date: "2026-05-01", name: "Vaishakha Purnima" },
  { date: "2026-05-30", name: "Jyeshtha Purnima (Adhika Purnima)" },
  { date: "2026-06-29", name: "Jyeshtha Purnima" },
  { date: "2026-07-29", name: "Ashadha Purnima" },
  { date: "2026-08-27", name: "Shravana Purnima" },
  { date: "2026-09-26", name: "Bhadrapada Purnima" },
  { date: "2026-10-25", name: "Ashwin Purnima" },
  { date: "2026-11-24", name: "Kartik Purnima" },
  { date: "2026-12-23", name: "Margashirsha Purnima" },

  // 2027
  { date: "2027-01-22", name: "Pausha Purnima" },
  { date: "2027-02-20", name: "Magha Purnima" },
  { date: "2027-03-22", name: "Phalguna Purnima" },
  { date: "2027-04-20", name: "Chaitra Purnima" },
  { date: "2027-05-20", name: "Vaishakha Purnima" },
  { date: "2027-06-18", name: "Jyeshtha Purnima" },
  { date: "2027-07-18", name: "Ashadha Purnima" },
  { date: "2027-08-16", name: "Shravana Purnima" },
  { date: "2027-09-15", name: "Bhadrapada Purnima" },
  { date: "2027-10-15", name: "Ashwin Purnima" },
  { date: "2027-11-13", name: "Kartik Purnima" },
  { date: "2027-12-13", name: "Margashirsha Purnima" },

  // 2028
  { date: "2028-01-11", name: "Pausha Purnima" },
  { date: "2028-02-10", name: "Magha Purnima" },
  { date: "2028-03-10", name: "Phalguna Purnima" },
  { date: "2028-04-09", name: "Chaitra Purnima" },
  { date: "2028-05-08", name: "Vaishakha Purnima" },
  { date: "2028-06-06", name: "Jyeshtha Purnima" },
  { date: "2028-07-06", name: "Ashadha Purnima" },
  { date: "2028-08-04", name: "Shravana Purnima" },
  { date: "2028-09-03", name: "Bhadrapada Purnima" },
  { date: "2028-10-03", name: "Ashwin Purnima" },
  { date: "2028-11-02", name: "Kartik Purnima" },
  { date: "2028-12-01", name: "Margashirsha Purnima" },
  { date: "2028-12-31", name: "Pausha Purnima" },
];

/** Traditional Purnima name by Gregorian month (0 = Jan) — used only for computed fallbacks. */
const PURNIMA_NAME_BY_MONTH = [
  "Pausha Purnima",       // Jan
  "Magha Purnima",        // Feb
  "Phalguna Purnima",     // Mar
  "Chaitra Purnima",      // Apr
  "Vaishakha Purnima",    // May
  "Jyeshtha Purnima",     // Jun
  "Ashadha Purnima",      // Jul
  "Shravana Purnima",     // Aug
  "Bhadrapada Purnima",   // Sep
  "Ashwin Purnima",       // Oct
  "Kartik Purnima",       // Nov
  "Margashirsha Purnima", // Dec
];

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const SYNODIC_MONTH = 29.530588861;

/**
 * Julian Ephemeris Date of the full moon for lunation `k`, using Meeus'
 * "Astronomical Algorithms" (ch. 49). `k` must end in .5 for a full moon.
 */
function fullMoonJDE(k: number): number {
  const T = k / 1236.85;
  const JDE0 =
    2451550.09766 +
    29.530588861 * k +
    0.00015437 * T * T -
    0.000000150 * T * T * T +
    0.00000000073 * T * T * T * T;

  const rad = Math.PI / 180;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const M = (2.5534 + 29.1053567 * k - 0.0000014 * T * T - 0.00000011 * T * T * T) * rad;
  const Mp =
    (201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T * T * T - 0.000000058 * T * T * T * T) * rad;
  const F =
    (160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T * T * T + 0.000000011 * T * T * T * T) * rad;
  const Omega = (124.7746 - 1.56375588 * k + 0.0020672 * T * T + 0.00000215 * T * T * T) * rad;

  let c = 0;
  c += -0.40614 * Math.sin(Mp);
  c += 0.17302 * E * Math.sin(M);
  c += 0.01614 * Math.sin(2 * Mp);
  c += 0.01043 * Math.sin(2 * F);
  c += 0.00734 * E * Math.sin(Mp - M);
  c += -0.00514 * E * Math.sin(Mp + M);
  c += 0.00209 * E * E * Math.sin(2 * M);
  c += -0.00111 * Math.sin(Mp - 2 * F);
  c += -0.00057 * Math.sin(Mp + 2 * F);
  c += 0.00056 * E * Math.sin(2 * Mp + M);
  c += -0.00042 * Math.sin(3 * Mp);
  c += 0.00042 * E * Math.sin(M + 2 * F);
  c += 0.00038 * E * Math.sin(M - 2 * F);
  c += -0.00024 * E * Math.sin(2 * Mp - M);
  c += -0.00017 * Math.sin(Omega);
  c += -0.00007 * Math.sin(Mp + 2 * M);
  return JDE0 + c;
}

/** IST calendar (year, month 0-based, day) of the full-moon instant for lunation `k`. */
function fullMoonYmdIST(k: number): { y: number; m: number; d: number } {
  const jde = fullMoonJDE(k + 0.5);
  const utcMs = (jde - 2440587.5) * 86400000;
  const ist = new Date(utcMs + IST_OFFSET_MS);
  return { y: ist.getUTCFullYear(), m: ist.getUTCMonth(), d: ist.getUTCDate() };
}

/**
 * Astronomically compute the next `howMany` full moons strictly after `after`,
 * as a self-maintaining fallback for dates beyond the verified list. Names are
 * derived from the Gregorian month, so a rare "two full moons in a month" year
 * can mislabel the second entry — verified dates in POURNAMI_DATES always win.
 */
function computeFullMoonsAfter(after: Date, howMany: number): PournamiEntry[] {
  const approxYear = after.getFullYear() + after.getMonth() / 12;
  let k = Math.floor((approxYear - 2000) * 12.3685) - 2;

  const out: PournamiEntry[] = [];
  let guard = 0;
  while (out.length < howMany && guard < 500) {
    const { y, m, d } = fullMoonYmdIST(k);
    const dObj = new Date(y, m, d);
    if (dObj.getTime() > after.getTime()) {
      const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      out.push({ date: iso, name: PURNIMA_NAME_BY_MONTH[m], computed: true });
    }
    k++;
    guard++;
  }
  return out;
}

function toDate(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export interface PournamiDate extends PournamiEntry {
  dateObj: Date;
  computed: boolean;
}

/** How far ahead the astronomical fallback keeps generating dates. */
const FALLBACK_MONTHS_AHEAD = 18;

/**
 * The full Pournami timeline: verified dates plus an astronomical extension so
 * there's always an upcoming date, however far in the future "today" is.
 */
function buildTimeline(): PournamiDate[] {
  const verified: PournamiDate[] = POURNAMI_DATES.map((item) => ({
    ...item,
    computed: false,
    dateObj: toDate(item.date),
  }));

  const lastVerified = verified[verified.length - 1].dateObj;

  // Always keep at least ~18 months of dates ahead of today.
  const horizon = new Date();
  horizon.setMonth(horizon.getMonth() + FALLBACK_MONTHS_AHEAD);
  const extendTo = horizon > lastVerified ? horizon : lastVerified;

  const monthsGap =
    (extendTo.getFullYear() - lastVerified.getFullYear()) * 12 +
    (extendTo.getMonth() - lastVerified.getMonth()) +
    2;

  const computed: PournamiDate[] =
    monthsGap > 0
      ? computeFullMoonsAfter(lastVerified, monthsGap).map((item) => ({
          ...item,
          computed: true,
          dateObj: toDate(item.date),
        }))
      : [];

  return [...verified, ...computed];
}

function startOfToday(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

/** All Pournami dates falling in a given calendar year (verified + computed). */
export function getPournamiForYear(year: number): PournamiDate[] {
  return buildTimeline().filter((d) => d.dateObj.getFullYear() === year);
}

export function usePournamiDates() {
  return useMemo(() => {
    const today = startOfToday();
    const dates = buildTimeline();

    const nextItem = dates.find((item) => item.dateObj >= today) ?? dates[dates.length - 1];
    const nextPournami = nextItem.dateObj;

    const daysUntilPournami = Math.max(
      0,
      Math.round((nextPournami.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      dates,
      nextPournami,
      nextPournamiName: nextItem.name,
      daysUntilPournami,
    };
  }, []);
}
