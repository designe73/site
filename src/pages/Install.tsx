import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, Smartphone, Share, Plus, CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const { settings } = useSiteSettings();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      <Helmet>
        <title>Installer l'application | {settings?.site_name || 'SenPièces'}</title>
        <meta name="description" content="Installez l'application SenPièces sur votre téléphone pour un accès rapide et une meilleure expérience." />
      </Helmet>

      <Layout>
        <div className="container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Smartphone className="h-10 w-10 text-primary" />
            </div>

            <h1 className="text-3xl font-bold mb-4">
              Installez {settings?.site_name || 'SenPièces'}
            </h1>
            <p className="text-muted-foreground mb-8">
              Accédez rapidement à votre boutique de pièces auto préférée directement depuis votre écran d'accueil.
            </p>

            {isInstalled ? (
              <Card className="bg-green-500/10 border-green-500/20">
                <CardContent className="p-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Application installée !</h2>
                  <p className="text-muted-foreground">
                    Vous pouvez maintenant accéder à SenPièces depuis votre écran d'accueil.
                  </p>
                </CardContent>
              </Card>
            ) : isIOS ? (
              <Card>
                <CardContent className="p-6 text-left">
                  <h2 className="text-xl font-semibold mb-4">Comment installer sur iPhone/iPad</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Appuyez sur le bouton Partager</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Share className="h-4 w-4" /> en bas de Safari
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Sélectionnez "Sur l'écran d'accueil"</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Plus className="h-4 w-4" /> dans le menu
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Appuyez sur "Ajouter"</p>
                        <p className="text-sm text-muted-foreground">
                          L'application sera ajoutée à votre écran d'accueil
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : deferredPrompt ? (
              <Button size="lg" onClick={handleInstall} className="gap-2">
                <Download className="h-5 w-5" />
                Installer l'application
              </Button>
            ) : (
              <Card>
                <CardContent className="p-6 text-left">
                  <h2 className="text-xl font-semibold mb-4">Comment installer sur Android</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Ouvrez le menu du navigateur</p>
                        <p className="text-sm text-muted-foreground">
                          Les 3 points en haut à droite de Chrome
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Sélectionnez "Installer l'application"</p>
                        <p className="text-sm text-muted-foreground">
                          ou "Ajouter à l'écran d'accueil"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Confirmez l'installation</p>
                        <p className="text-sm text-muted-foreground">
                          L'application sera disponible sur votre écran d'accueil
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-semibold">Accès rapide</h3>
                  <p className="text-sm text-muted-foreground">
                    Lancez l'app en un clic depuis votre écran d'accueil
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">🔔</div>
                  <h3 className="font-semibold">Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Recevez les alertes promos et suivi de commande
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">📴</div>
                  <h3 className="font-semibold">Mode hors-ligne</h3>
                  <p className="text-sm text-muted-foreground">
                    Consultez le catalogue même sans connexion
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Install;
