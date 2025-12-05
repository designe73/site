import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Phone, Settings, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import GlobalSearch from '@/components/search/GlobalSearch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import NotificationBell from '@/components/notifications/NotificationBell';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ✅ Correction : On récupère l'objet user complet pour vérifier nous-même les droits
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const { settings } = useSiteSettings();

  // ✅ SÉCURITÉ : Recalcul des droits Admin si useAuth ne les fournit pas
  // Vérifie si l'utilisateur a le rôle admin dans ses métadonnées OU si c'est votre email spécifique
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.email === 'cheikhti01@gmail.com'; // Ajoutez votre email admin ici au cas où
  const isModerator = isAdmin || user?.app_metadata?.role === 'moderator';

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
              
              {/* ✅ SÉCURITÉ : On n'affiche les notifications que si l'utilisateur n'est PAS un admin pur
                  pour éviter le crash "Profil introuvable" */}
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

              {/* User menu */}
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

              {/* Cart - Seulement pour les non-admins pour éviter les erreurs de chargement */}
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