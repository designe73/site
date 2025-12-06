import { createRoot } from "react-dom/client";
import App from "./App"; // Import par défaut (sans accolades)
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  // S'il y a un problème, le navigateur affichera une erreur dans la console
  console.error("ERREUR : Élément #root introuvable. Le montage React a échoué.");
}