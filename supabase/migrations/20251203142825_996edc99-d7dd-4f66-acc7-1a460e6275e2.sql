-- Fix security issues: Add explicit RLS policies for authenticated-only access

-- 1. Add policy to ensure cart_items requires authentication
CREATE POLICY "Cart items require authentication"
ON public.cart_items
FOR ALL
USING (auth.uid() IS NOT NULL);

-- 2. Add stronger protection for profiles
CREATE POLICY "Profiles require authentication for any access"
ON public.profiles
FOR ALL
USING (auth.uid() IS NOT NULL);

-- 3. Restrict site_settings sensitive fields - Create a view for public settings
CREATE OR REPLACE VIEW public.public_site_settings AS
SELECT 
  id,
  site_name,
  logo_url,
  currency,
  contact_email,
  contact_phone,
  address,
  maintenance_mode,
  maintenance_message,
  maintenance_end_date,
  whatsapp_enabled,
  whatsapp_number,
  account_enabled,
  seo_title,
  seo_description,
  seo_keywords
FROM public.site_settings;

-- Grant access to the view
GRANT SELECT ON public.public_site_settings TO anon, authenticated;

-- 4. Update orders RLS to be more explicit
CREATE POLICY "Orders require authentication"
ON public.orders
FOR ALL
USING (auth.uid() IS NOT NULL);

-- 5. Update order_items RLS
CREATE POLICY "Order items require authentication"
ON public.order_items
FOR ALL
USING (auth.uid() IS NOT NULL);

-- 6. Add authentication requirement to invoices
CREATE POLICY "Invoices require authentication"
ON public.invoices
FOR ALL
USING (auth.uid() IS NOT NULL);