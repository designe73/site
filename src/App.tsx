// 1. On change l'import : HashRouter au lieu de BrowserRouter
import { HashRouter } from "react-router-dom"; 
import { AppProviders } from "./components/AppProviders";
import { AppRoutes } from "./routes/AppRoutes";
import MaintenanceMode from "@/components/MaintenanceMode";
import PushNotificationPrompt from "@/components/notifications/PushNotificationPrompt";

const App = () => (
  <AppProviders>
    {/* 2. On utilise HashRouter ici pour envelopper l'application */}
    <HashRouter>
      <MaintenanceMode>
        <PushNotificationPrompt />
        <AppRoutes />
      </MaintenanceMode>
    </HashRouter>
  </AppProviders>
);

export default App;