import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Trash2, Edit, ShieldCheck } from "lucide-react";
import { AnnadhanamListing, AnnadhanamTrust } from "@/types/annadhanam";

export default function AnnadhanamManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<AnnadhanamListing[]>([]);
  const [trusts, setTrusts] = useState<AnnadhanamTrust[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectFor, setRejectFor] = useState<{ table: "listing" | "trust"; id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    setLoading(true);
    const [l, t, v] = await Promise.all([
      supabase.from("annadhanam_listings" as any).select("*, trust:annadhanam_trusts(*)").order("created_at", { ascending: false }),
      supabase.from("annadhanam_trusts" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("annadhanam_verifications" as any).select("*, listing:annadhanam_listings(title)").eq("status", "pending").order("created_at", { ascending: false }),
    ]);
    setListings((l.data as unknown as AnnadhanamListing[]) || []);
    setTrusts((t.data as unknown as AnnadhanamTrust[]) || []);
    setVerifications(v.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setListingStatus = async (id: string, status: "approved" | "rejected", reason?: string) => {
    const { error } = await supabase.from("annadhanam_listings" as any).update({
      status, rejection_reason: reason || null, approved_by: user?.id ?? null,
    }).eq("id", id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: `Listing ${status}` });
    load();
  };

  const setTrustStatus = async (id: string, status: "approved" | "rejected", reason?: string) => {
    const { error } = await supabase.from("annadhanam_trusts" as any).update({
      status, rejection_reason: reason || null, approved_by: user?.id ?? null,
    }).eq("id", id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: `Trust ${status}` });
    load();
  };

  const toggleActive = async (l: AnnadhanamListing) => {
    await supabase.from("annadhanam_listings" as any).update({ is_active: !l.is_active }).eq("id", l.id);
    load();
  };

  const toggleVerified = async (t: AnnadhanamTrust) => {
    await supabase.from("annadhanam_trusts" as any).update({ is_verified: !t.is_verified }).eq("id", t.id);
    load();
  };

  const removeListing = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    await supabase.from("annadhanam_listings" as any).delete().eq("id", id);
    load();
  };

  const removeTrust = async (id: string) => {
    if (!confirm("Delete this trust and all its listings?")) return;
    await supabase.from("annadhanam_trusts" as any).delete().eq("id", id);
    load();
  };

  const resolveVerification = async (id: string, status: "approved" | "rejected") => {
    await supabase.from("annadhanam_verifications" as any).update({ status, reviewed_by: user?.id ?? null }).eq("id", id);
    load();
  };

  const submitReject = async () => {
    if (!rejectFor) return;
    if (rejectFor.table === "listing") await setListingStatus(rejectFor.id, "rejected", rejectReason);
    else await setTrustStatus(rejectFor.id, "rejected", rejectReason);
    setRejectFor(null);
    setRejectReason("");
  };

  const statusBadge = (s: string) => {
    const cls: Record<string, string> = {
      approved: "bg-emerald-500", pending: "bg-amber-500", rejected: "bg-destructive",
    };
    return <Badge className={`${cls[s] ?? "bg-muted"} text-white capitalize`}>{s}</Badge>;
  };

  const pending = listings.filter((l) => l.status === "pending");
  const pendingTrusts = trusts.filter((t) => t.status === "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">🍚 Live Annadhanam</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="listings">
          <TabsList>
            <TabsTrigger value="listings">Listings {pending.length > 0 && <Badge className="ml-1 bg-amber-500 text-white">{pending.length}</Badge>}</TabsTrigger>
            <TabsTrigger value="trusts">Trusts {pendingTrusts.length > 0 && <Badge className="ml-1 bg-amber-500 text-white">{pendingTrusts.length}</Badge>}</TabsTrigger>
            <TabsTrigger value="verifications">Verifications {verifications.length > 0 && <Badge className="ml-1 bg-amber-500 text-white">{verifications.length}</Badge>}</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-2 mt-4">
            {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : listings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No listings yet.</p>
            ) : listings.map((l) => (
              <div key={l.id} className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium truncate">{l.title}</span>
                    {statusBadge(l.status)}
                    {!l.is_active && <Badge variant="outline">Inactive</Badge>}
                    <Badge variant="secondary" className="text-[10px] capitalize">{l.recurrence?.frequency}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {(l as any).trust?.trust_name ?? "—"} • {l.address ?? `${l.latitude.toFixed(4)}, ${l.longitude.toFixed(4)}`}
                  </div>
                  {l.rejection_reason && <div className="text-xs text-destructive">Reason: {l.rejection_reason}</div>}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {l.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => setListingStatus(l.id, "approved")}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="outline" onClick={() => setRejectFor({ table: "listing", id: l.id })}><XCircle className="h-3.5 w-3.5" /></Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" onClick={() => toggleActive(l)}>{l.is_active ? "Pause" : "Resume"}</Button>
                  <Button size="sm" variant="outline" onClick={() => removeListing(l.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="trusts" className="space-y-2 mt-4">
            {trusts.length === 0 ? <p className="text-sm text-muted-foreground">No trusts yet.</p> : trusts.map((t) => (
              <div key={t.id} className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium truncate">{t.trust_name}</span>
                    {statusBadge(t.status)}
                    {t.is_verified && <Badge className="bg-blue-500 text-white"><ShieldCheck className="h-3 w-3 mr-1" />Verified</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">{t.organizer_name ?? "—"} • {t.mobile ?? t.email ?? ""}</div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {t.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => setTrustStatus(t.id, "approved")}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="outline" onClick={() => setRejectFor({ table: "trust", id: t.id })}><XCircle className="h-3.5 w-3.5" /></Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" onClick={() => toggleVerified(t)}>{t.is_verified ? "Unverify" : "Verify"}</Button>
                  <Button size="sm" variant="outline" onClick={() => removeTrust(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="verifications" className="space-y-2 mt-4">
            {verifications.length === 0 ? <p className="text-sm text-muted-foreground">No pending reports.</p> : verifications.map((v: any) => (
              <div key={v.id} className="border rounded-lg p-3 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm"><span className="font-medium capitalize">{v.report_type.replace("_", " ")}</span> — {v.listing?.title ?? "listing"}</div>
                  {v.notes && <div className="text-xs text-muted-foreground">{v.notes}</div>}
                  {v.photo_url && <a href={v.photo_url} target="_blank" rel="noreferrer" className="text-xs text-primary">View photo</a>}
                </div>
                <Button size="sm" onClick={() => resolveVerification(v.id, "approved")}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="outline" onClick={() => resolveVerification(v.id, "rejected")}><XCircle className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {rejectFor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-4 max-w-md w-full space-y-3">
              <h3 className="font-semibold">Rejection reason</h3>
              <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why…" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setRejectFor(null); setRejectReason(""); }}>Cancel</Button>
                <Button variant="destructive" onClick={submitReject}>Reject</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
