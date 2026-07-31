import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, MapPin, Clock, Navigation2, Share2, Utensils, Flag, Bell, BellRing } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpiritualCard } from "@/components/SpiritualCard";
import { ListingOccurrence } from "@/types/annadhanam";
import { formatTimeAgo, formatTimeRemaining } from "@/lib/annadhanam";
import ReportStatusDialog from "./ReportStatusDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Props {
  occurrence: ListingOccurrence;
  featured?: boolean;
}

const statusStyles: Record<string, { badge: string; label: string; dot: string }> = {
  live: { badge: "bg-emerald-500 text-white", label: "LIVE NOW", dot: "bg-emerald-500 animate-pulse" },
  upcoming: { badge: "bg-amber-500 text-white", label: "UPCOMING", dot: "bg-amber-500" },
  completed: { badge: "bg-muted text-muted-foreground", label: "COMPLETED", dot: "bg-muted-foreground" },
  cancelled: { badge: "bg-destructive text-destructive-foreground", label: "CANCELLED", dot: "bg-destructive" },
};

export default function AnnadhanamCard({ occurrence, featured }: Props) {
  const { listing, start, end, status, distanceKm } = occurrence;
  const s = statusStyles[status] ?? statusStyles.upcoming;
  const now = new Date();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportOpen, setReportOpen] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  const setReminder = async () => {
    if (!user) return toast({ title: "Please sign in to set reminders", variant: "destructive" });
    const { error } = await supabase.from("annadhanam_reminders" as any).upsert({
      user_id: user.id,
      listing_id: listing.id,
      occurrence_date: occurrence.date,
      occurrence_time: start.toTimeString().slice(0, 8),
      remind_before_minutes: 30,
    }, { onConflict: "user_id,listing_id,occurrence_date,occurrence_time" });
    if (error) return toast({ title: "Reminder failed", description: error.message, variant: "destructive" });
    setReminderSet(true);
    toast({ title: "Reminder set 🔔", description: "You'll be notified 30 minutes before it starts." });
  };

  const timeInfo =
    status === "live"
      ? `Ends in ${formatTimeRemaining(end, now)}`
      : status === "upcoming"
      ? start.getTime() - now.getTime() < 60 * 60 * 1000
        ? `Starts in ${formatTimeRemaining(start, now)}`
        : `Starts at ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : `Finished ${formatTimeAgo(end, now)}`;

  const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${listing.latitude},${listing.longitude}`;

  const share = async () => {
    const url = window.location.origin + `/annadhanam?listing=${listing.id}`;
    const text = `🍚 ${listing.title} — ${listing.trust?.trust_name ?? "Annadhanam"}\n${listing.address ?? ""}`;
    try {
      if (navigator.share) await navigator.share({ title: listing.title, text, url });
      else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
      }
    } catch { /* ignore */ }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <SpiritualCard className={`p-4 space-y-3 ${featured ? "ring-2 ring-primary/60 shadow-lg" : ""}`} hover={false}>
        {featured && (
          <div className="text-[10px] font-semibold text-primary uppercase tracking-wide">⭐ Nearest to you</div>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-block h-2 w-2 rounded-full ${s.dot}`} />
              <Badge className={`${s.badge} text-[10px] font-semibold`}>{s.label}</Badge>
              {listing.trust?.is_verified && (
                <Badge variant="outline" className="text-[10px]">Verified</Badge>
              )}
            </div>
            <h3 className="font-semibold text-base leading-tight truncate">{listing.title}</h3>
            {listing.trust?.trust_name && (
              <Link
                to={`/annadhanam/trust/${listing.trust_id}`}
                className="text-sm text-primary hover:underline"
              >
                {listing.trust.trust_name}
              </Link>
            )}
          </div>
          {typeof distanceKm === "number" && (
            <div className="text-right shrink-0">
              <div className="text-lg font-bold text-primary">{distanceKm.toFixed(1)} km</div>
              <div className="text-[10px] text-muted-foreground">away</div>
            </div>
          )}
        </div>

        {listing.photos?.[0] && (
          <img
            src={listing.photos[0]}
            alt={listing.title}
            className="w-full h-32 object-cover rounded-lg"
            loading="lazy"
          />
        )}

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{timeInfo}</span>
          </div>
          {listing.address && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{listing.landmark || listing.address}</span>
            </div>
          )}
          {listing.estimated_capacity != null && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>
                {listing.remaining_availability != null
                  ? `${listing.remaining_availability}/${listing.estimated_capacity} left`
                  : `~${listing.estimated_capacity} capacity`}
              </span>
            </div>
          )}
          {listing.meal_types?.length > 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Utensils className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate capitalize">{listing.meal_types.join(", ")}</span>
            </div>
          )}
        </div>

        {listing.food_menu && (
          <p className="text-xs text-muted-foreground line-clamp-2">{listing.food_menu}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {listing.tags?.map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px] capitalize">{t}</Badge>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <Button asChild size="sm" className="flex-1 h-8">
            <a href={gmaps} target="_blank" rel="noreferrer">
              <Navigation2 className="h-3.5 w-3.5 mr-1" /> Navigate
            </a>
          </Button>
          {status === "upcoming" && (
            <Button size="sm" variant="outline" className="h-8" onClick={setReminder} disabled={reminderSet} title="Remind me 30 min before">
              {reminderSet ? <BellRing className="h-3.5 w-3.5 text-emerald-500" /> : <Bell className="h-3.5 w-3.5" />}
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-8" onClick={() => setReportOpen(true)} title="Report status">
            <Flag className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" className="h-8" onClick={share}>
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </SpiritualCard>
      <ReportStatusDialog listingId={listing.id} open={reportOpen} onOpenChange={setReportOpen} />
    </motion.div>
  );
}

