import React, { useState, useEffect, useContext, createContext } from 'react';
// IMPORTATION EXTERNE DE AuthContext SUPPRIMÉE pour contourner l'erreur de résolution de module.
// On suppose que AppProviders exporte AuthContext, mais nous allons le redéfinir ici pour la compilation.

// NOTE IMPORTANTE: Dans une application réelle, AuthContext DOIT être importé depuis
// le fichier AppProviders ou AuthProvider. Cette redéfinition est un contournement temporaire
// pour l'erreur de compilation de l'environnement.
const AuthContext = createContext({ user: null });

import { Settings, BarChart, XCircle } from 'lucide-react'; 

// Composant de remplacement minimal du Spinner (pour la démo)
const Spinner = ({ className = "h-8 w-8 text-primary animate-spin" }) => (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const Dashboard = () => {
    // Récupérer l'état de l'utilisateur depuis le contexte
    // NOTE: Si AuthContext n'est pas fourni par un parent, 'user' sera { user: null } par défaut.
    const { user } = useContext(AuthContext);
    
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ------------------------------------------------
    // GARDE DE SÉCURITÉ ET D'AUTORISATION
    // ------------------------------------------------
    // S'assurer que 'user' existe et que le rôle est 'admin'
    if (!user || user.role !== 'admin') {
        return (
            <div className="container py-12 text-center">
                <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-600">Accès Refusé (403)</h1>
                <p className="text-muted-foreground">Vous n'avez pas les permissions nécessaires pour accéder au Tableau de Bord.</p>
            </div>
        );
    }

    // ------------------------------------------------
    // LOGIQUE DE RÉCUPÉRATION DES STATISTIQUES COMPLEXES
    // ------------------------------------------------
    useEffect(() => {
        const fetchComplexStatistics = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // Simuler l'appel API complexe ou le calcul intensif
                // Remplacez cette logique par VOTRE code de statistiques.
                await new Promise(resolve => setTimeout(resolve, 1500)); 
                
                // Simuler un échec pour le test
                // if (Math.random() < 0.2) throw new Error("Erreur de calcul des KPIs.");

                const mockStats = {
                    totalOrders: 1250,
                    revenue: '9.8M CFA',
                    bestSeller: 'Plaquettes de frein avant'
                };

                setStats(mockStats);
            } catch (err) {
                console.error("Erreur lors du chargement des statistiques:", err);
                setError("Impossible de charger les données du tableau de bord. Veuillez réessayer.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchComplexStatistics();
    }, []);

    // ------------------------------------------------
    // RENDU CONDITIONNEL ET SÉCURISÉ
    // ------------------------------------------------

    if (isLoading) {
        return (
            <div className="container py-12 flex items-center justify-center min-h-[300px]">
                <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-xl">
                    <Spinner />
                    <p className="mt-4 text-lg text-primary">Chargement des Statistiques...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="container py-12 text-center p-8 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                <p className="font-bold">Erreur de Données :</p>
                <p>{error}</p>
            </div>
        );
    }
    
    // Rendu du Tableau de Bord
    return (
        <div className="container mx-auto py-8">
            <header className="flex items-center justify-between mb-8">
                <h1 className="font-roboto-condensed text-3xl font-bold flex items-center gap-3">
                    <BarChart className="h-7 w-7 text-primary" /> Tableau de Bord Principal
                </h1>
                <button className="inline-flex items-center justify-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
                    <Settings className="h-4 w-4 mr-2" /> Paramètres
                </button>
            </header>

            {/* Intégrez ici le RENDU de votre code de statistiques complexe (graphiques, cartes, etc.) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard title="Commandes Totales" value={stats.totalOrders} />
                <StatsCard title="Revenus Générés" value={stats.revenue} />
                <StatsCard title="Meilleure Vente" value={stats.bestSeller} />
            </div>

            <section className="mt-10 p-6 bg-card rounded-xl shadow-lg border border-border">
                <h2 className="text-xl font-bold mb-4">Analyse Détaillée (Intégrer le Code Complexe ici)</h2>
                <p className="text-muted-foreground">
                    *Placez votre logique de graphiques complexes (D3.js, Recharts, etc.) ici.*
                </p>
                {/* Exemple d'un point où votre code complexe est réactivé : */}
                {/* <YourComplexChart data={stats.detailedData} /> */}
            </section>

        </div>
    );
};

// Composant d'aide pour l'affichage des cartes de statistiques
const StatsCard = ({ title, value }) => (
    <div className="p-5 bg-card rounded-xl shadow-md border-l-4 border-primary">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
    </div>
);

export default Dashboard;
