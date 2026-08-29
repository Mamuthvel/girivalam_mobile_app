import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Plus, MapIcon, ListIcon } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Seo from "@/components/Seo";
import { useAnnadhanamListings, useAnnadhanamOccurrences, useUserLocation } from "@/hooks/useAnnadhanam";
import AnnadhanamCard from "@/components/annadhanam/AnnadhanamCard";
import AnnadhanamMap from "@/components/annadhanam/AnnadhanamMap";
import SubmitListingDialog from "@/components/annadhanam/SubmitListingDialog";
import { ListingOccurrence } from "@/types/annadhanam";

type DateFilter = "all" | "today" | "tomorrow" | "week" | "month" | "pournami" | "pradosham" | "festival";
type DistFilter = "any" | "500" | "1000" | "2000";

const DATE_CHIPS: { v: DateFilter; label: string }[] = [
  { v: "all", label: "All" },
  { v: "today", label: "Today" },
  { v: "tomorrow", label: "Tomorrow" },
  { v: "week", label: "This Week" },
  { v: "month", label: "This Month" },
  { v: "pournami", label: "Pournami" },
  { v: "pradosham", label: "Pradosham" },
  { v: "festival", label: "Festival" },
];

function inDateFilter(o: ListingOccurrence, f: DateFilter): boolean {
  if (f === "all") return true;
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart); todayEnd.setDate(todayEnd.getDate() + 1);
  const tomorrowEnd = new Date(todayEnd); tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  const weekEnd = new Date(todayStart); weekEnd.setDate(weekEnd.getDate() + 7);
  const monthEnd = new Date(todayStart); monthEnd.setMonth(monthEnd.getMonth() + 1);

  if (f === "today") return o.start >= todayStart && o.start < todayEnd;
  if (f === "tomorrow") return o.start >= todayEnd && o.start < tomorrowEnd;
  if (f === "week") return o.start >= todayStart && o.start < weekEnd;
  if (f === "month") return o.start >= todayStart && o.start < monthEnd;
  if (f === "pournami") return o.listing.tags?.includes("pournami") || o.listing.recurrence?.frequency === "pournami";
  if (f === "pradosham") return o.listing.tags?.includes("pradosham") || o.listing.recurrence?.frequency === "pradosham";
  if (f === "festival") return o.listing.tags?.includes("festival") || o.listing.recurrence?.frequency === "festival";
  return true;
}

function inDistFilter(o: ListingOccurrence, f: DistFilter): boolean {
  if (f === "any" || o.distanceKm == null) return f === "any";
  const meters = parseInt(f);
  return o.distanceKm * 1000 <= meters;
}

