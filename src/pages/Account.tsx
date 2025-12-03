import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Phone, Save, Loader2, LogOut, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import InvoiceGenerator from '@/components/invoice/InvoiceGenerator';
import OrderTimeline from '@/components/order/OrderTimeline';

interface Profile {
  full_name: string;
  phone: string;
  address: string;
  city: string;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    reference: string | null;
  } | null;
}

const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    phone: '',
    address: '',
    city: '',
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  useEffect(() => {
    if (!settings?.account_enabled) {
      navigate('/');
      return;
    }
    
    if (!user) {
      navigate('/connexion');
      return;
    }

    fetchProfile();
    fetchOrders();
  }, [user, settings, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
      });
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, total, status, phone, shipping_address, shipping_city')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
  };

  // Realtime subscription for order updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('account-order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedOrder = payload.new as Order;
          setOrders(prev => prev.map(order => 
            order.id === updatedOrder.id ? updatedOrder : order
          ));
          // Auto-expand updated order to show timeline
          if (!expandedOrders.includes(updatedOrder.id)) {
            setExpandedOrders(prev => [...prev, updatedOrder.id]);
          }
          toast.info(`Commande #${updatedOrder.id.slice(0, 8)} mise à jour`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, expandedOrders]);

  const fetchOrderItems = async (orderId: string) => {
    const { data } = await supabase
      .from('order_items')
      .select(`
        id, quantity, price,
        product:products(name, reference)
      `)
      .eq('order_id', orderId);

    setOrderItems(data || []);
  };

  const handleViewInvoice = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
    setInvoiceOpen(true);
  };

  const getInvoiceData = () => {
    if (!selectedOrder) return null;

    return {
      invoiceNumber: `FAC-${selectedOrder.id.slice(0, 8).toUpperCase()}`,
      orderDate: selectedOrder.created_at,
      customerName: profile.full_name || 'Client',
      customerPhone: selectedOrder.phone || profile.phone || '',
      customerAddress: selectedOrder.shipping_address || profile.address || '',
      customerCity: selectedOrder.shipping_city || profile.city || '',
      items: orderItems.map(item => ({
        name: item.product?.name || 'Produit',
        reference: item.product?.reference || null,
        quantity: item.quantity,
        price: item.price,
      })),
      total: selectedOrder.total,
      companyName: settings?.site_name || 'SenPièces',
      companyAddress: settings?.address || 'Dakar, Sénégal',
      companyPhone: settings?.contact_phone || '',
      companyEmail: settings?.contact_email || '',
      logoUrl: settings?.logo_url || null,
      footerText: 'Merci pour votre achat !',
    };
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user.id);

    if (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } else {
      toast.success('Profil mis à jour avec succès');
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Mon compte | {settings?.site_name || 'AutoPièces Pro'}</title>
      </Helmet>

      <Layout>
        <div className="container py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Mon compte</h1>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Commandes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>
                    Gérez vos informations de contact et de livraison
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nom complet</Label>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="full_name"
                            value={profile.full_name}
                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                            placeholder="Votre nom"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            placeholder="+221 77 123 45 67"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">Ville</Label>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="city"
                            value={profile.city}
                            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                            placeholder="Dakar"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse complète</Label>
                      <Input
                        id="address"
                        value={profile.address}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        placeholder="Rue, quartier, repères..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sauvegarde...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des commandes</CardTitle>
                  <CardDescription>
                    Consultez l'état de vos commandes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Vous n'avez pas encore de commandes</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const isExpanded = expandedOrders.includes(order.id);
                        return (
                          <Collapsible
                            key={order.id}
                            open={isExpanded}
                            onOpenChange={(open) => {
                              setExpandedOrders(open 
                                ? [...expandedOrders, order.id]
                                : expandedOrders.filter(id => id !== order.id)
                              );
                            }}
                          >
                            <div className="border rounded-lg overflow-hidden">
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    {isExpanded ? (
                                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    )}
                                    <div>
                                      <p className="font-medium">
                                        Commande #{order.id.slice(0, 8)}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                          day: 'numeric',
                                          month: 'long',
                                          year: 'numeric',
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <p className="font-semibold">
                                        {order.total.toLocaleString()} CFA
                                      </p>
                                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                      </span>
                                    </div>
                                    {(order.status === 'delivered' || order.status === 'shipped' || order.status === 'confirmed') && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewInvoice(order);
                                        }}
                                      >
                                        <FileText className="h-4 w-4 mr-1" />
                                        Facture
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="px-4 pb-4 border-t bg-muted/30">
                                  <OrderTimeline status={order.status} createdAt={order.created_at} />
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Invoice Dialog */}
          <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Facture</DialogTitle>
              </DialogHeader>
              {selectedOrder && getInvoiceData() && (
                <InvoiceGenerator data={getInvoiceData()!} />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </>
  );
};

export default Account;
