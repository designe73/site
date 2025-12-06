import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Package, ShoppingBag, Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/formatPrice';
import { Link } from 'react-router-dom';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  pendingOrders: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  brand: string | null;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    pendingOrders: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [
        productsRes,
        ordersRes,
        profilesRes,
        lowStockRes,
        outOfStockRes,
        pendingOrdersRes
      ] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).gt('stock', 0).lte('stock', 10),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('stock', 0),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

      // Fetch low stock products details
      const { data: lowStockData } = await supabase
        .from('products')
        .select('id, name, stock, brand')
        .gt('stock', 0)
        .lte('stock', 10)
        .order('stock', { ascending: true })
        .limit(5);

      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.data?.length || 0,
        totalUsers: profilesRes.count || 0,
        totalRevenue,
        lowStockProducts: lowStockRes.count || 0,
        outOfStockProducts: outOfStockRes.count || 0,
        pendingOrders: pendingOrdersRes.count || 0,
      });
      setLowStockProducts(lowStockData || []);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { icon: Package, label: 'Produits', value: stats.totalProducts, color: 'text-blue-500' },
    { icon: ShoppingBag, label: 'Commandes', value: stats.totalOrders, color: 'text-green-500' },
    { icon: Users, label: 'Utilisateurs', value: stats.totalUsers, color: 'text-purple-500' },
    { icon: TrendingUp, label: 'Revenus totaux', value: formatPrice(stats.totalRevenue), color: 'text-primary' },
  ];

  const alertCards = [
    { icon: AlertTriangle, label: 'Stock faible', value: stats.lowStockProducts, color: 'text-warning', bgColor: 'bg-warning/10' },
    { icon: AlertTriangle, label: 'Rupture de stock', value: stats.outOfStockProducts, color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { icon: CheckCircle, label: 'Commandes en attente', value: stats.pendingOrders, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  ];

  return (
    <>
      <Helmet>
        <title>Tableau de bord | Admin AutoPièces</title>
      </Helmet>

      <div className="p-8">
        <h1 className="font-roboto-condensed text-3xl font-bold mb-8">Tableau de bord</h1>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {alertCards.map((stat, index) => (
            <Card key={index} className={stat.bgColor}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Low Stock Products */}
        {lowStockProducts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Produits à faible stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Marque</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.brand || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={product.stock <= 5 ? 'destructive' : 'secondary'}>
                          {product.stock} unités
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link 
                          to="/admin/produits"
                          className="text-primary hover:underline text-sm"
                        >
                          Gérer
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Bienvenue dans votre espace d'administration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Gérez vos produits, catégories, véhicules, commandes et paramètres du site depuis cet espace.
              Utilisez le menu de gauche pour naviguer entre les différentes sections.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
