-- Create a function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- Update products policy to include moderators
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins and moderators can manage products" 
ON public.products 
FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['admin', 'moderator']::app_role[]));

-- Update categories policy to include moderators
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins and moderators can manage categories" 
ON public.categories 
FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['admin', 'moderator']::app_role[]));

-- Update banners policy to include moderators
DROP POLICY IF EXISTS "Admins can manage banners" ON public.banners;
CREATE POLICY "Admins and moderators can manage banners" 
ON public.banners 
FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['admin', 'moderator']::app_role[]));

-- Update vehicles policy to include moderators
DROP POLICY IF EXISTS "Admins can manage vehicles" ON public.vehicles;
CREATE POLICY "Admins and moderators can manage vehicles" 
ON public.vehicles 
FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['admin', 'moderator']::app_role[]));

-- Update product_vehicles policy to include moderators
DROP POLICY IF EXISTS "Admins can manage product vehicles" ON public.product_vehicles;
CREATE POLICY "Admins and moderators can manage product vehicles" 
ON public.product_vehicles 
FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['admin', 'moderator']::app_role[]));

-- Update spec tables policies to include moderators
DROP POLICY IF EXISTS "Admins can manage battery specs" ON public.battery_specs;
CREATE POLICY "Admins and moderators can manage battery specs" 
ON public.battery_specs 
FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['admin', 'moderator']::app_role[]));

DROP POLICY IF EXISTS "Admins can manage tire specs" ON public.tire_specs;
CREATE POLICY "Admins and moderators can manage tire specs" 
ON public.tire_specs 
FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['admin', 'moderator']::app_role[]));

DROP POLICY IF EXISTS "Admins can manage mechanical specs" ON public.mechanical_specs;
CREATE POLICY "Admins and moderators can manage mechanical specs" 
ON public.mechanical_specs 
FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['admin', 'moderator']::app_role[]));

DROP POLICY IF EXISTS "Admins can manage oil specs" ON public.oil_specs;
CREATE POLICY "Admins and moderators can manage oil specs" 
ON public.oil_specs 
FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['admin', 'moderator']::app_role[]));

DROP POLICY IF EXISTS "Admins can manage accessory specs" ON public.accessory_specs;
CREATE POLICY "Admins and moderators can manage accessory specs" 
ON public.accessory_specs 
FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['admin', 'moderator']::app_role[]));

DROP POLICY IF EXISTS "Admins can manage category spec types" ON public.category_spec_types;
CREATE POLICY "Admins and moderators can manage category spec types" 
ON public.category_spec_types 
FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['admin', 'moderator']::app_role[]));

-- Allow moderators to view and update orders (but not delete)
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins and moderators can view all orders" 
ON public.orders 
FOR SELECT 
USING (has_any_role(auth.uid(), ARRAY['admin', 'moderator']::app_role[]));

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins and moderators can update orders" 
ON public.orders 
FOR UPDATE 
USING (has_any_role(auth.uid(), ARRAY['admin', 'moderator']::app_role[]));

-- NOTE: user_roles and site_settings remain admin-only (no changes needed)