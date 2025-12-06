import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// Imports directs (Pages critiques)
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";

// Imports Lazy (Pages secondaires)
const Cart = lazy(() => import("@/pages/Cart"));
const Account = lazy(() => import("@/pages/Account"));
const Categories = lazy(() => import("@/pages/Categories"));
const CategoryProducts = lazy(() => import("@/pages/CategoryProducts"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const SearchResults = lazy(() => import("@/pages/SearchResults"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Admin Imports
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const ForgotPassword = lazy(() => import("@/pages/admin/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/admin/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Products = lazy(() => import("@/pages/admin/Products"));
const AdminCategories = lazy(() => import("@/pages/admin/Categories"));
const Vehicles = lazy(() => import("@/pages/admin/Vehicles"));
const Banners = lazy(() => import("@/pages/admin/Banners"));
const Orders = lazy(() => import("@/pages/admin/Orders"));
const Users = lazy(() => import("@/pages/admin/Users"));
const Settings = lazy(() => import("@/pages/admin/Settings"));
const AdminProfile = lazy(() => import("@/pages/admin/AdminProfile"));
const ImportCatalogue = lazy(() => import("@/pages/admin/ImportCatalogue"));
const AdminNotifications = lazy(() => import("@/pages/admin/Notifications"));
const CategoryBanners = lazy(() => import("@/pages/admin/CategoryBanners"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

// Utilisation de "export const" pour le Named Export correct
export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Routes Publiques */}
        <Route path="/" element={<Index />} />
        <Route path="/connexion" element={<Auth />} />
        <Route path="/inscription" element={<Auth />} />
        <Route path="/panier" element={<Cart />} />
        <Route path="/mon-compte" element={<Account />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categorie/:slug" element={<CategoryProducts />} />
        <Route path="/produit/:slug" element={<ProductDetail />} />
        <Route path="/recherche" element={<SearchResults />} />

        {/* Routes Admin Auth */}
        <Route path="/admin/connexion" element={<AdminLogin />} />
        <Route path="/admin/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />

        {/* Espace Admin Protégé */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="produits" element={<Products />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="vehicules" element={<Vehicles />} />
          <Route path="bannieres" element={<Banners />} />
          <Route path="bannieres-categories" element={<CategoryBanners />} />
          <Route path="commandes" element={<Orders />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="utilisateurs" element={<Users />} />
          <Route path="profil" element={<AdminProfile />} />
          <Route path="import" element={<ImportCatalogue />} />
          <Route path="parametres" element={<Settings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};