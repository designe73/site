import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Wrench, AlertTriangle, Clock, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface MaintenanceModeProps {
  children: React.ReactNode;
}

interface SiteSettings {
  maintenance_mode: boolean;
  maintenance_message: string;
  site_name: string;
  maintenance_end_date: string | null;
}

const MaintenanceMode = ({ children }: MaintenanceModeProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const checkAdminRole = async (userId: string) => {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'moderator'])
      .maybeSingle();
    
    return !!roleData;
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('maintenance_mode, maintenance_message, site_name, maintenance_end_date')
        .maybeSingle();

      setSettings(settingsData as SiteSettings | null);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const hasAdminRole = await checkAdminRole(user.id);
        setIsAdmin(hasAdminRole);
      }

      setIsLoading(false);
    };

    fetchData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const hasAdminRole = await checkAdminRole(session.user.id);
        setIsAdmin(hasAdminRole);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!settings?.maintenance_end_date) {
      setCountdown(null);
      return;
    }

    const calculateCountdown = () => {
      const endDate = new Date(settings.maintenance_end_date!);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [settings?.maintenance_end_date]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error('Identifiants incorrects');
      setLoginLoading(false);
      return;
    }

    if (data.user) {
      const hasAdminRole = await checkAdminRole(data.user.id);
      if (hasAdminRole) {
        setIsAdmin(true);
        toast.success('Connexion réussie');
      } else {
        await supabase.auth.signOut();
        toast.error('Accès réservé aux administrateurs');
      }
    }
    
    setLoginLoading(false);
  };

  const isAdminRoute = window.location.pathname.startsWith('/admin');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

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
          
          {countdown && (
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Retour estimé dans</span>
              </div>
              <div className="flex justify-center gap-3">
                {countdown.days > 0 && (
                  <div className="bg-card border rounded-lg p-3 min-w-[70px]">
                    <div className="text-2xl font-bold text-primary">{countdown.days}</div>
                    <div className="text-xs text-muted-foreground">jours</div>
                  </div>
                )}
                <div className="bg-card border rounded-lg p-3 min-w-[70px]">
                  <div className="text-2xl font-bold text-primary">{countdown.hours.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-muted-foreground">heures</div>
                </div>
                <div className="bg-card border rounded-lg p-3 min-w-[70px]">
                  <div className="text-2xl font-bold text-primary">{countdown.minutes.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-muted-foreground">minutes</div>
                </div>
                <div className="bg-card border rounded-lg p-3 min-w-[70px]">
                  <div className="text-2xl font-bold text-primary">{countdown.seconds.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-muted-foreground">secondes</div>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground mb-6">
            Merci de votre patience
          </p>

          {/* Admin Login */}
          {!showLogin ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowLogin(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <LogIn className="h-3 w-3 mr-1" />
              Accès administrateur
            </Button>
          ) : (
            <div className="bg-card border rounded-lg p-4 mt-4 text-left">
              <h3 className="font-medium mb-3 text-center">Connexion administrateur</h3>
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@exemple.com"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setShowLogin(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" size="sm" className="flex-1" disabled={loginLoading}>
                    {loginLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Connexion'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

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
