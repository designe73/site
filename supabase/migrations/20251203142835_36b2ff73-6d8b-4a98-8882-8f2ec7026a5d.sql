-- Fix security definer view issue
DROP VIEW IF EXISTS public.public_site_settings;

CREATE VIEW public.public_site_settings 
WITH (security_invoker = on) AS
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

GRANT SELECT ON public.public_site_settings TO anon, authenticated;