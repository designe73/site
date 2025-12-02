import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SiteSettings {
  site_name: string;
  logo_url: string;
  currency: string;
  contact_email: string;
  contact_phone: string;
  address: string;
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
