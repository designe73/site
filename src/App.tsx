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

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import ProductDetail from "./pages/ProductDetail";
import SearchResults from "./pages/SearchResults";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import Vehicles from "./pages/admin/Vehicles";
import Banners from "./pages/admin/Banners";
import Orders from "./pages/admin/Orders";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import AdminProfile from "./pages/admin/AdminProfile";
import ImportCatalogue from "./pages/admin/ImportCatalogue";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <SiteSettingsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <MaintenanceMode>
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
