import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { SiteSettingsProvider } from "@/hooks/useSiteSettings";
import MaintenanceMode from "@/components/MaintenanceMode";
import { lazy, Suspense } from "react";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";

// Lazy load non-critical pages
const Cart = lazy(() => import("./pages/Cart"));
const Account = lazy(() => import("./pages/Account"));
const Categories = lazy(() => import("./pages/Categories"));
const CategoryProducts = lazy(() => import("./pages/CategoryProducts"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const ForgotPassword = lazy(() => import("./pages/admin/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/admin/ResetPassword"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Products = lazy(() => import("./pages/admin/Products"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const Vehicles = lazy(() => import("./pages/admin/Vehicles"));
const Banners = lazy(() => import("./pages/admin/Banners"));
const Orders = lazy(() => import("./pages/admin/Orders"));
const Users = lazy(() => import("./pages/admin/Users"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const ImportCatalogue = lazy(() => import("./pages/admin/ImportCatalogue"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

const App = () => (
  <HelmetProvider>
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
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/connexion" element={<Auth />} />
                      <Route path="/inscription" element={<Auth />} />
                      <Route path="/panier" element={<Cart />} />
                      <Route path="/mon-compte" element={<Account />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/categorie/:slug" element={<CategoryProducts />} />
                      <Route path="/produit/:slug" element={<ProductDetail />} />
                      <Route path="/recherche" element={<SearchResults />} />
                      
                      {/* Admin auth routes */}
                      <Route path="/admin/connexion" element={<AdminLogin />} />
                      <Route path="/admin/mot-de-passe-oublie" element={<ForgotPassword />} />
                      <Route path="/admin/reset-password" element={<ResetPassword />} />
                      
                      {/* Admin routes */}
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="produits" element={<Products />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="vehicules" element={<Vehicles />} />
                        <Route path="bannieres" element={<Banners />} />
                        <Route path="commandes" element={<Orders />} />
                        <Route path="utilisateurs" element={<Users />} />
                        <Route path="profil" element={<AdminProfile />} />
                        <Route path="import" element={<ImportCatalogue />} />
                        <Route path="parametres" element={<Settings />} />
                      </Route>
                      
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
);

export default App;
