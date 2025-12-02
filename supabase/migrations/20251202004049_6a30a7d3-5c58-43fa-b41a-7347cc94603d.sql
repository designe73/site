-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create SECURITY DEFINER function to check roles safely
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
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
      AND role = _role
  )
$$;

-- 5. Create RLS policy for user_roles (only admins can manage roles)
CREATE POLICY "Only admins can manage roles" 
ON public.user_roles
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Allow users to view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles
FOR SELECT 
USING (auth.uid() = user_id);

-- 7. Update all admin RLS policies to use the new function

-- Products table
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" 
ON public.products
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Categories table
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" 
ON public.categories
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Vehicles table
DROP POLICY IF EXISTS "Admins can manage vehicles" ON public.vehicles;
CREATE POLICY "Admins can manage vehicles" 
ON public.vehicles
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Banners table
DROP POLICY IF EXISTS "Admins can manage banners" ON public.banners;
CREATE POLICY "Admins can manage banners" 
ON public.banners
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Product vehicles table
DROP POLICY IF EXISTS "Admins can manage product vehicles" ON public.product_vehicles;
CREATE POLICY "Admins can manage product vehicles" 
ON public.product_vehicles
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Category spec types table
DROP POLICY IF EXISTS "Admins can manage category spec types" ON public.category_spec_types;
CREATE POLICY "Admins can manage category spec types" 
ON public.category_spec_types
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Tire specs table
DROP POLICY IF EXISTS "Admins can manage tire specs" ON public.tire_specs;
CREATE POLICY "Admins can manage tire specs" 
ON public.tire_specs
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Battery specs table
DROP POLICY IF EXISTS "Admins can manage battery specs" ON public.battery_specs;
CREATE POLICY "Admins can manage battery specs" 
ON public.battery_specs
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Mechanical specs table
DROP POLICY IF EXISTS "Admins can manage mechanical specs" ON public.mechanical_specs;
CREATE POLICY "Admins can manage mechanical specs" 
ON public.mechanical_specs
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Oil specs table
DROP POLICY IF EXISTS "Admins can manage oil specs" ON public.oil_specs;
CREATE POLICY "Admins can manage oil specs" 
ON public.oil_specs
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Accessory specs table
DROP POLICY IF EXISTS "Admins can manage accessory specs" ON public.accessory_specs;
CREATE POLICY "Admins can manage accessory specs" 
ON public.accessory_specs
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Site settings table
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings" 
ON public.site_settings
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Orders table - admins can view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" 
ON public.orders
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" 
ON public.orders
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Prevent users from updating is_admin in profiles table
-- Remove the general update policy and create specific ones
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Allow users to update their own profile EXCEPT is_admin
CREATE POLICY "Users can update own profile data" 
ON public.profiles
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Ensure is_admin is not being changed
  (
    SELECT is_admin FROM public.profiles WHERE id = auth.uid()
  ) = is_admin
);

-- 9. Migrate existing admin users to user_roles table
-- Insert admin role for users who have is_admin = true in profiles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE is_admin = true
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert user role for all users who don't have any role yet
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role
FROM public.profiles
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = profiles.id
)
ON CONFLICT (user_id, role) DO NOTHING;