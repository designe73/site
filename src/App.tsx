import React from "react";

// On n'importe RIEN d'autre pour l'instant (pas de Router, pas de Providers)

const App = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: 'green', 
      color: 'white', 
      fontSize: '30px', 
      textAlign: 'center' 
    }}>
      <h1>✅ LE COEUR DE REACT FONCTIONNE !</h1>
      <p style={{fontSize: '16px'}}>Si tu vois ça, le problème venait de "AppProviders".</p>
    </div>
  );
};

export default App;