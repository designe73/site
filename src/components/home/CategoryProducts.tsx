import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/product/ProductCard';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

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

interface CategoryBanner {
  id: string;
  image_url: string;
  link: string | null;
  title: string | null;
}

interface CategoryWithProducts extends Category {
  products: Product[];
  banner?: CategoryBanner | null;
}

const CategoryProducts = () => {
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesWithProducts = async () => {
      const [categoriesRes, bannersRes] = await Promise.all([
        supabase.from('categories').select('id, name, slug, icon').order('name'),
        supabase.from('category_banners').select('id, category_id, image_url, link, title').eq('is_active', true),
      ]);

      const categories = categoriesRes.data;
      const banners = bannersRes.data || [];

      if (!categories) {
        setLoading(false);
        return;
      }

      const categoriesData: CategoryWithProducts[] = [];
      
      for (const category of categories) {
        const { data: products } = await supabase
          .from('products')
          .select('id, name, slug, price, original_price, image_url, brand, reference, stock, is_promo')
          .eq('category_id', category.id)
          .limit(8);

        if (products && products.length > 0) {
          const categoryBanner = banners.find(b => b.category_id === category.id);
          categoriesData.push({
            ...category,
            products,
            banner: categoryBanner || null,
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
            <div className="flex gap-4 overflow-hidden">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="min-w-[200px] md:min-w-[250px]">
                  <div className="aspect-square bg-muted rounded-lg" />
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

          <div className="flex gap-4">
            {/* Products carousel */}
            <div className={category.banner ? 'flex-1 min-w-0' : 'w-full'}>
              <Carousel
                opts={{
                  align: 'start',
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 4000,
                    stopOnInteraction: true,
                    stopOnMouseEnter: true,
                  }),
                ]}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {category.products.map((product) => (
                    <CarouselItem key={product.id} className={`pl-2 md:pl-4 ${category.banner ? 'basis-1/2 md:basis-1/3 lg:basis-1/3' : 'basis-1/2 md:basis-1/3 lg:basis-1/4'}`}>
                      <ProductCard
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
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-4 bg-background border-border hover:bg-accent" />
                <CarouselNext className="hidden md:flex -right-4 bg-background border-border hover:bg-accent" />
              </Carousel>
            </div>

            {/* Side banner */}
            {category.banner && (
              <div className="hidden lg:block w-48 xl:w-56 shrink-0">
                <Link 
                  to={category.banner.link || `/categorie/${category.slug}`}
                  className="block h-full"
                >
                  <div className="relative h-full rounded-lg overflow-hidden group">
                    <img
                      src={category.banner.image_url}
                      alt={category.banner.title || category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {category.banner.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="text-white font-semibold text-sm">{category.banner.title}</p>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
};

export default CategoryProducts;
