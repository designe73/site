import { Outlet, Link } from "react-router-dom";

// ⚠️ AUCUN IMPORT DE HOOKS ICI (pas de useAuth, pas de useCart)
// Juste du React pur pour tester l'affichage.

const AdminLayout = () => {
  console.log("🚀 ADMIN LAYOUT EST EN TRAIN DE S'AFFICHER !");

  return (
    <div className="min-h-screen bg-red-600 p-10 text-white">
      <h1 className="text-4xl font-bold mb-4">✅ TEST ADMIN RÉUSSI</h1>
      <p className="text-xl mb-8">
        Si vous voyez cet écran rouge, c'est que le Routeur fonctionne parfaitement.
        Le problème venait de "useAuth" qui bloquait l'affichage.
      </p>

      <div className="bg-white text-black p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Zone de contenu (Outlet) :</h2>
        {/* C'est ici que les pages Produits, Dashboard, etc. s'affichent */}
        <Outlet />
      </div>

      <div className="mt-8">
        <Link to="/" className="underline hover:text-gray-200">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default AdminLayout;