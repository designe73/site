import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import FilterSidebar from '@/components/filters/FilterSidebar';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
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
import { supabase } from '@/integrations/supabase/client';
import { useProductFilters } from '@/hooks/useProductFilters';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const CategoryProducts = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { settings } = useSiteSettings();

  // Fetch category
  useEffect(() => {
    const fetchCategory = async () => {
      setCategoryLoading(true);
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('slug', slug)
        .maybeSingle();
      
      setCategory(data);
      setCategoryLoading(false);
    };
    
    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  const {
    products,
    loading,
    availableBrands,
    specType,
    filters,
    handleFilterChange,
    handleVehicleSelect,
    resetFilters,
  } = useProductFilters(category?.id || null, sortBy);

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.vehicleId) count++;
    if (filters.common.brands.length > 0) count += filters.common.brands.length;
    if (filters.common.priceMin || filters.common.priceMax) count++;
    if (filters.common.inStock) count++;
    if (filters.common.isPromo) count++;
    return count;
  };

  if (categoryLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="hidden lg:block h-96 bg-muted rounded" />
              <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
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

  const breadcrumbItems = [
    { name: 'Accueil', url: 'https://senpieces.sn/' },
    { name: 'Catégories', url: 'https://senpieces.sn/categories' },
    { name: category.name, url: `https://senpieces.sn/categorie/${category.slug}` }
  ];

  return (
    <>
      <Helmet>
        <title>{category.name} | {settings?.site_name || 'Senpieces'}</title>
        <meta name="description" content={`Découvrez notre sélection de pièces ${category.name.toLowerCase()} pour votre véhicule. Prix compétitifs et livraison rapide.`} />
      </Helmet>
      <BreadcrumbSchema items={breadcrumbItems} />
      
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-roboto-condensed text-3xl font-bold">{category.name}</h1>
              <p className="text-muted-foreground">{products.length} produit(s)</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile filter trigger */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtres
                    {activeFiltersCount() > 0 && (
                      <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {activeFiltersCount()}
                      </span>
                    )}
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
                  <p className="text-muted-foreground mb-4">Aucun produit ne correspond à vos critères</p>
                  <Button variant="outline" onClick={resetFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default CategoryProducts;
