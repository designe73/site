// src/pages/admin/Diagnostic.tsx
import React from 'react';

const Diagnostic = () => {
  console.log(">>> LE COMPOSANT DIAGNOSTIC EST MONTÉ !");
  
  return (
    <div style={{ padding: '50px', backgroundColor: 'yellow', color: 'black', height: '100vh', zIndex: 9999, position: 'relative' }}>
      <h1>DIAGNOSTIC ADMIN</h1>
      <p>Si vous voyez ceci :</p>
      <ul>
        <li>1. Le Router fonctionne.</li>
        <li>2. Le problème vient de AdminLayout.tsx (probablement useAuth ou un import).</li>
      </ul>
      <p>Ouvrez la console (F12) et regardez si le message s'affiche.</p>
    </div>
  );
};

export default Diagnostic;