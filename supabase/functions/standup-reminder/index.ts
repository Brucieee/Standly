import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for potential browser invocation, although not strictly needed for cron
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey",
};

serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // 1. Get all active users and their roles
    const { data: users, error: usersError } = await supabaseClient
      .from("profiles")
      .select("id, name, email, role");

    if (usersError) throw usersError;
    if (!users) throw new Error("No users found.");

    // Filter out Product Owners and Product Managers
    const usersToPotentiallyRemind = users.filter(user => 
        user.role !== 'Product Owner' && user.role !== 'Product Manager'
    );

    // 2. Get standups submitted today
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const { data: standupsToday, error: standupsError } = await supabaseClient
      .from("standups")
      .select("user_id")
      .eq("date", today);

    if (standupsError) throw standupsError;

    const usersWhoSubmitted = new Set(standupsToday.map(s => s.user_id));

    // 3. Find users who have NOT submitted a standup from the filtered list
    const usersToRemind = usersToPotentiallyRemind.filter(user => !usersWhoSubmitted.has(user.id));

    if (usersToRemind.length === 0) {
      return new Response(JSON.stringify({ message: "No reminders sent, all standups are in." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 4. Send reminders using Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not set in Supabase secrets.");
    }

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const [index, user] of usersToRemind.entries()) {
      if (index > 0) {
        await wait(5000); // Wait 5 seconds between requests
      }

      console.log(`Sending reminder to: ${user.email}`);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Standly Reminder <reminder@yourdomain.com>", // IMPORTANT: Replace with a domain you've verified with Resend
          to: user.email,
          subject: "Standup Reminder!",
          html: `
            <h1>Hey ${user.name}!</h1>
            <p>Just a friendly reminder to please submit your standup for today.</p>
            <p>Thanks!</p>
            <p><strong>The Standly Team</strong></p>
          `,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json();
        console.error(`Failed to send email to ${user.email}. Status: ${res.status}`);
        console.error('Resend Error:', errorBody);
      }
    }

    const message = `Processed ${usersToRemind.length} reminder(s). Check logs for details.`;
    console.log(message);

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
