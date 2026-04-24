'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import MobileNav from '@/components/layout/MobileNav';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import CategoryGrid from '@/components/sections/CategoryGrid';
import BestSellerSection from '@/components/sections/BestSellerSection';
import PromoSection from '@/components/sections/PromoSection';
import ProductGrid from '@/components/product/ProductGrid';
import CartDrawer from '@/components/cart/CartDrawer';
import Toast from '@/components/ui/Toast';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { getProducts } from '@/lib/products';
import { supabase } from '@/lib/supabase';
import { categories, heroSlides } from '@/lib/data';
import type { Product } from '@/lib/supabase';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    items,
    isOpen,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    openCart,
    closeCart,
  } = useCart();

  const { toasts, removeToast, success, error } = useToast();

  // Fetch products from Supabase
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  }, [error]);

  // Initial fetch and realtime subscription
  useEffect(() => {
    fetchProducts();

    // Subscribe to realtime product changes
    const channel = supabase
      .channel('products-public-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          console.log('Realtime product update:', payload);
          // Refetch products when any change occurs
          fetchProducts();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  const handleAddToCart = (product: Product) => {
    // Convert Supabase Product to Cart Product type
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      category: product.category,
      rating: 4.5, // Default rating
      soldCount: 0,
      variants: [],
    };
    addToCart(cartProduct);
    success(`${product.name} ditambahkan ke keranjang`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Navbar */}
      <Navbar cartCount={totalItems} onCartClick={openCart} />

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
          {/* Hero Banner */}
          <HeroSection slides={heroSlides} />

          {/* Category Grid */}
          <CategoryGrid categories={categories} />

          {/* Best Seller Section */}
          <BestSellerSection products={products.slice(0, 4)} onAddToCart={handleAddToCart} loading={loading} />

          {/* Promo Section */}
          <PromoSection />

          {/* All Products */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <ProductGrid
              products={products}
              onAddToCart={handleAddToCart}
              title="Semua Produk"
              loading={loading}
            />
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Navigation */}
      <MobileNav cartCount={totalItems} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isOpen}
        onClose={closeCart}
        items={items}
        totalPrice={totalPrice}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    </div>
  );
}
