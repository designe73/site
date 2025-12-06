import { HashRouter } from "react-router-dom";
import { AppProviders } from "./components/AppProviders";
import { AppRoutes } from "./routes/AppRoutes";
// import MaintenanceMode from "@/components/MaintenanceMode"; // Désactivé car besoin de Settings
// import PushNotificationPrompt from "@/components/notifications/PushNotificationPrompt"; // Désactivé aussi

const App = () => (
  <AppProviders>
    <HashRouter>
      {/* On affiche directement les routes sans le mode maintenance pour tester */}
      <AppRoutes />
    </HashRouter>
  </AppProviders>
);

export default App;