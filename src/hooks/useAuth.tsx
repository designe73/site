import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'moderator' | 'user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isModerator: boolean;
  userRole: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('user');

  // Définition stable des rôles
  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator' || userRole === 'admin';

  // Fonction pour récupérer le rôle (extraite pour être réutilisable)
  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) throw error;

      // Priority: admin > moderator > user
      if (data?.some(r => r.role === 'admin')) return 'admin';
      if (data?.some(r => r.role === 'moderator')) return 'moderator';
      return 'user';
    } catch (err) {
      console.error("Erreur récupération rôle:", err);
      return 'user';
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1. Initialisation au démarrage
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);

          if (initialSession?.user) {
            // IMPORTANT : On attend d'avoir le rôle AVANT de finir le chargement
            // C'est ça qui empêche la redirection intempestive de l'admin
            const role = await fetchUserRole(initialSession.user.id);
            if (mounted) setUserRole(role);
          } else {
            if (mounted) setUserRole('user');
          }
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // 2. Écoute des changements (Connexion / Déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Si on se connecte, on récupère le rôle immédiatement
          const role = await fetchUserRole(currentSession.user.id);
          if (mounted) setUserRole(role);
        } else {
          // Si on se déconnecte, on reset tout
          if (mounted) setUserRole('user');
        }
        
        // On s'assure que le loading est false après un changement d'état
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  const signIn = useCallback(async (email: string, password: string) => {
    // On remet loading à true pour éviter les clignotements pendant la requête
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoading(false); // On enlève le loading seulement si erreur (sinon onAuthStateChange gère)
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, phone?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { 
          full_name: fullName,
          phone: phone 
        }
      }
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUserRole('user');
    setLoading(false); // Force le re-render immédiat
  }, []);

  // Optimisation majeure : l'objet value est stable
  const value = useMemo(() => ({
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isModerator,
    userRole
  }), [user, session, loading, signIn, signUp, signOut, isAdmin, isModerator, userRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};