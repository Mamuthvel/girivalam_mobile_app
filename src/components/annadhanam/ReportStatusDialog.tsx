import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PhotoUpload from "./PhotoUpload";

type ReportType = "confirm_live" | "confirm_closed" | "food_ran_out" | "wrong_info" | "photo_update";

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "confirm_live", label: "✅ Confirm it's live now" },
  { value: "confirm_closed", label: "🚫 Report it's closed" },
  { value: "food_ran_out", label: "🍽️ Food ran out" },
  { value: "wrong_info", label: "⚠️ Wrong info (address/time)" },
  { value: "photo_update", label: "📸 Share a photo" },
];

export default function ReportStatusDialog({
  listingId,
  open,
  onOpenChange,
}: {
  listingId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState<ReportType>("confirm_live");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!user) {
      toast({ title: "Please sign in to report", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("annadhanam_verifications" as any).insert({
        listing_id: listingId,
        reported_by: user.id,
        report_type: reportType,
        notes: notes.trim() || null,
        photo_url: photos[0] || null,
      });
      if (error) throw error;
      toast({ title: "Thank you 🙏", description: "Your report will be reviewed by an admin." });
      onOpenChange(false);
      setNotes("");
      setPhotos([]);
      setReportType("confirm_live");
    } catch (e: any) {
      toast({ title: "Report failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report Status</DialogTitle>
          <DialogDescription>
            Help fellow devotees with real-time info. Reports are reviewed by admins.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>What's happening?</Label>
            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Anything devotees should know?"
            />
          </div>
          <div>
            <Label className="mb-1 block">Photo (optional)</Label>
            <PhotoUpload photos={photos} onChange={setPhotos} max={1} folder="verifications" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Submitting…" : "Submit Report"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
