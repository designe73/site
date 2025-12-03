import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async"; // On garde l'import
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { SiteSettingsProvider } from "@/hooks/useSiteSettings";
import MaintenanceMode from "@/components/MaintenanceMode";
import PushNotificationPrompt from "@/components/notifications/PushNotificationPrompt";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import ErrorBoundary from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";

// ... (Garde tous tes Lazy imports ici, je ne les répète pas pour gagner de la place) ...
const Cart = lazy(() => import("./pages/Cart"));
// ... etc ...
const NotFound = lazy(() => import("./pages/NotFound"));
const Install = lazy(() => import("./pages/Install"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

// ✅ CORRECTIF ICI : Création explicite du contexte
const helmetContext = {};

const App = () => (
  <ErrorBoundary>
    {/* ✅ CORRECTIF ICI : On passe le context explicitement */}
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <SiteSettingsProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                  <MaintenanceMode>
                    <PushNotificationPrompt />
                    <PWAInstallPrompt />
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/connexion" element={<Auth />} />
                        <Route path="/inscription" element={<Auth />} />
                        
                        {/* ... Remets toutes tes routes ici ... */}
                        {/* Je mets juste un exemple pour que le code soit valide */}
                         <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </MaintenanceMode>
                </BrowserRouter>
              </TooltipProvider>
            </SiteSettingsProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
