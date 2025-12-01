import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, ShoppingCart, Check, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/formatPrice';
import ProductSpecs from '@/components/product/ProductSpecs';
import CompatibleVehicles from '@/components/product/CompatibleVehicles';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  images: string[] | null;
  brand: string | null;
  reference: string | null;
  stock: number;
  is_promo: boolean | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          category:categories (
            id,
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .maybeSingle();
      
      if (data) {
        setProduct(data as Product);
        setSelectedImage(data.image_url);
      }
      setLoading(false);
    };
    
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="grid md:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-square bg-muted rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/4" />
              <div className="h-24 bg-muted rounded" />
              <div className="h-12 bg-muted rounded w-1/2" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="font-roboto-condensed text-2xl font-bold mb-4">Produit introuvable</h1>
          <Button asChild>
            <Link to="/categories">Voir les catégories</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const discount = product.original_price 
    ? Math.round((1 - product.price / product.original_price) * 100) 
    : 0;

  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean) as string[];

  return (
    <>
      <Helmet>
        <title>{product.name} | AutoPièces Pro</title>
        <meta name="description" content={product.description || `Achetez ${product.name} au meilleur prix. Livraison rapide.`} />
      </Helmet>
      
      <Layout>
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
            <Link to="/" className="hover:text-foreground">Accueil</Link>
            <ChevronRight className="h-4 w-4" />
            {product.category && (
              <>
                <Link to={`/categorie/${product.category.slug}`} className="hover:text-foreground">
                  {product.category.name}
                </Link>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
            <span className="text-foreground line-clamp-1">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-xl overflow-hidden">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ShoppingCart className="h-24 w-24" />
                  </div>
                )}
              </div>
              
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 ${
                        selectedImage === img ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="space-y-6">
              {product.brand && (
                <span className="text-sm text-muted-foreground uppercase tracking-wider">
                  {product.brand}
                </span>
              )}
              
              <h1 className="font-roboto-condensed text-3xl font-bold">{product.name}</h1>
              
              {product.reference && (
                <p className="text-muted-foreground">Référence: {product.reference}</p>
              )}

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                    <span className="badge-promo text-sm">-{discount}%</span>
                  </>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <Check className="h-5 w-5 text-success" />
                    <span className="text-success font-medium">En stock ({product.stock} disponibles)</span>
                  </>
                ) : (
                  <span className="text-destructive font-medium">Rupture de stock</span>
                )}
              </div>

              {/* Quantity & Add to cart */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button onClick={handleAddToCart} className="btn-primary flex-1 py-6 text-lg">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Ajouter au panier
                  </Button>
                </div>
              )}

              {/* Features */}
              <Card className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm">Livraison gratuite dès 50 000 CFA</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm">Garantie qualité</span>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  <span className="text-sm">Retour sous 14 jours</span>
                </div>
              </Card>

              {/* Specifications */}
              <ProductSpecs productId={product.id} categoryId={product.category?.id || null} />

              {/* Compatible Vehicles */}
              <CompatibleVehicles productId={product.id} />

              {/* Description */}
              {product.description && (
                <div>
                  <h2 className="font-roboto-condensed text-xl font-bold mb-3">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ProductDetail;
