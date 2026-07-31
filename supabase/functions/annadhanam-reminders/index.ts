// Sends admin notifications for annadhanam reminders due within the next 5 minutes.
// Cron-triggered every 5 minutes via pg_cron.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const now = new Date();
  const windowEnd = new Date(now.getTime() + 60 * 60 * 1000); // look 1 hour ahead

  // Fetch unsent reminders with joined listing info
  const { data: reminders, error } = await supabase
    .from("annadhanam_reminders")
    .select("*, listing:annadhanam_listings(title, address, latitude, longitude, trust:annadhanam_trusts(trust_name))")
    .eq("sent", false)
    .limit(200);

  if (error) {
    console.error("Reminder query failed:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let sent = 0;
  for (const r of reminders ?? []) {
    // Compute the target datetime and remind-at moment
    const [y, m, d] = String(r.occurrence_date).split("-").map(Number);
    const [hh, mm] = String(r.occurrence_time).split(":").map(Number);
    const eventAt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
    const remindAt = new Date(eventAt.getTime() - (r.remind_before_minutes ?? 30) * 60 * 1000);

    if (remindAt > now || eventAt < now) continue; // not yet due, or already passed
    if (eventAt > windowEnd) continue;

    // Create an in-app admin notification (users see it as a general reminder)
    const listing: any = r.listing;
    const trustName = listing?.trust?.trust_name ?? "Annadhanam";
    await supabase.from("admin_notifications").insert({
      category: "annadhanam_reminder",
      title: `🍚 ${listing?.title ?? "Annadhanam"} starts soon`,
      message: `${trustName}${listing?.address ? " — " + listing.address : ""}. Starts in ${r.remind_before_minutes ?? 30} min.`,
      metadata: { user_id: r.user_id, listing_id: r.listing_id, occurrence_date: r.occurrence_date, occurrence_time: r.occurrence_time },
      is_read: false,
    });

    await supabase.from("annadhanam_reminders").update({ sent: true }).eq("id", r.id);
    sent++;
  }

  return new Response(JSON.stringify({ processed: reminders?.length ?? 0, sent }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
