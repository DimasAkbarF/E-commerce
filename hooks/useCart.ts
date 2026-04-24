'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { CartItem } from '@/lib/cart';
import {
  getCartItems,
  addToCart as addToCartDB,
  updateCartItemQuantity,
  removeCartItem,
  clearCart as clearCartDB,
  calculateCartTotal,
  calculateCartItemCount,
} from '@/lib/cart';
import { supabase } from '@/lib/supabase';

interface CartProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoaded: boolean;
  isLoading: boolean;
}

export function useCart() {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<CartState>({
    items: [],
    isOpen: false,
    isLoaded: false,
    isLoading: false,
  });

  const userId = session?.user?.id;
  const isAuthenticated = status === 'authenticated';

  // Fetch cart from Supabase on mount and when user changes
  useEffect(() => {
    async function fetchCart() {
      if (!userId) {
        setCart(prev => ({ ...prev, isLoaded: true }));
        return;
      }

      setCart(prev => ({ ...prev, isLoading: true }));
      
      const items = await getCartItems(userId);
      setCart(prev => ({ ...prev, items, isLoaded: true, isLoading: false }));
    }

    fetchCart();
  }, [userId]);

  // Subscribe to realtime cart changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`cart-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refetch cart when any change occurs
          getCartItems(userId).then(items => {
            setCart(prev => ({ ...prev, items }));
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const addToCart = useCallback(async (product: CartProduct, quantity: number = 1) => {
    if (!userId) return;

    const newItem = await addToCartDB(userId, {
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image,
    }, quantity);

    if (newItem) {
      setCart(prev => ({
        ...prev,
        items: prev.items.some(item => item.id === newItem.id)
          ? prev.items.map(item => item.id === newItem.id ? newItem : item)
          : [...prev.items, newItem],
        isOpen: true,
      }));
    }
  }, [userId]);

  const removeFromCart = useCallback(async (itemId: string) => {
    await removeCartItem(itemId);
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    const updatedItem = await updateCartItemQuantity(itemId, quantity);
    if (updatedItem) {
      setCart(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === itemId ? updatedItem : item),
      }));
    }
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    if (!userId) return;
    await clearCartDB(userId);
    setCart(prev => ({ ...prev, items: [] }));
  }, [userId]);

  const toggleCart = useCallback(() => {
    setCart(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const closeCart = useCallback(() => {
    setCart(prev => ({ ...prev, isOpen: false }));
  }, []);

  const openCart = useCallback(() => {
    setCart(prev => ({ ...prev, isOpen: true }));
  }, []);

  const totalItems = calculateCartItemCount(cart.items);
  const totalPrice = calculateCartTotal(cart.items);

  return {
    items: cart.items,
    isOpen: cart.isOpen,
    isLoaded: cart.isLoaded,
    isLoading: cart.isLoading,
    isAuthenticated,
    userId,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    closeCart,
    openCart,
  };
}
