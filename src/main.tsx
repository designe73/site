import { createRoot } from "react-dom/client";
import App from "./App"; // Import par défaut
import "./index.css";

// --- ZONE DE DIAGNOSTIC ---
console.log("🚀 Démarrage de l'application...");

const rootElement = document.getElementById("root");

if (!rootElement) {
  document.body.innerHTML = "<h1 style='color:red'>ERREUR CRITIQUE: Pas de div #root dans index.html</h1>";
  throw new Error("Missing root element");
}

try {
  // On essaie de monter l'application
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log("✅ Application montée avec succès !");
} catch (error) {
  // Si ça plante, on affiche l'erreur à l'écran
  console.error("🔥 CRASH AU DÉMARRAGE :", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; color: white; background: #990000; font-family: sans-serif;">
      <h1>L'application a planté.</h1>
      <p>Voici l'erreur technique à envoyer au support :</p>
      <pre style="background: black; padding: 10px; overflow: auto;">${String(error)}</pre>
    </div>
  `;
}