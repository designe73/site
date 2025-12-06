import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("🚨 Supabase Client Error: Les variables d'environnement sont manquantes.");
}

// On crée le client même si les clés sont vides pour éviter que l'import fasse crasher tout le site.
// Les appels échoueront plus tard (avec une erreur 401), mais l'interface pourra s'afficher.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);