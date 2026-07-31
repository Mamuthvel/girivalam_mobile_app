/**
 * Lightweight logging wrapper.
 *
 * Goals:
 *  - Keep noisy `debug`/`log`/`info` output OUT of production bundles' console.
 *  - Always surface `warn`/`error` (they're actionable and picked up by
 *    browser consoles / monitoring), while giving a single choke point to
 *    forward them to an error-reporting service later (e.g. Sentry).
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.error("Failed to load bookings", error);
 */

const isDev = import.meta.env.DEV;

type LogArgs = unknown[];

/**
 * Single hook for wiring up a monitoring service. Intentionally a no-op for now
 * so there's exactly one place to add Sentry (or similar) without touching call
 * sites. Example:
 *   Sentry.captureException(args[args.length - 1]);
 */
function report(_level: "warn" | "error", _args: LogArgs): void {
  // no-op placeholder for future error-reporting integration
}

export const logger = {
  /** Verbose diagnostics — dev only. */
  debug: (...args: LogArgs): void => {
    if (isDev) console.debug(...args);
  },
  /** General logs — dev only. */
  log: (...args: LogArgs): void => {
    if (isDev) console.log(...args);
  },
  /** Informational logs — dev only. */
  info: (...args: LogArgs): void => {
    if (isDev) console.info(...args);
  },
  /** Warnings — kept in production. */
  warn: (...args: LogArgs): void => {
    console.warn(...args);
    report("warn", args);
  },
  /** Errors — kept in production and forwarded to monitoring. */
  error: (...args: LogArgs): void => {
    console.error(...args);
    report("error", args);
  },
};

export default logger;
