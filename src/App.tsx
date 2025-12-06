// src/App.tsx
import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "./components/AppProviders";
import { AppRoutes } from "./routes/AppRoutes";
import MaintenanceMode from "@/components/MaintenanceMode";
import PushNotificationPrompt from "@/components/notifications/PushNotificationPrompt";

const App = () => (
  <AppProviders>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <MaintenanceMode>
        <PushNotificationPrompt />
        <AppRoutes />
      </MaintenanceMode>
    </BrowserRouter>
  </AppProviders>
);

export default App;