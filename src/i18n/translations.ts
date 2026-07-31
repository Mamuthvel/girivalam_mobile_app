import en from "./locales/en";
import ta from "./locales/ta";
import te from "./locales/te";
import kn from "./locales/kn";

export type Language = "en" | "ta" | "te" | "kn";

export const translations: Record<Language, Record<string, string>> = {
  en,
  ta,
  te,
  kn,
};
