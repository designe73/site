import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App"; // Assurez-vous que c'est bien "./App" (pas d'accolades)
import "./index.css";

console.log("🚀 Démarrage du Main...");

const rootElement = document.getElementById("root");

if (!rootElement) {
  document.body.innerHTML = `
    <div style="color: red; padding: 20px; font-weight: bold;">
      ERREUR CRITIQUE: Impossible de trouver la div #root dans index.html
    </div>
  `;
  throw new Error("Root element missing");
}

// Fonction pour afficher l'erreur à l'écran
const renderError = (error: unknown) => {
  console.error("🔥 CRASH APP:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; background: #fee2e2; color: #991b1b; font-family: monospace; border: 2px solid #ef4444; margin: 20px; border-radius: 8px;">
      <h1 style="font-size: 24px; margin-bottom: 10px;">💥 L'application a planté</h1>
      <p style="font-weight: bold;">Voici l'erreur technique (envoyez ça au développeur) :</p>
      <pre style="background: white; padding: 15px; border-radius: 5px; overflow: auto; border: 1px solid #cca5a5;">
${error instanceof Error ? error.message + "\n\n" + error.stack : String(error)}
      </pre>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #991b1b; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Réessayer (F5)
      </button>
    </div>
  `;
};

try {
  const root = createRoot(rootElement);
  root.render(
    // On retire StrictMode pour éviter les doubles rendus en dev qui masquent parfois les erreurs
    <App />
  );
  console.log("✅ App montée. Si l'écran est blanc, l'erreur est dans un useEffect ou un Lazy Load.");
} catch (error) {
  renderError(error);
}

// Attrape les erreurs globales (ex: import manquant dans un fichier lazy)
window.addEventListener('error', (event) => {
  renderError(event.error);
});

// Attrape les erreurs de promesses (ex: Supabase qui échoue au boot)
window.addEventListener('unhandledrejection', (event) => {
  renderError(event.reason);
});