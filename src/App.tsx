import { HashRouter } from "react-router-dom";
import { AppProviders } from "./components/AppProviders";
// Import avec accolades car nous avons mis "export const" dans AppRoutes.tsx
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