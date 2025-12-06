import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
// ... vos autres imports

// 👇 AJOUTEZ CET IMPORT DIRECT (Pas de lazy !)
import Diagnostic from "@/pages/admin/Diagnostic";

// ... vos lazy imports existants

export const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <Routes>
        {/* ... vos routes existantes ... */}

        {/* 👇 AJOUTEZ CETTE ROUTE DE TEST PRIORITAIRE */}
        <Route path="/admin-test" element={<Diagnostic />} />

        {/* Votre route Admin actuelle */}
        <Route path="/admin" element={<AdminLayout />}>
           {/* ... */}
        </Route>

        {/* ... */}
      </Routes>
    </Suspense>
  );
};