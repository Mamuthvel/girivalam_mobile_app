import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AnnadhanamListing, AnnadhanamTrust, ListingOccurrence } from "@/types/annadhanam";
import { expandOccurrences } from "@/lib/annadhanam";

export function useUserLocation() {
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (p) => setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);
  return loc;
}

export function useAnnadhanamListings(opts?: { includePending?: boolean }) {
  const [listings, setListings] = useState<AnnadhanamListing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("annadhanam_listings" as any)
      .select("*, trust:annadhanam_trusts(*)")
      .eq("is_active", true);
    if (!opts?.includePending) q = q.eq("status", "approved");
    const { data, error } = await q.order("created_at", { ascending: false });
    if (!error && data) setListings(data as unknown as AnnadhanamListing[]);
    setLoading(false);
  }, [opts?.includePending]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel("annadhanam_listings_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "annadhanam_listings" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  return { listings, loading, reload: load };
}

export function useAnnadhanamOccurrences(
  listings: AnnadhanamListing[],
  userLocation: { lat: number; lng: number } | null
): { live: ListingOccurrence[]; upcoming: ListingOccurrence[]; completed: ListingOccurrence[] } {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  return useMemo(() => {
    const now = new Date();
    const all = listings.flatMap((l) =>
      expandOccurrences(l, { now, daysBack: 1, daysAhead: 3, userLocation })
    );
    const today = new Date(now);
    today.setHours(23, 59, 59, 999);

    const live = all.filter((o) => o.status === "live").sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    const upcoming = all
      .filter((o) => o.status === "upcoming" && o.start <= today)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    const completed = all
      .filter((o) => o.status === "completed" && o.end.getTime() > now.getTime() - 12 * 3600_000)
      .sort((a, b) => b.end.getTime() - a.end.getTime());
    return { live, upcoming, completed };
  }, [listings, userLocation]);
}

export async function fetchTrusts(): Promise<AnnadhanamTrust[]> {
  const { data } = await supabase.from("annadhanam_trusts" as any).select("*").order("trust_name");
  return (data as unknown as AnnadhanamTrust[]) || [];
}
