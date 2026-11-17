/**
 * Pournami (full moon) engine for Tiruvannamalai — fully computed, no date tables.
 *
 * Everything here is derived from Meeus, "Astronomical Algorithms" (2nd ed.):
 *   - ch. 49  new & full moon instants for lunation `k`
 *   - ch. 25  apparent geocentric solar longitude
 * plus a linear Lahiri ayanamsa for the sidereal (Hindu) zodiac.
 *
 * Two traditions are encoded on top of the raw astronomy:
 *
 * 1. OBSERVANCE DAY. The full-moon *instant* is not the night Girivalam is
 *    walked. The observance day is the IST calendar date of the instant minus
 *    OBSERVANCE_SHIFT_H hours — i.e. a full moon falling before ~14:30 IST
 *    belongs to the previous evening. This reproduces all 39 panchangam dates
 *    in `scripts/verify-pournami.ts` (Dec 2025 – Dec 2028) exactly.
 *
 * 2. MONTH NAME. Amanta (new-moon-to-new-moon) months are named for the rashi
 *    the sun *enters* during the month. A month with no sankranti in it is
 *    adhika (intercalary) and borrows the following month's name — which is why
 *    2026 has two Jyeshtha Purnimas. Also verified against all 39 entries.
 *
 * Both rules are empirical fits to the published panchangam, so re-run
 * `node --experimental-strip-types scripts/verify-pournami.ts` after any edit.
 * The observance rule has roughly ±15 minutes of slack at the cutoff; an
 * occurrence whose instant lands inside that band is flagged `uncertain` so
 * the UI can ask the pilgrim to confirm against the temple panchangam.
 */

const RAD = Math.PI / 180;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const HOUR_MS = 3_600_000;

/** Mean length of a lunation, in days. */
export const SYNODIC_MONTH = 29.530588861;

/** Hours subtracted from a full-moon instant to land on its observance day. */
const OBSERVANCE_SHIFT_H = 14.5;

/** An instant this close (hours) to the observance cutoff is not safely decidable. */
const UNCERTAIN_BAND_H = 0.5;

// ─── Lunations (Meeus ch. 49) ─────────────────────────────────────────────────

/**
 * Julian Ephemeris Date of a moon phase. Integer `k` is a new moon, `k + 0.5`
 * a full moon; k = 0 is the new moon of 2000 Jan 6.
 */
function moonPhaseJDE(k: number): number {
  const T = k / 1236.85;
  const JDE0 =
    2451550.09766 +
    29.530588861 * k +
    0.00015437 * T * T -
    0.000000150 * T * T * T +
    0.00000000073 * T * T * T * T;

  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const M = (2.5534 + 29.1053567 * k - 0.0000014 * T * T - 0.00000011 * T * T * T) * RAD;
  const Mp =
    (201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T * T * T - 0.000000058 * T * T * T * T) * RAD;
  const F =
    (160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T * T * T + 0.000000011 * T * T * T * T) * RAD;
  const Omega = (124.7746 - 1.56375588 * k + 0.0020672 * T * T + 0.00000215 * T * T * T) * RAD;

  // The new- and full-moon series differ only in the first coefficient.
  const isNewMoon = Math.abs(k - Math.round(k)) < 1e-9;
  let c = isNewMoon ? -0.40720 * Math.sin(Mp) : -0.40614 * Math.sin(Mp);
  c += (isNewMoon ? 0.17241 : 0.17302) * E * Math.sin(M);
  c += (isNewMoon ? 0.01608 : 0.01614) * Math.sin(2 * Mp);
  c += (isNewMoon ? 0.01039 : 0.01043) * Math.sin(2 * F);
  c += (isNewMoon ? 0.00739 : 0.00734) * E * Math.sin(Mp - M);
  c += -0.00514 * E * Math.sin(Mp + M);
  c += (isNewMoon ? 0.00208 : 0.00209) * E * E * Math.sin(2 * M);
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

const jdeToMs = (jde: number): number => (jde - 2440587.5) * 86_400_000;
const msToJde = (ms: number): number => ms / 86_400_000 + 2440587.5;

/** Unix ms of the full moon of lunation `k`. */
const fullMoonMs = (k: number): number => jdeToMs(moonPhaseJDE(k + 0.5));
/** Unix ms of the new moon that opens lunation `k`. */
const newMoonMs = (k: number): number => jdeToMs(moonPhaseJDE(k));

/** Approximate lunation number covering `date` (Meeus ch. 49 eq. 49.2). */
function lunationNear(date: Date): number {
  const year = date.getUTCFullYear() + date.getUTCMonth() / 12;
  return Math.floor((year - 2000) * 12.3685);
}

// ─── Sidereal sun (Meeus ch. 25 + Lahiri ayanamsa) ───────────────────────────

/** Apparent geocentric longitude of the sun, tropical degrees (~0.01° accurate). */
function sunTropicalLon(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * RAD;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);
  const omega = (125.04 - 1934.136 * T) * RAD;
  const lon = L0 + C - 0.00569 - 0.00478 * Math.sin(omega);
  return ((lon % 360) + 360) % 360;
}

