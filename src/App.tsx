import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

// Version ultra-simplifiée pour débogage
const App = () => (
  <div style={{ padding: "20px", border: "5px solid green" }}>
    <h1>MODE DÉBOGAGE</h1>
    <p>Si tu vois ceci, React fonctionne, Vite fonctionne, et main.tsx fonctionne.</p>
    <p>Le problème vient de tes Providers (Auth, Cart, ou Settings).</p>

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
      </Routes>
    </BrowserRouter>
  </div>
);

export default App;
