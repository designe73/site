-- Table pour les attributs de pneus
CREATE TABLE public.tire_specs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  width INTEGER, -- ex: 205
  height INTEGER, -- ex: 55
  diameter INTEGER, -- ex: 16
  season TEXT, -- Été, Hiver, 4 Saisons
  load_index TEXT, -- ex: 91
  speed_index TEXT, -- ex: V
  runflat BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- Table pour les attributs de batteries
CREATE TABLE public.battery_specs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  amperage INTEGER, -- ex: 60 (Ah)
  start_power INTEGER, -- ex: 640 (A)
  terminal_position TEXT, -- + à gauche, + à droite
  technology TEXT, -- Plomb, AGM, Gel, Start & Stop
  length_mm INTEGER,
  width_mm INTEGER,
  height_mm INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- Table pour les attributs de pièces mécaniques
CREATE TABLE public.mechanical_specs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  assembly_side TEXT, -- Avant, Arrière, Gauche, Droite
  system_type TEXT, -- ex: Bosch, Lucas
  material TEXT, -- Céramique, Acier, Carbone
  condition TEXT DEFAULT 'new', -- Neuf, Reconditionné, Occasion
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- Table pour les attributs d'huiles
CREATE TABLE public.oil_specs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  viscosity TEXT, -- 5W30, 10W40, 0W20
  oil_type TEXT, -- Synthétique, Semi-synthétique, Minérale
  manufacturer_norm TEXT, -- VW 507.00, PSA B71
  capacity TEXT, -- 1L, 5L, Fût
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- Table pour les attributs d'accessoires
CREATE TABLE public.accessory_specs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  compatibility TEXT, -- Universel, Sur-mesure
  material TEXT, -- Caoutchouc, Velours, Plastique
  color TEXT, -- Noir, Gris, Beige
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- Table pour mapper les catégories aux types de specs
CREATE TABLE public.category_spec_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  spec_type TEXT NOT NULL, -- tire, battery, mechanical, oil, accessory
  UNIQUE(category_id)
);

-- Enable RLS
ALTER TABLE public.tire_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battery_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanical_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oil_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessory_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_spec_types ENABLE ROW LEVEL SECURITY;

-- Policies for public read
CREATE POLICY "Specs are viewable by everyone" ON public.tire_specs FOR SELECT USING (true);
CREATE POLICY "Specs are viewable by everyone" ON public.battery_specs FOR SELECT USING (true);
CREATE POLICY "Specs are viewable by everyone" ON public.mechanical_specs FOR SELECT USING (true);
CREATE POLICY "Specs are viewable by everyone" ON public.oil_specs FOR SELECT USING (true);
CREATE POLICY "Specs are viewable by everyone" ON public.accessory_specs FOR SELECT USING (true);
CREATE POLICY "Category spec types are viewable by everyone" ON public.category_spec_types FOR SELECT USING (true);

-- Admin policies
CREATE POLICY "Admins can manage tire specs" ON public.tire_specs FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can manage battery specs" ON public.battery_specs FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can manage mechanical specs" ON public.mechanical_specs FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can manage oil specs" ON public.oil_specs FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can manage accessory specs" ON public.accessory_specs FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can manage category spec types" ON public.category_spec_types FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));