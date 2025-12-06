import React from 'react';

const Dashboard = () => {
  console.log("Dashboard - Rendu Minimal");
  return (
    <div style={{ padding: '20px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px' }}>
      <h1 style={{ color: '#059669', fontSize: '24px', fontWeight: 'bold' }}>
        Tableau de Bord (Mode Sécurisé)
      </h1>
      <p style={{ marginTop: '10px' }}>
        L'affichage est maintenant stable. Le problème est dans la récupération des statistiques (hooks ou requêtes).
      </p>
    </div>
  );
};

export default Dashboard;