import { HashRouter } from "react-router-dom";
// On n'importe PAS les routes complexes pour l'instant pour isoler le bug
// import { AppRoutes } from "./routes/AppRoutes"; 

const App = () => {
  return (
    <HashRouter>
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h1 style={{ color: 'green' }}>✅ LE SITE EST EN LIGNE</h1>
        <p>Si vous voyez ceci, c'est que la configuration Vite/Vercel est réparée.</p>
        <p>Nous allons pouvoir réactiver le contenu (Admin, Produits) juste après.</p>
      </div>
    </HashRouter>
  );
};

export default App;