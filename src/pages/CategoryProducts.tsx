import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

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
}

const CategoryProducts = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch category
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (catData) {
        setCategory(catData);
        
        // Fetch products
        let query = supabase
          .from('products')
          .select('*')
          .eq('category_id', catData.id);
        
        if (sortBy === 'price_asc') {
          query = query.order('price', { ascending: true });
        } else if (sortBy === 'price_desc') {
          query = query.order('price', { ascending: false });
        } else {
          query = query.order('name');
        }
        
        const { data: prodData } = await query;
        setProducts(prodData || []);
      }
      
      setLoading(false);
    };
    
    if (slug) {
      fetchData();
    }
  }, [slug, sortBy]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card-product">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="font-roboto-condensed text-2xl font-bold mb-4">Catégorie introuvable</h1>
          <Button asChild>
            <Link to="/categories">Voir toutes les catégories</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category.name} | AutoPièces Pro</title>
        <meta name="description" content={`Découvrez notre sélection de pièces ${category.name.toLowerCase()} pour votre véhicule. Prix compétitifs et livraison rapide.`} />
      </Helmet>
      
      <Layout>
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Accueil</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/categories" className="hover:text-foreground">Catégories</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{category.name}</span>
          </nav>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-roboto-condensed text-3xl font-bold">{category.name}</h1>
              <p className="text-muted-foreground">{products.length} produit(s)</p>
            </div>

            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom A-Z</SelectItem>
                  <SelectItem value="price_asc">Prix croissant</SelectItem>
                  <SelectItem value="price_desc">Prix décroissant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products grid */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Aucun produit dans cette catégorie</p>
              <Button asChild>
                <Link to="/categories">Voir d'autres catégories</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          )}
        </div>
      </Layout>
    </>
  );
};

export default CategoryProducts;
