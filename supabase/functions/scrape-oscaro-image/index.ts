import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference, productId } = await req.json();
    
    if (!reference) {
      return new Response(
        JSON.stringify({ error: "Reference is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Firecrawl API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Search on Oscaro for the product reference
    const searchUrl = `https://www.oscaro.com/recherche?q=${encodeURIComponent(reference)}`;
    
    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: searchUrl,
        formats: ["html", "links"],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error("Firecrawl error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to scrape Oscaro", details: errorText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const scrapeData = await scrapeResponse.json();
    
    // Try to extract image URLs from the HTML
    const html = scrapeData.data?.html || "";
    
    // Regex patterns for Oscaro product images
    const imagePatterns = [
      /https:\/\/[^"'\s]+\.oscaro\.com\/[^"'\s]*\.(?:jpg|jpeg|png|webp)/gi,
      /https:\/\/media\.oscaro\.com\/[^"'\s]+/gi,
      /data-src="([^"]+)"/gi,
      /src="(https:\/\/[^"]+(?:jpg|jpeg|png|webp)[^"]*)"/gi,
    ];

    const imageUrls: string[] = [];
    
    for (const pattern of imagePatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const url = match[1] || match[0];
        if (url && !url.includes("logo") && !url.includes("icon") && !imageUrls.includes(url)) {
          imageUrls.push(url);
        }
      }
    }

    // Filter for product images (usually contain specific patterns)
    const productImages = imageUrls.filter(url => 
      url.includes("piece") || 
      url.includes("product") || 
      url.includes("media") ||
      (url.includes("oscaro") && (url.includes(".jpg") || url.includes(".png") || url.includes(".webp")))
    ).slice(0, 5); // Limit to 5 images

    // If productId provided, update the product in the database
    if (productId && productImages.length > 0) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error: updateError } = await supabase
        .from("products")
        .update({
          image_url: productImages[0],
          images: productImages,
        })
        .eq("id", productId);

      if (updateError) {
        console.error("Error updating product:", updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        images: productImages,
        searchUrl,
        totalFound: imageUrls.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
