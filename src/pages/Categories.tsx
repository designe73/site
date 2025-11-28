import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Disc, Filter, Cog, Car, Lightbulb, Zap, Thermometer, Wrench, ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image_url: string | null;
}

const iconMap: Record<string, React.ReactNode> = {
  disc: <Disc className="h-12 w-12" />,
  filter: <Filter className="h-12 w-12" />,
  engine: <Cog className="h-12 w-12" />,
  car: <Car className="h-12 w-12" />,
  lightbulb: <Lightbulb className="h-12 w-12" />,
  zap: <Zap className="h-12 w-12" />,
  thermometer: <Thermometer className="h-12 w-12" />,
  default: <Wrench className="h-12 w-12" />,
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .order('name');
      
      if (data) {
        setCategories(data);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  return (
    <>
      <Helmet>
        <title>Toutes les catégories | AutoPièces Pro</title>
        <meta name="description" content="Parcourez toutes nos catégories de pièces automobiles : freinage, filtration, moteur, suspension et plus." />
      </Helmet>
      
      <Layout>
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Accueil</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Catégories</span>
          </nav>

          <h1 className="font-roboto-condensed text-3xl font-bold mb-8">Toutes les catégories</h1>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl p-6 animate-pulse">
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
                  <div className="h-6 bg-muted rounded w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categorie/${category.slug}`}
                  className="bg-card rounded-xl p-6 border-2 border-transparent hover:border-primary hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="text-primary group-hover:scale-110 transition-transform duration-300 flex justify-center mb-4">
                    {iconMap[category.icon || 'default']}
                  </div>
                  <h2 className="font-roboto-condensed text-xl font-bold text-center group-hover:text-primary transition-colors">
                    {category.name}
                  </h2>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default Categories;
