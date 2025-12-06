import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ReactNode } from "react";

// 👇 ON GARDE CES IMPORTS MAIS ON NE LES UTILISE PAS ENCORE
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { SiteSettingsProvider } from "@/hooks/useSiteSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          {/* 👇 J'ai commenté les 3 providers à risque. On va voir si le site s'affiche sans eux. */}
          
          {/* <AuthProvider> */}
            {/* <CartProvider> */}
              {/* <SiteSettingsProvider> */}
                
                <TooltipProvider>
                  {children}
                  <Toaster />
                  <Sonner />
                </TooltipProvider>

              {/* </SiteSettingsProvider> */}
            {/* </CartProvider> */}
          {/* </AuthProvider> */}
          
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};