'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import MobileNav from '@/components/layout/MobileNav';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import QuantityControl from '@/components/product/QuantityControl';
import Toast from '@/components/ui/Toast';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { useIsolatedSession } from '@/hooks/useIsolatedSession';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
    isLoaded,
  } = useCart();

  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // TRULY ISOLATED SESSION - This tab's session NEVER changes when other tabs login
  // Role is fetched from Supabase database once on mount and stays constant
  const { role, isAuthenticated, initialized } = useIsolatedSession();

  // Debug logging
  useEffect(() => {
    console.log('CART PAGE DEBUG - isLoaded:', isLoaded, 'items:', items, 'count:', items.length);
  }, [isLoaded, items]);

  // Show loading while cart is loading from localStorage
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
        <MobileNav />
      </div>
    );
  }

  const toggleItem = (itemKey: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemKey)) {
      newSelected.delete(itemKey);
    } else {
      newSelected.add(itemKey);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  const router = useRouter();

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      error('Pilih minimal 1 item untuk checkout');
      return;
    }

    if (!isAuthenticated) {
      error('Silakan login terlebih dahulu untuk melanjutkan checkout');
      setTimeout(() => {
        router.push('/login?redirect=/checkout');
      }, 1500);
      return;
    }

    router.push('/checkout');
  };

  const selectedTotal = items
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Toast toasts={toasts} onRemove={removeToast} />
      <Navbar cartCount={totalItems} />

      <main className="flex-1 bg-[#F5F5F5] pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* Role Notice Banner - ISOLATED per tab */}
          {/* This shows role for THIS TAB only - doesn't change when other tabs login */}
          {initialized && role && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    Anda login sebagai <strong className="capitalize">{role}</strong>
                    {role === 'admin' && <span className="text-blue-600"> - Keranjang untuk User</span>}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-[#03AC0E]">Beranda</Link>
            <span>/</span>
            <span className="text-gray-900">Keranjang</span>
          </nav>

          <h1 className="text-xl md:text-2xl font-bold text-[#1F1F1F] mb-6">
            Keranjang ({totalItems})
          </h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Keranjang Masih Kosong</h2>
              <p className="text-gray-500 mb-4">Yuk, tambahkan produk ke keranjangmu</p>
              <Link href="/">
                <Button variant="primary">Mulai Belanja</Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3">
                {/* Select All */}
                <div className="bg-white rounded-xl p-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === items.length && items.length > 0}
                    onChange={selectAll}
                    className="w-5 h-5 rounded border-gray-300 text-[#03AC0E] focus:ring-[#03AC0E]"
                  />
                  <span className="font-medium text-sm">Pilih Semua ({items.length})</span>
                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="ml-auto text-sm text-red-500 hover:text-red-600"
                    >
                      Hapus Semua
                    </button>
                  )}
                </div>

                {/* Items List */}
                {items.map((item) => {
                  const isSelected = selectedItems.has(item.id);

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`p-4 flex gap-4 ${isSelected ? 'bg-green-50/50' : ''}`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-8 transition-colors ${
                          isSelected
                            ? 'bg-[#03AC0E] border-[#03AC0E]'
                            : 'border-gray-300 hover:border-[#03AC0E]'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {/* Image */}
                      <Link href={`/product/${item.product_id}`} className="flex-shrink-0">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.product_id}`}>
                          <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-[#03AC0E] transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="font-semibold text-[#EF4444] mt-1">
                          {formatPrice(item.price)}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <QuantityControl
                            quantity={item.quantity}
                            onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                            onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                            size="sm"
                          />
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Summary - Sticky on desktop */}
              <div className="lg:sticky lg:top-20 lg:h-fit">
                <div className="bg-white rounded-xl p-4 space-y-4">
                  <h2 className="font-semibold text-gray-900">Ringkasan Belanja</h2>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Total Barang</span>
                      <span>{selectedItems.size} item</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-100">
                      <span>Total Harga</span>
                      <span className="text-[#EF4444]">{formatPrice(selectedTotal)}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleCheckout}
                    disabled={selectedItems.size === 0}
                  >
                    Checkout ({selectedItems.size})
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Belum termasuk ongkir. Dihitung saat checkout.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileNav cartCount={totalItems} />
    </div>
  );
}
