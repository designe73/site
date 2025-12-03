import { Link } from 'react-router-dom';
import { ShoppingCart, Check, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { formatPrice } from '@/lib/formatPrice';
import { useCart } from '@/hooks/useCart';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useWhatsAppNumber } from '@/hooks/useWhatsAppNumber';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  imageUrl?: string | null;
  brand?: string | null;
  reference?: string | null;
  stock: number;
  isPromo?: boolean;
}

const ProductCard = ({
  id,
  name,
  slug,
  price,
  originalPrice,
  imageUrl,
  brand,
  reference,
  stock,
  isPromo,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { settings } = useSiteSettings();
  const { getWhatsAppUrl } = useWhatsAppNumber();
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(id);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const message = `Bonjour, je suis intéressé par ce produit:\n\n${name}\n${brand ? `Marque: ${brand}\n` : ''}${reference ? `Référence: ${reference}\n` : ''}Prix: ${formatPrice(price)}`;
    const whatsappUrl = getWhatsAppUrl(message);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Link to={`/produit/${slug}`} className="card-product group block">
      {/* Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        <OptimizedImage
          src={imageUrl}
          alt={name}
          width={300}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          fallback={
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12" />
            </div>
          }
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isPromo && discount > 0 && (
            <span className="badge-promo">-{discount}%</span>
          )}
          {stock > 0 && stock <= 5 && (
            <span className="bg-warning text-foreground text-xs font-medium px-2 py-1 rounded">
              Plus que {stock}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {brand && (
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {brand}
          </span>
        )}
        <h3 className="font-medium text-sm line-clamp-2 mt-1 mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        {reference && (
          <p className="text-xs text-muted-foreground mb-2">Réf: {reference}</p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="price-tag">{formatPrice(price)}</span>
          {originalPrice && originalPrice > price && (
            <span className="price-original">{formatPrice(originalPrice)}</span>
          )}
        </div>

        {/* Stock status */}
        <div className="flex items-center gap-1 text-sm mb-3">
          {stock > 0 ? (
            <>
              <Check className="h-4 w-4 text-success" />
              <span className="text-success">En stock</span>
            </>
          ) : (
            <span className="text-destructive">Rupture de stock</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <Button 
            onClick={handleAddToCart}
            disabled={stock === 0}
            className="w-full btn-primary"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ajouter au panier
          </Button>
          {settings?.whatsapp_enabled && (
            <Button 
              onClick={handleWhatsApp}
              variant="outline"
              className="w-full border-green-500 text-green-600 hover:bg-green-50"
              size="sm"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Commander sur WhatsApp
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
