import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useWhatsAppNumber } from '@/hooks/useWhatsAppNumber';
import { formatPrice } from '@/lib/formatPrice';

const Cart = () => {
  const { items, loading, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const { getWhatsAppUrl } = useWhatsAppNumber();

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Panier | AutoPièces Pro</title>
        </Helmet>
        <Layout>
          <div className="container py-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="font-roboto-condensed text-2xl font-bold mb-4">Votre panier</h1>
            <p className="text-muted-foreground mb-6">Connectez-vous pour voir votre panier</p>
            <Button asChild className="btn-primary">
              <Link to="/connexion">Se connecter</Link>
            </Button>
          </div>
        </Layout>
      </>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Panier vide | AutoPièces Pro</title>
        </Helmet>
        <Layout>
          <div className="container py-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="font-roboto-condensed text-2xl font-bold mb-4">Votre panier est vide</h1>
            <p className="text-muted-foreground mb-6">Découvrez nos produits et commencez vos achats</p>
            <Button asChild className="btn-primary">
              <Link to="/categories">Voir les catégories</Link>
            </Button>
          </div>
        </Layout>
      </>
    );
  }

  const shippingCost = totalPrice >= 50000 ? 0 : 3000;
  const finalTotal = totalPrice + shippingCost;

  const handleWhatsAppOrder = () => {
    let message = "Bonjour, je souhaite commander les produits suivants:\n\n";
    items.forEach((item) => {
      message += `• ${item.product?.name}\n`;
      if (item.product?.brand) message += `  Marque: ${item.product.brand}\n`;
      if (item.product?.reference) message += `  Réf: ${item.product.reference}\n`;
      message += `  Quantité: ${item.quantity}\n`;
      message += `  Prix unitaire: ${formatPrice(item.product?.price || 0)}\n\n`;
    });
    message += `Sous-total: ${formatPrice(totalPrice)}\n`;
    message += `Livraison: ${shippingCost === 0 ? 'Gratuite' : formatPrice(shippingCost)}\n`;
    message += `Total: ${formatPrice(finalTotal)}`;
    
    const whatsappUrl = getWhatsAppUrl(message);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <Helmet>
        <title>{`Panier (${items.length}) | AutoPièces Pro`}</title>
      </Helmet>
      
      <Layout>
        <div className="container py-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continuer mes achats
          </Link>

          <h1 className="font-roboto-condensed text-3xl font-bold mb-8">Mon panier</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded overflow-hidden shrink-0">
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/produit/${item.product_id}`}
                        className="font-medium hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.product?.name}
                      </Link>
                      <p className="text-primary font-bold mt-2">
                        {formatPrice(item.product?.price || 0)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>

                      <div className="flex items-center border rounded">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product?.stock || 0)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="font-roboto-condensed text-xl font-bold mb-4">Récapitulatif</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className={shippingCost === 0 ? 'text-success' : ''}>
                      {shippingCost === 0 ? 'Gratuite' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Plus que {formatPrice(50000 - totalPrice)} pour la livraison gratuite
                    </p>
                  )}
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleWhatsAppOrder}
                  className="w-full btn-primary mt-6"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Commander sur WhatsApp
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Finalisez votre achat directement sur WhatsApp
                </p>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Cart;
