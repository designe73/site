import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Save, Loader2, AlertTriangle, Search, MessageCircle, UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SiteSettings {
  site_name: string;
  logo_url: string;
  currency: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  whatsapp_enabled: boolean;
  account_enabled: boolean;
}

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'AutoPièces Pro',
    logo_url: '',
    currency: 'CFA',
    contact_email: '',
    contact_phone: '+221 77 123 45 67',
    address: '',
    maintenance_mode: false,
    maintenance_message: 'Site en maintenance. Nous serons bientôt de retour.',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    whatsapp_enabled: true,
    account_enabled: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
    } else if (data) {
      setSettings({
        site_name: data.site_name || 'AutoPièces Pro',
        logo_url: data.logo_url || '',
        currency: data.currency || 'CFA',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '+221 77 123 45 67',
        address: data.address || '',
        maintenance_mode: data.maintenance_mode || false,
        maintenance_message: data.maintenance_message || 'Site en maintenance. Nous serons bientôt de retour.',
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        seo_keywords: data.seo_keywords || '',
        whatsapp_enabled: data.whatsapp_enabled ?? true,
        account_enabled: data.account_enabled ?? true,
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Check if settings exist
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .single();

    let error;
    if (existing) {
      // Update existing settings
      const { error: updateError } = await supabase
        .from('site_settings')
        .update(settings)
        .eq('id', existing.id);
      error = updateError;
    } else {
      // Insert new settings
      const { error: insertError } = await supabase
        .from('site_settings')
        .insert(settings);
      error = insertError;
    }

    if (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } else {
      toast.success('Paramètres sauvegardés avec succès');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Paramètres du site | Admin AutoPièces</title>
      </Helmet>

      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-roboto-condensed text-3xl font-bold mb-2">
            Paramètres du site
          </h1>
          <p className="text-muted-foreground">
            Configurez les informations générales de votre site
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 max-w-4xl">
            {/* Maintenance Mode */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Mode maintenance
                </CardTitle>
                <CardDescription>
                  Activez le mode maintenance pour bloquer l'accès au site public
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance_mode">Activer le mode maintenance</Label>
                    <p className="text-sm text-muted-foreground">
                      Les visiteurs verront une page de maintenance
                    </p>
                  </div>
                  <Switch
                    id="maintenance_mode"
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenance_message">Message de maintenance</Label>
                  <Textarea
                    id="maintenance_message"
                    value={settings.maintenance_message}
                    onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                    placeholder="Site en maintenance. Nous serons bientôt de retour."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Features Toggle */}
            <Card>
              <CardHeader>
                <CardTitle>Fonctionnalités</CardTitle>
                <CardDescription>
                  Activez ou désactivez les fonctionnalités du site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <div className="space-y-0.5">
                      <Label htmlFor="whatsapp_enabled">Commander par WhatsApp</Label>
                      <p className="text-sm text-muted-foreground">
                        Permet aux clients de commander via WhatsApp
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="whatsapp_enabled"
                    checked={settings.whatsapp_enabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, whatsapp_enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-5 w-5 text-blue-600" />
                    <div className="space-y-0.5">
                      <Label htmlFor="account_enabled">Espace Mon compte</Label>
                      <p className="text-sm text-muted-foreground">
                        Permet aux clients d'accéder à leur espace personnel
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="account_enabled"
                    checked={settings.account_enabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, account_enabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Référencement SEO
                </CardTitle>
                <CardDescription>
                  Optimisez votre site pour les moteurs de recherche
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">Titre SEO</Label>
                  <Input
                    id="seo_title"
                    value={settings.seo_title}
                    onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
                    placeholder="AutoPièces Pro - Pièces Auto de Qualité au Sénégal"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {settings.seo_title.length}/60 caractères (recommandé: max 60)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_description">Meta description</Label>
                  <Textarea
                    id="seo_description"
                    value={settings.seo_description}
                    onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
                    placeholder="Découvrez notre large gamme de pièces automobiles de qualité. Livraison rapide partout au Sénégal."
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {settings.seo_description.length}/160 caractères (recommandé: max 160)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_keywords">Mots-clés</Label>
                  <Input
                    id="seo_keywords"
                    value={settings.seo_keywords}
                    onChange={(e) => setSettings({ ...settings, seo_keywords: e.target.value })}
                    placeholder="pièces auto, automobile, Dakar, Sénégal, freinage, filtration"
                  />
                  <p className="text-xs text-muted-foreground">
                    Séparez les mots-clés par des virgules
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* General Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>
                  Nom du site, logo et devise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Nom du site</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    placeholder="AutoPièces Pro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo_url">URL du logo</Label>
                  <Input
                    id="logo_url"
                    value={settings.logo_url}
                    onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    placeholder="CFA"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Coordonnées de contact</CardTitle>
                <CardDescription>
                  Informations de contact affichées sur le site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email de contact</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    placeholder="contact@autopieces.sn"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Téléphone / WhatsApp</Label>
                  <Input
                    id="contact_phone"
                    value={settings.contact_phone}
                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                    placeholder="+221 77 123 45 67"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ce numéro sera utilisé pour les commandes WhatsApp
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    placeholder="123 Avenue Cheikh Anta Diop, Dakar, Sénégal"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="btn-primary">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder les paramètres
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Settings;
