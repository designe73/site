import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// Définition propre des types
interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock: number;
  brand?: string | null;
  reference?: string | null;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Utilisation de useCallback pour éviter de recréer la fonction à chaque rendu
  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          product:products (
            id,
            name,
            price,
            image_url,
            stock,
            brand,
            reference
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Transformation sécurisée des données pour correspondre à l'interface TypeScript
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const typedData = (data as any[]).map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.product // Supabase renvoie un objet unique ici grâce à la jointure
      })) as CartItem[];

      setItems(typedData);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error("Impossible de charger le panier");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Chargement initial
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    if (!user) {
      toast.error('Connectez-vous pour ajouter au panier');
      return;
    }

    const existingItem = items.find(item => item.product_id === productId);

    if (existingItem) {
      // Si le produit existe déjà, on met à jour la quantité
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);

      if (error) {
        toast.error("Erreur lors de la mise à jour du panier");
      } else {
        toast.success("Quantité mise à jour");
        fetchCart();
      }
    } else {
      // Sinon on insère
      const { error } = await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id: productId, quantity });

      if (error) {
        toast.error("Erreur lors de l'ajout au panier");
      } else {
        toast.success("Produit ajouté au panier");
        fetchCart();
      }
    }
  }, [items, user, fetchCart]);

  const removeFromCart = useCallback(async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Produit retiré du panier');
      // Optimisation : mise à jour locale immédiate pour éviter le lag
      setItems(prev => prev.filter(item => item.id !== itemId));
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      // Mise à jour locale optimiste
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast.error('Erreur lors du vidage du panier');
    } else {
      setItems([]);
    }
  }, [user]);

  // Calculs dérivés (mémorisés pour éviter les recalculs inutiles)
  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0), [items]);

  // IMPORTANT : On mémorise l'objet value pour éviter que toute l'app ne se re-rende quand rien ne change
  const value = useMemo(() => ({
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice
  }), [items, loading, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};