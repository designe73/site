-- Add maintenance mode and SEO fields to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS maintenance_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_message text DEFAULT 'Site en maintenance. Nous serons bientôt de retour.',
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS seo_keywords text;