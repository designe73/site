import { HashRouter } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";

const App = () => {
  return (
    // On retire AppProviders et MaintenanceMode pour tester le Routeur pur
    <HashRouter>
      <div className="p-4 bg-yellow-200 text-black text-center font-bold">
        MODE DE SECOURS ACTIVÉ
      </div>
      <AppRoutes />
    </HashRouter>
  );
};

export default App;