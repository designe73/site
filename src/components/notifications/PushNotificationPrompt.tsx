import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/hooks/useAuth';

export const PushNotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { isSupported, permission, requestPermission } = usePushNotifications();
  const { user } = useAuth();

  useEffect(() => {
    // Show prompt after 5 seconds if user is logged in, notifications are supported, and not yet asked
    if (user && isSupported && permission === 'default') {
      const dismissed = localStorage.getItem('push-notification-dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, isSupported, permission]);

  const handleEnable = async () => {
    await requestPermission();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('push-notification-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4">
      <Card className="p-4 shadow-lg border-primary/20">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">Activer les notifications</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Recevez des alertes pour vos commandes et les promotions exclusives.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEnable}>
                Activer
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Plus tard
              </Button>
            </div>
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

export default PushNotificationPrompt;
