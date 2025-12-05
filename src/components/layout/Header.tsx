import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Phone, Settings, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth'; // ⚠️ MODIFIÉ: useAuth est censé fournir isAdmin/isModerator
import { useCart } from '@/hooks/useCart';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import GlobalSearch from '@/components/search/GlobalSearch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import NotificationBell from '@/components/notifications/NotificationBell';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ✅ MODIFIÉ : Récupération des indicateurs de rôle depuis useAuth pour une meilleure centralisation (RBAC)
  const { user, signOut, isAdmin, isModerator } = useAuth(); 
  const { totalItems } = useCart();
  const { settings } = useSiteSettings();

  // Note : Le recalcul des droits est retiré ici, car il doit être dans useAuth.
  // S'il doit rester ici, la ligne suivante est la version sans l'email en dur, plus sécurisée :
  // const isAdmin = user?.app_metadata?.role === 'admin'; 
  
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-secondary text-secondary-foreground py-2 px-4">
        <div className="container flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <a href="tel:+221771234567" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">+221 77 123 45 67</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">Livraison gratuite dès 50 000 CFA</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="bg-primary text-primary-foreground font-roboto-condensed text-2xl font-bold px-3 py-1 rounded">
                ​SEN
              </div>
              <span className="font-roboto-condensed text-2xl font-bold text-foreground hidden sm:inline">
                PIECES
              </span>
            </Link>

            {/* Search bar with autocomplete */}
            <GlobalSearch className="flex-1 max-w-2xl hidden md:block" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              
              {/* Notification Bell : non-admin seulement */}
              {!isAdmin && <NotificationBell />}

              {/* Mon compte link when logged in */}
              {user && settings?.account_enabled && (
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex items-center gap-2">
                  <Link to={isAdmin ? "/admin" : "/mon-compte"}>
                    {isAdmin ? <ShieldCheck className="h-5 w-5 text-red-500" /> : <User className="h-5 w-5" />}
                    <span className="hidden md:inline">
                      {isAdmin ? "Admin" : "Mon compte"}
                    </span>
                  </Link>
                </Button>
              )}

              {/* Login link when not logged in */}
              {!user && (
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex items-center gap-2">
                  <Link to="/connexion">
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline">Connexion</span>
                  </Link>
                </Button>
              )}

              {/* User menu (Mobile + Dropdown) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="sm:hidden">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user ? (
                    <>
                      {settings?.account_enabled && !isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link to="/mon-compte" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Mon compte
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      {/* Menu Admin Sécurisé */}
                      {isModerator && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-primary font-bold flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            {isAdmin ? 'Espace Administrateur' : 'Modérateur'}
                          </DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to="/admin" className="text-primary font-bold flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Tableau de bord
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/commandes">Gestion des commandes</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/produits">Gestion des produits</Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()} className="text-red-500 cursor-pointer">
                        Déconnexion
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/connexion">Connexion</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/inscription">Inscription</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Cart : non-admin seulement pour éviter les erreurs de chargement (correction de syntaxe) */}
              {!isAdmin && (
                <Button variant="ghost" size="icon" className="relative" asChild>
                  <Link to="/panier">
                    <ShoppingCart className="h-6 w-6" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </Button> 
              )}


              {/* Mobile menu toggle */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="mt-4 md:hidden">
            <GlobalSearch isMobile />
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-secondary text-secondary-foreground">
          <div className="container">
            <ul className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-start md:items-center gap-1 py-2`}>
              <li>
                <Link to="/categories" className="block px-4 py-2 nav-link hover:bg-slate-200 rounded transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Toutes les catégories
                </Link>
              </li>
              <li>
                <Link to="/categorie/freinage" className="block px-4 py-2 nav-link hover:bg-slate-200 rounded transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Freinage
                </Link>
              </li>
              <li>
                <Link to="/categorie/filtration" className="block px-4 py-2 nav-link hover:bg-slate-200 rounded transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Filtration
                </Link>
              </li>
              <li>
                <Link to="/categorie/moteur" className="block px-4 py-2 nav-link hover:bg-slate-200 rounded transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Moteur
                </Link>
              </li>
              <li>
                <Link to="/categorie/suspension" className="block px-4 py-2 nav-link hover:bg-slate-200 rounded transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Suspension
                </Link>
              </li>
              <li>
                <Link to="/promotions" className="block px-4 py-2 text-primary font-medium hover:bg-slate-200 rounded transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Promotions
                </Link>
              </li>
              {isModerator && (
                <li className="md:ml-auto mt-2 md:mt-0 w-full md:w-auto">
                  <Link to="/admin" className="flex px-4 py-2 bg-primary text-white font-bold rounded hover:bg-primary/90 transition-colors items-center gap-2 justify-center" onClick={() => setMobileMenuOpen(false)}>
                    <Settings className="h-4 w-4" />
                    <span>Administration</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};
export default Header;