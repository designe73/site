-- Add maintenance end date column
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS maintenance_end_date TIMESTAMP WITH TIME ZONE;