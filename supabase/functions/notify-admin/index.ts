import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationPayload {
  category: 'booking' | 'message' | 'service' | 'emergency';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  send_email?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");

    console.log("Environment check:", {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasAnonKey: !!supabaseAnonKey,
      adminEmail: adminEmail || "NOT SET",
      hasSmtpUser: !!smtpUser,
      hasSmtpPassword: !!smtpPassword
    });

    // Authentication check - require valid JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the JWT token using anon key client
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID not found in token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    const { category, title, message, metadata = {}, send_email = true } = payload;

    // Validate category
    if (!['booking', 'message', 'service', 'emergency'].includes(category)) {
      throw new Error("Invalid notification category");
    }

    // For emergency category, require admin role
    if (category === 'emergency') {
      const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: userId });
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: "Admin access required for emergency notifications" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Check for duplicate notifications (same category and title within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: existingNotification } = await supabase
      .from('admin_notifications')
      .select('id')
      .eq('category', category)
      .eq('title', title)
      .gte('created_at', fiveMinutesAgo)
      .maybeSingle();

    if (existingNotification) {
      console.log("Duplicate notification detected, skipping:", title);
      return new Response(
        JSON.stringify({ success: true, duplicate: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create in-app notification
    const { error: notifError } = await supabase
      .from('admin_notifications')
      .insert({
        category,
        title,
        message,
        metadata,
        is_read: false,
      });

    if (notifError) {
      console.error("Error creating notification:", notifError);
      throw notifError;
    }

    console.log(`Admin notification created: [${category}] ${title}`);

    // Send email if enabled and ADMIN_EMAIL is configured
    console.log("Email check:", { send_email, adminEmail: adminEmail || "NOT SET" });
    if (send_email && adminEmail) {
      console.log("Attempting to send email to:", adminEmail);
      try {
        const smtpUser = Deno.env.get("SMTP_USER");
        const smtpPassword = Deno.env.get("SMTP_PASSWORD");

        if (smtpUser && smtpPassword) {
          const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
          
          const client = new SMTPClient({
            connection: {
              hostname: "smtp.gmail.com",
              port: 465,
              tls: true,
              auth: { username: smtpUser, password: smtpPassword },
            },
          });

          const categoryEmoji = {
            booking: '📅',
            message: '💬',
            service: '🔧',
            emergency: '🚨',
          };

          const categoryColor = {
            booking: '#3B82F6',
            message: '#10B981',
            service: '#8B5CF6',
            emergency: '#EF4444',
          };

          const siteUrl = Deno.env.get('SITE_URL') || 'https://girivalam.lovable.app';

          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
              <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="500" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                      <tr>
                        <td style="background: ${categoryColor[category]}; padding: 24px; text-align: center;">
                          <span style="font-size: 32px;">${categoryEmoji[category]}</span>
                          <h1 style="margin: 12px 0 0 0; color: #fff; font-size: 20px;">${title}</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 24px;">
                          <p style="margin: 0 0 16px 0; color: #374151; line-height: 1.6;">${message}</p>
                          ${metadata && Object.keys(metadata).length > 0 ? `
                            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                              <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Details</p>
                              <pre style="margin: 8px 0 0 0; font-size: 13px; color: #374151; white-space: pre-wrap;">${JSON.stringify(metadata, null, 2)}</pre>
                            </div>
                          ` : ''}
                          <a href="${siteUrl}/admin" style="display: inline-block; background: ${categoryColor[category]}; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                            View in Admin Panel →
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 24px; background: #f9fafb; text-align: center;">
                          <p style="margin: 0; font-size: 12px; color: #9ca3af;">Arunachala Girivalam Guide • Om Namah Shivaya 🙏</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `;

          await client.send({
            from: smtpUser,
            to: adminEmail,
            subject: `${categoryEmoji[category]} [${category.toUpperCase()}] ${title}`,
            content: "auto",
            html: htmlContent,
          });

          await client.close();
          console.log("Admin email notification sent successfully");
        }
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
        // Don't throw - email failure shouldn't fail the whole notification
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in notify-admin function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
