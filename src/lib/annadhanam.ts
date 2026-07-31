import { AnnadhanamListing, ListingOccurrence, LiveStatus, Recurrence, TimeSlot } from "@/types/annadhanam";

/** Great-circle distance in km (Haversine). */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYMD(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function parseHM(base: Date, hm: string): Date {
  const [h, m] = hm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

/** Does the recurrence rule fire on this date (before applying exceptions/paused)? */
function fires(rec: Recurrence, date: Date, pournamiSet: Set<string>, pradoshamSet: Set<string>): boolean {
  const iso = fmt(date);
  if (rec.paused) return false;
  if (rec.exceptions?.includes(iso)) return false;
  if (rec.start_date && iso < rec.start_date) return false;
  if (rec.end_date && iso > rec.end_date) return false;

  const startRef = rec.start_date ? parseYMD(rec.start_date) : date;

  switch (rec.frequency) {
    case "one_time":
      return !!rec.start_date && rec.start_date === iso;
    case "daily":
      return true;
    case "every_x_days": {
      const n = Math.max(1, rec.interval || 1);
      const diff = Math.round((date.getTime() - startRef.getTime()) / 86400000);
      return diff >= 0 && diff % n === 0;
    }
    case "weekly":
      return (rec.weekdays || []).includes(date.getDay());
    case "every_x_weeks": {
      const n = Math.max(1, rec.interval || 1);
      const diff = Math.floor((date.getTime() - startRef.getTime()) / (86400000 * 7));
      return diff >= 0 && diff % n === 0 && (rec.weekdays || []).includes(date.getDay());
    }
    case "monthly":
      return (rec.month_days || []).includes(date.getDate());
    case "every_x_months": {
      const n = Math.max(1, rec.interval || 1);
      const diff = (date.getFullYear() - startRef.getFullYear()) * 12 + (date.getMonth() - startRef.getMonth());
      return diff >= 0 && diff % n === 0 && (rec.month_days || []).includes(date.getDate());
    }
    case "pournami":
      return pournamiSet.has(iso);
    case "pradosham":
      return pradoshamSet.has(iso);
    case "festival":
    case "custom_dates":
      return !!rec.custom_dates?.includes(iso);
  }
  return false;
}

/** Compute status of a specific occurrence given `now`. */
function statusOf(start: Date, end: Date, now: Date, override?: LiveStatus | null): LiveStatus {
  if (override) return override;
  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "live";
}

/**
 * Expand a listing into concrete occurrences within [from, to] days from `now`.
 * Returns one entry per time-slot per firing date.
 */
export function expandOccurrences(
  listing: AnnadhanamListing,
  opts: {
    now?: Date;
    daysBack?: number;
    daysAhead?: number;
    pournamiDates?: string[];
    pradoshamDates?: string[];
    userLocation?: { lat: number; lng: number } | null;
  } = {}
): ListingOccurrence[] {
  const now = opts.now ?? new Date();
  const daysBack = opts.daysBack ?? 1;
  const daysAhead = opts.daysAhead ?? 14;
  const rec = listing.recurrence || ({ frequency: "one_time" } as Recurrence);
  const slots: TimeSlot[] = rec.time_slots?.length ? rec.time_slots : [{ start: "12:00", end: "14:00" }];
  const pournami = new Set(opts.pournamiDates || []);
  const pradosham = new Set(opts.pradoshamDates || []);
  const out: ListingOccurrence[] = [];

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysBack);

  for (let i = 0; i <= daysBack + daysAhead; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (!fires(rec, d, pournami, pradosham)) continue;
    for (const s of slots) {
      const sd = parseHM(d, s.start);
      const ed = parseHM(d, s.end);
      if (ed <= sd) ed.setDate(ed.getDate() + 1); // handle overnight
      out.push({
        listing,
        date: fmt(d),
        start: sd,
        end: ed,
        status: statusOf(sd, ed, now, listing.manual_status_override),
        distanceKm: opts.userLocation
          ? distanceKm(
              { lat: opts.userLocation.lat, lng: opts.userLocation.lng },
              { lat: listing.latitude, lng: listing.longitude }
            )
          : undefined,
      });
    }
  }
  return out;
}

export function formatTimeRemaining(target: Date, now: Date = new Date()): string {
  let diff = Math.max(0, target.getTime() - now.getTime());
  const hrs = Math.floor(diff / 3_600_000);
  diff -= hrs * 3_600_000;
  const mins = Math.floor(diff / 60_000);
  if (hrs > 0) return `${hrs} hr ${mins} min`;
  return `${mins} min`;
}

export function formatTimeAgo(from: Date, now: Date = new Date()): string {
  const diff = Math.max(0, now.getTime() - from.getTime());
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}
