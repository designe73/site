import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProductToScrape {
  id: string;
  reference: string;
}

interface ScrapeResult {
  productId: string;
  success: boolean;
  imageUrl?: string;
  error?: string;
}

async function scrapeOscaroForProduct(reference: string, apiKey: string): Promise<string[]> {
  const searchUrl = `https://www.oscaro.com/recherche?q=${encodeURIComponent(reference)}`;
  
  try {
    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: searchUrl,
        formats: ["html"],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    if (!scrapeResponse.ok) {
      console.error(`Firecrawl error for ${reference}`);
      return [];
    }

    const scrapeData = await scrapeResponse.json();
    const html = scrapeData.data?.html || "";
    
    const imagePatterns = [
      /https:\/\/[^"'\s]+\.oscaro\.com\/[^"'\s]*\.(?:jpg|jpeg|png|webp)/gi,
      /https:\/\/media\.oscaro\.com\/[^"'\s]+/gi,
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

    return imageUrls.filter(url => 
      url.includes("piece") || 
      url.includes("product") || 
      url.includes("media") ||
      (url.includes("oscaro") && (url.includes(".jpg") || url.includes(".png") || url.includes(".webp")))
    ).slice(0, 3);
  } catch (error) {
    console.error(`Error scraping ${reference}:`, error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { products } = await req.json() as { products: ProductToScrape[] };
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return new Response(
        JSON.stringify({ error: "Products array is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Limit to 10 products per batch for performance
    const productsToProcess = products.slice(0, 10);

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Firecrawl API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: ScrapeResult[] = [];

    // Process products in parallel (max 3 at a time to avoid rate limits)
    const batchSize = 3;
    for (let i = 0; i < productsToProcess.length; i += batchSize) {
      const batch = productsToProcess.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (product): Promise<ScrapeResult> => {
          const images = await scrapeOscaroForProduct(product.reference, FIRECRAWL_API_KEY);
          
          if (images.length > 0) {
            const { error: updateError } = await supabase
              .from("products")
              .update({
                image_url: images[0],
                images: images,
              })
              .eq("id", product.id);

            if (updateError) {
              console.error(`Error updating product ${product.id}:`, updateError);
              return { productId: product.id, success: false, error: updateError.message };
            }
            
            return { productId: product.id, success: true, imageUrl: images[0] };
          }
          
          return { productId: product.id, success: false, error: "No images found" };
        })
      );
      
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < productsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Batch scrape completed: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        summary: { successCount, failCount, total: results.length },
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
