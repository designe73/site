import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Tag, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/formatPrice';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  brand: string | null;
  reference: string | null;
  category_name?: string;
}

interface CategoryResult {
  id: string;
  name: string;
  slug: string;
}

interface GlobalSearchProps {
  className?: string;
  inputClassName?: string;
  isMobile?: boolean;
}

const GlobalSearch = ({ className = '', inputClassName = '', isMobile = false }: GlobalSearchProps) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<SearchResult[]>([]);
  const [categories, setCategories] = useState<CategoryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setProducts([]);
        setCategories([]);
        return;
      }

      setLoading(true);

      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from('products')
          .select(`
            id, name, slug, price, image_url, brand, reference,
            category:categories(name)
          `)
          .or(`name.ilike.%${query}%,reference.ilike.%${query}%,brand.ilike.%${query}%`)
          .limit(6),
        supabase
          .from('categories')
          .select('id, name, slug')
          .ilike('name', `%${query}%`)
          .limit(3),
      ]);

      const formattedProducts = (productsRes.data || []).map((p: any) => ({
        ...p,
        category_name: p.category?.name,
      }));

      setProducts(formattedProducts);
      setCategories(categoriesRes.data || []);
      setLoading(false);
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(query)}`);
      setShowResults(false);
      setQuery('');
    }
  };

  const handleProductClick = (slug: string) => {
    navigate(`/produit/${slug}`);
    setShowResults(false);
    setQuery('');
  };

  const handleCategoryClick = (slug: string) => {
    navigate(`/categorie/${slug}`);
    setShowResults(false);
    setQuery('');
  };

  const hasResults = products.length > 0 || categories.length > 0;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative w-full">
          <Input
            type="search"
            placeholder="Rechercher une pièce, une référence..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className={`w-full pl-4 pr-12 ${isMobile ? 'py-3' : 'py-6'} input-search rounded-lg ${inputClassName}`}
          />
          <Button 
            type="submit" 
            size="icon" 
            className={`absolute right-1 top-1/2 -translate-y-1/2 btn-primary rounded-md ${isMobile ? 'h-8 w-8' : ''}`}
          >
            <Search className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
          </Button>
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {showResults && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : hasResults ? (
            <div className="divide-y divide-border">
              {/* Categories */}
              {categories.length > 0 && (
                <div className="p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Catégories
                  </h3>
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.slug)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {products.length > 0 && (
                <div className="p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Produits
                  </h3>
                  <div className="space-y-2">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.slug)}
                        className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <div className="w-12 h-12 bg-muted rounded overflow-hidden shrink-0">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {product.brand && <span>{product.brand}</span>}
                            {product.reference && <span>• {product.reference}</span>}
                          </div>
                        </div>
                        <span className="text-primary font-bold text-sm shrink-0">
                          {formatPrice(product.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* View all results */}
              <div className="p-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSubmit}
                >
                  Voir tous les résultats pour "{query}"
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              Aucun résultat pour "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
