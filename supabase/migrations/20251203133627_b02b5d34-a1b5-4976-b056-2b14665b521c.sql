-- Table des notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, promo, order, system
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour récupérer rapidement les notifications d'un utilisateur
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies pour notifications
CREATE POLICY "Users can view own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" 
ON public.notifications 
FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'moderator'::app_role]));

-- Table des factures
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policies pour factures
CREATE POLICY "Users can view own invoices" 
ON public.invoices 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = invoices.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage invoices" 
ON public.invoices 
FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'moderator'::app_role]));

-- Ajouter les champs de personnalisation de facture dans site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS invoice_company_name TEXT,
ADD COLUMN IF NOT EXISTS invoice_siret TEXT,
ADD COLUMN IF NOT EXISTS invoice_address TEXT,
ADD COLUMN IF NOT EXISTS invoice_phone TEXT,
ADD COLUMN IF NOT EXISTS invoice_email TEXT,
ADD COLUMN IF NOT EXISTS invoice_footer_text TEXT;

-- Enable realtime pour notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;