import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Wrench, AlertTriangle } from 'lucide-react';

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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch settings
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('maintenance_mode, maintenance_message, site_name')
        .maybeSingle();

      setSettings(settingsData as SiteSettings | null);

      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'moderator'])
          .maybeSingle();
        
        setIsAdmin(!!roleData);
      }

      setIsLoading(false);
    };

    fetchData();
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

  // Allow admins and moderators to view the site in maintenance mode
  if (settings?.maintenance_mode && !isAdminRoute && !isAdmin) {
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

  // Show maintenance banner for admins viewing the site
  if (settings?.maintenance_mode && isAdmin && !isAdminRoute) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground py-2 px-4 text-center text-sm flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Mode maintenance actif - Seuls les administrateurs peuvent voir le site
        </div>
        <div className="pt-10">
          {children}
        </div>
      </>
    );
  }

  return <>{children}</>;
};

export default MaintenanceMode;
