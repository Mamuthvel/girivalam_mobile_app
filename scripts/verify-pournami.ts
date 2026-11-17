/**
 * Panchangam regression check for the computed Pournami engine.
 *
 *   node --experimental-strip-types scripts/verify-pournami.ts
 *
 * These 39 dates and month names were the hand-verified table that used to be
 * hardcoded in src/hooks/get-pournamidates.tsx (sourced from drikpanchang.com
 * for Tiruvannamalai). They are kept here as a fixture, not as runtime data:
 * src/lib/pournami-astro.ts now computes every date, and this script proves the
 * computation still reproduces the published panchangam exactly. Run it after
 * touching the observance rule, the ayanamsa, or the month-naming rule.
 */
import { pournamiBetween } from "../src/lib/pournami-astro.ts";

/** date → traditional month name; "+" marks the adhika (intercalary) month. */
const PANCHANGAM: Record<string, string> = {
  "2025-12-04": "Margashirsha",
  "2026-01-03": "Pausha",
  "2026-02-01": "Magha",
  "2026-03-03": "Phalguna",
  "2026-04-01": "Chaitra",
  "2026-05-01": "Vaishakha",
  "2026-05-30": "Jyeshtha+",
  "2026-06-29": "Jyeshtha",
  "2026-07-29": "Ashadha",
  "2026-08-27": "Shravana",
  "2026-09-26": "Bhadrapada",
  "2026-10-25": "Ashwin",
  "2026-11-24": "Kartik",
  "2026-12-23": "Margashirsha",
  "2027-01-22": "Pausha",
  "2027-02-20": "Magha",
  "2027-03-22": "Phalguna",
  "2027-04-20": "Chaitra",
  "2027-05-20": "Vaishakha",
  "2027-06-18": "Jyeshtha",
  "2027-07-18": "Ashadha",
  "2027-08-16": "Shravana",
  "2027-09-15": "Bhadrapada",
  "2027-10-15": "Ashwin",
  "2027-11-13": "Kartik",
  "2027-12-13": "Margashirsha",
  "2028-01-11": "Pausha",
  "2028-02-10": "Magha",
  "2028-03-10": "Phalguna",
  "2028-04-09": "Chaitra",
  "2028-05-08": "Vaishakha",
  "2028-06-06": "Jyeshtha",
  "2028-07-06": "Ashadha",
  "2028-08-04": "Shravana",
  "2028-09-03": "Bhadrapada",
  "2028-10-03": "Ashwin",
  "2028-11-02": "Kartik",
  "2028-12-01": "Margashirsha",
  "2028-12-31": "Pausha",
};

const expected = Object.keys(PANCHANGAM).sort();
const computed = pournamiBetween(expected[0], expected[expected.length - 1]);
const byDate = new Map(computed.map((o) => [o.date, o]));

let failures = 0;
const fail = (msg: string): void => {
  console.error(`FAIL  ${msg}`);
  failures++;
};

for (const date of expected) {
  const want = PANCHANGAM[date];
  const wantAdhika = want.endsWith("+");
  const wantMonth = wantAdhika ? want.slice(0, -1) : want;
  const got = byDate.get(date);

  if (!got) {
    fail(`${date}  ${wantMonth} — not computed at all`);
    continue;
  }
  if (got.month !== wantMonth) fail(`${date}  month: got ${got.month}, want ${wantMonth}`);
  else if (got.adhika !== wantAdhika) fail(`${date}  adhika: got ${got.adhika}, want ${wantAdhika}`);
  else console.log(`ok    ${date}  ${got.name}${got.uncertain ? "  (near cutoff)" : ""}`);
}

// Anything computed inside the window that the panchangam does not list is a
// spurious date — just as wrong as a missing one.
for (const occurrence of computed) {
  if (!PANCHANGAM[occurrence.date]) fail(`${occurrence.date} ${occurrence.name} — computed but not in the panchangam`);
}

const near = computed.filter((o) => o.uncertain).map((o) => o.date);
console.log(
  `\n${expected.length - failures}/${expected.length} verified` +
    (near.length ? `; ${near.length} near the observance cutoff (${near.join(", ")})` : ""),
);

if (failures > 0) {
  console.error(`\n${failures} failure(s) — the engine no longer matches the published panchangam.`);
  process.exit(1);
}
