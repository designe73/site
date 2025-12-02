import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import ProductDetail from "./pages/ProductDetail";
import SearchResults from "./pages/SearchResults";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import Vehicles from "./pages/admin/Vehicles";
import Banners from "./pages/admin/Banners";
import Orders from "./pages/admin/Orders";
import Users from "./pages/admin/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/connexion" element={<Auth />} />
                <Route path="/inscription" element={<Auth />} />
                <Route path="/panier" element={<Cart />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categorie/:slug" element={<CategoryProducts />} />
                <Route path="/produit/:slug" element={<ProductDetail />} />
                <Route path="/recherche" element={<SearchResults />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="produits" element={<Products />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="vehicules" element={<Vehicles />} />
                  <Route path="bannieres" element={<Banners />} />
                  <Route path="commandes" element={<Orders />} />
                  <Route path="utilisateurs" element={<Users />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
