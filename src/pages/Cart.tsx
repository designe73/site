import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Truck, Loader2, MapPin, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/formatPrice';
import { toast } from 'sonner';

interface ShippingInfo {
  full_name: string;
  phone: string;
  address: string;
  city: string;
}

const Cart = () => {
  const navigate = useNavigate();
  const { items, loading, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const [ordering, setOrdering] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    full_name: '',
    phone: '',
    address: '',
    city: '',
  });

  // Load user profile info
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, address, city')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) {
        setShippingInfo({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
        });
      }
    };
    loadProfile();
  }, [user]);

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Panier | {settings?.site_name || 'AutoPièces Pro'}</title>
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
          <title>Panier vide | {settings?.site_name || 'AutoPièces Pro'}</title>
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

  const handlePlaceOrder = async () => {
    if (!shippingInfo.full_name || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
      toast.error('Veuillez remplir toutes les informations de livraison');
      return;
    }

    setOrdering(true);
    
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: finalTotal,
          status: 'pending',
          phone: shippingInfo.phone,
          shipping_address: shippingInfo.address,
          shipping_city: shippingInfo.city,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update profile with shipping info
      await supabase
        .from('profiles')
        .update({
          full_name: shippingInfo.full_name,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
        })
        .eq('id', user.id);

      // Clear cart
      await clearCart();

      toast.success('Commande passée avec succès !');
      navigate('/mon-compte');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Erreur lors de la commande. Veuillez réessayer.');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{`Panier (${items.length}) | ${settings?.site_name || 'AutoPièces Pro'}`}</title>
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

              {/* Shipping info form */}
              <Card className="p-6">
                <h2 className="font-roboto-condensed text-xl font-bold mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Informations de livraison
                </h2>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nom complet *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="full_name"
                        value={shippingInfo.full_name}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, full_name: e.target.value })}
                        placeholder="Votre nom complet"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        placeholder="+221 77 123 45 67"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        placeholder="Dakar"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Adresse complète *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      placeholder="Rue, quartier, repères..."
                      required
                    />
                  </div>
                </div>
              </Card>
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
                  onClick={handlePlaceOrder}
                  className="w-full btn-primary mt-6"
                  disabled={ordering}
                >
                  {ordering ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Commande en cours...
                    </>
                  ) : (
                    <>
                      <Truck className="h-5 w-5 mr-2" />
                      Commander - Paiement à la livraison
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Payez en espèces à la réception de votre commande
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