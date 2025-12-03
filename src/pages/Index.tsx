import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import VehicleSelector from '@/components/home/VehicleSelector';
import BannerCarousel from '@/components/home/BannerCarousel';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoBanner from '@/components/home/PromoBanner';
import CategoryProducts from '@/components/home/CategoryProducts';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>AutoPièces Pro - Pièces Auto de Qualité | Dakar, Sénégal</title>
        <meta name="description" content="Achetez vos pièces automobiles en ligne. Large choix de pièces auto de qualité, livraison rapide partout au Sénégal. Freinage, filtration, moteur et plus." />
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
