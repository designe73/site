import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link: string | null;
}

const BannerCarousel = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('position');
      
      if (data && data.length > 0) {
        setBanners(data);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  // Preload next image
  useEffect(() => {
    if (banners.length > 1) {
      const nextIndex = (currentIndex + 1) % banners.length;
      const img = new Image();
      img.src = banners[nextIndex]?.image_url || '';
    }
  }, [currentIndex, banners]);

  const goToPrevious = () => {
    setImageLoaded(false);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setImageLoaded(false);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0) {
    return (
      <div className="relative h-[300px] md:h-[400px] bg-gradient-hero rounded-xl overflow-hidden flex items-center justify-center">
        <div className="text-center text-secondary-foreground p-8">
          <h2 className="font-roboto-condensed text-3xl md:text-5xl font-bold mb-4">
            Bienvenue sur <span className="text-primary">AutoPièces Pro</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-6">
            Les meilleures pièces auto aux meilleurs prix
          </p>
          <Button asChild className="btn-primary text-lg px-8 py-6">
            <Link to="/categories">Découvrir nos produits</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden group">
      {/* Background image with lazy loading */}
      <div className="absolute inset-0">
        <img
          src={currentBanner.image_url}
          alt={currentBanner.title}
          loading={currentIndex === 0 ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container">
          <div className="max-w-xl animate-fade-in">
            <h2 className="font-roboto-condensed text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
              {currentBanner.title}
            </h2>
            {currentBanner.subtitle && (
              <p className="text-lg md:text-xl text-muted mb-6">
                {currentBanner.subtitle}
              </p>
            )}
            {currentBanner.link && (
              <Button asChild className="btn-primary text-lg px-8 py-6">
                <Link to={currentBanner.link}>Voir l'offre</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? 'bg-primary w-8' : 'bg-primary-foreground/50'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
