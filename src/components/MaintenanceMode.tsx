import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Wrench } from 'lucide-react';

interface MaintenanceModeProps {
  children: React.ReactNode;
}

interface SiteSettings {
  maintenance_mode: boolean;
  maintenance_message: string;
  site_name: string;
}

const MaintenanceMode = ({ children }: MaintenanceModeProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('maintenance_mode, maintenance_message, site_name')
        .maybeSingle();

      setSettings(data as SiteSettings | null);
      setIsLoading(false);
    };

    fetchSettings();
  }, []);

  // Allow admin routes even in maintenance mode
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (settings?.maintenance_mode && !isAdminRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="text-center max-w-md">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            <Wrench className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">
            {settings.site_name || 'AutoPièces Pro'}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {settings.maintenance_message || 'Site en maintenance. Nous serons bientôt de retour.'}
          </p>
          <p className="text-sm text-muted-foreground">
            Merci de votre patience
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MaintenanceMode;
