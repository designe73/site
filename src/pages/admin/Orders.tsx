import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Eye, Search, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/formatPrice';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url: string | null;
  } | null;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  user_id: string;
  profile?: {
    full_name: string | null;
  } | null;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente', icon: Clock, color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Confirmée', icon: CheckCircle, color: 'bg-blue-500' },
  { value: 'processing', label: 'En préparation', icon: Package, color: 'bg-purple-500' },
  { value: 'shipped', label: 'Expédiée', icon: Truck, color: 'bg-indigo-500' },
  { value: 'delivered', label: 'Livrée', icon: CheckCircle, color: 'bg-green-500' },
  { value: 'cancelled', label: 'Annulée', icon: XCircle, color: 'bg-red-500' },
];

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchOrders = async () => {
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersData) {
      // Fetch profiles separately
      const userIds = [...new Set(ordersData.map(o => o.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      
      const ordersWithProfiles = ordersData.map(order => ({
        ...order,
        profile: profilesMap.get(order.user_id) || null,
      }));
      
      setOrders(ordersWithProfiles);
    }
    setLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(name, image_url)
      `)
      .eq('order_id', orderId);
    setOrderItems(data || []);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
    setDetailsOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success('Statut mis à jour');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    if (!statusOption) return <Badge variant="secondary">{status}</Badge>;
    
    const Icon = statusOption.icon;
    return (
      <Badge className={`${statusOption.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {statusOption.label}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.phone?.toLowerCase().includes(search.toLowerCase()) ||
      order.profile?.full_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Helmet>
        <title>Commandes | Admin AutoPièces</title>
      </Helmet>

      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-roboto-condensed text-3xl font-bold">Commandes</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {STATUS_OPTIONS.slice(0, 4).map((status) => {
            const count = orders.filter(o => o.status === status.value).length;
            const Icon = status.icon;
            return (
              <Card key={status.value} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${status.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">{status.label}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher par ID, téléphone, nom..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Orders table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Commande</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucune commande trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      #{order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.profile?.full_name || 'Client'}</p>
                        {order.phone && (
                          <p className="text-sm text-muted-foreground">{order.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">{formatPrice(order.total)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Order details dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Commande #{selectedOrder?.id.slice(0, 8)}
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* Status change */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Statut :</span>
                  <Select 
                    value={selectedOrder.status} 
                    onValueChange={(v) => handleStatusChange(selectedOrder.id, v)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Order info */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Informations client</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Nom:</span> {selectedOrder.profile?.full_name || '-'}</p>
                      <p><span className="text-muted-foreground">Téléphone:</span> {selectedOrder.phone || '-'}</p>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Livraison</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Adresse:</span> {selectedOrder.shipping_address || '-'}</p>
                      <p><span className="text-muted-foreground">Ville:</span> {selectedOrder.shipping_city || '-'}</p>
                    </div>
                  </Card>
                </div>

                {/* Order items */}
                <div>
                  <h4 className="font-semibold mb-3">Articles commandés</h4>
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="w-12 h-12 bg-background rounded overflow-hidden">
                          {item.product?.image_url && (
                            <img 
                              src={item.product.image_url} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product?.name || 'Produit supprimé'}</p>
                          <p className="text-sm text-muted-foreground">
                            Qté: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="font-bold">{formatPrice(item.quantity * item.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(selectedOrder.total)}
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Orders;
