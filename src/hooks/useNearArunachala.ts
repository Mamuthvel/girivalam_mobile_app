import { useCallback, useEffect, useRef, useState } from "react";
import { Geolocation } from "@capacitor/geolocation";
import { distanceKm } from "@/lib/annadhanam";

/** Arunachaleswarar Temple — the centre everything is measured from. */
export const ARUNACHALA = { lat: 12.2253, lng: 79.0747 };

/**
 * Within this many km of the temple the pilgrim is treated as "here": the whole
 * 14 km Girivalam path, the town, the bus stand and the railway station all sit
 * comfortably inside it.
 */
const NEAR_RADIUS_KM = 20;

/** Cached for the session so the card doesn't re-locate on every mount. */
const CACHE_KEY = "mg-near-arunachala";

export type NearStatus = "unknown" | "locating" | "near" | "far" | "denied";

export interface NearArunachala {
  status: NearStatus;
  distanceKm: number | null;
  /** True when we can ask without the permission dialog arriving unprompted. */
  canAsk: boolean;
  locate: () => void;
}

interface Cached {
  status: "near" | "far";
  distanceKm: number;
}

function readCache(): Cached | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Cached) : null;
  } catch {
    return null;
  }
}

/**
 * Where the pilgrim is, relative to Arunachala — without springing the Android
 * location dialog on them at launch.
 *
 * Uses @capacitor/geolocation so this works the same in the WebView as on the
 * web build. Permission is *checked* on mount and only read when it has already
 * been granted; otherwise the hook stays "unknown" and `locate()` is wired to a
 * button the pilgrim taps, which is when requesting permission is reasonable.
 */
export function useNearArunachala(): NearArunachala {
  const cached = readCache();
  const [status, setStatus] = useState<NearStatus>(cached?.status ?? "unknown");
  const [distance, setDistance] = useState<number | null>(cached?.distanceKm ?? null);
  const [canAsk, setCanAsk] = useState(false);
  const requested = useRef(false);

  const apply = useCallback((lat: number, lng: number) => {
    const km = distanceKm({ lat, lng }, ARUNACHALA);
    const next: Cached = { status: km <= NEAR_RADIUS_KM ? "near" : "far", distanceKm: km };
    setDistance(km);
    setStatus(next.status);
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(next));
    } catch {
      /* storage blocked — recompute next launch */
    }
  }, []);

  const read = useCallback(async () => {
    setStatus((prev) => (prev === "near" || prev === "far" ? prev : "locating"));
    try {
      // A rough fix is plenty for "are you in town?", and a cached one is free.
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 8_000,
        maximumAge: 5 * 60_000,
      });
      apply(pos.coords.latitude, pos.coords.longitude);
    } catch {
      setStatus("denied");
    }
  }, [apply]);

  useEffect(() => {
    if (cached || requested.current) return;
    let cancelled = false;

    const check = async () => {
      try {
        const perm = await Geolocation.checkPermissions();
        if (cancelled) return;
        if (perm.location === "granted") {
          requested.current = true;
          void read();
        } else if (perm.location === "denied") {
          setStatus("denied");
        } else {
          setCanAsk(true);
        }
      } catch {
        // Plugin unavailable (e.g. an unsupported web target) — offer the
        // button rather than guessing, and never auto-ask.
        if (!cancelled) setCanAsk(true);
      }
    };

    void check();
    return () => {
      cancelled = true;
    };
  }, [cached, read]);

  const locate = useCallback(async () => {
    requested.current = true;
    setCanAsk(false);
    try {
      const perm = await Geolocation.requestPermissions();
      if (perm.location === "denied") {
        setStatus("denied");
        return;
      }
    } catch {
      /* fall through — getCurrentPosition will surface the failure */
    }
    void read();
  }, [read]);

  return { status, distanceKm: distance, canAsk, locate };
}
