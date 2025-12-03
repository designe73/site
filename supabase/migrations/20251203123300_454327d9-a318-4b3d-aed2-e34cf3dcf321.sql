-- Add whatsapp_number column to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS whatsapp_number text;