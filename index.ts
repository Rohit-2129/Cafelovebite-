import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  name: string;
  email: string;
  phone: string | null;
  date: string;
  time: string;
  guests: number;
  message: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking: BookingNotificationRequest = await req.json();
    
    console.log("Sending booking notification for:", booking.email);

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
      from: "Sweet Cafe <onboarding@resend.dev>",
      to: [booking.email],
      subject: "Booking Confirmation - Sweet Cafe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B4513;">Thank You for Your Booking!</h1>
          <p>Dear ${booking.name},</p>
          <p>We're delighted to confirm your reservation at Sweet Cafe.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #8B4513; margin-top: 0;">Booking Details</h2>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Number of Guests:</strong> ${booking.guests}</p>
            ${booking.phone ? `<p><strong>Phone:</strong> ${booking.phone}</p>` : ''}
            ${booking.message ? `<p><strong>Special Requests:</strong> ${booking.message}</p>` : ''}
          </div>
          
          <p>We look forward to serving you!</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you need to make any changes to your booking, please contact us directly.
          </p>
          
          <p style="margin-top: 30px;">
            Warm regards,<br>
            <strong>Sweet Cafe Team</strong>
          </p>
        </div>
      `,
    });

    // Send notification to cafe owner
    const ownerEmail = await resend.emails.send({
      from: "Sweet Cafe Bookings <onboarding@resend.dev>",
      to: ["cafe@example.com"], // Replace with actual cafe email
      subject: "New Booking Received",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B4513;">New Booking Alert</h1>
          <p>A new booking has been received:</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #8B4513; margin-top: 0;">Customer Details</h2>
            <p><strong>Name:</strong> ${booking.name}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            ${booking.phone ? `<p><strong>Phone:</strong> ${booking.phone}</p>` : ''}
            
            <h2 style="color: #8B4513; margin-top: 20px;">Booking Details</h2>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Guests:</strong> ${booking.guests}</p>
            ${booking.message ? `<p><strong>Message:</strong> ${booking.message}</p>` : ''}
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Please confirm or manage this booking in your admin dashboard.
          </p>
        </div>
      `,
    });

    console.log("Emails sent successfully:", { customerEmail, ownerEmail });

    return new Response(
      JSON.stringify({ 
        success: true, 
        customerEmailId: customerEmail.data?.id,
        ownerEmailId: ownerEmail.data?.id
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-notification:", error);
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
