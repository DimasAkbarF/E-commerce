'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getOrders, subscribeToOrders, deleteOrder } from '@/lib/orders';
import { formatPrice } from '@/lib/utils';
import { CookingAnimation, OrderCompletedAnimation, StatusBadge } from '@/components/animations/CookingAnimation';
import type { Order, OrderItem } from '@/lib/orders';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/ui/Toast';
import { useIsolatedSession } from '@/hooks/useIsolatedSession';

interface OrderWithItems extends Order {
  items: OrderItem[];
}

export default function OrdersPage() {
  // TRULY ISOLATED SESSION - This tab's session NEVER changes when other tabs login
  // Role is fetched from Supabase database once on mount and stays constant
  const { role, userId, isLoading: sessionLoading, initialized, isAuthenticated } = useIsolatedSession();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    if (!userId) return;

    async function fetchOrders() {
      const data = await getOrders(userId);
      // Fetch items for each order
      const ordersWithItems = await Promise.all(
        data.map(async (order) => {
          const { items } = await import('@/lib/orders').then(m => m.getOrderById(order.id));
          return { ...order, items };
        })
      );
      setOrders(ordersWithItems);
      setIsLoading(false);
    }

    fetchOrders();

    // Realtime subscription
    const channel = subscribeToOrders((updatedOrder) => {
      if (updatedOrder.user_id === userId) {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
      return;
    }

    setDeletingOrderId(orderId);
    const deleted = await deleteOrder(orderId);
    
    if (deleted) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      success('Pesanan berhasil dihapus');
    } else {
      error('Gagal menghapus pesanan. Silakan coba lagi.');
    }
    setDeletingOrderId(null);
  };

  // Wait for session initialization (isolated per tab)
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar cartCount={0} />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-8 h-8 border-4 border-[#03AC0E] border-t-transparent rounded-full" />
            <p className="text-gray-500 text-sm">Memuat sesi...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not authenticated - show login prompt (this tab stays independent)
  if (!isAuthenticated && initialized) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar cartCount={0} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Silakan login untuk melihat pesanan</p>
            <Link href="/login" className="text-[#03AC0E] font-medium hover:underline">
              Login
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar cartCount={0} />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Toast toasts={toasts} removeToast={removeToast} />
        
        {/* Role Notice Banner - ISOLATED: shows current role from database after initialized */}
        {/* This shows the role for THIS TAB only - doesn't change when other tabs login */}
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
                  {role === 'admin' && (
                    <span className="text-blue-600"> - Menampilkan pesanan User</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Saya</h1>
        <p className="text-gray-600 mb-6">Kelola dan pantau status pesanan Anda</p>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'processing', 'completed', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status ? 'bg-[#03AC0E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Semua' : 
               status === 'pending' ? 'Menunggu' :
               status === 'processing' ? 'Diproses' :
               status === 'completed' ? 'Selesai' : 'Ditolak'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#03AC0E] border-t-transparent rounded-full" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 mb-4">Belum ada pesanan</p>
            <Link href="/" className="text-[#03AC0E] font-medium hover:underline">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium text-gray-900">{order.id.slice(0, 8)}...</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Animation Section */}
                {order.status === 'processing' && <CookingAnimation />}
                {order.status === 'completed' && <OrderCompletedAnimation />}

                {/* Order Items */}
                <div className="p-4 space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        <p className="text-sm text-gray-500">x{item.quantity}</p>
                        <p className="text-sm font-medium text-[#EF4444]">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </p>
                    <p className="font-bold text-gray-900">
                      Total: {formatPrice(order.total_price)}
                    </p>
                  </div>
                  
                  {/* Delete button for pending/rejected orders */}
                  {(order.status === 'pending' || order.status === 'rejected') && (
                    <div className="flex justify-end pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={deletingOrderId === order.id}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingOrderId === order.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            Menghapus...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus Pesanan
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
