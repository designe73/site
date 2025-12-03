-- Create table for category banners (side banners on homepage)
CREATE TABLE public.category_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  link TEXT,
  title TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.category_banners ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Category banners are viewable by everyone" 
ON public.category_banners 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins and moderators can manage category banners" 
ON public.category_banners 
FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'moderator'::app_role]));