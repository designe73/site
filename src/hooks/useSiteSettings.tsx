import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
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
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
  refetch: async () => {},
});

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error fetching site settings:', error);
      setSettings(defaultSettings);
    } else if (data) {
      setSettings({
        site_name: data.site_name || defaultSettings.site_name,
        logo_url: data.logo_url || defaultSettings.logo_url,
        currency: data.currency || defaultSettings.currency,
        contact_email: data.contact_email || defaultSettings.contact_email,
        contact_phone: data.contact_phone || defaultSettings.contact_phone,
        address: data.address || defaultSettings.address,
        maintenance_mode: data.maintenance_mode ?? defaultSettings.maintenance_mode,
        maintenance_message: data.maintenance_message || defaultSettings.maintenance_message,
        seo_title: data.seo_title || defaultSettings.seo_title,
        seo_description: data.seo_description || defaultSettings.seo_description,
        seo_keywords: data.seo_keywords || defaultSettings.seo_keywords,
        whatsapp_enabled: data.whatsapp_enabled ?? defaultSettings.whatsapp_enabled,
        account_enabled: data.account_enabled ?? defaultSettings.account_enabled,
      });
    } else {
      setSettings(defaultSettings);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading, refetch: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
