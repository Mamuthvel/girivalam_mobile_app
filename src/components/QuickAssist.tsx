import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Headset, MessageCircle, Phone, Siren, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { QUICK_DIALS } from "@/data/contact";
import { cn } from "@/lib/utils";

/**
 * Floating quick-assist dialer.
 *
 * A pilgrim mid-Girivalam, at night, barefoot, on bad mobile data should never
 * have to navigate a menu to reach a human. One tap opens the panel, the second
 * dials. Everything is a native tel:/wa.me link, so it works with no network
 * round-trip and no sign-in.
 *
 * Sits above the safe-area inset so it clears the Android gesture bar.
 */
export function QuickAssist() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const iconFor = (key: string) => {
    if (key === "whatsapp") return MessageCircle;
    if (key === "ambulance" || key === "police") return Siren;
    return Phone;
  };

  return (
    <div
      className="fixed right-4 z-[1500] flex flex-col items-end gap-2"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id="quick-assist-panel"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: reduce ? 0.15 : 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-[17.5rem] overflow-hidden rounded-3xl bg-card shadow-2xl ring-1 ring-border"
          >
            <div className="bg-primary px-4 py-3 text-primary-foreground">
              <p className="font-playfair text-base font-semibold">{t("quickAssist.title")}</p>
              <p className="mt-0.5 text-xs opacity-90">{t("quickAssist.subtitle")}</p>
            </div>

            <ul className="divide-y divide-border">
              {QUICK_DIALS.map((dial) => {
                const Icon = iconFor(dial.key);
                const isWhatsApp = dial.kind === "whatsapp";
                return (
                  <li key={dial.key}>
                    <a
                      href={isWhatsApp ? dial.value : `tel:${dial.value}`}
                      {...(isWhatsApp ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[56px] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                    >
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                          dial.urgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
                        )}
                        aria-hidden="true"
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {t(`quickAssist.dial.${dial.key}`)}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">{dial.display}</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <Link
              to="/emergency-contacts"
              onClick={() => setOpen(false)}
              className="flex min-h-[48px] items-center justify-between gap-2 bg-muted px-4 text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
            >
              {t("quickAssist.allContacts")}
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="quick-assist-panel"
        aria-label={t("quickAssist.title")}
        className="flex h-14 items-center gap-2 rounded-full bg-primary px-4 text-primary-foreground shadow-xl transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Headset className="h-5 w-5" aria-hidden="true" />}
        <span className="text-sm font-semibold">{t("quickAssist.cta")}</span>
      </button>
    </div>
  );
}
