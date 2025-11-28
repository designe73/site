import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/product/ProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  brand: string | null;
  reference: string | null;
  stock: number;
  is_promo: boolean | null;
}

interface FeaturedProductsProps {
  title: string;
  type: 'featured' | 'promo';
}

const FeaturedProducts = ({ title, type }: FeaturedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      let query = supabase
        .from('products')
        .select('*')
        .limit(8);

      if (type === 'featured') {
        query = query.eq('is_featured', true);
      } else {
        query = query.eq('is_promo', true);
      }

      const { data } = await query;
      if (data) {
        setProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [type]);

  if (loading) {
    return (
      <section className="py-12">
        <h2 className="font-roboto-condensed text-2xl md:text-3xl font-bold mb-8">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-product animate-pulse">
              <div className="aspect-square bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-8 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-roboto-condensed text-2xl md:text-3xl font-bold">
          {title}
        </h2>
        <Link 
          to={type === 'promo' ? '/promotions' : '/produits'} 
          className="text-primary hover:text-orange-dark font-medium transition-colors"
        >
          Voir tout →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            originalPrice={product.original_price}
            imageUrl={product.image_url}
            brand={product.brand}
            reference={product.reference}
            stock={product.stock}
            isPromo={product.is_promo ?? false}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
