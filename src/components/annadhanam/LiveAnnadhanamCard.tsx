import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SpiritualCard } from "@/components/SpiritualCard";
import { ClickSound } from "@/components/ClickSound";
import { expandOccurrences } from "@/lib/annadhanam";
import { AnnadhanamListing } from "@/types/annadhanam";

/** Home-page card that shows a LIVE badge + active count for Live Annadhanam. */
export default function LiveAnnadhanamCard() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("annadhanam_listings" as any)
        .select("*")
        .eq("status", "approved")
        .eq("is_active", true);
      const listings = (data as unknown as AnnadhanamListing[]) || [];
      const now = new Date();
      const liveCount = listings.reduce((n, l) => {
        const occ = expandOccurrences(l, { now, daysBack: 0, daysAhead: 0 });
        return n + (occ.some((o) => o.status === "live") ? 1 : 0);
      }, 0);
      setCount(liveCount);
    };
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  const isLive = count > 0;

  return (
    <ClickSound soundText="Opening live annadhanam">
      <Link to="/annadhanam" className="group h-full">
        <SpiritualCard className="text-center group-hover:bg-emerald-500/5 h-full flex flex-col justify-between min-h-[160px] p-4 md:p-6 relative">
          {isLive && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </div>
          )}
          <div className="p-4 bg-emerald-500/10 rounded-xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform">
            <span className="text-3xl">🍚</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="font-medium text-lg mb-2">Live Annadhanam</h3>
            <p className="text-sm text-muted-foreground">
              {isLive ? `${count} Active Now` : "Free food services"}
            </p>
          </div>
        </SpiritualCard>
      </Link>
    </ClickSound>
  );
}
