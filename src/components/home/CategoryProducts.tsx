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

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface CategoryWithProducts extends Category {
  products: Product[];
}

const CategoryProducts = () => {
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesWithProducts = async () => {
      // Fetch all categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug, icon')
        .order('name');

      if (!categories) {
        setLoading(false);
        return;
      }

      // For each category, fetch 4 products
      const categoriesData: CategoryWithProducts[] = [];
      
      for (const category of categories) {
        const { data: products } = await supabase
          .from('products')
          .select('id, name, slug, price, original_price, image_url, brand, reference, stock, is_promo')
          .eq('category_id', category.id)
          .limit(4);

        if (products && products.length > 0) {
          categoriesData.push({
            ...category,
            products
          });
        }
      }

      setCategoriesWithProducts(categoriesData);
      setLoading(false);
    };

    fetchCategoriesWithProducts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-12">
        {[...Array(3)].map((_, i) => (
          <section key={i} className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="card-product">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  if (categoriesWithProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12">
      {categoriesWithProducts.map((category) => (
        <section key={category.id}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-roboto-condensed text-2xl md:text-3xl font-bold">
              {category.name}
            </h2>
            <Link 
              to={`/categorie/${category.slug}`}
              className="text-primary hover:text-orange-dark font-medium transition-colors"
            >
              Voir tout →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {category.products.map((product) => (
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
      ))}
    </div>
  );
};

export default CategoryProducts;
