// --- CODE DE PROTECTION ANTI-CACHE (ChunkLoadError) ---

function setupChunkErrorReload() {
  window.addEventListener('error', (event) => {
    // Liste des messages d'erreur courants liés au chargement de chunk
    const errorMessages = [
      'Failed to fetch dynamically imported module',
      'Loading chunk failed',
      'hydration failed' // Rare, mais peut être lié
    ];
    
    // Vérifie si le message d'erreur ou le type d'erreur est lié à un problème réseau/chunk
    const isChunkError = errorMessages.some(msg => 
        event.message?.includes(msg) || (event.error && event.error.code === 'CHUNK_LOAD_FAILED')
    );
    
    // Le test networkError doit être fait sur la target, mais on se contente du message.

    if (isChunkError) {
      // Pour éviter une boucle infinie de rechargement si l'erreur n'est pas due au cache
      if (!sessionStorage.getItem('reloadAttempted')) {
        sessionStorage.setItem('reloadAttempted', 'true');
        console.warn("CACHE VIEUX DÉTECTÉ: Rechargement forcé de la page pour obtenir le nouveau code.");
        window.location.reload();
      }
    }
  });

  // Nettoyer le flag après un chargement réussi pour permettre le prochain chargement normal
  window.addEventListener('load', () => {
    sessionStorage.removeItem('reloadAttempted');
  });
}

// Appelez la fonction après le montage de la racine
setupChunkErrorReload();