-- Create table for WhatsApp numbers
CREATE TABLE public.whatsapp_numbers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number text NOT NULL,
  name text,
  is_active boolean DEFAULT true,
  position integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_numbers ENABLE ROW LEVEL SECURITY;

-- Admins can manage WhatsApp numbers
CREATE POLICY "Admins can manage whatsapp numbers" 
ON public.whatsapp_numbers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Everyone can view active WhatsApp numbers
CREATE POLICY "Active whatsapp numbers are viewable by everyone" 
ON public.whatsapp_numbers 
FOR SELECT 
USING (is_active = true);