/**
 * Month pages for the Girivalam calendar: `/girivalam-dates/october-2026`.
 *
 * Search Console shows 4,884 impressions a quarter on month-specific queries
 * ("girivalam october 2026", "girivalam dates 2026 september", "pournami
 * january 2027") converting at 0.76% from an average position of 6.8. Google
 * already ranks the site for them; what was missing was a page that is actually
 * *about* that month, so the snippet could answer the question.
 *
 * Every month is computed from `pournami-astro.ts`, so there is no list to
 * extend each year — the URL space is defined by a rolling window around today
 * and regenerated into the sitemap and prerender list by
 * `scripts/generate-seo-routes.mjs`.
 */
// Explicit .ts extension (allowed by tsconfig's allowImportingTsExtensions) so
// that scripts/generate-seo-routes.ts can import this module directly under
// Node's type stripping, without a bundler in the loop.
import { istToday, pournamiBetween, type PournamiOccurrence } from "./pournami-astro.ts";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** How wide the generated URL space is, in months, around the current month. */
export const MONTHS_BACK = 3;
export const MONTHS_AHEAD = 18;

export interface MonthRef {
  year: number;
  /** 1-12, not zero-based — these are URL values, not Date internals. */
  month: number;
  /** URL segment, e.g. "october-2026". */
  slug: string;
  /** Display label, e.g. "October 2026". */
  label: string;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export function monthRef(year: number, month: number): MonthRef {
  const name = MONTH_NAMES[month - 1];
  return { year, month, slug: `${name.toLowerCase()}-${year}`, label: `${name} ${year}` };
}

/** Parse a URL segment back into a month, or null when it is not one. */
export function parseMonthSlug(slug: string): MonthRef | null {
  const match = /^([a-z]+)-(\d{4})$/.exec(slug.toLowerCase());
  if (!match) return null;
  const index = MONTH_NAMES.findIndex((m) => m.toLowerCase() === match[1]);
  if (index === -1) return null;
  const year = Number(match[2]);
  // Guard against nonsense years finding their way into the router.
  if (year < 2000 || year > 2100) return null;
  return monthRef(year, index + 1);
}

/** Shift a month by a number of months, carrying the year. */
export function shiftMonth(ref: MonthRef, delta: number): MonthRef {
  const zeroBased = ref.year * 12 + (ref.month - 1) + delta;
  return monthRef(Math.floor(zeroBased / 12), (zeroBased % 12) + 1);
}

/** The month containing today, in IST. */
export function currentMonth(now: number = Date.now()): MonthRef {
  const today = istToday(now);
  return monthRef(Number(today.slice(0, 4)), Number(today.slice(5, 7)));
}

/**
 * The rolling window of months that get their own page. Recent months stay up
 * because people search them after the fact; the long tail ahead is what
 * planners search.
 */
export function monthWindow(now: number = Date.now()): MonthRef[] {
  const base = currentMonth(now);
  const out: MonthRef[] = [];
  for (let delta = -MONTHS_BACK; delta <= MONTHS_AHEAD; delta++) out.push(shiftMonth(base, delta));
  return out;
}

/** Is this month inside the window we publish pages for? */
export function isPublishedMonth(ref: MonthRef, now: number = Date.now()): boolean {
  return monthWindow(now).some((m) => m.slug === ref.slug);
}

/** Every Pournami whose observance day falls in the given month. */
export function pournamiInMonth(ref: MonthRef): PournamiOccurrence[] {
  const lastDay = new Date(Date.UTC(ref.year, ref.month, 0)).getUTCDate();
  return pournamiBetween(`${ref.year}-${pad2(ref.month)}-01`, `${ref.year}-${pad2(ref.month)}-${lastDay}`);
}