export default function LiveAnnadhanam() {
  const [params] = useSearchParams();
  const userLocation = useUserLocation();
  const { listings, loading } = useAnnadhanamListings();
  const { live, upcoming, completed } = useAnnadhanamOccurrences(listings, userLocation);
  const [q, setQ] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [distFilter, setDistFilter] = useState<DistFilter>("any");
  const [view, setView] = useState<"list" | "map">("list");
  const [submitOpen, setSubmitOpen] = useState(false);

  useEffect(() => {
    const id = params.get("listing");
    if (id) {
      setTimeout(() => document.getElementById(`listing-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
    }
  }, [params, listings]);

  const filter = (list: ListingOccurrence[]) =>
    list.filter((o) => {
      if (!inDateFilter(o, dateFilter)) return false;
      if (!inDistFilter(o, distFilter)) return false;
      if (q) {
        const t = q.toLowerCase();
        return (
          o.listing.title.toLowerCase().includes(t) ||
          o.listing.trust?.trust_name?.toLowerCase().includes(t) ||
          o.listing.address?.toLowerCase().includes(t) ||
          o.listing.landmark?.toLowerCase().includes(t) ||
          o.listing.food_menu?.toLowerCase().includes(t) ||
          o.listing.food_types?.some((f) => f.includes(t))
        );
      }
      return true;
    });

  const fLive = useMemo(() => filter(live), [live, q, dateFilter, distFilter]);
  const fUp = useMemo(() => filter(upcoming), [upcoming, q, dateFilter, distFilter]);
  const fDone = useMemo(() => filter(completed), [completed, q, dateFilter, distFilter]);
  const allForMap = useMemo(() => [...fLive, ...fUp, ...fDone], [fLive, fUp, fDone]);

  // Nearest recommendation: prefer live, else upcoming, sorted by distance
  const nearest = useMemo(() => {
    if (!userLocation) return null;
    const pool = [...fLive, ...fUp].filter((o) => o.distanceKm != null);
    if (!pool.length) return null;
    return pool.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))[0];
  }, [fLive, fUp, userLocation]);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Live Annadhanam Near Me — Free Food on the Girivalam Path | MyGirivalam.in"
        description="Find free food (Annadhanam) services live now and upcoming along the Tiruvannamalai Girivalam path — search by trust, area, food type, or distance."
        canonical="/annadhanam"
      />
      <SiteHeader />
      <div className="pt-16 pb-8 px-4 max-w-4xl mx-auto">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-5">
          <div className="text-4xl mb-1">🍚</div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold">
            <span className="spiritual-gradient-text">Live Annadhanam</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Free food services around the Girivalam path in real time</p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search trust, area, food type, landmark…"
            className="pl-9"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {DATE_CHIPS.map((c) => (
            <Button
              key={c.v}
              size="sm"
              variant={dateFilter === c.v ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setDateFilter(c.v)}
            >
              {c.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <span className="text-xs text-muted-foreground">Near me:</span>
          {([
            { v: "any", label: "Any" },
            { v: "500", label: "≤ 500m" },
            { v: "1000", label: "≤ 1 km" },
            { v: "2000", label: "≤ 2 km" },
          ] as { v: DistFilter; label: string }[]).map((c) => (
            <Button
              key={c.v}
              size="sm"
              variant={distFilter === c.v ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setDistFilter(c.v)}
            >
              {c.label}
            </Button>
          ))}
        </div>

        {/* View toggle + submit */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex rounded-lg border p-0.5">
            <Button size="sm" variant={view === "list" ? "secondary" : "ghost"} className="h-7" onClick={() => setView("list")}>
              <ListIcon className="h-3.5 w-3.5 mr-1" /> List
            </Button>
            <Button size="sm" variant={view === "map" ? "secondary" : "ghost"} className="h-7" onClick={() => setView("map")}>
              <MapIcon className="h-3.5 w-3.5 mr-1" /> Map
            </Button>
          </div>
          <Button size="sm" onClick={() => setSubmitOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Submit
          </Button>
        </div>

        {view === "map" ? (
          <div className="h-[70vh] rounded-xl overflow-hidden border">
            <AnnadhanamMap occurrences={allForMap} userLocation={userLocation} />
          </div>
        ) : loading ? (
          <div className="text-center text-muted-foreground py-16">Loading Annadhanam services…</div>
        ) : (
          <div className="space-y-6">
            {nearest && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">⭐</span>
                  <h2 className="font-playfair text-xl font-semibold">Nearest to You</h2>
                </div>
                <AnnadhanamCard occurrence={nearest} featured />
              </section>
            )}

            <Section title="Live Now" dot="bg-emerald-500 animate-pulse" count={fLive.length} empty="No Annadhanam is live right now.">
              {fLive.map((o) => <div key={`${o.listing.id}-${o.start.getTime()}`} id={`listing-${o.listing.id}`}><AnnadhanamCard occurrence={o} /></div>)}
            </Section>

            <Section title="Upcoming" dot="bg-amber-500" count={fUp.length} empty="No upcoming Annadhanam matches your filters.">
              {fUp.map((o) => <div key={`${o.listing.id}-${o.start.getTime()}`}><AnnadhanamCard occurrence={o} /></div>)}
            </Section>

            <Section title="Recently Completed" dot="bg-muted-foreground" count={fDone.length} empty="Nothing completed recently.">
              {fDone.slice(0, 10).map((o) => <div key={`${o.listing.id}-${o.start.getTime()}`}><AnnadhanamCard occurrence={o} /></div>)}
            </Section>
          </div>
        )}
      </div>

      <SubmitListingDialog open={submitOpen} onOpenChange={setSubmitOpen} />
      <SiteFooter />
    </div>
  );
}

function Section({ title, dot, count, empty, children }: { title: string; dot: string; count: number; empty: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
        <h2 className="font-playfair text-xl font-semibold">{title}</h2>
        <Badge variant="secondary" className="text-[10px]">{count}</Badge>
      </div>
      {count === 0 ? (
        <p className="text-sm text-muted-foreground italic pl-4">{empty}</p>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </section>
  );
}
