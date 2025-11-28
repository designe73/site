import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Disc, Filter, Cog, Car, Lightbulb, Zap, Thermometer, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

const iconMap: Record<string, React.ReactNode> = {
  disc: <Disc className="h-8 w-8" />,
  filter: <Filter className="h-8 w-8" />,
  engine: <Cog className="h-8 w-8" />,
  car: <Car className="h-8 w-8" />,
  lightbulb: <Lightbulb className="h-8 w-8" />,
  zap: <Zap className="h-8 w-8" />,
  thermometer: <Thermometer className="h-8 w-8" />,
  default: <Wrench className="h-8 w-8" />,
};

const CategoryGrid = () => {
  const [categories, setCategories] = useState<Category[]>([]);

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
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-roboto-condensed text-2xl md:text-3xl font-bold">
          Nos catégories
        </h2>
        <Link 
          to="/categories" 
          className="text-primary hover:text-orange-dark font-medium transition-colors"
        >
          Voir tout →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/categorie/${category.slug}`}
            className="category-card flex flex-col items-center text-center group"
          >
            <div className="bg-primary/10 text-primary p-4 rounded-full mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              {iconMap[category.icon || 'default']}
            </div>
            <span className="font-medium text-sm">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
