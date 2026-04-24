'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import CustomerForm from '@/components/checkout/CustomerForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import PaymentInfo from '@/components/checkout/PaymentInfo';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { useIsolatedSession } from '@/hooks/useIsolatedSession';
import { createOrder } from '@/lib/orders';
import type { CartItem } from '@/lib/cart';

export default function CheckoutPage() {
  const router = useRouter();
  // TRULY ISOLATED SESSION - This tab's session NEVER changes when other tabs login
  // Role is fetched from Supabase database once on mount and stays constant
  const { role, userId, isAuthenticated, isLoading: sessionLoading, initialized } = useIsolatedSession();
  const { items, totalItems, totalPrice, clearCart, isLoaded } = useCart();
  const { toasts, removeToast, success, error } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerData, setCustomerData] = useState<{
    name: string;
    phone: string;
    address: string;
    notes?: string;
  } | null>(null);
  const [hasCheckedCart, setHasCheckedCart] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Check admin role after initialized - blocks checkout for admin on THIS tab only
  const isAdminBlocked = initialized && role === 'admin';

  // Debug logging
  useEffect(() => {
    console.log('CART DEBUG - isLoaded:', isLoaded, 'items:', items, 'items.length:', items.length);
  }, [isLoaded, items]);

  // Redirect if cart is empty (only after cart is loaded from localStorage)
  useEffect(() => {
    // Wait for cart to load from localStorage
    if (!isLoaded) {
      console.log('CART DEBUG - Waiting for cart to load...');
      return;
    }
    
    // Only check once to prevent duplicate errors
    if (hasCheckedCart) return;
    setHasCheckedCart(true);
    
    console.log('CART DEBUG - Cart loaded, items.length:', items.length);
    
    if (!items || items.length === 0) {
      console.log('CART DEBUG - Cart is empty, showing error');
      error('Keranjang masih kosong. Silakan tambahkan produk terlebih dahulu.');
      const timer = setTimeout(() => {
        router.push('/cart');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [items, items.length, router, error, isLoaded, hasCheckedCart]);

  const handleFormSubmit = (data: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
  }) => {
    setCustomerData(data);
  };

  const handlePlaceOrder = async () => {
    if (isAdminBlocked) {
      error('Admin tidak diizinkan melakukan pemesanan');
      return;
    }

    if (!customerData) {
      error('Silakan lengkapi data pengiriman terlebih dahulu');
      return;
    }

    if (!userId) {
      error('Silakan login terlebih dahulu');
      return;
    }

    if (items.length === 0) {
      error('Keranjang masih kosong');
      return;
    }

    setIsProcessing(true);
    setIsCreatingOrder(true);

    try {
      // Convert cart items to order items format
      const orderItems = items.map((item: CartItem) => ({
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url,
      }));

      // Create order in database
      const order = await createOrder(userId, orderItems);

      if (!order) {
        throw new Error('Failed to create order');
      }

      // Clear cart after successful order
      await clearCart();

      // Show success message
      success('Pesanan berhasil dibuat!');

      // Redirect to success page
      router.push(`/order-success?orderId=${order.id}`);
    } catch (err) {
      console.error('Checkout error:', err);
      error('Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.');
      setIsProcessing(false);
      setIsCreatingOrder(false);
    }
  };

  // Show loading state while cart is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F5F5F5] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
            <p className="text-gray-500">Memuat keranjang...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show empty state if no items (only after cart is loaded)
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Toast toasts={toasts} onRemove={removeToast} />
        <Navbar />

        <main className="flex-1 bg-[#F5F5F5] flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Keranjang Kosong</h2>
            <p className="text-gray-500 mb-4">Silakan tambahkan produk ke keranjang terlebih dahulu</p>
            <Link href="/">
              <Button variant="primary">Mulai Belanja</Button>
            </Link>
          </motion.div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toast toasts={toasts} onRemove={removeToast} />
      <Navbar cartCount={totalItems} />

      <main className="flex-1 bg-[#F5F5F5] pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* Admin Notice Banner - Only shows after role is confirmed from database */}
          {initialized && isAdminBlocked && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    Anda login sebagai <strong className="capitalize">{role}</strong>. Checkout dinonaktifkan untuk akun Admin.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/cart" className="hover:text-[#03AC0E]">Keranjang</Link>
            <span>/</span>
            <span className="text-gray-900">Checkout</span>
          </nav>

          <h1 className="text-xl md:text-2xl font-bold text-[#1F1F1F] mb-6">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-4">
              <CustomerForm onSubmit={handleFormSubmit} isLoading={isProcessing || isCreatingOrder} />
              <PaymentInfo />
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:sticky lg:top-20 lg:h-fit space-y-4">
              <OrderSummary items={items} total={totalPrice} />

              {/* Place Order Button */}
              <div className="bg-white rounded-xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Total</span>
                  <span className="text-xl font-bold text-[#EF4444]">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(totalPrice)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handlePlaceOrder}
                  isLoading={isProcessing || isCreatingOrder}
                  disabled={!customerData || items.length === 0 || !userId || isAdminBlocked}
                >
                  {isProcessing || isCreatingOrder ? 'Memproses...' : isAdminBlocked ? 'Admin Tidak Diizinkan' : 'Buat Pesanan'}
                </Button>

                {isAdminBlocked && (
                  <p className="text-xs text-red-500 text-center mt-3">
                    Admin tidak dapat melakukan pemesanan
                  </p>
                )}

                {!customerData && !isAdminBlocked && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Silakan lengkapi data pengiriman terlebih dahulu
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav cartCount={totalItems} />
    </div>
  );
}
