import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Phone, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import GlobalSearch from '@/components/search/GlobalSearch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import NotificationBell from '@/components/notifications/NotificationBell';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, isAdmin, isModerator } = useAuth();
  const { totalItems } = useCart();
  const { settings } = useSiteSettings();
  return <header className="sticky top-0 z-50 w-full">
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
              {/* Notifications */}
              <NotificationBell />

              {/* Mon compte link when logged in */}
              {user && settings?.account_enabled && (
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex items-center gap-2">
                  <Link to="/mon-compte">
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline">Mon compte</span>
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

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="sm:hidden">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user ? <>
                      {settings?.account_enabled && (
                        <DropdownMenuItem asChild>
                          <Link to="/mon-compte" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Mon compte
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {isModerator && <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-primary font-bold flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            {isAdmin ? 'Administrateur' : 'Modérateur'}
                          </DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to="/admin" className="text-primary font-bold flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Tableau de bord Admin
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/produits">
                              Gestion des produits
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/categories">
                              Gestion des catégories
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/vehicules">
                              Gestion des véhicules
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/bannieres">
                              Gestion des bannières
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/commandes">
                              Gestion des commandes
                            </Link>
                          </DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem asChild>
                              <Link to="/admin/utilisateurs">
                                Gestion des utilisateurs
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </>}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut}>
                        Déconnexion
                      </DropdownMenuItem>
                    </> : <>
                      <DropdownMenuItem asChild>
                        <Link to="/connexion">Connexion</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/inscription">Inscription</Link>
                      </DropdownMenuItem>
                    </>}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Cart */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/panier">
                  <ShoppingCart className="h-6 w-6" />
                  {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>}
                </Link>
              </Button>

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
                <Link to="/categories" className="block px-4 py-2 nav-link hover:bg-dark-light rounded transition-colors">
                  Toutes les catégories
                </Link>
              </li>
              <li>
                <Link to="/categorie/freinage" className="block px-4 py-2 nav-link hover:bg-dark-light rounded transition-colors">
                  Freinage
                </Link>
              </li>
              <li>
                <Link to="/categorie/filtration" className="block px-4 py-2 nav-link hover:bg-dark-light rounded transition-colors">
                  Filtration
                </Link>
              </li>
              <li>
                <Link to="/categorie/moteur" className="block px-4 py-2 nav-link hover:bg-dark-light rounded transition-colors">
                  Moteur
                </Link>
              </li>
              <li>
                <Link to="/categorie/suspension" className="block px-4 py-2 nav-link hover:bg-dark-light rounded transition-colors">
                  Suspension
                </Link>
              </li>
              <li>
                <Link to="/promotions" className="block px-4 py-2 text-primary font-medium hover:bg-dark-light rounded transition-colors">
                  Promotions
                </Link>
              </li>
              {isModerator && <li className="ml-auto">
                  <Link to="/admin" className="block px-4 py-2 nav-link hover:bg-dark-light rounded transition-colors flex items-center gap-2 bg-primary/10 text-primary font-bold border border-primary/20">
                    <Settings className="h-4 w-4" />
                    <span className="hidden lg:inline">Administration</span>
                    <span className="lg:hidden">Admin</span>
                  </Link>
                </li>}
            </ul>
          </div>
        </nav>
      </div>
    </header>;
};
export default Header;