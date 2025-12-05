import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
// J'ai commenté les providers qui demandent Supabase pour tester
// import { AuthProvider } from "@/hooks/useAuth";
// import { CartProvider } from "@/hooks/useCart";
import { SiteSettingsProvider } from "@/hooks/useSiteSettings";
import MaintenanceMode from "@/components/MaintenanceMode";
import ErrorBoundary from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";

// On garde une route simple pour le test
const NotFound = lazy(() => import("./pages/NotFound"));

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

const helmetContext = {};

const App = () => (
  <ErrorBoundary>
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        {/* On a retiré AuthProvider temporairement */}
          {/* <CartProvider> */}
            <SiteSettingsProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <MaintenanceMode>
                    <Suspense fallback={<PageLoader />}>
                      <div className="p-4 text-center bg-green-100 text-green-800 font-bold">
                        MODE TEST : AUTHENTIFICATION DÉSACTIVÉE
                      </div>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </MaintenanceMode>
                </BrowserRouter>
              </TooltipProvider>
            </SiteSettingsProvider>
          {/* </CartProvider> */}
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
