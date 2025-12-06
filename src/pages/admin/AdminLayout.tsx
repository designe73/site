import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, Image, Settings, Users, ShoppingBag, LogOut, Car, UserCircle, Upload, Bell, ImageIcon, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
// import { useAdminPushNotifications } from '@/hooks/useAdminPushNotifications'; // ⚠️ Gardez commenté pour l'instant
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AdminLayout = () => {
  const { user, isAdmin, isModerator, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Liste des menus
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

  // Filtrer les menus selon le rôle
  const filteredNavItems = navItems.filter(item => {
    if (isAdmin) return true;
    if (isModerator) return item.roles.includes('moderator');
    return false;
  });

  // Fermer le menu mobile au changement de page
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // --- SÉCURITÉ : GESTION DES ÉTATS D'AUTHENTIFICATION ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500 font-medium">Chargement de l'administration...</p>
      </div>
    );
  }

  // Redirection sécurisée (Si pas connecté ou pas modérateur)
  if (!user || !isModerator) {
    return <Navigate to="/admin/connexion" state={{ from: location }} replace />;
  }

  // Protection des routes Admin pour les Modérateurs
  if (isModerator && !isAdmin) {
    const adminOnlyPaths = ['/admin/utilisateurs', '/admin/parametres'];
    const isRestricted = adminOnlyPaths.some(path => location.pathname.startsWith(path));
    if (isRestricted) {
       return <Navigate to="/admin" replace />;
    }
  }

  // --- FIN SÉCURITÉ ---
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
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button asChild variant="ghost" className="w-full justify-start text-gray-600">
          <Link to="/">Voir le site</Link>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10"
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Déconnexion
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground font-bold px-2 py-1 rounded text-xs">AUTO</div>
            <span className="font-bold text-sm">ADMIN</span>
          </Link>
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-white">
              <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <span className="font-bold text-lg">Menu Admin</span>
              </div>
              <NavContent />
            </SheetContent>
          </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white flex-col fixed h-full border-r border-gray-200 shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground font-bold px-2 py-1 rounded text-sm">AUTO</div>
            <span className="font-bold text-lg">ADMIN</span>
          </Link>
        </div>
        <NavContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;