/** Lahiri ayanamsa in degrees: 23.853° at J2000 drifting 50.2771″/year. */
const lahiriAyanamsa = (jd: number): number => 23.853 + ((jd - 2451545.0) / 365.25) * (50.2771 / 3600);

/** Sidereal rashi index of the sun: 0 = Mesha … 11 = Meena. */
function sunRashi(ms: number): number {
  const jd = msToJde(ms);
  const sidereal = ((sunTropicalLon(jd) - lahiriAyanamsa(jd)) % 360 + 360) % 360;
  return Math.floor(sidereal / 30);
}

/** Lunar month name by the rashi the sun enters during it. */
const MONTH_BY_ENTERED_RASHI = [
  "Chaitra",      // Mesha
  "Vaishakha",    // Vrishabha
  "Jyeshtha",     // Mithuna
  "Ashadha",      // Karka
  "Shravana",     // Simha
  "Bhadrapada",   // Kanya
  "Ashwin",       // Tula
  "Kartik",       // Vrischika
  "Margashirsha", // Dhanu
  "Pausha",       // Makara
  "Magha",        // Kumbha
  "Phalguna",     // Meena
] as const;

/**
 * Amanta month of lunation `k`. The full moon of `k` always falls inside
 * [newMoon(k), newMoon(k+1)), so no search is needed.
 */
function amantaMonth(k: number): { month: string; adhika: boolean } {
  for (let j = k, guard = 0; guard < 4; j++, guard++) {
    const entered = sunRashi(newMoonMs(j + 1));
    if (sunRashi(newMoonMs(j)) !== entered) {
      return { month: MONTH_BY_ENTERED_RASHI[entered], adhika: j !== k };
    }
    // No sankranti in this month — it is adhika and borrows the next name.
  }
  // Unreachable in practice: a sankranti cannot be missed four months running.
  return { month: MONTH_BY_ENTERED_RASHI[sunRashi(fullMoonMs(k))], adhika: false };
}

// ─── Observance days ─────────────────────────────────────────────────────────

const pad = (n: number): string => String(n).padStart(2, "0");

