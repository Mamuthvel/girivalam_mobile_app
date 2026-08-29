import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import { ArrowLeft, Phone, Mail, Globe, MessageCircle } from "lucide-react";
import { AnnadhanamListing, AnnadhanamTrust } from "@/types/annadhanam";
import AnnadhanamCard from "@/components/annadhanam/AnnadhanamCard";
import { expandOccurrences } from "@/lib/annadhanam";

export default function TrustProfile() {
  const { id } = useParams();
  const [trust, setTrust] = useState<AnnadhanamTrust | null>(null);
  const [listings, setListings] = useState<AnnadhanamListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: t }, { data: l }] = await Promise.all([
        supabase.from("annadhanam_trusts" as any).select("*").eq("id", id).maybeSingle(),
        supabase.from("annadhanam_listings" as any).select("*").eq("trust_id", id).eq("status", "approved").eq("is_active", true),
      ]);
      setTrust(t as unknown as AnnadhanamTrust);
      setListings((l as unknown as AnnadhanamListing[]) || []);
      setLoading(false);
    })();
  }, [id]);

  const now = new Date();
  const occurrences = listings.flatMap((l) => expandOccurrences(l, { now, daysAhead: 30 }));
  const upcoming = occurrences.filter((o) => o.status !== "completed").sort((a, b) => a.start.getTime() - b.start.getTime()).slice(0, 10);
  const past = occurrences.filter((o) => o.status === "completed").sort((a, b) => b.end.getTime() - a.end.getTime()).slice(0, 6);

  if (loading) return <div className="min-h-screen bg-background"><SiteHeader /><div className="pt-24 text-center text-muted-foreground">Loading…</div></div>;
  if (!trust) return <div className="min-h-screen bg-background"><SiteHeader /><div className="pt-24 text-center text-muted-foreground">Trust not found</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${trust.trust_name} — Annadhanam Trust | MyGirivalam.in`}
        description={`Free food (Annadhanam) service by ${trust.trust_name} for Girivalam pilgrims in Tiruvannamalai. See timings, location, and upcoming schedule.`}
        canonical={`/annadhanam/trust/${id}`}
      />
      <SiteHeader />
      <div className="pt-16 pb-8 px-4 max-w-3xl mx-auto">
        <Link to="/annadhanam" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <SpiritualCard className="p-5 mb-4" hover={false}>
          <div className="flex gap-4 items-start">
            {trust.logo_url && <img src={trust.logo_url} alt={trust.trust_name} className="h-16 w-16 rounded-full object-cover" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-playfair text-2xl font-bold">{trust.trust_name}</h1>
                {trust.is_verified && <Badge variant="outline">Verified</Badge>}
              </div>
              {trust.organization_name && <p className="text-sm text-muted-foreground">{trust.organization_name}</p>}
              {trust.bio && <p className="text-sm mt-2">{trust.bio}</p>}
            </div>
          </div>

          {(trust.mobile || trust.whatsapp || trust.email || trust.website) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {trust.mobile && <Button asChild size="sm" variant="outline"><a href={`tel:${trust.mobile}`}><Phone className="h-3.5 w-3.5 mr-1" />{trust.mobile}</a></Button>}
              {trust.whatsapp && <Button asChild size="sm" variant="outline"><a href={`https://wa.me/${trust.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp</a></Button>}
              {trust.email && <Button asChild size="sm" variant="outline"><a href={`mailto:${trust.email}`}><Mail className="h-3.5 w-3.5 mr-1" />Email</a></Button>}
              {trust.website && <Button asChild size="sm" variant="outline"><a href={trust.website} target="_blank" rel="noreferrer"><Globe className="h-3.5 w-3.5 mr-1" />Website</a></Button>}
            </div>
          )}
        </SpiritualCard>

        {(trust.mission || trust.founder || trust.history || trust.description) && (
          <SpiritualCard className="p-5 mb-4 space-y-3 text-sm" hover={false}>
            {trust.description && <div><h3 className="font-semibold mb-1">About</h3><p className="text-muted-foreground">{trust.description}</p></div>}
            {trust.mission && <div><h3 className="font-semibold mb-1">Mission</h3><p className="text-muted-foreground">{trust.mission}</p></div>}
            {trust.founder && <div><h3 className="font-semibold mb-1">Founder</h3><p className="text-muted-foreground">{trust.founder}</p></div>}
            {trust.history && <div><h3 className="font-semibold mb-1">History</h3><p className="text-muted-foreground">{trust.history}</p></div>}
          </SpiritualCard>
        )}

        {trust.photos && trust.photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {trust.photos.map((p, i) => <img key={i} src={p} alt="" className="aspect-square object-cover rounded-lg" loading="lazy" />)}
          </div>
        )}

        <h2 className="font-playfair text-xl font-semibold mb-3">Upcoming Schedule</h2>
        {upcoming.length === 0 ? <p className="text-sm text-muted-foreground italic mb-4">No upcoming Annadhanam.</p> : (
          <div className="space-y-3 mb-6">{upcoming.map((o) => <AnnadhanamCard key={`${o.listing.id}-${o.start.getTime()}`} occurrence={o} />)}</div>
        )}

        {past.length > 0 && (
          <>
            <h2 className="font-playfair text-xl font-semibold mb-3">Previous Events</h2>
            <div className="space-y-3">{past.map((o) => <AnnadhanamCard key={`${o.listing.id}-${o.start.getTime()}`} occurrence={o} />)}</div>
          </>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
