import { useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, Image, Settings, Users, ShoppingBag, LogOut, Car, UserCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin' },
  { icon: Package, label: 'Produits', path: '/admin/produits' },
  { icon: FolderTree, label: 'Catégories', path: '/admin/categories' },
  { icon: Car, label: 'Véhicules', path: '/admin/vehicules' },
  { icon: Image, label: 'Bannières', path: '/admin/bannieres' },
  { icon: ShoppingBag, label: 'Commandes', path: '/admin/commandes' },
  { icon: Users, label: 'Utilisateurs', path: '/admin/utilisateurs' },
  { icon: UserCircle, label: 'Mon Profil', path: '/admin/profil' },
  { icon: Settings, label: 'Paramètres', path: '/admin/parametres' },
];

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/connexion');
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-secondary-foreground flex flex-col">
        <div className="p-4 border-b border-dark-light">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground font-roboto-condensed text-lg font-bold px-2 py-1 rounded">
              AUTO
            </div>
            <span className="font-roboto-condensed text-lg font-bold">ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
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
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
