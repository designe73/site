import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-vercel-signature",
};

interface DeploymentPayload {
  type: "deployment.created" | "deployment.succeeded" | "deployment.failed" | "deployment.canceled";
  action?: "start" | "end";
  secret?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const deploymentSecret = Deno.env.get("DEPLOYMENT_WEBHOOK_SECRET");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const payload: DeploymentPayload = await req.json();
    
    // Simple secret validation for manual triggers
    if (payload.secret && deploymentSecret && payload.secret !== deploymentSecret) {
      return new Response(JSON.stringify({ error: "Invalid secret" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let enableMaintenance = false;
    let maintenanceMessage = "Site en maintenance. Nous serons bientôt de retour.";

    // Handle Vercel webhook events
    if (payload.type === "deployment.created") {
      enableMaintenance = true;
      maintenanceMessage = "🚀 Mise à jour en cours... Le site sera disponible dans quelques instants.";
    } else if (payload.type === "deployment.succeeded" || payload.type === "deployment.failed" || payload.type === "deployment.canceled") {
      enableMaintenance = false;
    }

    // Handle manual triggers
    if (payload.action === "start") {
      enableMaintenance = true;
      maintenanceMessage = "🚀 Mise à jour en cours... Le site sera disponible dans quelques instants.";
    } else if (payload.action === "end") {
      enableMaintenance = false;
    }

    // Update site settings
    const { error } = await supabase
      .from("site_settings")
      .update({
        maintenance_mode: enableMaintenance,
        maintenance_message: enableMaintenance ? maintenanceMessage : "Site en maintenance. Nous serons bientôt de retour.",
        maintenance_end_date: enableMaintenance ? new Date(Date.now() + 5 * 60 * 1000).toISOString() : null, // 5 min estimate
      })
      .eq("id", (await supabase.from("site_settings").select("id").single()).data?.id);

    if (error) {
      console.error("Error updating maintenance mode:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Maintenance mode ${enableMaintenance ? "enabled" : "disabled"}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        maintenance_mode: enableMaintenance,
        message: enableMaintenance ? "Maintenance mode enabled" : "Maintenance mode disabled"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
