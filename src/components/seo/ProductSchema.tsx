import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface ProductSchemaProps {
  product: {
    name: string;
    description?: string | null;
    price: number;
    original_price?: number | null;
    image_url?: string | null;
    brand?: string | null;
    reference?: string | null;
    stock: number;
    slug: string;
  };
}

const ProductSchema = ({ product }: ProductSchemaProps) => {
  const { settings } = useSiteSettings();
  const currency = settings?.currency || 'XOF';

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || product.name,
    "image": product.image_url || "https://senpieces.sn/og-image.png",
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Senpieces"
    },
    "sku": product.reference || product.slug,
    "offers": {
      "@type": "Offer",
      "url": `https://senpieces.sn/product/${product.slug}`,
      "priceCurrency": currency === 'CFA' ? 'XOF' : currency,
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": settings?.site_name || "Senpieces"
      }
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default ProductSchema;
