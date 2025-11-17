import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReviewNotificationRequest {
  name: string;
  rating: number;
  comment: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const review: ReviewNotificationRequest = await req.json();
    
    console.log("Sending review notification for:", review.name);

    // Generate star rating display
    const stars = "⭐".repeat(review.rating);

    // Send notification to cafe owner
    const ownerEmail = await resend.emails.send({
      from: "Sweet Cafe Reviews <onboarding@resend.dev>",
      to: ["cafe@example.com"], // Replace with actual cafe email
      subject: `New ${review.rating}-Star Review Received`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B4513;">New Review Alert</h1>
          <p>A new review has been submitted:</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #8B4513; margin-top: 0;">${stars} ${review.rating}/5</h2>
            <p><strong>From:</strong> ${review.name}</p>
            
            <div style="background-color: white; padding: 15px; border-left: 4px solid #8B4513; margin-top: 15px;">
              <p style="margin: 0; font-style: italic;">"${review.comment}"</p>
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            You can approve or manage this review in your admin dashboard.
          </p>
          
          <p style="margin-top: 30px;">
            <strong>Sweet Cafe Review System</strong>
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", ownerEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: ownerEmail.data?.id
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-review-notification:", error);
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
