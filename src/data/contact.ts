/**
 * Single source of truth for the numbers the app dials.
 *
 * These are the same numbers already shown on /support-girivalam and
 * /emergency-contacts — kept here so the welcome card, the quick-assist dialer
 * and those pages can never drift apart.
 */

/** MyGirivalam helpline, in dialable form. */
export const CONTACT_PHONE = "+91 8925483701";

/** Same number, digits only, for wa.me links. */
export const WHATSAPP_NUMBER = "918925483701";

/** Arunachaleswarar Temple landline (also listed on /emergency-contacts). */
export const TEMPLE_PHONE = "04175-252170";

export interface QuickDial {
  /** i18n key suffix under `quickAssist.dial.*` */
  key: "helpline" | "whatsapp" | "ambulance" | "police" | "temple";
  /** tel: target, or a wa.me URL for WhatsApp. */
  value: string;
  /** Rendered beneath the label — the number itself, not a translated string. */
  display: string;
  kind: "tel" | "whatsapp";
  /** Emergency services get the alert treatment. */
  urgent?: boolean;
}

/**
 * Quick-assist actions, most-wanted first. Pilgrims on the path need the
 * helpline and an ambulance far more often than anything else, and the panel is
 * thumb-reachable, so the list stays short.
 */
export const QUICK_DIALS: QuickDial[] = [
  { key: "helpline", value: CONTACT_PHONE, display: CONTACT_PHONE, kind: "tel" },
  { key: "whatsapp", value: `https://wa.me/${WHATSAPP_NUMBER}`, display: CONTACT_PHONE, kind: "whatsapp" },
  { key: "ambulance", value: "108", display: "108", kind: "tel", urgent: true },
  { key: "police", value: "100", display: "100", kind: "tel", urgent: true },
  { key: "temple", value: TEMPLE_PHONE, display: TEMPLE_PHONE, kind: "tel" },
];
