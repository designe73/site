import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, SlidersHorizontal, Search } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import FilterSidebar from '@/components/filters/FilterSidebar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { supabase } from '@/integrations/supabase/client';
import { useProductFilters } from '@/hooks/useProductFilters';

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

const ITEMS_PER_PAGE = 24;

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [specType, setSpecType] = useState<'tire' | 'battery' | 'mechanical' | 'oil' | 'accessory' | null>(null);

  const {
    filters,
    handleFilterChange,
    handleVehicleSelect,
    resetFilters,
  } = useProductFilters(null, sortBy);

  // Fetch products based on search query and filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('id, name, slug, price, original_price, image_url, brand, reference, stock, is_promo', { count: 'exact' });

      // Search query
      if (searchParams.get('q')) {
        query = query.or(`name.ilike.%${searchParams.get('q')}%,brand.ilike.%${searchParams.get('q')}%,reference.ilike.%${searchParams.get('q')}%`);
      }

      // Apply common filters
      if (filters.common.brands.length > 0) {
        query = query.in('brand', filters.common.brands);
      }
      
      if (filters.common.priceMin) {
        query = query.gte('price', parseFloat(filters.common.priceMin));
      }
      
      if (filters.common.priceMax) {
        query = query.lte('price', parseFloat(filters.common.priceMax));
      }
      
      if (filters.common.inStock) {
        query = query.gt('stock', 0);
      }
      
      if (filters.common.isPromo) {
        query = query.eq('is_promo', true);
      }

      // Sorting
      switch (sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        default:
          query = query.order('name', { ascending: true });
      }

      // Pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, count } = await query;
      
      setProducts(data || []);
      setTotalProducts(count || 0);
      setLoading(false);
    };

    fetchProducts();
  }, [searchParams, sortBy, filters, currentPage]);

  // Fetch available brands
  useEffect(() => {
    const fetchBrands = async () => {
      const { data } = await supabase
        .from('products')
        .select('brand')
        .not('brand', 'is', null);
      
      const uniqueBrands = [...new Set(data?.map(p => p.brand).filter(Boolean) as string[])];
      setAvailableBrands(uniqueBrands.sort());
    };
    
    fetchBrands();
  }, []);

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setSearchParams({ q: query, page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pages = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    // First page
    pages.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Ellipsis start
    if (showEllipsisStart) {
      pages.push(<PaginationEllipsis key="ellipsis-start" />);
    }

    // Middle pages
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Ellipsis end
    if (showEllipsisEnd) {
      pages.push(<PaginationEllipsis key="ellipsis-end" />);
    }

    // Last page
    if (totalPages > 1) {
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <>
      <Helmet>
        <title>Recherche {query ? `"${query}"` : ''} | AutoPièces Pro</title>
        <meta name="description" content={`Résultats de recherche pour ${query}. Trouvez les pièces automobiles dont vous avez besoin.`} />
      </Helmet>
      
      <Layout>
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Accueil</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Recherche</span>
          </nav>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-roboto-condensed text-3xl font-bold flex items-center gap-2">
                <Search className="h-8 w-8" />
                {query ? `Résultats pour "${query}"` : 'Recherche'}
              </h1>
              <p className="text-muted-foreground">{totalProducts} produit(s) trouvé(s)</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile filter trigger */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-96 p-0">
                  <FilterSidebar
                    specType={specType}
                    filters={filters}
                    availableBrands={availableBrands}
                    onFilterChange={handleFilterChange}
                    onVehicleSelect={handleVehicleSelect}
                    onReset={resetFilters}
                    onClose={() => setMobileFiltersOpen(false)}
                    isMobile
                  />
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
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

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block">
              <FilterSidebar
                specType={specType}
                filters={filters}
                availableBrands={availableBrands}
                onFilterChange={handleFilterChange}
                onVehicleSelect={handleVehicleSelect}
                onReset={resetFilters}
              />
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="card-product animate-pulse">
                      <div className="aspect-square bg-muted" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border border-border">
                  <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2 text-lg">Aucun produit trouvé</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Essayez avec d'autres mots-clés ou ajustez vos filtres
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          
                          {renderPagination()}
                          
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default SearchResults;
