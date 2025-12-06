// src/routes/AppRoutes.tsx (ou src/AppRoutes.tsx)
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import NotFound from "@/pages/NotFound";

// ... Tous tes imports lazy ici ...
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";

const Cart = lazy(() => import("@/pages/Cart"));
const Account = lazy(() => import("@/pages/Account"));
const Categories = lazy(() => import("@/pages/Categories"));
const CategoryProducts = lazy(() => import("@/pages/CategoryProducts"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const SearchResults = lazy(() => import("@/pages/SearchResults"));
// ... Admin imports ...
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
// (Ajoute tous les autres imports admin ici)

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

export const AppRoutes = () => {
  return (
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
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
           <Route index element={<Dashboard />} />
           {/* ... tes autres routes admin ... */}
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};