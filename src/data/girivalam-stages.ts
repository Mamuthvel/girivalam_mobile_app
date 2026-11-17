/**
 * Leg-by-leg distances along the Girivalam path.
 *
 * Cumulative distances are derived from the mapped path (`girivalam-path.ts`)
 * matched to each Ashta Lingam temple's coordinates (`landmarks.ts`).
 *
 * `dir` is a compass code translated via `t('dist.dir.<code>')`; `fromKey` and
 * `toKey` are translation keys for the start/finish temple labels, while Lingam
 * names stay as proper nouns. Shared by /girivalam-distance-route and
 * /ashta-lingam-temples so the two pages can never quote different numbers for
 * the same stretch of road.
 */
export interface GirivalamStage {
  /** Lingam name the leg starts from, when it is a Lingam. */
  from?: string;
  /** i18n key for the start label, when the leg begins at the temple. */
  fromKey?: string;
  /** Lingam name the leg ends at, when it is a Lingam. */
  to?: string;
  /** i18n key for the finish label, when the leg ends at the temple. */
  toKey?: string;
  /** Compass code for the stretch. */
  dir: string;
  /** Km from the start of the walk at the end of this leg. */
  cumulative: number;
  /** Length of this leg in km. */
  leg: number;
}

export const GIRIVALAM_STAGES: GirivalamStage[] = [
  { fromKey: "dist.start", to: "Indra Lingam", dir: "E", cumulative: 0.2, leg: 0.2 },
  { from: "Indra Lingam", to: "Agni Lingam", dir: "SE", cumulative: 1.6, leg: 1.4 },
  { from: "Agni Lingam", to: "Yama Lingam", dir: "S", cumulative: 3.3, leg: 1.7 },
  { from: "Yama Lingam", to: "Nirruti Lingam", dir: "SW", cumulative: 5.1, leg: 1.8 },
  { from: "Nirruti Lingam", to: "Varuna Lingam", dir: "W", cumulative: 6.6, leg: 1.5 },
  { from: "Varuna Lingam", to: "Vayu Lingam", dir: "NW", cumulative: 8.6, leg: 2.0 },
  { from: "Vayu Lingam", to: "Kubera Lingam", dir: "N", cumulative: 10.1, leg: 1.5 },
  { from: "Kubera Lingam", to: "Esanya Lingam", dir: "NE", cumulative: 12.0, leg: 1.9 },
  { from: "Esanya Lingam", toKey: "dist.finish", dir: "E", cumulative: 13.8, leg: 1.8 },
];

/**
 * Total of the measured route, 13.8 km.
 *
 * Note this is deliberately *not* the headline figure. The walk is universally
 * known — and searched for — as "14 km", which is what page titles and the FAQ
 * answers say; 13.8 km is what the mapped polyline actually measures. Use this
 * only where the measured legs are being explained, so the per-leg numbers add
 * up to something the reader can check.
 */
export const TOTAL_KM = GIRIVALAM_STAGES[GIRIVALAM_STAGES.length - 1].cumulative;

/** One decimal always, so a 2 km leg does not read as "2" beside "1.9". */
export const km = (value: number): string => value.toFixed(1);

export interface LingamLeg {
  /** Km from the start of the walk to this Lingam. */
  cumulative: number;
  /** Km walked since the previous stop. */
  leg: number;
  /** The previous Lingam, or undefined when the leg starts at the temple. */
  previous?: string;
}

/**
 * Where a Lingam sits along the route: distance from the start, distance from
 * the previous stop, and which stop that was. Answers the long-tail queries
 * that name two shrines, e.g. "kubera lingam to esanya lingam distance".
 */
export function lingamLeg(name: string): LingamLeg | undefined {
  const stage = GIRIVALAM_STAGES.find((s) => s.to === name);
  if (!stage) return undefined;
  return { cumulative: stage.cumulative, leg: stage.leg, previous: stage.from };
}
