import React, { useEffect } from 'react';

const Debug = () => {
  useEffect(() => {
    console.log("✅ LE COMPOSANT DEBUG EST MONTÉ !");
    console.log("📍 URL Actuelle:", window.location.href);
    console.log("🔑 Hash Actuel:", window.location.hash);
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#ff0000', 
      color: 'white', 
      zIndex: 99999,
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      <h1>DIAGNOSTIC ADMIN</h1>
      <p>Si vous voyez cet écran rouge, le Routeur fonctionne.</p>
      <div style={{ backgroundColor: 'black', padding: '20px', marginTop: '20px', fontSize: '16px', fontFamily: 'monospace' }}>
        <p>Test terminé avec succès.</p>
      </div>
      <button 
        onClick={() => window.location.href = '/#/admin'} 
        style={{ marginTop: '20px', padding: '10px 20px', fontSize: '18px', cursor: 'pointer' }}
      >
        Tenter d'aller sur /admin
      </button>
    </div>
  );
};

export default Debug;