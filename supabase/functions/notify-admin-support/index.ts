import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportNotificationRequest {
  userEmail: string;
  userName: string;
  message: string;
  conversationId: string;
  isReturningUser?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, message, conversationId, isReturningUser }: SupportNotificationRequest = await req.json();
    
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");

    if (!adminEmail) {
      throw new Error("Admin email not configured");
    }

    if (!smtpUser || !smtpPassword) {
      throw new Error("SMTP credentials not configured");
    }

    console.log(`Sending support notification to admin for user: ${userEmail}`);
    console.log(`Is returning user: ${isReturningUser}`);

    // Create SMTP client for Gmail
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPassword,
        },
      },
    });

    const subjectPrefix = isReturningUser ? "🔔 Returning User Message" : "🙏 New Support Request";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f4f0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f4f0; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header with Icon -->
                <tr>
                  <td style="background: linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f97316 100%); padding: 32px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                      ${isReturningUser ? '🔔 Returning User Message' : '📩 New Support Request'}
                    </h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                      ${isReturningUser ? 'A devotee has sent a new message after inactivity' : 'A devotee seeks your guidance'}
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 32px 40px;">
                    <!-- User Info Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #1f2937;">👤 ${userName || 'Anonymous User'}</p>
                          <p style="margin: 0; font-size: 14px; color: #6b7280;">📧 ${userEmail || 'No email provided'}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Message Section -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                      <tr>
                        <td>
                          <p style="font-size: 14px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">💬 Message</p>
                          <div style="background-color: #f9fafb; border-left: 4px solid #ea580c; padding: 16px 20px; border-radius: 0 8px 8px 0;">
                            <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Conversation ID -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                      <tr>
                        <td>
                          <p style="font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;"># Conversation ID</p>
                          <code style="display: inline-block; background-color: #f3f4f6; padding: 8px 12px; border-radius: 6px; font-size: 13px; color: #6b7280; font-family: 'SF Mono', Monaco, monospace;">${conversationId}</code>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-top: 8px;">
                          <a href="${Deno.env.get('SITE_URL') || 'https://arunachala-pilgrimage.lovable.app'}/admin" 
                             style="display: inline-block; background: linear-gradient(135deg, #ea580c, #f97316); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);">
                            🔗 View in Admin Panel
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #fef7f0; padding: 24px 40px; text-align: center; border-top: 1px solid #fed7aa;">
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #92400e; font-weight: 500;">✨ Arunachala Girivalam Guide</p>
                    <p style="margin: 0; font-size: 12px; color: #b45309;">Om Namah Shivaya 🙏</p>
                  </td>
                </tr>
              </table>

              <!-- Footer Note -->
              <p style="margin: 24px 0 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
                This is an automated notification from your support system.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await client.send({
      from: smtpUser,
      to: adminEmail,
      subject: `${subjectPrefix} - Arunachala Devotee Needs Help`,
      content: "auto",
      html: htmlContent,
    });

    await client.close();

    console.log("Admin notification email sent successfully via Gmail SMTP");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending admin notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
