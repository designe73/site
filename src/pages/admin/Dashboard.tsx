import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-green-600">✅ Le Dashboard fonctionne !</h1>
      <p className="mt-4">
        Si vous voyez ceci, c'est que l'accès Admin est réparé.
        Le problème venait probablement des widgets de statistiques.
      </p>
    </div>
  );
};

export default Dashboard;