import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Flame, HandPlatter, MapPin, Navigation, Phone, Play, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CONTACT_PHONE } from "@/data/contact";
import { useNearArunachala } from "@/hooks/useNearArunachala";
import { usePournamiDates } from "@/hooks/get-pournamidates";
import { cn } from "@/lib/utils";

/** Shown once per app session. */
const SEEN_KEY = "mg-welcome-seen";

/** Let the hero paint first — the card is a greeting, not a gate. */
const APPEAR_DELAY_MS = 1200;

/**
 * Session-once welcome card.
 *
 * Becomes a local greeting ("Welcome to Tiruvannamalai") when the pilgrim is
 * within 20 km of the hill, and a planning prompt when they are further away.
 * Location is read through @capacitor/geolocation and only when permission has
 * already been granted — see useNearArunachala.
 */
export function WelcomeCard() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const { status, distanceKm, canAsk, locate } = useNearArunachala();
  const { daysUntilPournami } = usePournamiDates();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* private mode — greeting them again is harmless */
    }
    if (seen) return;
    const timer = window.setTimeout(() => setOpen(true), APPEAR_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  if (!open) return null;

  const isNear = status === "near";
  const km = distanceKm === null ? null : Math.round(distanceKm);

  const heading = isNear ? t("welcome.near.title") : t("welcome.generic.title");
  const body = isNear
    ? t("welcome.near.body").replace("{km}", distanceKm !== null && distanceKm < 1 ? "<1" : String(km ?? "—"))
    : status === "far" && km !== null
      ? t("welcome.far.body").replace("{km}", String(km))
      : t("welcome.generic.body");

  // Near the hill the pilgrim wants to walk now; far away they want to plan.
  const actions = isNear
    ? [
        { to: "/my-girivalam", icon: Play, key: "start", primary: true },
        { to: "/girivalam-map", icon: Navigation, key: "map" },
        { to: "/annadhanam", icon: HandPlatter, key: "annadhanam" },
      ]
    : [
        { to: "/pournami-dates", icon: CalendarDays, key: "dates", primary: true },
        { to: "/girivalam-distance-route", icon: MapPin, key: "route" },
        { to: "/girivalam-guide", icon: Flame, key: "guide" },
      ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button
        type="button"
        aria-label={t("welcome.dismiss")}
        onClick={dismiss}
        className="absolute inset-0 bg-foreground/60 backdrop-blur-[2px]"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-heading"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduce ? 0.2 : 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card text-card-foreground shadow-2xl ring-1 ring-border"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label={t("welcome.dismiss")}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full text-primary-foreground/80 transition-colors hover:bg-white/15 hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="bg-primary px-6 pb-5 pt-6 text-primary-foreground">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-90">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {isNear ? t("welcome.near.eyebrow") : t("welcome.generic.eyebrow")}
          </p>
          <h2 id="welcome-heading" className="mt-2 font-playfair text-2xl font-bold leading-tight">
            {heading}
          </h2>
          <p lang="ta" className="mt-1 text-base opacity-95">
            {t("welcome.chantTamil")}
          </p>
          <p className="mt-2.5 text-sm leading-relaxed opacity-90">{body}</p>
        </div>

        <div className="px-6 py-5">
          <p className="flex items-center gap-2 rounded-2xl bg-muted px-3.5 py-2.5 text-sm text-foreground">
            <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              {daysUntilPournami === 0
                ? t("welcome.pournamiToday")
                : t("welcome.pournamiIn").replace("{days}", String(daysUntilPournami))}
            </span>
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {actions.map(({ to, icon: Icon, key, primary }) => (
              <Link
                key={key}
                to={to}
                onClick={dismiss}
                className={cn(
                  "flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl px-2 text-center text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
                  primary
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-foreground ring-1 ring-border hover:bg-muted/70",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {t(`welcome.action.${key}`)}
              </Link>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            {/* Only offered when the OS dialog will not appear unprompted. */}
            {canAsk && !isNear ? (
              <button
                type="button"
                onClick={locate}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                {status === "locating" ? t("welcome.locating") : t("welcome.useLocation")}
              </button>
            ) : (
              <span />
            )}

            <a
              href={`tel:${CONTACT_PHONE}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {t("welcome.callUs")}
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
