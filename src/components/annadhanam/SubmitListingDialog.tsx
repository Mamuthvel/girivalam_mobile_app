import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FoodType, MealType, RecurrenceFrequency } from "@/types/annadhanam";
import PhotoUpload from "./PhotoUpload";

const MEALS: MealType[] = ["breakfast", "lunch", "dinner", "snacks", "tea", "water"];
const FOODS: FoodType[] = ["full_meals", "lemon_rice", "curd_rice", "pongal", "sweet", "other"];
const FREQS: { value: RecurrenceFrequency; label: string }[] = [
  { value: "one_time", label: "One Time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly (weekdays)" },
  { value: "monthly", label: "Monthly (dates)" },
  { value: "pournami", label: "Every Pournami" },
  { value: "pradosham", label: "Every Pradosham" },
  { value: "custom_dates", label: "Custom Dates" },
];

export default function SubmitListingDialog({ open, onOpenChange, onSubmitted }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmitted?: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    trust_name: "",
    organizer_name: "",
    mobile: "",
    whatsapp: "",
    email: "",
    bio: "",
    title: "",
    description: "",
    address: "",
    landmark: "",
    latitude: "",
    longitude: "",
    estimated_capacity: "",
    food_menu: "",
    meal_types: [] as MealType[],
    food_types: [] as FoodType[],
    frequency: "daily" as RecurrenceFrequency,
    start_date: new Date().toISOString().slice(0, 10),
    end_date: "",
    start_time: "12:00",
    end_time: "14:00",
    weekdays: [] as number[],
    month_days: "",
    custom_dates: "",
    photos: [] as string[],
  });

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const toggleArr = <T,>(arr: T[], v: T): T[] => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const pickLocation = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        set("latitude", p.coords.latitude.toFixed(6));
        set("longitude", p.coords.longitude.toFixed(6));
      },
      () => toast({ title: "Location unavailable", variant: "destructive" })
    );
  };

  const submit = async () => {
    if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    if (!f.trust_name || !f.title || !f.latitude || !f.longitude) {
      toast({ title: "Missing fields", description: "Trust name, title, and location are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: trust, error: te } = await supabase
        .from("annadhanam_trusts" as any)
        .insert({
          trust_name: f.trust_name.trim(),
          organizer_name: f.organizer_name || null,
          mobile: f.mobile || null,
          whatsapp: f.whatsapp || null,
          email: f.email || null,
          bio: f.bio || null,
          submitted_by: user.id,
        })
        .select()
        .single();
      if (te) throw te;

      const recurrence: any = {
        frequency: f.frequency,
        start_date: f.start_date || undefined,
        end_date: f.end_date || null,
        time_slots: [{ start: f.start_time, end: f.end_time }],
      };
      if (f.frequency === "weekly") recurrence.weekdays = f.weekdays;
      if (f.frequency === "monthly")
        recurrence.month_days = f.month_days.split(",").map((s) => parseInt(s.trim())).filter((n) => n >= 1 && n <= 31);
      if (f.frequency === "custom_dates")
        recurrence.custom_dates = f.custom_dates.split(",").map((s) => s.trim()).filter(Boolean);

      const { error: le } = await supabase.from("annadhanam_listings" as any).insert({
        trust_id: (trust as any).id,
        title: f.title.trim(),
        description: f.description || null,
        latitude: parseFloat(f.latitude),
        longitude: parseFloat(f.longitude),
        address: f.address || null,
        landmark: f.landmark || null,
        meal_types: f.meal_types,
        food_types: f.food_types,
        food_menu: f.food_menu || null,
        estimated_capacity: f.estimated_capacity ? parseInt(f.estimated_capacity) : null,
        photos: f.photos,
        recurrence,
        submitted_by: user.id,
      });
      if (le) throw le;

      toast({ title: "Submitted for review 🙏", description: "An admin will approve your Annadhanam listing shortly." });
      onOpenChange(false);
      onSubmitted?.();
    } catch (e: any) {
      toast({ title: "Submission failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit an Annadhanam</DialogTitle>
          <DialogDescription>Listings are reviewed by admins before going live.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Trust Name *</Label><Input value={f.trust_name} onChange={(e) => set("trust_name", e.target.value)} /></div>
            <div><Label>Organizer Name</Label><Input value={f.organizer_name} onChange={(e) => set("organizer_name", e.target.value)} /></div>
            <div><Label>Mobile</Label><Input value={f.mobile} onChange={(e) => set("mobile", e.target.value)} /></div>
            <div><Label>WhatsApp</Label><Input value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
            <div className="col-span-2"><Label>Email</Label><Input value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div className="col-span-2"><Label>Trust Bio</Label><Textarea value={f.bio} onChange={(e) => set("bio", e.target.value)} rows={2} /></div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div><Label>Listing Title *</Label><Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Lunch Annadhanam at Adi Annamalai" /></div>
            <div><Label>Description</Label><Textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Address</Label><Input value={f.address} onChange={(e) => set("address", e.target.value)} /></div>
              <div><Label>Landmark</Label><Input value={f.landmark} onChange={(e) => set("landmark", e.target.value)} /></div>
              <div><Label>Latitude *</Label><Input value={f.latitude} onChange={(e) => set("latitude", e.target.value)} /></div>
              <div><Label>Longitude *</Label><Input value={f.longitude} onChange={(e) => set("longitude", e.target.value)} /></div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={pickLocation}>Use my current location</Button>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div>
              <Label className="mb-2 block">Meal Types</Label>
              <div className="flex flex-wrap gap-3">
                {MEALS.map((m) => (
                  <label key={m} className="flex items-center gap-2 text-sm capitalize">
                    <Checkbox checked={f.meal_types.includes(m)} onCheckedChange={() => set("meal_types", toggleArr(f.meal_types, m))} />
                    {m}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Food Types</Label>
              <div className="flex flex-wrap gap-3">
                {FOODS.map((m) => (
                  <label key={m} className="flex items-center gap-2 text-sm capitalize">
                    <Checkbox checked={f.food_types.includes(m)} onCheckedChange={() => set("food_types", toggleArr(f.food_types, m))} />
                    {m.replace("_", " ")}
                  </label>
                ))}
              </div>
            </div>
            <div><Label>Food Menu</Label><Textarea value={f.food_menu} onChange={(e) => set("food_menu", e.target.value)} rows={2} /></div>
            <div><Label>Estimated Capacity</Label><Input type="number" value={f.estimated_capacity} onChange={(e) => set("estimated_capacity", e.target.value)} /></div>
            <div>
              <Label className="mb-1 block">Photos</Label>
              <PhotoUpload photos={f.photos} onChange={(p) => set("photos", p)} max={5} folder="listings" />
            </div>
          </div>


          <div className="border-t pt-4 space-y-3">
            <div>
              <Label>Frequency</Label>
              <Select value={f.frequency} onValueChange={(v) => set("frequency", v as RecurrenceFrequency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FREQS.map((x) => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date</Label><Input type="date" value={f.start_date} onChange={(e) => set("start_date", e.target.value)} /></div>
              <div><Label>End Date (optional)</Label><Input type="date" value={f.end_date} onChange={(e) => set("end_date", e.target.value)} /></div>
              <div><Label>Start Time</Label><Input type="time" value={f.start_time} onChange={(e) => set("start_time", e.target.value)} /></div>
              <div><Label>End Time</Label><Input type="time" value={f.end_time} onChange={(e) => set("end_time", e.target.value)} /></div>
            </div>
            {f.frequency === "weekly" && (
              <div>
                <Label className="mb-2 block">Weekdays</Label>
                <div className="flex flex-wrap gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
                    <Button key={d} type="button" size="sm" variant={f.weekdays.includes(i) ? "default" : "outline"} onClick={() => set("weekdays", toggleArr(f.weekdays, i))}>
                      {d}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {f.frequency === "monthly" && (
              <div><Label>Days of Month (comma-separated, 1-31)</Label><Input value={f.month_days} onChange={(e) => set("month_days", e.target.value)} placeholder="1, 15, 30" /></div>
            )}
            {f.frequency === "custom_dates" && (
              <div><Label>Custom Dates (comma-separated YYYY-MM-DD)</Label><Input value={f.custom_dates} onChange={(e) => set("custom_dates", e.target.value)} placeholder="2026-01-15, 2026-02-10" /></div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Submitting…" : "Submit for Review"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
