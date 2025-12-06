import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 1. DIAGNOSTIC AU DÉMARRAGE (Regardez la console F12)
console.log("🚀 Application en cours de démarrage...");
console.log("🌍 Environnement:", import.meta.env.MODE);

// Vérification cruciale : Est-ce que les clés Supabase sont là ?
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERREUR FATALE: Les clés Supabase sont manquantes !");
  console.error("Vérifiez vos 'Environment Variables' dans les réglages Vercel.");
} else {
  console.log("✅ Clés Supabase détectées.");
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  // Si le HTML est cassé et qu'il n'y a pas de div id="root"
  document.body.innerHTML = '<h1 style="color:red; padding: 20px;">ERREUR FATALE : Élément #root introuvable dans index.html</h1>';
  throw new Error("Impossible de trouver l'élément #root");
}

// 2. RENDU SÉCURISÉ
try {
  createRoot(rootElement).render(<App />);
  console.log("✅ React a monté l'application avec succès.");
} catch (error) {
  console.error("❌ L'application a planté au rendu :", error);
  // Affiche l'erreur à l'écran au lieu d'une page blanche
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red; font-family: sans-serif;">
      <h1>Erreur Critique au Démarrage</h1>
      <p>L'application n'a pas pu démarrer. Voici l'erreur technique :</p>
      <pre style="background: #f0f0f0; padding: 10px; border-radius: 5px;">${error instanceof Error ? error.message : String(error)}</pre>
      <p>Ouvrez la console (F12) pour plus de détails.</p>
    </div>
  `;
}