// 👇 C'est ici que ça change : on importe depuis le dossier racine components
import { NavLink } from "@/components/NavLink"; 

const Navbar = () => {
  return (
    <nav className="bg-secondary text-secondary-foreground">
      <div className="container">
        <ul className="hidden md:flex flex-col md:flex-row gap-1 py-2">
          
          {/* Lien 1 */}
          <li>
            <NavLink 
              to="/categories" 
              className="block px-4 py-2 rounded transition-colors hover:bg-slate-200"
              activeClassName="bg-primary text-primary-foreground font-bold hover:bg-primary"
            >
              Toutes les catégories
            </NavLink>
          </li>

          {/* Lien 2 */}
          <li>
            <NavLink 
              to="/categorie/freinage"
              className="block px-4 py-2 rounded transition-colors hover:bg-slate-200"
              activeClassName="bg-primary text-primary-foreground font-bold hover:bg-primary"
            >
              Freinage
            </NavLink>
          </li>

          {/* Ajoutez les autres liens ici... */}

        </ul>
      </div>
    </nav>
  );
};

export default Navbar;