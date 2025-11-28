import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Package, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/formatPrice';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [productsRes, ordersRes, profilesRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.data?.length || 0,
        totalUsers: profilesRes.count || 0,
        totalRevenue,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { icon: Package, label: 'Produits', value: stats.totalProducts, color: 'text-blue-500' },
    { icon: ShoppingBag, label: 'Commandes', value: stats.totalOrders, color: 'text-green-500' },
    { icon: Users, label: 'Utilisateurs', value: stats.totalUsers, color: 'text-purple-500' },
    { icon: TrendingUp, label: 'Revenus', value: formatPrice(stats.totalRevenue), color: 'text-primary' },
  ];

  return (
    <>
      <Helmet>
        <title>Tableau de bord | Admin AutoPièces</title>
      </Helmet>

      <div className="p-8">
        <h1 className="font-roboto-condensed text-3xl font-bold mb-8">Tableau de bord</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <Card>
          <CardHeader>
            <CardTitle>Bienvenue dans votre espace d'administration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Gérez vos produits, catégories, commandes et paramètres du site depuis cet espace.
              Utilisez le menu de gauche pour naviguer entre les différentes sections.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
