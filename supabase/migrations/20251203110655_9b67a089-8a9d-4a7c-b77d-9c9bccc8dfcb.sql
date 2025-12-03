-- Add feature toggles to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS account_enabled boolean DEFAULT true;