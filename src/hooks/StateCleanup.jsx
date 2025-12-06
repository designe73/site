import React from 'react';
// Ces imports doivent pointer vers vos fichiers réels
import { useAuth } from './AuthContext'; 
import { useSupabase } from './SupabaseClient'; 
import { useNavigate } from 'react-router-dom'; 

// Ce composant doit être appelé lors du clic sur le bouton "Quitter le Back Office"
const NavigationAndLogoutHandler = () => {
  // resetAuthState est la fonction CRITIQUE que vous devez implémenter dans AuthContext.js
  const { resetAuthState } = useAuth(); 
  const { supabase } = useSupabase(); 
  const navigate = useNavigate();

  const handleExitBackOffice = async () => {
    try {
      // 1. Déconnexion côté Back-end (Supabase)
      // L'appel à Supabase pour invalider la session côté serveur
      const { error } = await supabase.auth.signOut();
      if (error) {
        // En cas d'erreur de Supabase, nous procédons quand même au nettoyage Front-end
        console.error("Erreur lors de la déconnexion de Supabase:", error);
      }

      // 2. Nettoyage de l'état Front-end (CRITIQUE pour éviter la page blanche)
      // Ceci vide les variables comme 'currentUser', 'userOrders', 'isAdmin', etc.
      resetAuthState(); 

      // 3. Redirection vers la page Front Office statique (Ex: page d'accueil)
      navigate('/'); 

      // Optionnel: Décommenter si le problème persiste après l'optimisation du cache Vercel
      // if (process.env.NODE_ENV === 'production') {
      //    window.location.reload(true); 
      // }

    } catch (e) {
      // Gérer toute erreur non traitée
      console.error("Erreur Full Stack lors de la sortie du Back Office:", e);
    }
  };

  return (
    <button 
      onClick={handleExitBackOffice}
      className="p-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
    >
      Quitter le Back Office
    </button>
  );
};

// Si le Front Office a besoin de données, assurez-vous qu'il gère l'état de chargement
const FrontOfficePage = () => {
    const { currentUser, isLoading } = useAuth();

    if (isLoading) {
        // Affiche un état de chargement au lieu d'une page blanche
        return <div>Chargement de la page...</div>; 
    }

    if (!currentUser) {
        // Redirige ou affiche un message si l'utilisateur n'est pas authentifié
        return <p>Veuillez vous connecter pour accéder à l'intégralité du Front Office.</p>; 
    }

    // Le rendu normal de la page se produit ici...
    return <h1>Contenu du Front Office</h1>;
}

export default NavigationAndLogoutHandler;