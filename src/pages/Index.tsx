import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import VehicleSelector from '@/components/home/VehicleSelector';
import BannerCarousel from '@/components/home/BannerCarousel';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoBanner from '@/components/home/PromoBanner';
import CategoryProducts from '@/components/home/CategoryProducts';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Index = () => {
  const { settings } = useSiteSettings();
  
  const seoTitle = settings?.seo_title || `${settings?.site_name || 'AutoPièces Pro'} - Pièces Auto de Qualité | Dakar, Sénégal`;
  const seoDescription = settings?.seo_description || 'Achetez vos pièces automobiles en ligne. Large choix de pièces auto de qualité, livraison rapide partout au Sénégal. Freinage, filtration, moteur et plus.';
  const seoKeywords = settings?.seo_keywords || 'pièces auto, automobile, Dakar, Sénégal, freinage, filtration';

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
      </Helmet>
      
      <Layout>
        <div className="container py-6 space-y-6">
          {/* Vehicle Selector */}
          <VehicleSelector />
          
          {/* Banner Carousel */}
          <BannerCarousel />
          
          {/* Categories */}
          <CategoryGrid />
          
          {/* Features Banner */}
          <PromoBanner />
          
          {/* Products by Category */}
          <CategoryProducts />
          
          {/* Featured Products */}
          <FeaturedProducts title="Produits populaires" type="featured" />
          
          {/* Promo Products */}
          <FeaturedProducts title="🔥 Promotions" type="promo" />
        </div>
      </Layout>
    </>
  );
};

export default Index;
