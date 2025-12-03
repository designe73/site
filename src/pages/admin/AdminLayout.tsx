import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, Image, Settings, Users, ShoppingBag, LogOut, Car, UserCircle, Upload, Bell, ImageIcon, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminPushNotifications } from '@/hooks/useAdminPushNotifications';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AdminLayout = () => {
  const { user, isAdmin, isModerator, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Enable admin push notifications
  useAdminPushNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // Define nav items with role requirements
  const navItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin', roles: ['admin', 'moderator'] },
    { icon: Package, label: 'Produits', path: '/admin/produits', roles: ['admin', 'moderator'] },
    { icon: FolderTree, label: 'Catégories', path: '/admin/categories', roles: ['admin', 'moderator'] },
    { icon: Car, label: 'Véhicules', path: '/admin/vehicules', roles: ['admin', 'moderator'] },
    { icon: Image, label: 'Bannières', path: '/admin/bannieres', roles: ['admin', 'moderator'] },
    { icon: ImageIcon, label: 'Bannières Catégories', path: '/admin/bannieres-categories', roles: ['admin', 'moderator'] },
    { icon: ShoppingBag, label: 'Commandes', path: '/admin/commandes', roles: ['admin', 'moderator'] },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications', roles: ['admin', 'moderator'] },
    { icon: Users, label: 'Utilisateurs', path: '/admin/utilisateurs', roles: ['admin'] },
    { icon: Upload, label: 'Import Catalogue', path: '/admin/import', roles: ['admin', 'moderator'] },
    { icon: UserCircle, label: 'Mon Profil', path: '/admin/profil', roles: ['admin', 'moderator'] },
    { icon: Settings, label: 'Paramètres', path: '/admin/parametres', roles: ['admin'] },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (isAdmin) return true;
    if (isModerator) return item.roles.includes('moderator');
    return false;
  });

  useEffect(() => {
    if (!loading && (!user || !isModerator)) {
      navigate('/connexion');
    }
  }, [user, isModerator, loading, navigate]);

  // Check if current route is allowed for this user
  useEffect(() => {
    if (!loading && user && isModerator && !isAdmin) {
      const adminOnlyPaths = ['/admin/utilisateurs', '/admin/parametres'];
      if (adminOnlyPaths.includes(location.pathname)) {
        navigate('/admin');
      }
    }
  }, [location.pathname, isAdmin, isModerator, loading, user, navigate]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isModerator) {
    return null;
  }

  const NavContent = () => (
    <>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-dark-light"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-dark-light space-y-2">
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link to="/">
            Voir le site
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Déconnexion
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-secondary text-secondary-foreground border-b border-dark-light">
        <div className="flex items-center justify-between p-3">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground font-roboto-condensed text-sm font-bold px-2 py-1 rounded">
              AUTO
            </div>
            <span className="font-roboto-condensed text-sm font-bold">ADMIN</span>
          </Link>
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-secondary text-secondary-foreground">
              <div className="p-4 border-b border-dark-light">
                <Link to="/admin" className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground font-roboto-condensed text-lg font-bold px-2 py-1 rounded">
                    AUTO
                  </div>
                  <span className="font-roboto-condensed text-lg font-bold">ADMIN</span>
                </Link>
              </div>
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-secondary text-secondary-foreground flex-col fixed h-full">
        <div className="p-4 border-b border-dark-light">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground font-roboto-condensed text-lg font-bold px-2 py-1 rounded">
              AUTO
            </div>
            <span className="font-roboto-condensed text-lg font-bold">ADMIN</span>
          </Link>
        </div>
        <NavContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
