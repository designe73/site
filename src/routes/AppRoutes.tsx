import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// 👇 IMPORT DIRECT (Pas de lazy pour le debug)
import Debug from "@/pages/admin/Debug"; 

// ... vos autres imports lazy (AdminLayout, Dashboard, etc.) ...
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
// ...

const PageLoader = () => <div>Chargement...</div>;

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        
        {/* 👇 ROUTE DE DIAGNOSTIC PRIORITAIRE */}
        <Route path="/test" element={<Debug />} />

        {/* ... vos routes publiques ... */}
        <Route path="/" element={<Index />} />
        {/* ... */}

        {/* Route Admin */}
        <Route path="/admin" element={<AdminLayout />}>
           {/* ... */}
        </Route>

      </Routes>
    </Suspense>
  );
};