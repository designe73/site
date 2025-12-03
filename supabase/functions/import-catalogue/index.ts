import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CatalogueRow {
  marque: string;
  modele: string;
  anneeDebut: number;
  anneeFin: number;
  cylindree: string;
  moteur: string;
  puissance: string;
  categoriePiece: string;
  nomPiece: string;
  referenceInterne: string;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { csvData } = await req.json();

    if (!csvData) {
      throw new Error("No CSV data provided");
    }

    console.log("Starting import...");

    // Parse CSV
    const lines = csvData.split("\n").filter((line: string) => line.trim());
    const rows: CatalogueRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(";");
      if (values.length >= 10) {
        rows.push({
          marque: values[0]?.trim() || "",
          modele: values[1]?.trim() || "",
          anneeDebut: parseInt(values[2]) || 2010,
          anneeFin: parseInt(values[3]) || 2020,
          cylindree: values[4]?.trim() || "",
          moteur: values[5]?.trim() || "",
          puissance: values[6]?.trim() || "",
          categoriePiece: values[7]?.trim() || "",
          nomPiece: values[8]?.trim() || "",
          referenceInterne: values[9]?.trim() || "",
        });
      }
    }

    console.log(`Parsed ${rows.length} rows`);

    // Get or create categories
    const categoryMap = new Map<string, string>();
    const uniqueCategories = [...new Set(rows.map((r) => r.categoriePiece))];

    for (const catName of uniqueCategories) {
      if (!catName) continue;
      
      const slug = generateSlug(catName);
      
      // Check if exists
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (existing) {
        categoryMap.set(catName, existing.id);
      } else {
        const { data: newCat, error } = await supabase
          .from("categories")
          .insert({ name: catName, slug })
          .select("id")
          .single();

        if (newCat) {
          categoryMap.set(catName, newCat.id);
        }
        if (error) console.log(`Category error for ${catName}:`, error.message);
      }
    }

    console.log(`Processed ${categoryMap.size} categories`);

    // Create unique vehicles (brand + model + year + engine)
    const vehicleMap = new Map<string, string>();
    const vehicleKeys = new Set<string>();

    for (const row of rows) {
      // Create a vehicle entry for the middle year of the range
      const midYear = Math.floor((row.anneeDebut + row.anneeFin) / 2);
      const engineInfo = `${row.cylindree} ${row.moteur}`.trim();
      const key = `${row.marque}|${row.modele}|${midYear}|${engineInfo}`;
      vehicleKeys.add(key);
    }

    console.log(`Found ${vehicleKeys.size} unique vehicles`);

    for (const key of vehicleKeys) {
      const [brand, model, yearStr, engine] = key.split("|");
      const year = parseInt(yearStr);

      // Check if vehicle exists
      const { data: existing } = await supabase
        .from("vehicles")
        .select("id")
        .eq("brand", brand)
        .eq("model", model)
        .eq("year", year)
        .eq("engine", engine)
        .maybeSingle();

      if (existing) {
        vehicleMap.set(key, existing.id);
      } else {
        const { data: newVehicle, error } = await supabase
          .from("vehicles")
          .insert({ brand, model, year, engine })
          .select("id")
          .single();

        if (newVehicle) {
          vehicleMap.set(key, newVehicle.id);
        }
        if (error) console.log(`Vehicle error for ${key}:`, error.message);
      }
    }

    console.log(`Processed ${vehicleMap.size} vehicles`);

    // Create products and link to vehicles
    const productMap = new Map<string, string>();
    let productsCreated = 0;
    let linksCreated = 0;

    for (const row of rows) {
      const productKey = row.referenceInterne;
      
      // Get or create product
      let productId = productMap.get(productKey);
      
      if (!productId) {
        // Check if product exists
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("reference", row.referenceInterne)
          .maybeSingle();

        if (existing) {
          productId = existing.id;
        } else {
          const categoryId = categoryMap.get(row.categoriePiece);
          const slug = generateSlug(`${row.nomPiece}-${row.referenceInterne}`);
          
          const { data: newProduct, error } = await supabase
            .from("products")
            .insert({
              name: row.nomPiece,
              slug,
              reference: row.referenceInterne,
              category_id: categoryId,
              price: 0,
              stock: 0,
              description: `${row.nomPiece} - Compatible ${row.marque} ${row.modele}`,
              brand: row.marque,
            })
            .select("id")
            .single();

          if (newProduct) {
            productId = newProduct.id;
            productsCreated++;
          }
          if (error) console.log(`Product error for ${row.referenceInterne}:`, error.message);
        }
        
        if (productId) {
          productMap.set(productKey, productId);
        }
      }

      // Link product to vehicle
      if (productId) {
        const midYear = Math.floor((row.anneeDebut + row.anneeFin) / 2);
        const engineInfo = `${row.cylindree} ${row.moteur}`.trim();
        const vehicleKey = `${row.marque}|${row.modele}|${midYear}|${engineInfo}`;
        const vehicleId = vehicleMap.get(vehicleKey);

        if (vehicleId) {
          // Check if link exists
          const { data: existingLink } = await supabase
            .from("product_vehicles")
            .select("id")
            .eq("product_id", productId)
            .eq("vehicle_id", vehicleId)
            .maybeSingle();

          if (!existingLink) {
            const { error } = await supabase
              .from("product_vehicles")
              .insert({ product_id: productId, vehicle_id: vehicleId });
            
            if (!error) linksCreated++;
          }
        }
      }
    }

    console.log(`Import complete: ${productsCreated} products, ${linksCreated} links`);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          rowsParsed: rows.length,
          categoriesProcessed: categoryMap.size,
          vehiclesProcessed: vehicleMap.size,
          productsCreated,
          linksCreated,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Import error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
