import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  width?: number;
  height?: number;
  lazy?: boolean;
  priority?: boolean;
}

// Convert image URL to WebP if it's from Supabase storage
const getOptimizedUrl = (src: string, width?: number): string => {
  // If it's a Supabase storage URL, we can use transformation
  if (src.includes('supabase.co/storage')) {
    const url = new URL(src);
    const params = new URLSearchParams();
    if (width) params.set('width', String(width));
    params.set('format', 'webp');
    params.set('quality', '80');
    return `${url.origin}${url.pathname}?${params.toString()}`;
  }
  return src;
};

export const OptimizedImage = ({
  src,
  alt,
  className,
  fallback,
  width,
  height,
  lazy = true,
  priority = false,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!lazy || priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority]);

  if (!src || hasError) {
    return fallback ? <>{fallback}</> : null;
  }

  const optimizedSrc = getOptimizedUrl(src, width);

  return (
    <img
      ref={imgRef}
      src={isInView ? optimizedSrc : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={lazy && !priority ? 'lazy' : 'eager'}
      decoding={priority ? 'sync' : 'async'}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
    />
  );
};

export default OptimizedImage;
