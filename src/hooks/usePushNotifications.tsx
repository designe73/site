import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') return;

    try {
      new Notification(title, {
        icon: '/pwa-icon-192.png',
        badge: '/pwa-icon-192.png',
        ...options,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [isSupported, permission]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user || permission !== 'granted') return;

    // Channel for general notifications
    const notificationsChannel = supabase
      .channel('push-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as { title: string; message: string; link?: string };
          showNotification(notification.title, {
            body: notification.message,
            tag: 'senpieces-notification',
            data: { link: notification.link },
          });
        }
      )
      .subscribe();

    // Channel for order status updates
    const ordersChannel = supabase
      .channel('customer-order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const order = payload.new as { id: string; status: string };
          const oldOrder = payload.old as { status: string };
          
          if (order.status !== oldOrder.status) {
            const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;
            showNotification('📦 Mise à jour de votre commande', {
              body: `Votre commande #${order.id.slice(0, 8)} est maintenant "${statusLabel}"`,
              tag: 'order-status-update',
              data: { link: '/mon-compte' },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, [user, permission, showNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
  };
};

export default usePushNotifications;
