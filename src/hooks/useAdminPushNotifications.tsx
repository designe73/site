import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { usePushNotifications } from './usePushNotifications';

export const useAdminPushNotifications = () => {
  const { user, isAdmin, isModerator } = useAuth();
  const { showNotification, permission, isSupported } = usePushNotifications();

  const canReceiveNotifications = isSupported && permission === 'granted' && (isAdmin || isModerator);

  // Subscribe to new orders for admin/moderator notifications
  useEffect(() => {
    if (!user || !canReceiveNotifications) return;

    const ordersChannel = supabase
      .channel('admin-orders-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          const order = payload.new as { id: string; total: number; user_id: string };
          
          // Fetch user info for the order
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', order.user_id)
            .single();
          
          const customerName = profile?.full_name || profile?.phone || 'Client';
          
          showNotification('🛒 Nouvelle commande!', {
            body: `${customerName} vient de passer une commande de ${order.total.toLocaleString()} CFA`,
            tag: 'admin-new-order',
            data: { link: '/admin/commandes' },
          });
        }
      )
      .subscribe();

    // Subscribe to order status changes
    const statusChannel = supabase
      .channel('admin-order-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const order = payload.new as { id: string; status: string };
          const oldOrder = payload.old as { status: string };
          
          if (order.status !== oldOrder.status) {
            showNotification('📦 Statut de commande mis à jour', {
              body: `Commande #${order.id.slice(0, 8)} → ${order.status}`,
              tag: 'admin-order-status',
              data: { link: '/admin/commandes' },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(statusChannel);
    };
  }, [user, canReceiveNotifications, showNotification]);

  return { canReceiveNotifications };
};

export default useAdminPushNotifications;
