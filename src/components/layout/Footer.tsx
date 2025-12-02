import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const { isAdmin } = useAuth();
  
  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground font-roboto-condensed text-xl font-bold px-2 py-1 rounded">
                AUTO
              </div>
              <span className="font-roboto-condensed text-xl font-bold">PIÈCES</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Votre partenaire de confiance pour toutes vos pièces automobiles. Qualité garantie et livraison rapide.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-roboto-condensed text-lg font-bold mb-4">Catégories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/categorie/freinage" className="text-muted-foreground hover:text-primary transition-colors">
                  Freinage
                </Link>
              </li>
              <li>
                <Link to="/categorie/filtration" className="text-muted-foreground hover:text-primary transition-colors">
                  Filtration
                </Link>
              </li>
              <li>
                <Link to="/categorie/moteur" className="text-muted-foreground hover:text-primary transition-colors">
                  Moteur
                </Link>
              </li>
              <li>
                <Link to="/categorie/suspension" className="text-muted-foreground hover:text-primary transition-colors">
                  Suspension
                </Link>
              </li>
              <li>
                <Link to="/categorie/eclairage" className="text-muted-foreground hover:text-primary transition-colors">
                  Éclairage
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-roboto-condensed text-lg font-bold mb-4">Informations</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/a-propos" className="text-muted-foreground hover:text-primary transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/livraison" className="text-muted-foreground hover:text-primary transition-colors">
                  Livraison
                </Link>
              </li>
              <li>
                <Link to="/retours" className="text-muted-foreground hover:text-primary transition-colors">
                  Retours & Remboursements
                </Link>
              </li>
              <li>
                <Link to="/cgv" className="text-muted-foreground hover:text-primary transition-colors">
                  CGV
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-roboto-condensed text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                +221 77 123 45 67
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                contact@autopieces.sn
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                123 Avenue Cheikh Anta Diop, Dakar, Sénégal
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-light">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <p>© 2024 AutoPièces Pro. Tous droits réservés.</p>
              <span>•</span>
              <Button 
                asChild 
                size="sm" 
                className="btn-primary h-8 gap-2"
              >
                <Link to={isAdmin ? "/admin" : "/admin/connexion"}>
                  <Settings className="h-4 w-4" />
                  Administration
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <span>Paiement sécurisé</span>
              <span>•</span>
              <span>Satisfait ou remboursé</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