/** IST calendar date of a Unix instant, as YYYY-MM-DD. */
function istDateIso(ms: number): string {
  const d = new Date(ms + IST_OFFSET_MS);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Hour-of-day (IST, fractional) of a Unix instant. */
function istHour(ms: number): number {
  const d = new Date(ms + IST_OFFSET_MS);
  return d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
}

export interface PournamiOccurrence {
  /** IST observance date (YYYY-MM-DD) — the night Girivalam is walked. */
  date: string;
  /** Display name, e.g. "Kartik Purnima" or "Adhika Jyeshtha Purnima". */
  name: string;
  /** Traditional lunar month, without the "Purnima" suffix. */
  month: string;
  /** True for the intercalary month that repeats a name. */
  adhika: boolean;
  /** ISO instant of the exact full moon. */
  fullMoonAt: string;
  /** Meeus lunation number. */
  lunation: number;
  /** The instant sits near the observance cutoff — confirm with the panchangam. */
  uncertain: boolean;
}

/** Build the occurrence for a single lunation. */
export function pournamiForLunation(k: number): PournamiOccurrence {
  const instant = fullMoonMs(k);
  const { month, adhika } = amantaMonth(k);
  // The observance day flips when the instant crosses OBSERVANCE_SHIFT_H
  // o'clock IST: at or after it the full moon keeps its own date, before it the
  // observance belongs to the previous evening.
  const hour = istHour(instant);
  const cutoff = OBSERVANCE_SHIFT_H;
  return {
    date: istDateIso(instant - OBSERVANCE_SHIFT_H * HOUR_MS),
    name: `${adhika ? "Adhika " : ""}${month} Purnima`,
    month,
    adhika,
    fullMoonAt: new Date(instant).toISOString(),
    lunation: k,
    uncertain: Math.abs(hour - cutoff) <= UNCERTAIN_BAND_H,
  };
}

/**
 * Every Pournami whose observance day falls in [fromIso, toIso], inclusive,
 * ordered by date. Both bounds are IST calendar dates (YYYY-MM-DD).
 */
export function pournamiBetween(fromIso: string, toIso: string): PournamiOccurrence[] {
  const start = lunationNear(new Date(`${fromIso}T00:00:00Z`)) - 2;
  const end = lunationNear(new Date(`${toIso}T00:00:00Z`)) + 2;

  const out: PournamiOccurrence[] = [];
  for (let k = start; k <= end; k++) {
    const occurrence = pournamiForLunation(k);
    if (occurrence.date >= fromIso && occurrence.date <= toIso) out.push(occurrence);
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** Every Pournami of a calendar year. */
export function pournamiForYear(year: number): PournamiOccurrence[] {
  return pournamiBetween(`${year}-01-01`, `${year}-12-31`);
}

/** Today's date in IST (YYYY-MM-DD), independent of the device timezone. */
export function istToday(now: number = Date.now()): string {
  return istDateIso(now);
}

/**
 * Clock time of an instant in IST, e.g. "8:24 PM" — computed from the offset
 * rather than the device locale, so a pilgrim in Chennai and one in Toronto are
 * both told the Tiruvannamalai time.
 */
export function istTimeLabel(instant: string | number): string {
  const ms = typeof instant === "number" ? instant : Date.parse(instant);
  const d = new Date(ms + IST_OFFSET_MS);
  const hours24 = d.getUTCHours();
  const suffix = hours24 < 12 ? "AM" : "PM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${pad(d.getUTCMinutes())} ${suffix}`;
}

/** IST calendar date of an instant (YYYY-MM-DD). */
export function istDateOf(instant: string | number): string {
  return istDateIso(typeof instant === "number" ? instant : Date.parse(instant));
}

/**
 * Unix ms of the next IST midnight after `now` — when a day count goes stale.
 */
export function nextIstMidnight(now: number = Date.now()): number {
  const shifted = now + IST_OFFSET_MS;
  const dayStart = Math.floor(shifted / 86_400_000) * 86_400_000;
  return dayStart + 86_400_000 - IST_OFFSET_MS;
}

/**
 * Parse an IST calendar date into a Date at *local* midnight, so date-fns
 * formatting shows that same calendar day on any device timezone.
 */
export function isoToLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Whole days from IST today to an IST observance date (never negative). */
export function daysUntil(iso: string, today: string = istToday()): number {
  const diff = isoToLocalDate(iso).getTime() - isoToLocalDate(today).getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}
