'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { getOrderById, subscribeToOrders } from '@/lib/orders';
import type { Order, OrderItem } from '@/lib/orders';
import { formatPrice } from '@/lib/utils';
import { CookingAnimation, OrderCompletedAnimation, StatusBadge } from '@/components/animations/CookingAnimation';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (orderId) {
        const { order: foundOrder, items } = await getOrderById(orderId);
        setOrder(foundOrder);
        setOrderItems(items);
      }
      setLoading(false);
    }
    fetchOrder();

    // Realtime subscription for status updates
    if (orderId) {
      const channel = subscribeToOrders((updatedOrder) => {
        if (updatedOrder.id === orderId) {
          setOrder(prev => prev ? { ...prev, ...updatedOrder } : updatedOrder);
        }
      });
      return () => channel.unsubscribe();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#03AC0E] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F5F5F5] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Pesanan Tidak Ditemukan</h2>
            <p className="text-gray-500 mb-4">Order ID tidak valid atau sudah kadaluarsa</p>
            <Link href="/">
              <Button variant="primary">Kembali ke Beranda</Button>
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-[#F5F5F5]">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Berhasil Dibuat!</h1>
            <p className="text-gray-600">Terima kasih telah berbelanja di FoodStore</p>
          </motion.div>

          {/* Order Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6"
          >
            {/* Order Header */}
            <div className="bg-[#03AC0E] px-6 py-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-sm opacity-90">Nomor Pesanan</p>
                  <p className="text-lg font-bold">{order.id.slice(0, 8)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Status</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            </div>

            {/* Cooking Animation */}
            {order.status === 'processing' && <CookingAnimation />}
            {order.status === 'completed' && <OrderCompletedAnimation />}

            {/* Order Details */}
            <div className="p-6 space-y-6">
              {/* Status Tracker */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  {['pending', 'processing', 'completed'].map((status, index) => {
                    const isActive = ['pending', 'processing', 'completed'].indexOf(order.status) >= index;
                    const isCurrent = order.status === status;
                    return (
                      <div key={status} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          isActive ? 'bg-[#03AC0E] text-white' : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-[#03AC0E]/20' : ''}`}>
                          {status === 'pending' ? '📋' : status === 'processing' ? '👨‍🍳' : '✅'}
                        </div>
                        {index < 2 && (
                          <div className={`w-16 h-1 mx-2 ${isActive ? 'bg-[#03AC0E]' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Diterima</span>
                  <span className="ml-4">Diproses</span>
                  <span>Selesai</span>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Detail Pesanan</h3>
                <div className="space-y-3">
                  {orderItems.map((item) => {
                    if (!item) return null;
                    return (
                      <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">x{item.quantity}</span>
                            <span className="text-sm font-semibold">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Pembayaran</span>
                  <span className="text-2xl font-bold text-[#EF4444]">{formatPrice(order.total_price)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6"
          >
            <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Instruksi Pembayaran
            </h3>

            <div className="space-y-3 text-sm text-blue-800">
              <p>1. Transfer sesuai total pembayaran ke salah satu rekening berikut:</p>
              <div className="bg-white rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Bank BCA</span>
                  <span className="font-mono font-bold">1234567890</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Bank Mandiri</span>
                  <span className="font-mono font-bold">0987654321</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Bank BNI</span>
                  <span className="font-mono font-bold">1122334455</span>
                </div>
                <p className="text-xs text-gray-500">a.n. PT FoodStore Indonesia</p>
              </div>
              <p>2. Simpan bukti transfer</p>
              <p>3. Konfirmasi pembayaran melalui WhatsApp ke <strong>0812-3456-7890</strong></p>
              <p>4. Pesanan akan diproses setelah pembayaran dikonfirmasi</p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link href="/" className="flex-1">
              <Button variant="outline" size="lg" fullWidth>
                Lanjut Belanja
              </Button>
            </Link>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="primary" size="lg" fullWidth>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Konfirmasi Pembayaran
              </Button>
            </a>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#03AC0E] border-t-transparent rounded-full" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
