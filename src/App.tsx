import { HashRouter } from "react-router-dom";
import { AppProviders } from "./components/AppProviders";
import { AppRoutes } from "./routes/AppRoutes";
import MaintenanceMode from "@/components/MaintenanceMode";
import PushNotificationPrompt from "@/components/notifications/PushNotificationPrompt";

const App = () => {
  return (
    <AppProviders>
      <HashRouter>
        <MaintenanceMode>
          <PushNotificationPrompt />
          <AppRoutes />
        </MaintenanceMode>
      </HashRouter>
    </AppProviders>
  );
};

export default App;