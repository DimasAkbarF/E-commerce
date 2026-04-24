'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { getUserOrdersForAdmin, getUserInfo, updateOrderStatus, deleteOrder, subscribeToOrders } from '@/lib/orders';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/ui/Toast';
import { TableSkeleton, ErrorState } from '@/components/admin/AdminSkeletons';
import type { Order } from '@/lib/orders';

interface OrderWithUser extends Order {
  userName?: string;
  userEmail?: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pending: 'Menunggu',
  processing: 'Diproses',
  completed: 'Selesai',
  rejected: 'Ditolak',
};

const DATE_RANGES = [
  { label: 'Semua Waktu', value: 'all' },
  { label: 'Hari Ini', value: 'today' },
  { label: '7 Hari', value: '7d' },
  { label: '30 Hari', value: '30d' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const { toasts, removeToast, success, error: showError } = useToast();

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch orders with filters
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters: {
        status?: string;
        dateFrom?: string;
        dateTo?: string;
      } = {};

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      // Date range filter
      const now = new Date();
      if (dateFilter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filters.dateFrom = today.toISOString();
        filters.dateTo = now.toISOString();
      } else if (dateFilter === '7d') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filters.dateFrom = sevenDaysAgo.toISOString();
        filters.dateTo = now.toISOString();
      } else if (dateFilter === '30d') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filters.dateFrom = thirtyDaysAgo.toISOString();
        filters.dateTo = now.toISOString();
      }

      const data = await getUserOrdersForAdmin(filters);
      
      // Fetch user info for each order
      const ordersWithUser = await Promise.all(
        data.map(async (order) => {
          const userInfo = await getUserInfo(order.user_id);
          return {
            ...order,
            userName: userInfo?.name || 'Unknown',
            userEmail: userInfo?.email || '-',
          };
        })
      );
      
      setOrders(ordersWithUser);
    } catch {
      setError('Gagal memuat data pesanan');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Realtime subscription
  useEffect(() => {
    const channel = subscribeToOrders(() => {
      fetchOrders();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchOrders]);

  // Action handlers
  const handleStartProcessing = async (orderId: string) => {
    const updated = await updateOrderStatus(orderId, 'processing');
    if (updated) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'processing' } : o));
    }
  };

  const handleComplete = async (orderId: string) => {
    const updated = await updateOrderStatus(orderId, 'completed');
    if (updated) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));
    }
  };

  const handleReject = async (orderId: string) => {
    const updated = await updateOrderStatus(orderId, 'rejected');
    if (updated) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'rejected' } : o));
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pesanan ini secara permanen? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    setDeletingOrderId(orderId);
    const deleted = await deleteOrder(orderId);
    
    if (deleted) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      success('Pesanan berhasil dihapus');
    } else {
      showError('Gagal menghapus pesanan');
    }
    setDeletingOrderId(null);
  };

  // Filter by search query (client-side)
  const filteredOrders = useMemo(() => {
    if (!debouncedSearch) return orders;
    const query = debouncedSearch.toLowerCase();
    return orders.filter(
      order =>
        order.id.toLowerCase().includes(query) ||
        order.user_id.toLowerCase().includes(query)
    );
  }, [orders, debouncedSearch]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      completed: orders.filter(o => o.status === 'completed').length,
      revenue: orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total_price, 0),
    };
  }, [orders]);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Pesanan User</h1>
        <ErrorState message={error} onRetry={fetchOrders} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Pesanan User</h1>
        <p className="text-gray-600 mt-1">Monitor dan kelola semua pesanan dari user</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl shadow-md p-4">
              <p className="text-sm text-yellow-600">Menunggu</p>
              <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
            </div>
            <div className="bg-blue-50 rounded-xl shadow-md p-4">
              <p className="text-sm text-blue-600">Diproses</p>
              <p className="text-2xl font-bold text-blue-800">{stats.processing}</p>
            </div>
            <div className="bg-green-50 rounded-xl shadow-md p-4">
              <p className="text-sm text-green-600">Selesai</p>
              <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl shadow-md p-4">
              <p className="text-sm text-emerald-600">Revenue</p>
              <p className="text-xl font-bold text-emerald-800">{formatPrice(stats.revenue)}</p>
            </div>
          </>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Order ID atau User ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03AC0E] focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03AC0E] focus:border-transparent"
          >
            {DATE_RANGES.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'processing', 'completed', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === status
                ? 'bg-[#03AC0E] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status === 'all' ? 'Semua' : statusLabels[status as keyof typeof statusLabels]}
            {status === 'all' && (
              <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded text-xs">
                {stats.total}
              </span>
            )}
            {status === 'pending' && stats.pending > 0 && (
              <span className="ml-2 bg-yellow-500/20 px-1.5 py-0.5 rounded text-xs">
                {stats.pending}
              </span>
            )}
            {status === 'processing' && stats.processing > 0 && (
              <span className="ml-2 bg-blue-500/20 px-1.5 py-0.5 rounded text-xs">
                {stats.processing}
              </span>
            )}
          </button>
        ))}
      </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-600">Tidak ada pesanan yang ditemukan</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Daftar Pesanan</h2>
            <span className="text-sm text-gray-500">{filteredOrders.length} pesanan</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900">Order ID</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900">Pelanggan</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900">Tanggal</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{order.userName || 'Unknown'}</span>
                        <span className="text-xs text-gray-500">{order.userEmail || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(order.total_price)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[order.status]
                      }`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStartProcessing(order.id)}
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Proses
                            </button>
                            <button
                              onClick={() => handleReject(order.id)}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Tolak
                            </button>
                          </>
                        )}
                        {order.status === 'processing' && (
                          <button
                            onClick={() => handleComplete(order.id)}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Selesai
                          </button>
                        )}
                        
                        {/* Delete button for completed/rejected orders */}
                        {(order.status === 'completed' || order.status === 'rejected') && (
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={deletingOrderId === order.id}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 text-xs rounded-lg transition-colors disabled:opacity-50"
                            title="Hapus pesanan untuk menghemat storage"
                          >
                            {deletingOrderId === order.id ? (
                              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
