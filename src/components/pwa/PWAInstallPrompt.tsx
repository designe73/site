import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedDate = dismissed ? new Date(dismissed) : null;
    const now = new Date();
    
    // Show again after 7 days
    if (dismissedDate && (now.getTime() - dismissedDate.getTime()) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 3 seconds
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, show instructions after delay
    if (iOS) {
      const hasSeenIOSPrompt = localStorage.getItem('pwa-ios-prompted');
      if (!hasSeenIOSPrompt) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    if (isIOS) {
      localStorage.setItem('pwa-ios-prompted', 'true');
    }
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4">
      <Card className="p-4 shadow-lg border-primary/20 bg-background">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">Installer SenPièces</h4>
            {isIOS ? (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  Appuyez sur le bouton Partager puis "Sur l'écran d'accueil" pour installer l'application.
                </p>
                <Button size="sm" variant="outline" onClick={handleDismiss}>
                  Compris
                </Button>
              </>
            ) : deferredPrompt ? (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  Accédez rapidement à votre boutique depuis votre écran d'accueil.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleInstall} className="gap-1">
                    <Download className="h-3 w-3" />
                    Installer
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDismiss}>
                    Plus tard
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  Ouvrez le menu du navigateur et sélectionnez "Installer l'application".
                </p>
                <Button size="sm" variant="outline" onClick={handleDismiss}>
                  Compris
                </Button>
              </>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 -mt-1 -mr-1"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
