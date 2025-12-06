// Astuce pour recharger la page automatiquement si une nouvelle version est déployée
// et que le navigateur a une vieille version en cache.

const originalImport = window.console.error;

window.console.error = (...args) => {
  // Détecte l'erreur spécifique de chargement de fichier (ChunkLoadError)
  if (/Loading chunk \d+ failed/.test(args[0]) || /Unexpected token/.test(args[0])) {
    // Vérifie si on a déjà rechargé pour éviter une boucle infinie
    if (!window.sessionStorage.getItem('reload-chunk-error')) {
      window.sessionStorage.setItem('reload-chunk-error', 'true');
      window.location.reload(); // Force le rechargement de la page pour prendre la nouvelle version
      return;
    }
  }
  originalImport(...args);
};

// Nettoyage du flag après un chargement réussi
window.addEventListener('load', () => {
  window.sessionStorage.removeItem('reload-chunk-error');
});