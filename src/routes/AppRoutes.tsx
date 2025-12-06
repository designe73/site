import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// 1. Imports DIRECTS (Chargement immédiat pour éviter les bugs de lazy loading)
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Diagnostic from "@/pages/admin/Diagnostic"; // 👈 LA SONDE DE TEST

// 2. Imports LAZY (Chargement à la demande pour la performance)
const Cart = lazy(() => import("@/pages/Cart"));
const Account = lazy(() => import("@/pages/Account"));
const Categories = lazy(() => import("@/pages/Categories"));
const CategoryProducts = lazy(() => import("@/pages/CategoryProducts"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const SearchResults = lazy(() => import("@/pages/SearchResults"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// --- Imports Admin ---
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

// Composant de chargement pendant la navigation
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* --- Routes Publiques --- */}
        <Route path="/" element={<Index />} />
        <Route path="/connexion" element={<Auth />} />
        <Route path="/inscription" element={<Auth />} />
        <Route path="/panier" element={<Cart />} />
        <Route path="/mon-compte" element={<Account />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categorie/:slug" element={<CategoryProducts />} />
        <Route path="/produit/:slug" element={<ProductDetail />} />
        <Route path="/recherche" element={<SearchResults />} />

        {/* 👇 ROUTE DE DIAGNOSTIC (Accès direct sans Lazy Loading) */}
        <Route path="/admin-test" element={<Diagnostic />} />

        {/* --- Routes Authentification Admin --- */}
        <Route path="/admin/connexion" element={<AdminLogin />} />
        <Route path="/admin/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />

        {/* --- Espace Admin Protégé --- */}
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

        {/* --- Route 404 --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};